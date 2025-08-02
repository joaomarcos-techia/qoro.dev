
'use server';
/**
 * @fileOverview Defines Genkit tools for the Finance module.
 * These tools allow the AI agent (QoroPulse) to interact with financial data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as financeService from '@/services/financeService';
import { AccountProfileSchema } from '@/ai/schemas';

// Define the tool for listing financial accounts
export const listAccountsTool = ai.defineTool(
    {
        name: 'listAccountsTool',
        description: 'Lists all financial accounts for the organization, such as checking accounts, savings, credit cards, and cash. Use this to answer questions about bank accounts or current balances.',
        inputSchema: z.object({}), // No specific input needed from the AI
        outputSchema: z.array(AccountProfileSchema),
    },
    async (_, context) => {
        // The actor's UID is passed in the context by the flow
        if (!context?.actor) {
            throw new Error('User authentication is required to list financial accounts.');
        }
        return financeService.listAccounts(context.actor);
    }
);

// Define the tool for getting a financial summary
export const getFinanceSummaryTool = ai.defineTool(
    {
        name: 'getFinanceSummaryTool',
        description: 'Retrieves a summary of the current financial health for the organization, including total balance, total income for the current month, total expenses for the current month, and the resulting net profit. Use this for high-level questions about financial performance.',
        inputSchema: z.object({}), // No specific input needed from the AI
        outputSchema: z.object({
            totalBalance: z.number(),
            totalIncome: z.number(),
            totalExpense: z.number(),
            netProfit: z.number(),
        }),
    },
    async (_, context) => {
        // The actor's UID is passed in the context by the flow
        if (!context?.actor) {
            throw new Error('User authentication is required to get a financial summary.');
        }
        return financeService.getDashboardMetrics(context.actor);
    }
);
