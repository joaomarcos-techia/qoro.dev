
import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/googleai';

export async function generateConversationTitle(firstUserMessage: string): Promise<string> {
  if (!firstUserMessage || firstUserMessage.trim().length === 0) {
    return "Nova conversa";
  }
  
  const trimmedMessage = firstUserMessage.trim().toLowerCase();
  
  // Fallback para saudações comuns
  const commonGreetings = ['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite'];
  if (commonGreetings.includes(trimmedMessage)) {
      return "Nova Conversa";
  }

  try {
    const result = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: `
Resuma o seguinte texto em **no máximo 3 palavras**.
Retorne apenas o título curto, nada mais.

Texto: "${firstUserMessage}"
`.trim(),
      config: {
        temperature: 0.2,
        maxOutputTokens: 10,
      },
    });

    const title = result.text?.trim();
    // Adiciona uma verificação para não usar saudações como título caso a IA retorne uma
    if (title && !commonGreetings.includes(title.toLowerCase())) {
        return title;
    }
  } catch (err) {
    console.error("Erro ao gerar título com IA:", err);
  }

  // fallback se a IA não responder ou retornar uma saudação
  return firstUserMessage.length > 25
    ? firstUserMessage.substring(0, 25) + "..."
    : firstUserMessage;
}
