
'use server';
/**
 * @fileOverview Defines Genkit tools for the CRM module.
 * These tools allow the AI agent (QoroPulse) to interact with CRM data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as crmService from '@/services/crmService';
import { CustomerProfileSchema } from '@/ai/schemas';

// Define the tool for listing customers
export const listCustomersTool = ai.defineTool(
    {
        name: 'listCustomersTool',
        description: 'Obtém uma lista detalhada de todos os clientes da organização. Use isso para perguntas que exigem detalhes específicos de clientes individuais.',
        inputSchema: z.object({}),
        outputSchema: z.array(CustomerProfileSchema),
    },
    async (_, context) => {
        if (!context?.actor) {
            throw new Error('Autenticação do usuário é necessária para listar clientes.');
        }
        return crmService.listCustomers(context.actor);
    }
);


const CrmSummarySchema = z.object({
    totalCustomers: z.number().describe("O número total de clientes cadastrados."),
    customersByStatus: z.record(z.string(), z.number()).describe("Um objeto mostrando a contagem de clientes em cada estágio do funil de vendas (ex: { 'Novo': 10, 'Ganho': 5 })."),
});

// Define a new, more efficient tool for getting a CRM summary
export const getCrmSummaryTool = ai.defineTool(
    {
        name: 'getCrmSummaryTool',
        description: 'Recupera um resumo dos dados do CRM, incluindo o número total de clientes e a contagem de clientes por status (funil de vendas). Use esta ferramenta para responder a perguntas de alto nível sobre o desempenho de vendas e a base de clientes.',
        inputSchema: z.object({}),
        outputSchema: CrmSummarySchema,
    },
    async (_, context) => {
        if (!context?.actor) {
            throw new Error('Autenticação do usuário é necessária para obter o resumo do CRM.');
        }
        const customers = await crmService.listCustomers(context.actor);
        const totalCustomers = customers.length;
        const customersByStatus = customers.reduce((acc, customer) => {
            const status = customer.status || 'Desconhecido';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalCustomers,
            customersByStatus,
        };
    }
);
