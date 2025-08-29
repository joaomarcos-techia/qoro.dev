
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

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
    const orgData = orgDoc.data()!;

    let planId: 'free' | 'growth' | 'performance' = 'free';

    // Developer override for testing purposes
    if (process.env.DEV_FORCE_PLAN && ['growth', 'performance'].includes(process.env.DEV_FORCE_PLAN)) {
        planId = process.env.DEV_FORCE_PLAN as 'growth' | 'performance';
    } else {
        // Regular Stripe subscription check
        const subscriptionActive = orgData.stripePriceId && 
                                   orgData.stripeCurrentPeriodEnd && 
                                   (orgData.stripeCurrentPeriodEnd as Timestamp).toDate() > new Date();

        if (subscriptionActive) {
            if (orgData.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PERFORMANCE_PLAN_PRICE_ID) {
                planId = 'performance';
            } else if (orgData.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_GROWTH_PLAN_PRICE_ID) {
                planId = 'growth';
            }
        }
    }


    return { 
        userDocRef, 
        userData, 
        organizationId, 
        organizationName: orgData.name, 
        userRole, 
        adminUid: actorUid, // Using actorUid as adminUid for simplicity in this context
        planId
    };
};
