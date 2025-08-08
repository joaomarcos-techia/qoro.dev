
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
    const userRole = userData.role || 'member'; // Default to 'member' if role is not set
    
    if (!organizationId) {
        throw new Error('User does not belong to an organization.');
    }
    
    // The user's role is now available to be used in the services that call this function.
    // This allows for more granular permission checks, e.g., restricting certain actions to 'admin' users.
    // Example in a service:
    // const { organizationId, userRole } = await getAdminAndOrg(actorUid);
    // if (userRole !== 'admin') {
    //   throw new Error("You do not have permission to perform this action.");
    // }

    return { userDocRef, userData, organizationId, userRole, actorUid };
};
