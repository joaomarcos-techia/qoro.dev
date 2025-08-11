
import { adminDb } from '@/lib/firebase-admin';

export const getAdminAndOrg = async (actorUid: string) => {
    if (!actorUid) {
        throw new Error('User must be authenticated to perform this action.');
    }
    
    const userDocRef = adminDb.collection('users').doc(actorUid);
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists) {
        throw new Error('User not found in Firestore.');
    }
    
    const userData = userDoc.data()!;
    const organizationId = userData.organizationId;
    const userRole = userData.role || 'member'; 
    
    if (!organizationId) {
        throw new Error('User does not belong to an organization.');
    }
    
    const orgDocRef = adminDb.collection('organizations').doc(organizationId);
    const orgDoc = await orgDocRef.get();
    if (!orgDoc.exists) {
        throw new Error('Organization not found.');
    }
    const organizationName = orgDoc.data()?.name;


    return { userDocRef, userData, organizationId, organizationName, userRole, actorUid };
};
