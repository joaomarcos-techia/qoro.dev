import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/googleai';

export async function generateConversationTitle(firstUserMessage: string): Promise<string> {
  if (!firstUserMessage || firstUserMessage.trim().length === 0) {
    return "Nova conversa";
  }
  
  const trimmedMessage = firstUserMessage.trim().toLowerCase();
  
  // Lista de saudações comuns para evitar chamadas desnecessárias à IA na primeira mensagem.
  const commonGreetings = ['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem', 'tudo bem?', 'e ai', 'eae'];
  if (commonGreetings.some(greeting => trimmedMessage.startsWith(greeting))) {
      return "Nova Conversa";
  }

  try {
    const result = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: `
Resuma o seguinte texto em **no máximo 3 palavras**.
Se o texto for uma saudação ou pergunta curta, use as palavras-chave principais.
Retorne apenas o título. NADA MAIS.

Texto: "${firstUserMessage}"
`.trim(),
      config: {
        temperature: 0.1,
        maxOutputTokens: 10,
      },
    });

    const title = result.text?.trim().replace(/^"|"$/g, ''); // Remove aspas do resultado
    
    // Se a IA retornar algo válido (não vazio e não uma saudação), use-o.
    if (title && title.length > 0 && !commonGreetings.includes(title.toLowerCase())) {
        return title;
    }

  } catch (err) {
    console.error("Erro ao gerar título com IA:", err);
  }

  // Fallback mais robusto caso a IA falhe ou retorne algo inútil.
  // Pega as primeiras 3 palavras da mensagem do usuário.
  const words = trimmedMessage.split(' ');
  if (words.length <= 3) {
      return trimmedMessage;
  }
  return words.slice(0, 3).join(' ');
}
