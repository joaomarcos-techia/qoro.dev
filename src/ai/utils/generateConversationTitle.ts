'use server';

import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/googleai';

export async function generateConversationTitle(context: string): Promise<string> {
  if (!context || context.trim().length === 0) return 'Nova Conversa';

  const trimmed = context.trim().toLowerCase();

  const greetings = [
    'oi', 'ola', 'olá', 'bom dia', 'boa tarde',
    'boa noite', 'tudo bem', 'e ai', 'eae'
  ];

  const isGreeting = (txt: string) =>
    greetings.some(g => txt.startsWith(g)) && txt.length < 20;

  if (isGreeting(trimmed)) return 'Nova Conversa';

  try {
    const result = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: `
Crie um título curto e preciso de no máximo 3 palavras.
Ignore saudações (oi, olá, bom dia, etc).
Retorne apenas o título, sem aspas ou pontuação.

Início da conversa:
---
"${context}"
---
`.trim(),
      config: { temperature: 0.1, maxOutputTokens: 10 },
    });

    const rawTitle = result.text ?? '';
    const title = rawTitle
      .trim()
      .replace(/^["'`]+|["'`]+$/g, '') // remove aspas
      .replace(/[.!?]+$/, ''); // remove pontuação final

    if (title && title.split(/\s+/).length <= 3 && !isGreeting(title.toLowerCase())) {
      return title;
    }
  } catch (err) {
    console.error('Erro ao gerar título com IA:', err);
  }

  // Fallback: até 3 palavras úteis
  const words = trimmed.split(/\s+/).filter(w => w.length > 1).slice(0, 3);
  return words.length ? words.join(' ') : 'Nova Conversa';
}
