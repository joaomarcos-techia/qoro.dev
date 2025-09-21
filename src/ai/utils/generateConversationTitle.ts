'use server';
// src/ai/utils/generateConversationTitle.ts
import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/googleai';

export async function generateConversationTitle(context: string): Promise<string> {
  if (!context || context.trim().length === 0) {
    return "Nova Conversa";
  }

  const trimmedContext = context.trim().toLowerCase();
  
  // Basic check for common greetings
  const greetings = ['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem'];
  if (greetings.includes(trimmedContext)) {
      return "Nova Conversa";
  }


  try {
    const result = await ai.generate({
      model: googleAI.model("gemini-1.5-flash"),
      prompt: `
Com base no início da conversa abaixo, crie um título curto e preciso de no máximo 4 palavras.
O título deve capturar o assunto principal. Retorne apenas o título, sem aspas ou pontuação.

Início da Conversa:
---
"${trimmedContext}"
---
`.trim(),
      config: {
        temperature: 0.1,
        maxOutputTokens: 12,
      },
    });

    const rawTitle = result.text ?? "";
    const title = rawTitle
      .trim()
      .replace(/^["'`]+|["'`]+$/g, "") // remove quotes
      .replace(/[.!?]+$/, ""); // remove final punctuation

    if (title && title.length > 1) {
      return title;
    }

  } catch (err) {
    console.error("Erro ao gerar título com IA:", err);
  }

  // Improved Fallback: uses up to 4 initial words, removing short words
  const words = trimmedContext
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 4);

  const fallbackTitle = words.join(" ");
  if (!fallbackTitle) {
    return "Nova Conversa";
  }

  return fallbackTitle.charAt(0).toUpperCase() + fallbackTitle.slice(1);
}
