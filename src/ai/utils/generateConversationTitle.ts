
'use server';

import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { PulseMessage } from '../schemas';

/**
 * Gera um título curto e contextual (2-4 palavras) baseado nas primeiras mensagens do usuário.
 * Utiliza um prompt direto e um fallback inteligente para garantir um resultado útil.
 */
export async function generateConversationTitle(messages: PulseMessage[]): Promise<string> {
  const fallbackTitle = 'Nova conversa';

  if (!Array.isArray(messages) || messages.length === 0) {
    return fallbackTitle;
  }

  // Pega até as 3 primeiras mensagens do usuário para dar contexto
  const userMessages = messages.filter(m => m.role === 'user').slice(0, 3);
  
  // Se não houver mensagens de usuário, não podemos gerar um título.
  if (userMessages.length === 0) {
      return fallbackTitle;
  }

  const context = userMessages
    .map(m => m.content)
    .join('\n');

  try {
    const aiPrompt = `
Analise as mensagens abaixo e crie um título de 2 a 4 palavras que resuma o tema central.

NÃO use pontuação. NÃO use aspas. Retorne SOMENTE o título.

MENSAGENS:
---
${context}
---
TÍTULO:
    `.trim();

    const result = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: aiPrompt,
      config: { temperature: 0.2, maxOutputTokens: 15 },
    });

    let title = (result.text ?? '').trim();
    // Limpeza rigorosa para remover qualquer caractere indesejado
    title = title.replace(/[.,"':;!?]/g, '');

    // Se o título gerado for válido (mais de uma palavra), retorne
    if (title && title.split(' ').length > 1) {
        // Capitaliza a primeira letra de cada palavra
        return title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  } catch (error) {
    console.error('Erro na API da IA ao gerar título:', error);
    // Se a API falhar, o código prosseguirá para o fallback abaixo.
  }

  // Fallback definitivo: pega as 2 primeiras palavras da primeira mensagem do usuário.
  // Isso é muito mais útil do que "Nova conversa" ou um erro.
  const firstMessageWords = userMessages[0]?.content?.trim().split(/\s+/);
  if (firstMessageWords && firstMessageWords.length > 0) {
    return firstMessageWords.slice(0, 2).join(' ');
  }

  // Se tudo falhar, retorna o título provisório.
  return fallbackTitle;
}
