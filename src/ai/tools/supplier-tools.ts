
'use server';
/**
 * @fileOverview Defines Genkit tools for the Supplier module.
 * These tools allow the AI agent (QoroPulse) to interact with supplier data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as supplierService from '@/services/supplierService';
import { SupplierProfileSchema } from '@/ai/schemas';

// Define the tool for listing suppliers
export const listSuppliersTool = ai.defineTool(
    {
        name: 'listSuppliersTool',
        description: 'Lists all suppliers for the organization. Use this to answer questions about suppliers, their contact information, or payment terms.',
        inputSchema: z.object({}), // No specific input needed from the AI
        outputSchema: z.array(SupplierProfileSchema),
    },
    async (_, context) => {
        // The actor's UID is passed in the context by the flow
        if (!context?.actor) {
            throw new Error('User authentication is required to list suppliers.');
        }
        return supplierService.listSuppliers(context.actor);
    }
);
