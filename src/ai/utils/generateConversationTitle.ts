import { ai } from '../genkit';
import { googleAI } from '@genkit-ai/googleai';

export async function generateConversationTitle(context: string): Promise<string> {
  if (!context || context.trim().length === 0) {
    return "Nova conversa";
  }
  
  const trimmedContext = context.trim().toLowerCase();
  
  // Lista de saudações comuns para evitar chamadas desnecessárias à IA na primeira mensagem.
  const commonGreetings = ['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem', 'tudo bem?', 'e ai', 'eae'];
  if (commonGreetings.some(greeting => trimmedContext.startsWith(greeting) && trimmedContext.length < 15)) {
      return "Nova Conversa";
  }

  try {
    const result = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: `
Com base no início da conversa abaixo, crie um título curto e preciso de no máximo 4 palavras.
O título deve capturar o assunto principal.
Retorne apenas o título. NADA MAIS.

Início da Conversa:
---
"${context}"
---
`.trim(),
      config: {
        temperature: 0.1,
        maxOutputTokens: 10,
      },
    });

    const title = result.text?.trim().replace(/^"|"$/g, '').replace(/\.$/, ''); // Remove aspas e pontos finais.
    
    // Se a IA retornar algo válido (não vazio e não uma saudação), use-o.
    if (title && title.length > 0 && !commonGreetings.includes(title.toLowerCase())) {
        return title;
    }

  } catch (err) {
    console.error("Erro ao gerar título com IA:", err);
  }

  // Fallback mais robusto caso a IA falhe ou retorne algo inútil.
  // Pega as primeiras 4 palavras da mensagem do usuário.
  const words = trimmedContext.split(' ');
  const fallbackTitle = words.slice(0, 4).join(' ');
  
  // Evita que o fallback seja uma saudação
  if (commonGreetings.includes(fallbackTitle.toLowerCase())) {
    return "Nova Conversa";
  }

  return fallbackTitle;
}
