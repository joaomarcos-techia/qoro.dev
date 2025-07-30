
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { 
    SignUpSchema, 
    InviteUserSchema, 
    UpdateUserPermissionsSchema, 
    UpdateOrganizationDetailsSchema, 
    UserProfile,
    OrganizationProfileSchema 
} from '@/ai/schemas';
import { runInContext, getAction, getFlow, getActor } from 'genkit';


// Initialize Firebase Admin SDK
// This is the definitive, centralized initialization.
let app: App;
if (!getApps().length) {
    // In a real production environment, you would use applicationDefault()
    // which automatically finds the credentials. For local/specific environments,
    // you might use a service account file. We will try to initialize
    // without explicit credentials, assuming the environment is set up.
    try {
        app = initializeApp();
    } catch (e) {
        console.error("Firebase Admin SDK initialization failed.", e);
        // Fallback or error handling here.
        // For development, you might load from a local file if env vars aren't set.
        // For this project, we'll rely on the hosting environment's auto-config.
        throw new Error("Could not initialize Firebase Admin SDK. Ensure environment is configured correctly.");
    }
} else {
    app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

// Helper to get the authenticated user's UID and organization
const getAdminAndOrg = async () => {
    const actor = getActor();
    const actorUid = actor?.uid;

    if (!actorUid) {
        throw new Error('User must be authenticated to perform this action.');
    }
    
    const adminDocRef = db.collection('users').doc(actorUid);
    const adminDoc = await adminDocRef.get();
    
    if (!adminDoc.exists) {
        throw new Error('Admin user not found in Firestore.');
    }
    
    const adminData = adminDoc.data()!;
    const organizationId = adminData.organizationId;
    
    if (!organizationId) {
        throw new Error('Admin user does not belong to an organization.');
    }
    
    // Check role for actions that require admin privileges
    if (adminData.role !== 'admin') {
        throw new Error('User does not have admin privileges.');
    }

    return { adminDocRef, adminData, organizationId, adminUid: actorUid };
};


export const signUp = async (input: z.infer<typeof SignUpSchema>): Promise<{ uid: string }> => {
    const { name, organizationName, email, password, cnpj, contactEmail, contactPhone } = input;
    
    // 1. Create user in Firebase Auth FIRST.
    const userRecord = await auth.createUser({
        email,
        password,
        emailVerified: false,
    });

    // 2. Create organization in Firestore
    const orgRef = await db.collection('organizations').add({
        name: organizationName,
        owner: userRecord.uid,
        createdAt: FieldValue.serverTimestamp(),
        cnpj: cnpj || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
    });

    // 3. Create user profile in Firestore
    await db.collection('users').doc(userRecord.uid).set({
        name,
        email,
        organizationId: orgRef.id,
        role: 'admin', // First user is always admin
        createdAt: FieldValue.serverTimestamp(),
        permissions: {
            qoroCrm: true,
            qoroPulse: true,
            qoroTask: true,
            qoroFinance: true,
        },
    });

    // 4. Send verification email
    const verificationLink = await auth.generateEmailVerificationLink(email);
    // In a real app, you'd email this link. For now, we log it.
    console.log(`Verification link for ${email}: ${verificationLink}`);

    return { uid: userRecord.uid };
};

export const inviteUser = async (input: z.infer<typeof InviteUserSchema>): Promise<{ uid: string; email: string; organizationId: string; }> => {
    const { organizationId, adminUid } = await getAdminAndOrg();
    const { email } = input;
    
    const userRecord = await auth.createUser({
      email,
      emailVerified: false,
    });

    await db.collection('users').doc(userRecord.uid).set({
      email,
      organizationId,
      invitedBy: adminUid,
      createdAt: FieldValue.serverTimestamp(),
      role: 'member',
      permissions: {
        qoroCrm: true,
        qoroPulse: true,
        qoroTask: true,
        qoroFinance: true,
      }
    });
    
    // In a real app, you'd email this link. For now, we log it.
    const link = await auth.generatePasswordResetLink(email);
    console.log(`Password setup link for ${email}: ${link}`);

    return {
      uid: userRecord.uid,
      email: userRecord.email!,
      organizationId,
    };
};

export const listUsers = async (): Promise<UserProfile[]> => {
    const { organizationId } = await getAdminAndOrg();
    
    const usersSnapshot = await db.collection('users').where('organizationId', '==', organizationId).get();
    
    const users: UserProfile[] = [];
    usersSnapshot.forEach(doc => {
        const data = doc.data();
        users.push({
            uid: doc.id,
            email: data.email,
            name: data.name,
            organizationId: data.organizationId,
            role: data.role,
            permissions: data.permissions,
        });
    });
    
    return users;
};

export const updateUserPermissions = async (input: z.infer<typeof UpdateUserPermissionsSchema>): Promise<{ success: boolean }> => {
    const { organizationId, adminUid } = await getAdminAndOrg();
    const { userId, permissions } = input;
    
    const targetUserRef = db.collection('users').doc(userId);
    const targetUserDoc = await targetUserRef.get();

    if (!targetUserDoc.exists || targetUserDoc.data()?.organizationId !== organizationId) {
        throw new Error("Target user not found in this organization.");
    }

    if (adminUid === userId) {
        // Updated error message to be more specific
        throw new Error("Administradores não podem alterar as próprias permissões.");
    }

    await targetUserRef.update({ permissions });

    return { success: true };
};

export const getOrganizationDetails = async (): Promise<z.infer<typeof OrganizationProfileSchema>> => {
    const { organizationId } = await getAdminAndOrg();
    const orgDoc = await db.collection('organizations').doc(organizationId).get();

    if (!orgDoc.exists) {
        throw new Error('Organization not found.');
    }
    const orgData = orgDoc.data()!;
    return {
        id: orgDoc.id,
        name: orgData.name,
        cnpj: orgData.cnpj,
        contactEmail: orgData.contactEmail,
        contactPhone: orgData.contactPhone,
    };
};

export const updateOrganizationDetails = async (details: z.infer<typeof UpdateOrganizationDetailsSchema>): Promise<{ success: boolean }> => {
    const { organizationId } = await getAdminAndOrg();
    
    const updateData = {
        name: details.name,
        cnpj: details.cnpj || null,
        contactEmail: details.contactEmail || null,
        contactPhone: details.contactPhone || null,
    };

    await db.collection('organizations').doc(organizationId).update(updateData);

    return { success: true };
};
