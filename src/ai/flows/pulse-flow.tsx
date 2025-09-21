'use server';

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { AskPulseInputSchema, AskPulseOutputSchema, PulseMessage } from '@/ai/schemas';
import { generateConversationTitle } from '../utils/generateConversationTitle';

export type { AskPulseInput, AskPulseOutput, PulseMessage } from '@/ai/schemas';

const roleMap: Record<PulseMessage['role'], 'user' | 'model'> = {
  user: 'user',
  assistant: 'model',
  model: 'model',
  tool: 'user',
};

const pulseFlow = ai.defineFlow(
  {
    name: 'pulseFlow',
    inputSchema: AskPulseInputSchema,
    outputSchema: AskPulseOutputSchema,
  },
  async (input: z.infer<typeof AskPulseInputSchema>) => {
    const { actor, messages } = input;
    const userId = actor;

    const systemPrompt = `
Você é o QoroPulse, um assistente de negócios especialista e proativo, integrado à plataforma de gestão Qoro. Sua missão é fornecer insights, responder perguntas e ajudar o usuário a gerenciar sua empresa com mais eficiência, sempre se comunicando em português do Brasil.

A plataforma Qoro possui os seguintes módulos:
- QoroCRM: Para gestão de clientes, funil de vendas, produtos e orçamentos.
- QoroTask: Para gestão de tarefas, projetos e produtividade da equipe.
- QoroFinance: Para controle de transações financeiras, contas a pagar/receber e fluxo de caixa.

Seu comportamento:
- Proatividade: Não espere apenas por perguntas. Se um usuário diz "vendas", sugira ações relevantes como "Você gostaria de ver um relatório de vendas do último mês?", "Quer analisar o funil de clientes?" ou "Precisa cadastrar um novo produto?".
- Contexto é tudo: Sempre relacione as perguntas ao contexto de gestão de uma empresa. Uma palavra como "Vendas" NUNCA se refere a "curativos" (bandages), mas sim a processos comerciais.
- Clareza e Simplicidade: Comunique-se de forma clara e direta, evitando jargão técnico excessivo.
- Amigável e prestativo: Mantenha um tom profissional, mas acessível e encorajador.
`.trim();

    const conversationHistory = messages.map(m => ({
      role: roleMap[m.role] || 'user',
      content: [{ text: m.content ?? '' }],
    }));

    const genkitMessages = [
      { role: 'system' as const, content: [{ text: systemPrompt }] },
      ...conversationHistory,
    ];

    let result;
    try {
      result = await ai.generate({
        model: googleAI.model('gemini-1.5-flash'),
        messages: genkitMessages,
        config: {
          temperature: 0.5,
          maxOutputTokens: 1024,
        },
      });
    } catch (err) {
      console.error('AI Generation Error in pulse-flow:', err);
      throw new Error('Falha ao gerar resposta da IA.');
    }

    const responseText = result.text ?? 'Desculpe, não consegui processar sua pergunta. Tente novamente.';
    const responseMessage: PulseMessage = { role: 'assistant', content: responseText };

    let conversationId = input.conversationId;
    const finalMessages = [...messages, responseMessage];

    if (conversationId) {
      const conversationRef = adminDb.collection('pulse_conversations').doc(conversationId);
      const updatePayload: { [key: string]: any } = {
        messages: finalMessages.map(m => ({ ...m })),
        updatedAt: FieldValue.serverTimestamp(),
      };
      
      const doc = await conversationRef.get();
      const currentTitle = doc.data()?.title;

      if (currentTitle === 'Nova Conversa') {
        const contextForTitle = finalMessages
          .filter(m => m.role === 'user')
          .slice(0, 2)
          .map(m => m.content)
          .join(' ');
          
        const newTitle = await generateConversationTitle(contextForTitle);
        if (newTitle !== 'Nova Conversa') {
          updatePayload.title = newTitle;
        }
      }
      
      await conversationRef.update(updatePayload);

    } else {
      const addedRef = await adminDb.collection('pulse_conversations').add({
        userId,
        messages: finalMessages.map(m => ({ ...m })),
        title: 'Nova Conversa',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      conversationId = addedRef.id;
    }

    return { response: responseMessage, conversationId };
  }
);

export async function askPulse(
  input: z.infer<typeof AskPulseInputSchema>
): Promise<z.infer<typeof AskPulseOutputSchema>> {
  return pulseFlow(input);
}
