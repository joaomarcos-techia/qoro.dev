'use server';
/**
 * @fileOverview QoroPulse Orchestrator Flow.
 * Responsável por gerenciar a conversa da IA, chamar ferramentas de CRM, Finance e Task,
 * e consolidar as respostas.
 */

import { defineFlow, ai } from '@genkit-ai/core';
import { gemini15Flash } from '@/ai/genkit';
import { getCrmSummaryTool } from '@/ai/tools/crm-tools';
import { listTasksTool, createTaskTool } from '@/ai/tools/task-tools';
import { listAccountsTool, getFinanceSummaryTool } from '@/ai/tools/finance-tools';

// Registrar todas as ferramentas disponíveis
const allTools = {
  getCrmSummaryTool,
  listTasksTool,
  createTaskTool,
  listAccountsTool,
  getFinanceSummaryTool,
};

// Helper seguro para extrair toolRequests
function extractToolRequests(llmResponse: any): any[] {
  if (!llmResponse) return [];
  if (Array.isArray(llmResponse.toolRequests)) return llmResponse.toolRequests;
  if (Array.isArray(llmResponse.toolCalls)) return llmResponse.toolCalls;
  if (Array.isArray(llmResponse.toolInvocations)) return llmResponse.toolInvocations;
  return [];
}

// Flow principal do Pulse
export const askPulse = defineFlow(
  {
    name: 'askPulse',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string' },
        actor: { type: 'string' },
        history: { type: 'array', items: { type: 'object' }, nullable: true },
      },
      required: ['prompt', 'actor'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        answer: { type: 'string' },
      },
    },
  },
  async ({ prompt, actor, history }) => {
    const newHistory = [
      ...(history ?? []),
      { role: 'user', content: prompt },
    ];

    // Primeira chamada ao modelo
    const llmResponse = await ai.generate({
      model: gemini15Flash,
      input: prompt,
      history: newHistory,
      tools: Object.values(allTools), // permite chamadas às ferramentas
      context: { actor },
    });

    let finalAnswer = llmResponse.output ?? 'Desculpe, não consegui gerar uma resposta.';

    // Processar chamadas de ferramenta (se houver)
    const toolRequests = extractToolRequests(llmResponse);

    if (toolRequests.length > 0) {
      for (const toolReq of toolRequests) {
        const tool = allTools[toolReq.name];
        if (!tool) continue;

        try {
          const toolResult = await ai.runTool(tool, {
            input: toolReq.input,
            context: { actor },
          });

          // Nova rodada no modelo, já com o resultado da ferramenta
          const secondResponse = await ai.generate({
            model: gemini15Flash,
            history: [
              ...newHistory,
              { role: 'tool', content: JSON.stringify(toolResult) },
            ],
            input: `O resultado da ferramenta ${toolReq.name} foi ${JSON.stringify(
              toolResult
            )}. Responda ao usuário com base nisso.`,
            context: { actor },
          });

          finalAnswer = secondResponse.output ?? finalAnswer;
        } catch (err: any) {
          finalAnswer = `Erro ao executar a ferramenta ${toolReq.name}: ${err.message}`;
        }
      }
    }

    return { answer: finalAnswer };
  }
);
