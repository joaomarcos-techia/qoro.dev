'use server';
/**
 * @fileOverview Service layer for QoroPulse conversations, using Firebase Admin SDK.
 * Versão melhorada com tratamento de erros robusto e retry automático.
 */

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import {
  PulseMessage,
  Conversation as ConversationProfile,
  ConversationProfileSchema,
} from '@/ai/schemas';

// 🔹 Esquema para mensagens do Firestore
const FirestoreMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'tool', 'model']),
  content: z.string().default(''),
});

const FirestoreConversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  userId: z.string(),
  messages: z.array(FirestoreMessageSchema),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export type FirestoreConversation = z.infer<typeof FirestoreConversationSchema>;

const COLLECTION = 'pulse_conversations';

/**
 * 🔹 Função de retry com backoff exponencial
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  operationName: string = 'Firestore operation'
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`${operationName} falhou na tentativa ${attempt + 1}:`, error);
      
      // Se é a última tentativa, joga o erro
      if (attempt === maxRetries - 1) {
        console.error(`${operationName} falhou após ${maxRetries} tentativas:`, lastError);
        throw new Error(`Operação falhou após ${maxRetries} tentativas: ${lastError.message}`);
      }
      
      // Backoff exponencial com jitter
      const jitter = Math.random() * 500; // 0-500ms de aleatoriedade
      const delay = baseDelay * Math.pow(2, attempt) + jitter;
      
      console.log(`Aguardando ${Math.round(delay)}ms antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * 🔹 Sanitizar mensagens para compatibilidade com Firestore
 */
function sanitizeMessages(messages?: PulseMessage[]): z.infer<typeof FirestoreMessageSchema>[] {
  if (!Array.isArray(messages)) return [];
  
  return messages
    .filter((m) => m && typeof m === 'object' && m.content) // Filtrar mensagens inválidas
    .map((m) => {
      try {
        const role = ['assistant', 'user', 'tool', 'model'].includes(m.role) ? m.role : 'user';
        const content = typeof m.content === 'string' 
          ? m.content.trim() 
          : String(m.content || '').trim();
          
        return { role, content };
      } catch (error) {
        console.warn('Erro ao sanitizar mensagem:', error, m);
        return { role: 'user' as const, content: 'Mensagem corrompida' };
      }
    })
    .filter((m) => m.content.length > 0); // Remover mensagens vazias
}

/**
 * 🔹 Validar entrada do usuário
 */
