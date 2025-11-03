
'use server';

import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { PulseMessage } from '../schemas';

/**
 * Gera um título curto e contextual (2-3 palavras) baseado nas primeiras mensagens do usuário.
 */
export async function generateConversationTitle(messages: PulseMessage[]): Promise<string> {
  const fallbackTitle = 'Nova conversa';

  if (!Array.isArray(messages) || messages.length === 0) {
    return fallbackTitle;
  }

  // Pega até as 3 primeiras mensagens do usuário para dar contexto
  const userMessages = messages.filter(m => m.role === 'user').slice(0, 3);
  const context = userMessages
    .map(m => `Usuário: ${m.content}`)
    .join('\n');

  if (!context) {
    return fallbackTitle;
  }

  try {
    const aiPrompt = `
Analise a conversa e extraia as 2 a 3 palavras-chave mais importantes (verbos ou substantivos) que definem o assunto principal.
Retorne apenas as palavras-chave, sem pontuação.

CONVERSA:
---
${context}
---
PALAVRAS-CHAVE:
    `.trim();

    const result = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: aiPrompt,
      config: { temperature: 0.2, maxOutputTokens: 15 },
    });

    let title = (result.text ?? '').trim();
    
    // Limpeza final para remover aspas ou pontuações que a IA possa adicionar
    title = title.replace(/^["'“‘]|["'”’,.!?]+$/g, '');

    if (title) {
        // Capitaliza a primeira letra de cada palavra
        return title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  } catch (error) {
    console.error('Erro ao gerar título com IA, usando fallback:', error);
    // Em caso de falha da API, retorna o título padrão seguro.
    return fallbackTitle;
  }

  // Se a IA não retornar um título válido, use o fallback.
  return fallbackTitle;
}
