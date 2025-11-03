'use server';

import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { PulseMessage } from '../schemas';

/**
 * Gera um título curto e contextual (2 palavras) baseado nas primeiras mensagens do usuário.
 */
export async function generateConversationTitle(messages: PulseMessage[]): Promise<string> {
  const fallbackTitle = 'Nova conversa';

  if (!Array.isArray(messages) || messages.length === 0) {
    return fallbackTitle;
  }

  // Pega até as 3 primeiras mensagens do usuário
  const userMessages = messages.filter(m => m.role === 'user').slice(0, 3);
  const context = userMessages
    .map(m => `Usuário: ${m.content}`)
    .join('\n');

  try {
    const aiPrompt = `
O diálogo abaixo é o início de uma conversa. Extraia o assunto principal em DUAS palavras para ser usado como título. 
Retorne APENAS o título, sem pontuação, sem aspas, sem formatação.

Diálogo:
---
${context}
---
Título:
    `.trim();

    const result = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: aiPrompt,
      config: { temperature: 0.2, maxOutputTokens: 10 },
    });

    let title = (result.text ?? '').trim();
    title = title.replace(/^["'“‘]|["'”’.,!?]+$/g, '');

    // Garante que são só duas palavras
    title = title.split(/\s+/).slice(0, 2).join(' ');

    if (title) return title;
  } catch (error) {
    console.error('Erro ao gerar título com IA:', error);
  }

  // Fallback: 2 primeiras palavras da 1ª mensagem do usuário
  const fallbackWords = userMessages[0]?.content?.trim().split(/\s+/).slice(0, 2) || [];
  return fallbackWords.length > 0 ? fallbackWords.join(' ') : fallbackTitle;
}