function validateUserInput(input: any, requiredFields: string[]): void {
  if (!input || typeof input !== 'object') {
    throw new Error('Entrada inválida: deve ser um objeto');
  }
  
  for (const field of requiredFields) {
    if (!input[field]) {
      throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  }
  
  if (input.actor && typeof input.actor !== 'string') {
    throw new Error('Campo "actor" deve ser uma string');
  }
  
  if (input.conversationId && typeof input.conversationId !== 'string') {
    throw new Error('Campo "conversationId" deve ser uma string');
  }
}

/**
 * 🔹 Criar nova conversa
 */
export async function createConversation(input: {
  actor: string;
  messages: PulseMessage[];
  title?: string;
}): Promise<ConversationProfile> {
  try {
    validateUserInput(input, ['actor', 'messages']);
    
    if (!Array.isArray(input.messages) || input.messages.length === 0) {
      throw new Error('Lista de mensagens não pode estar vazia');
    }
    
    const safeMessages = sanitizeMessages(input.messages);
    
    if (safeMessages.length === 0) {
      throw new Error('Nenhuma mensagem válida encontrada');
    }
    
    const operation = async () => {
      const docRef = adminDb.collection(COLLECTION).doc();
      
      const convData = {
        userId: input.actor.trim(),
        title: input.title?.trim() || safeMessages[0]?.content?.slice(0, 30) || 'Nova conversa',
        messages: safeMessages,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      
      await docRef.set(convData);
      
      return {
        id: docRef.id,
        title: convData.title,
        messages: safeMessages,
        updatedAt: new Date().toISOString(),
      };
    };
    
    return await withRetry(operation, 3, 1000, 'Criar conversa');
    
  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    throw new Error(`Falha ao criar conversa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * 🔹 Carregar conversa existente
 */
export async function getConversation(input: {
  conversationId: string;
  actor: string;
}): Promise<ConversationProfile | null> {
  try {
    validateUserInput(input, ['conversationId', 'actor']);
    
    const operation = async () => {
      const conversationRef = adminDb.collection(COLLECTION).doc(input.conversationId.trim());
      const snap = await conversationRef.get();
      
      if (!snap.exists) {
        return null;
      }
      
      const data = snap.data();
      
      if (!data) {
        console.warn('Documento existe mas não tem dados:', input.conversationId);
        return null;
      }
      
      // Verificação de segurança
      if (data.userId !== input.actor.trim()) {
        console.warn('Tentativa de acesso não autorizado:', { 
          conversationId: input.conversationId, 
          expectedUser: input.actor, 
          actualUser: data.userId 
        });
        return null;
      }
      
      // Validar e sanitizar dados
      const messages = sanitizeMessages(data.messages || []);
      
      return {
        id: snap.id,
        title: data.title || 'Conversa sem título',
        messages,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    };
    
    return await withRetry(operation, 3, 1000, 'Carregar conversa');
    
  } catch (error) {
    console.error('Erro ao carregar conversa:', error);
    throw new Error(`Falha ao carregar conversa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * 🔹 Atualizar conversa existente
 */
export async function updateConversation(
  actor: string,
  conversationId: string,
  update: { messages?: PulseMessage[]; title?: string }
): Promise<void> {
  try {
    validateUserInput({ actor, conversationId }, ['actor', 'conversationId']);
    
    if (!update || (update.messages === undefined && update.title === undefined)) {
      throw new Error('Nenhuma atualização fornecida');
    }
    
    const operation = async () => {
      const docRef = adminDb.collection(COLLECTION).doc(conversationId.trim());
      
      // Verificar se existe e se o usuário tem acesso
      const currentDoc = await docRef.get();
      if (!currentDoc.exists) {
        throw new Error('Conversa não encontrada');
      }
      
      const currentData = currentDoc.data();
      if (!currentData || currentData.userId !== actor.trim()) {
        throw new Error('Acesso negado à conversa');
      }
      
      // Preparar payload de atualização
      const payload: any = {
        updatedAt: FieldValue.serverTimestamp(),
      };
      
      if (update.title !== undefined) {
        payload.title = update.title.trim() || 'Conversa sem título';
      }
      
      if (update.messages !== undefined) {
        const sanitizedMessages = sanitizeMessages(update.messages);
        if (sanitizedMessages.length === 0) {
          throw new Error('Lista de mensagens atualizada não pode estar vazia');
        }
        payload.messages = sanitizedMessages;
      }
      
      await docRef.update(payload);
    };
    
    await withRetry(operation, 3, 1000, 'Atualizar conversa');
    
  } catch (error) {
    console.error('Erro ao atualizar conversa:', error);
    throw new Error(`Falha ao atualizar conversa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * 🔹 Deletar uma conversa
 */
export async function deleteConversation(input: {
  conversationId: string;
  actor: string;
}): Promise<{ success: boolean }> {
  try {
    validateUserInput(input, ['conversationId', 'actor']);
    
    const operation = async () => {
      const conversationRef = adminDb.collection(COLLECTION).doc(input.conversationId.trim());
      
      // Verificar se existe e se o usuário tem acesso
      const currentDoc = await conversationRef.get();
      if (!currentDoc.exists) {
        console.warn('Tentativa de deletar conversa inexistente:', input.conversationId);
        return { success: false };
      }
      
      const currentData = currentDoc.data();
      if (!currentData || currentData.userId !== input.actor.trim()) {
        console.warn('Tentativa de deletar conversa sem autorização:', { 
          conversationId: input.conversationId, 
          expectedUser: input.actor 
        });
        return { success: false };
      }
      
      await conversationRef.delete();
      return { success: true };
    };
    
    return await withRetry(operation, 3, 1000, 'Deletar conversa');
    
  } catch (error) {
    console.error('Erro ao deletar conversa:', error);
    return { success: false };
  }
}

/**
 * 🔹 Listar todas as conversas de um usuário
 */
export async function listConversations(input: { 
  actor: string;
  limit?: number;
}): Promise<z.infer<typeof ConversationProfileSchema>[]> {
  try {
    validateUserInput(input, ['actor']);
    
    const limit = input.limit && input.limit > 0 ? Math.min(input.limit, 100) : 50;
    
    const operation = async () => {
      const q = adminDb.collection(COLLECTION)
        .where("userId", "==", input.actor.trim())
        .orderBy("updatedAt", "desc")
        .limit(limit);
      
      const snap = await q.get();
      
      if (snap.empty) {
        return [];
      }
      
      const list: z.infer<typeof ConversationProfileSchema>[] = [];
      
      snap.forEach((doc) => {
        try {
          const data = doc.data();
          
          if (!data) {
            console.warn('Documento sem dados encontrado:', doc.id);
            return;
          }
          
          const parsed = ConversationProfileSchema.safeParse({ 
            id: doc.id, 
            title: data.title || 'Conversa sem título',
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
          });
          
          if (parsed.success) {
            list.push(parsed.data);
          } else {
            console.warn("Conversa inválida encontrada no DB:", { 
              id: doc.id, 
              error: parsed.error,
              data: { title: data.title, updatedAt: data.updatedAt }
            });
          }
        } catch (error) {
          console.warn('Erro ao processar documento:', doc.id, error);
        }
      });
      
      return list;
    };
    
    return await withRetry(operation, 3, 1000, 'Listar conversas');
    
  } catch (error) {
    console.error('Erro ao listar conversas:', error);
    return []; // Retorna lista vazia em caso de erro
  }
}