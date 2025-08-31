
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
        description: 'Lists all customers for the organization. Use this to answer questions about customer counts, customer details, or to get a general overview of the customer base.',
        inputSchema: z.object({}), // No specific input needed from the AI
        outputSchema: z.array(CustomerProfileSchema),
    },
    async (_, context) => {
        // The actor's UID is passed in the context by the flow
        if (!context?.actor) {
            throw new Error('User authentication is required to list customers.');
        }
        return crmService.listCustomers(context.actor);
    }
);
