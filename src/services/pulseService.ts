
'use server';
/**
 * @fileOverview Service for managing QoroPulse conversations in Firestore.
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminAndOrg } from './utils';
import { PulseMessageSchema } from '@/ai/schemas';
import { z } from 'zod';

const db = getFirestore();

export const saveConversation = async (
    actorUid: string, 
    title: string, 
    messages: z.infer<typeof PulseMessageSchema>[]
): Promise<string> => {
    const { organizationId } = await getAdminAndOrg(actorUid);
    
    const conversationData = {
        userId: actorUid,
        organizationId,
        title,
        messages,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    };

    const conversationRef = await db.collection('pulse_conversations').add(conversationData);
    return conversationRef.id;
}

export const updateConversation = async (
    conversationId: string, 
    actorUid: string, 
    messages: z.infer<typeof PulseMessageSchema>[]
): Promise<void> => {
    const { organizationId } = await getAdminAndOrg(actorUid);
    const conversationRef = db.collection('pulse_conversations').doc(conversationId);

    // Optional: Verify ownership before updating
    const doc = await conversationRef.get();
    if (!doc.exists || doc.data()?.organizationId !== organizationId) {
        throw new Error("Conversation not found or access denied.");
    }

    await conversationRef.update({
        messages,
        updatedAt: FieldValue.serverTimestamp(),
    });
}
