
'use server';
/**
 * @fileOverview Service for managing QoroPulse conversations in Firestore.
 */
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { ConversationSchema, ConversationProfileSchema, PulseMessage, PulseMessageSchema } from '@/ai/schemas';
import { getAdminAndOrg } from './utils';
import { adminDb } from '@/lib/firebase-admin';

// Helper to convert Firestore Timestamps in nested objects to ISO strings for client compatibility
const convertTimestampsToISO = (obj: any): any => {
    if (!obj) return obj;
    if (obj instanceof Timestamp) {
        return obj.toDate().toISOString();
    }
    if (Array.isArray(obj)) {
        return obj.map(convertTimestampsToISO);
    }
    if (typeof obj === 'object' && obj !== null) {
        const newObj: { [key: string]: any } = {};
        for (const key in obj) {
            newObj[key] = convertTimestampsToISO(obj[key]);
        }
        return newObj;
    }
    return obj;
};

// Sanitizes a message object to ensure it's safe for Firestore.
function sanitizeMessage(message: any): PulseMessage {
    const { role, content } = message;
    return {
        role: role || 'assistant',
        content: content || '', // Ensure content is always a string
    };
}


export const createConversation = async ({ actor, messages, title }: { actor: string; messages: PulseMessage[]; title?: string; }): Promise<{ id: string, title: string }> => {
    const { organizationId } = await getAdminAndOrg(actor);
    const newDocRef = adminDb.collection('pulse_conversations').doc();

    const newConversationData = {
        userId: actor,
        organizationId,
        title: title || 'Nova Conversa',
        messages: messages.map(sanitizeMessage), // Sanitize messages on creation
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    };

    await newDocRef.set(newConversationData);
    return { id: newDocRef.id, title: newConversationData.title };
};

export const updateConversation = async (actorUid: string, conversationId: string, updatedConversation: Partial<Omit<z.infer<typeof ConversationSchema>, 'id'>>): Promise<void> => {
    const { organizationId } = await getAdminAndOrg(actorUid);
    const conversationRef = adminDb.collection('pulse_conversations').doc(conversationId);

    const doc = await conversationRef.get();
    if (!doc.exists || doc.data()?.organizationId !== organizationId || doc.data()?.userId !== actorUid) {
        throw new Error("Conversa não encontrada ou acesso negado.");
    }
    
    const updateData: any = {
        updatedAt: FieldValue.serverTimestamp(),
    };

    if(updatedConversation.messages) {
        updateData.messages = updatedConversation.messages.map(sanitizeMessage); // Sanitize on update
    }
    if(updatedConversation.title) {
        updateData.title = updatedConversation.title;
    }

    await conversationRef.update(updateData);
};

export const getConversation = async ({ conversationId, actor }: { conversationId: string, actor: string }): Promise<z.infer<typeof ConversationSchema> | null> => {
    const { organizationId } = await getAdminAndOrg(actor);
    const conversationRef = adminDb.collection('pulse_conversations').doc(conversationId);

    const doc = await conversationRef.get();
    if (!doc.exists || doc.data()?.organizationId !== organizationId || doc.data()?.userId !== actor) {
        return null;
    }
    
    const data = doc.data();
    if (!data) return null;
    
    // Validate messages from DB with safeParse
    const rawMessages = data.messages ?? [];
    const parsedMessages = z.array(PulseMessageSchema).safeParse(rawMessages);
    
    if (!parsedMessages.success) {
        console.error("Invalid messages found in Firestore conversation, returning empty.", parsedMessages.error);
        data.messages = [];
    } else {
        data.messages = parsedMessages.data;
    }

    const parsedData = ConversationSchema.parse({
        id: doc.id,
        title: data.title,
        messages: data.messages,
    })
    
    return parsedData;
};

export const listConversations = async ({ actor }: { actor: string }): Promise<z.infer<typeof ConversationProfileSchema>[]> => {
    try {
        const { organizationId } = await getAdminAndOrg(actor);
        const snapshot = await adminDb.collection('pulse_conversations')
            .where('organizationId', '==', organizationId)
            .where('userId', '==', actor)
            .orderBy('updatedAt', 'desc') 
            .limit(50)
            .get();

        if (snapshot.empty) {
            return [];
        }
        
        const conversations = snapshot.docs.map(doc => {
            const data = doc.data();
            const sanitizedData = convertTimestampsToISO(data);
            return ConversationProfileSchema.parse({
                id: doc.id,
                ...sanitizedData,
            });
        });
        
        return conversations;
    } catch (error: any) {
        console.error("Error listing conversations in service:", error);
        if (error.code === 'FAILED_PRECONDITION') {
            throw new Error('A consulta do histórico de conversas requer um índice. Verifique a configuração do Firestore Indexes.');
        }
        throw new Error(`Failed to fetch conversations: ${error.message}`);
    }
};

export const deleteConversation = async ({ conversationId, actor }: { conversationId: string, actor: string }): Promise<{ success: boolean }> => {
    const { organizationId } = await getAdminAndOrg(actor);
    const conversationRef = adminDb.collection('pulse_conversations').doc(conversationId);

    const doc = await conversationRef.get();
    if (!doc.exists || doc.data()?.organizationId !== organizationId || doc.data()?.userId !== actor) {
        throw new Error("Conversa não encontrada ou acesso negado.");
    }

    await conversationRef.delete();
    return { success: true };
};
