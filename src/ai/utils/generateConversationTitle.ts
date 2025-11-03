
'use server';

import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { PulseMessage } from '../schemas';

/**
 * Tenta gerar um título contextual de 2 a 3 palavras. 
 * Se a geração de IA falhar ou retornar um valor inválido, 
 * a mensagem de erro exata é retornada para fins de depuração.
 */
export async function generateConversationTitle(messages: PulseMessage[]): Promise<string> {
  const context = messages
    .map(m => `Usuário: ${m.content}`)
    .join('\n');

  try {
    const aiPrompt = `
Analise a conversa e extraia as 2 a 3 palavras-chave mais importantes (verbos ou substantivos) que definem o assunto principal. 
Retorne apenas as palavras-chave, sem pontuação.

Diálogo:
---
${context}
---
Palavras-chave do Título:
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
