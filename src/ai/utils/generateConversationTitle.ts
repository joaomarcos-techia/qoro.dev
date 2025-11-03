
'use server';

import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { PulseMessage } from '../schemas';

/**
 * Tenta gerar um título contextual de 2 a 4 palavras. 
 * Se a geração de IA falhar ou retornar um valor inválido, 
 * a mensagem de erro exata é retornada para fins de depuração.
 */
export async function generateConversationTitle(messages: PulseMessage[]): Promise<string> {
  // Pega até as 3 primeiras mensagens do usuário para dar contexto
  const userMessages = messages.filter(m => m.role === 'user').slice(0, 3);
  
  if (userMessages.length === 0) {
      return "Sem contexto de usuário"; // Retorna uma mensagem clara se não houver entrada
  }

  const context = userMessages
    .map(m => `Usuário: ${m.content}`)
    .join('\n');

  try {
    const aiPrompt = `
Analise o seguinte diálogo e crie um título de 2 a 4 palavras que resuma o tema central.

NÃO use pontuação. NÃO use aspas. Retorne SOMENTE o título.

Diálogo:
---
${context}
---
Título:
    `.trim();

    const result = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: aiPrompt,
      config: { temperature: 0.2, maxOutputTokens: 15 },
    });

    const title = result.text?.trim().replace(/^["'“‘]|["'”’.,!?]+$/g, '');

    // Validação rigorosa: se o título não for uma string com mais de uma palavra, lança um erro.
    if (!title || title.split(' ').length < 2) {
      throw new Error("A IA retornou um título inválido.");
    }

    return title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  } catch (error: any) {
    console.error('Erro na API da IA ao gerar título:', error);
    // Retorna a mensagem de erro exata como o título para depuração.
    return error.message || "Erro desconhecido na geração do título";
  }
}
