
'use server';

import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { PulseMessage } from '../schemas';

/**
 * Gera um título curto e contextual (3 palavras) baseado no diálogo inicial.
 * @param messages Histórico da conversa (PulseMessage[]).
 */
export async function generateConversationTitle(messages: PulseMessage[]): Promise<string> {
  const fallbackTitle = 'Nova conversa';

  // Garante que temos um diálogo mínimo (ex: user -> assistant -> user)
  if (!Array.isArray(messages) || messages.length < 3) {
    return fallbackTitle;
  }

  // Pega as 3 primeiras mensagens para ter um bom contexto de diálogo
  const contextMessages = messages.slice(0, 3);
  const context = contextMessages
    .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
    .join('\n');

  try {
    // Prompt mais direto, focado na tarefa de extrair um assunto.
    const aiPrompt = `
O diálogo abaixo é o início de uma conversa. Extraia o assunto principal em 3 palavras para ser usado como título. Retorne APENAS o título.

Diálogo:
---
${context}
---
Título:
    `.trim();

    const result = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: aiPrompt,
      config: { temperature: 0.2, maxOutputTokens: 12 },
    });

    let title = (result.text ?? '').trim();
    // Limpa pontuações e aspas que a IA possa adicionar
    title = title.replace(/^["'“‘]|["'”’.,!?]+$/g, ''); 
    
    if (title) {
      return title;
    }
  } catch (error) {
    console.error('Erro ao gerar título com IA:', error);
  }

  // Fallback aprimorado: pega as 3 primeiras palavras da primeira pergunta do usuário.
  const userMessageContent = messages.find(m => m.role === 'user')?.content || '';
  const fallbackWords = userMessageContent.trim().split(/\s+/).slice(0, 3);

  return fallbackWords.length > 0 ? fallbackWords.join(' ') : fallbackTitle;
}
