
'use server';
/**
 * @fileOverview User and organization management flows.
 * - signUp - Creates a new user and organization.
 * - inviteUser - Invites a user to an organization via email.
 * - listUsers - Lists all users within the caller's organization.
 * - updateUserPermissions - Updates the application permissions for a specific user.
 * - getOrganizationDetails - Fetches details for the user's organization.
 * - updateOrganizationDetails - Updates details for the user's organization.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { 
    SignUpSchema, 
    InviteUserSchema, 
    UpdateUserPermissionsSchema, 
    UpdateOrganizationDetailsSchema, 
    UserProfileSchema, 
    UserProfile, 
    OrganizationProfileSchema 
} from '@/ai/schemas';
import * as orgService from '@/services/organizationService';


// Exported functions (client-callable wrappers)
export async function signUp(input: z.infer<typeof SignUpSchema>) {
    return orgService.signUp(input);
}

export async function inviteUser(input: z.infer<typeof InviteUserSchema>) {
    // Note: We need to get the actor's UID to pass to the service.
    // This is a placeholder for how context would be accessed in a real flow.
    // For now, let's assume the service layer handles context.
    return ai.run('inviteUserFlow', () => orgService.inviteUser(input));
}

export async function listUsers(): Promise<UserProfile[]> {
    return ai.run('listUsersFlow', () => orgService.listUsers());
}

export async function updateUserPermissions(input: z.infer<typeof UpdateUserPermissionsSchema>) {
    return ai.run('updateUserPermissionsFlow', () => orgService.updateUserPermissions(input));
}

export async function getOrganizationDetails(): Promise<z.infer<typeof OrganizationProfileSchema>> {
    return ai.run('getOrganizationDetailsFlow', () => orgService.getOrganizationDetails());
}

export async function updateOrganizationDetails(input: z.infer<typeof UpdateOrganizationDetailsSchema>) {
    return ai.run('updateOrganizationDetailsFlow', () => orgService.updateOrganizationDetails(input));
}

// Genkit Flows (wrappers around service calls, for tracing and context)
ai.defineFlow(
    { name: 'signUpFlow', inputSchema: SignUpSchema, outputSchema: z.object({ uid: z.string() }) },
    (input) => orgService.signUp(input)
);

ai.defineFlow(
  {
    name: 'inviteUserFlow',
    inputSchema: InviteUserSchema,
    outputSchema: z.object({
      uid: z.string(),
      email: z.string(),
      organizationId: z.string(),
    }),
  },
  (input) => orgService.inviteUser(input)
);

ai.defineFlow(
    { name: 'listUsersFlow', inputSchema: z.undefined(), outputSchema: z.array(UserProfileSchema) },
    () => orgService.listUsers()
);

ai.defineFlow(
    {
        name: 'updateUserPermissionsFlow',
        inputSchema: UpdateUserPermissionsSchema,
        outputSchema: z.object({ success: z.boolean() }),
    },
    (input) => orgService.updateUserPermissions(input)
);

ai.defineFlow(
    {
        name: 'getOrganizationDetailsFlow',
        inputSchema: z.undefined(),
        outputSchema: OrganizationProfileSchema,
    },
    () => orgService.getOrganizationDetails()
);

ai.defineFlow(
    {
        name: 'updateOrganizationDetailsFlow',
        inputSchema: UpdateOrganizationDetailsSchema,
        outputSchema: z.object({ success: z.boolean() }),
    },
    (input) => orgService.updateOrganizationDetails(input)
);
