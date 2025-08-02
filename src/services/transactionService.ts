import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { TransactionSchema, TransactionProfileSchema, TransactionProfile } from '@/ai/schemas';
import { getAdminAndOrg } from './utils';

const db = getFirestore();

export const createTransaction = async (input: z.infer<typeof TransactionSchema>, actorUid: string) => {
    const { organizationId } = await getAdminAndOrg(actorUid);

    const newTransactionData = {
        ...input,
        companyId: organizationId,
        createdBy: actorUid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    };

    const transactionRef = await db.collection('transactions').add(newTransactionData);

    return { id: transactionRef.id };
};

export const listTransactions = async (actorUid: string): Promise<TransactionProfile[]> => {
    const { organizationId } = await getAdminAndOrg(actorUid);
    
    const transactionsSnapshot = await db.collection('transactions')
                                     .where('companyId', '==', organizationId)
                                     .orderBy('date', 'desc')
                                     .get();
    
    if (transactionsSnapshot.empty) {
        return [];
    }
    
    // Denormalization: Fetch account names
    const accountIds = [...new Set(transactionsSnapshot.docs.map(doc => doc.data().accountId).filter(id => id))];
    const accounts: Record<string, { name?: string }> = {};

    if (accountIds.length > 0) {
        const accountsSnapshot = await db.collection('accounts').where('__name__', 'in', accountIds).get();
        accountsSnapshot.forEach(doc => {
            accounts[doc.id] = { name: doc.data().name };
        });
    }

    const transactions: TransactionProfile[] = transactionsSnapshot.docs.map(doc => {
        const data = doc.data();
        const accountInfo = accounts[data.accountId] || {};
        const date = data.date ? data.date.toDate() : new Date();

        const parsedData = TransactionProfileSchema.parse({
            id: doc.id,
            ...data,
            date,
            createdAt: data.createdAt.toDate().toISOString(),
            updatedAt: data.updatedAt.toDate().toISOString(),
            accountName: accountInfo.name,
        });

        // Convert Date object back to ISO string for the client
        return {
            ...parsedData,
            date: parsedData.date.toISOString(),
        };
    });
    
    return transactions;
};
