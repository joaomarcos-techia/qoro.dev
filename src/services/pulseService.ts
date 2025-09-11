
'use server';
/**
 * @fileOverview Service layer for QoroPulse conversations.
 * Handles Firestore persistence with strict sanitization.
 */

import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { z } from 'zod';
import {
  PulseMessage,
  Conversation as ConversationSchemaType
} from '@/ai/schemas';

const ConversationSchema = z.object({
  id: z.string(),
  actor: z.string(),
  title: z.string().default('Nova conversa'),
  updatedAt: z.any().optional(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().default(''),
    })
  ),
});
export type Conversation = z.infer<typeof ConversationSchema>;

const COLLECTION = 'pulse_conversations';

/**
 * 🔹 Sanitize messages to ensure Firestore compatibility
 */
function sanitizeMessages(messages: PulseMessage[]): PulseMessage[] {
  return (messages || []).map((m) => ({
    role: m.role,
    content: m.content ?? '',
  }));
}

/**
 * 🔹 Create new conversation
 */
export async function createConversation(input: {
  actor: string;
  messages: PulseMessage[];
  title?: string;
}): Promise<Conversation> {
  const safeMessages = sanitizeMessages(input.messages);

  const newId = crypto.randomUUID();
  const conv: Conversation = {
    id: newId,
    actor: input.actor,
    title: input.title?.trim() || safeMessages[0]?.content?.slice(0, 30) || 'Nova conversa',
    messages: safeMessages,
    updatedAt: new Date(),
  };

  const conversationRef = doc(db, COLLECTION, newId);
  await setDoc(conversationRef, conv, { merge: true });
  return conv;
}

/**
 * 🔹 Load existing conversation
 */
export async function getConversation(input: {
  conversationId: string;
  actor: string;
}): Promise<Conversation | null> {
  const conversationRef = doc(db, COLLECTION, input.conversationId);
  const snap = await getDoc(conversationRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  if (!data) return null;
  if (data.actor !== input.actor) return null; // segurança: cada ator só vê suas conversas

  const parsed = ConversationSchema.safeParse({ id: snap.id, ...data });
  return parsed.success ? parsed.data : null;
}

/**
 * 🔹 Update existing conversation
 */
export async function updateConversation(
  actor: string,
  conversationId: string,
  update: { messages?: PulseMessage[]; title?: string }
): Promise<void> {
  const safeMessages = sanitizeMessages(update.messages || []);

  const payload: any = {
    updatedAt: new Date(),
  };
  if(update.title) payload.title = update.title;
  if(safeMessages.length > 0) payload.messages = safeMessages;


  if (Object.keys(payload).length <= 1) return; // nada para salvar além da data

  const conversationRef = doc(db, COLLECTION, conversationId);
  await updateDoc(conversationRef, payload);
}

/**
 * 🔹 Delete a conversation
 */
export async function deleteConversation(input: {
  conversationId: string;
  actor: string;
}): Promise<{ success: boolean }> {
  const conv = await getConversation(input);
  if (!conv) return { success: false };

  const conversationRef = doc(db, COLLECTION, input.conversationId);
  await deleteDoc(conversationRef);
  return { success: true };
}

/**
 * 🔹 List all conversations for an actor
 */
export async function listConversations(input: { actor: string }): Promise<ConversationSchemaType[]> {
    const q = query(collection(db, COLLECTION), where("actor", "==", input.actor));
    const snap = await getDocs(q);

    const list: ConversationSchemaType[] = [];
    snap.forEach((doc) => {
        const data = doc.data();
        const parsed = ConversationSchema.safeParse({ id: doc.id, ...data });
        if (parsed.success) {
            list.push(parsed.data);
        } else {
            console.warn("Found invalid conversation in DB:", parsed.error);
        }
    });

    return list.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt.seconds * 1000) : new Date(0);
        const dateB = b.updatedAt ? new Date(b.updatedAt.seconds * 1000) : new Date(0);
        return dateB.getTime() - dateA.getTime();
    });
}
