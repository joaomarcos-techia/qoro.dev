'use server';
/**
 * @fileOverview Task management flows.
 * - createTask - Creates a new task.
 * - listTasks - Lists all tasks for the user's organization.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { TaskSchema, TaskProfileSchema } from '@/ai/schemas';
import * as taskService from '@/services/taskService';

const ActorSchema = z.object({ actor: z.string() });

// Define flows
const createTaskFlow = ai.defineFlow(
    { 
        name: 'createTaskFlow', 
        inputSchema: TaskSchema.extend(ActorSchema.shape), 
        outputSchema: z.object({ id: z.string() }) 
    },
    async (input) => taskService.createTask(input, input.actor)
);

const listTasksFlow = ai.defineFlow(
    { 
        name: 'listTasksFlow', 
        inputSchema: ActorSchema, 
        outputSchema: z.array(TaskProfileSchema) 
    },
    async ({ actor }) => taskService.listTasks(actor)
);

// Exported functions (client-callable wrappers)
export async function createTask(input: z.infer<typeof TaskSchema> & z.infer<typeof ActorSchema>): Promise<{ id: string; }> {
    return createTaskFlow(input);
}

export async function listTasks(input: z.infer<typeof ActorSchema>): Promise<z.infer<typeof TaskProfileSchema>[]> {
    return listTasksFlow(input);
}
