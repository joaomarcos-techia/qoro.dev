
'use server';

import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { PulseMessage } from '../schemas';

/**
 * Gera um título curto (máx. 4 palavras) para uma conversa
 * baseado no contexto das primeiras mensagens.
 * @param messages Histórico inicial da conversa (PulseMessage[]), idealmente as 3 primeiras.
 */
export async function generateConversationTitle(messages: PulseMessage[]): Promise<string> {
  const fallbackTitle = 'Nova conversa';

  if (!Array.isArray(messages) || messages.length < 3) {
    return fallbackTitle;
  }

  // Constrói um contexto com as 3 primeiras mensagens para a IA
  const context = messages
    .slice(0, 3)
    .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
    .join('\n');

  try {
    const aiPrompt = `
Analise o diálogo a seguir e crie um título curto e objetivo com no máximo 4 palavras que resuma o tema central da conversa.
Retorne apenas o título, sem aspas, pontuação final ou qualquer outra formatação.

Diálogo:
---
${context}
---
Título:
    `.trim();

    const result = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: aiPrompt,
      config: { temperature: 0.1, maxOutputTokens: 15 },
    });

    let title = (result.text ?? '').trim();
    
    // Limpeza rigorosa do título
    title = title.replace(/^["'“‘]|["'”’.,!?]+$/g, ''); // Remove aspas e pontuação final

    // Garante no máximo 4 palavras
    const words = title.split(/\s+/).filter(Boolean).slice(0, 4);
    title = words.join(' ');

    if (title) {
      return title;
    }
  } catch (error) {
    console.error('Erro ao gerar título com IA:', error);
  }
  
  // Fallback caso a IA falhe: pega as primeiras 4 palavras da primeira pergunta do usuário.
  const userMessageContent = messages.find(m => m.role === 'user')?.content || '';
  const usefulWords = userMessageContent
    .trim()
    .split(/\s+/)
    .slice(0, 4);

  if (usefulWords.length > 0) {
    return usefulWords.join(' ');
  }

  return fallbackTitle;
}
