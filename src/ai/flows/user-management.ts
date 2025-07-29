
'use server';
/**
 * @fileOverview User management flows for inviting and managing users.
 * - inviteUser - Invites a user to an organization via email.
 * - listUsers - Lists all users within the caller's organization.
 * - updateUserPermissions - Updates the application permissions for a specific user.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
const app = getApps().length
  ? (getApps()[0] as App)
  : initializeApp();

const auth = getAuth(app);
const db = getFirestore(app);

const getAdminAndOrg = async (actorUid: string | undefined) => {
    if (!actorUid) {
        throw new Error('User must be authenticated.');
    }
    const adminDocRef = db.collection('users').doc(actorUid);
    const adminDoc = await adminDocRef.get();
    if (!adminDoc.exists) {
        throw new Error('Admin user not found in Firestore.');
    }
    const organization = adminDoc.data()?.organization;
    if (!organization) {
        throw new Error('Admin user does not have an organization.');
    }
    return { adminDoc, organization };
}

// Schemas
export const InviteUserSchema = z.object({
  email: z.string().email(),
});

const AppPermissionsSchema = z.object({
    qoroCrm: z.boolean().default(true),
    qoroPulse: z.boolean().default(true),
    qoroTask: z.boolean().default(true),
    qoroFinance: z.boolean().default(true),
}).optional();

export const UserProfileSchema = z.object({
    uid: z.string(),
    email: z.string(),
    name: z.string().optional().nullable(),
    organization: z.string(),
    role: z.string().optional(),
    permissions: AppPermissionsSchema,
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateUserPermissionsSchema = z.object({
    userId: z.string(),
    permissions: z.object({
        qoroCrm: z.boolean(),
        qoroPulse: z.boolean(),
        qoroTask: z.boolean(),
        qoroFinance: z.boolean(),
    }),
});

// Exported functions (client-callable wrappers)
export async function inviteUser(input: z.infer<typeof InviteUserSchema>) {
    return inviteUserFlow(input);
}

export async function listUsers(input: {}) {
    return listUsersFlow(input);
}

export async function updateUserPermissions(input: z.infer<typeof UpdateUserPermissionsSchema>) {
    return updateUserPermissionsFlow(input);
}


// Genkit Flows
export const inviteUserFlow = ai.defineFlow(
  {
    name: 'inviteUserFlow',
    inputSchema: InviteUserSchema,
    outputSchema: z.object({
      uid: z.string(),
      email: z.string(),
      organization: z.string(),
    }),
  },
  async ({ email }, context) => {
    const { organization } = await getAdminAndOrg(context?.auth?.uid);
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      emailVerified: false,
    });

    // Save user info to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      organization,
      invitedBy: context?.auth?.uid,
      createdAt: FieldValue.serverTimestamp(),
      // Set default permissions for a new user
      permissions: {
        qoroCrm: true,
        qoroPulse: true,
        qoroTask: true,
        qoroFinance: true,
      }
    });

    // Send a password reset email to act as a "set your password" link
    const link = await auth.generatePasswordResetLink(email);
    console.log(`Password setup link for ${email}: ${link}`);

    return {
      uid: userRecord.uid,
      email: userRecord.email!,
      organization,
    };
  }
);


export const listUsersFlow = ai.defineFlow(
    {
        name: 'listUsersFlow',
        inputSchema: z.object({}),
        outputSchema: z.array(UserProfileSchema),
    },
    async (_, context) => {
        const { organization } = await getAdminAndOrg(context?.auth?.uid);

        const usersSnapshot = await db.collection('users').where('organization', '==', organization).get();
        
        const users: UserProfile[] = [];
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            users.push({
                uid: doc.id,
                email: data.email,
                name: data.name,
                organization: data.organization,
                permissions: data.permissions,
            });
        });
        
        return users;
    }
);


export const updateUserPermissionsFlow = ai.defineFlow(
    {
        name: 'updateUserPermissionsFlow',
        inputSchema: UpdateUserPermissionsSchema,
        outputSchema: z.object({ success: z.boolean() }),
    },
    async ({ userId, permissions }, context) => {
        const { organization, adminDoc } = await getAdminAndOrg(context?.auth?.uid);
        
        const targetUserRef = db.collection('users').doc(userId);
        const targetUserDoc = await targetUserRef.get();

        if (!targetUserDoc.exists || targetUserDoc.data()?.organization !== organization) {
            throw new Error("Target user not found in this organization.");
        }

        // Prevent admin from changing their own permissions to avoid lockout
        if (adminDoc.id === userId) {
            throw new Error("Administrators cannot change their own permissions.");
        }

        await targetUserRef.update({ permissions });

        return { success: true };
    }
);

    