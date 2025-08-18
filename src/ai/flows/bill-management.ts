
'use server';
/**
 * @fileOverview Bill management flows (Contas a Pagar/Receber).
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { BillSchema, BillProfileSchema, UpdateBillSchema } from '@/ai/schemas';
import * as billService from '@/services/billService';

const ActorSchema = z.object({ actor: z.string() });
const DeleteInputSchema = z.object({ billId: z.string() }).extend(ActorSchema.shape);

const createBillFlow = ai.defineFlow(
    { 
        name: 'createBillFlow', 
        inputSchema: BillSchema.extend(ActorSchema.shape), 
        outputSchema: z.object({ id: z.string() }) 
    },
    async (input) => billService.createBill(input, input.actor)
);

const listBillsFlow = ai.defineFlow(
    { 
        name: 'listBillsFlow', 
        inputSchema: ActorSchema, 
        outputSchema: z.array(BillProfileSchema) 
    },
    async ({ actor }) => billService.listBills(actor)
);

const updateBillFlow = ai.defineFlow(
    {
        name: 'updateBillFlow',
        inputSchema: UpdateBillSchema.extend(ActorSchema.shape),
        outputSchema: z.object({ id: z.string() })
    },
    async (input) => billService.updateBill(input, input.actor)
);

const deleteBillFlow = ai.defineFlow(
    {
        name: 'deleteBillFlow',
        inputSchema: DeleteInputSchema,
        outputSchema: z.object({ id: z.string(), success: z.boolean() })
    },
    async (input) => billService.deleteBill(input.billId, input.actor)
);

export async function createBill(input: z.infer<typeof BillSchema> & z.infer<typeof ActorSchema>): Promise<{ id: string; }> {
    return createBillFlow(input);
}

export async function listBills(input: z.infer<typeof ActorSchema>): Promise<z.infer<typeof BillProfileSchema>[]> {
    return listBillsFlow(input);
}

export async function updateBill(input: z.infer<typeof UpdateBillSchema> & z.infer<typeof ActorSchema>): Promise<{ id: string; }> {
    return updateBillFlow(input);
}

export async function deleteBill(input: z.infer<typeof DeleteInputSchema>): Promise<{ id: string; success: boolean }> {
    return deleteBillFlow(input);
}
