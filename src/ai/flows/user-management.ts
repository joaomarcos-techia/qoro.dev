
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
    // This flow is public and doesn't require an authenticated user.
    return ai.run('signUpFlow', () => orgService.signUp(input));
}

export async function inviteUser(input: z.infer<typeof InviteUserSchema>) {
    // This flow requires an authenticated admin user, which is handled
    // by the getAdminAndOrg helper in the service layer.
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
// Note: These are not exported directly to comply with 'use server' constraints.
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
