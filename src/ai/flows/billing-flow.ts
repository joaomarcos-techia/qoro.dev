
'use server';
/**
 * @fileOverview Billing and subscription management flows.
 * - createCheckoutSession: Creates a Stripe Checkout session for a user to subscribe.
 * - createBillingPortalSession: Creates a Stripe Billing Portal session for a user to manage their subscription.
 * - updateSubscription: Updates the subscription status in Firestore based on Stripe webhook events.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { stripe } from '@/lib/stripe';
import { getAdminAndOrg } from '@/services/utils';
import type { Stripe } from 'stripe';
import { FieldValue } from 'firebase-admin/firestore';
import * as orgService from '@/services/organizationService';

const CreateCheckoutSessionSchema = z.object({
  priceId: z.string(),
  actor: z.string(),
  name: z.string(),
  organizationName: z.string(),
  cnpj: z.string(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
});

const CreateBillingPortalSessionSchema = z.object({
  actor: z.string(),
});

// Schema para validar os metadados esperados do webhook da assinatura
const UpdateSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  isCreating: z.boolean(),
  customerId: z.string(),
  firebaseUID: z.string(),
  planId: z.enum(['growth', 'performance']), // Garante que o planId é válido
  // Adiciona os campos de organização como obrigatórios no momento da criação
  organizationName: z.string().min(1, 'Nome da organização é obrigatório.'),
  cnpj: z.string().min(1, 'CNPJ é obrigatório.'),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
});


const createCheckoutSessionFlow = ai.defineFlow(
  {
    name: 'createCheckoutSessionFlow',
    inputSchema: CreateCheckoutSessionSchema,
    outputSchema: z.object({ sessionId: z.string() }),
  },
  async ({ priceId, actor, name, organizationName, cnpj, contactEmail, contactPhone }) => {
    
    const user = await adminAuth.getUser(actor);

    // Verifique se já existe um cliente Stripe para este usuário para evitar duplicatas
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customer;
    if (customers.data.length > 0) {
        customer = customers.data[0];
    } else {
        customer = await stripe.customers.create({
            email: user.email,
            name: name,
            metadata: {
                firebaseUID: actor,
            },
        });
    }

    const planId = priceId === process.env.NEXT_PUBLIC_STRIPE_GROWTH_PLAN_PRICE_ID ? 'growth' : 'performance';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'required',
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/login?payment_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/signup?plan=${planId}&payment_cancelled=true`,
      subscription_data: {
        metadata: {
            firebaseUID: actor,
            organizationName: organizationName,
            cnpj: cnpj,
            contactEmail: contactEmail || '',
            contactPhone: contactPhone || '',
            planId: planId, // Passa o planId para o webhook
        }
      },
    });

    if (!session.url) {
      throw new Error('Failed to create Stripe checkout session URL.');
    }

    return { sessionId: session.url };
  }
);


const createBillingPortalSessionFlow = ai.defineFlow(
    {
      name: 'createBillingPortalSessionFlow',
      inputSchema: CreateBillingPortalSessionSchema,
      outputSchema: z.object({ url: z.string() }),
    },
    async ({ actor }) => {
      const { organizationId } = await getAdminAndOrg(actor);
      const orgDoc = await adminDb.collection('organizations').doc(organizationId).get();
      const stripeCustomerId = orgDoc.data()?.stripeCustomerId;
  
      if (!stripeCustomerId) {
        throw new Error("Customer ID do Stripe não encontrado para esta organização.");
      }
  
      const { url } = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings`,
      });
  
      return { url };
    }
  );
  

const updateSubscriptionFlow = ai.defineFlow(
    {
      name: 'updateSubscriptionFlow',
      inputSchema: z.any(), // Entrada flexível para o webhook, validação será feita internamente
      outputSchema: z.object({ success: z.boolean() }),
    },
    async (rawInput) => {
        
      const { subscriptionId, isCreating } = rawInput;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['default_payment_method'],
      });
      
      const firebaseUID = subscription.metadata.firebaseUID;
      if (!firebaseUID) {
        console.error('CRITICAL: Firebase UID not found in subscription metadata for subscription ID:', subscriptionId);
        throw new Error('Firebase UID not found in subscription metadata.');
      }
      
      const userRef = adminDb.collection('users').doc(firebaseUID);

      if (isCreating) {
        // Valida os dados da assinatura para garantir que temos tudo para criar a organização
        const validatedInput = UpdateSubscriptionSchema.safeParse({
            ...rawInput,
            firebaseUID: firebaseUID,
            customerId: subscription.customer,
            planId: subscription.metadata.planId,
            organizationName: subscription.metadata.organizationName,
            cnpj: subscription.metadata.cnpj,
            contactEmail: subscription.metadata.contactEmail,
            contactPhone: subscription.metadata.contactPhone,
        });

        if (!validatedInput.success) {
            console.error("Validation error on subscription creation:", validatedInput.error.flatten());
            throw new Error(`Dados de metadados da assinatura inválidos: ${validatedInput.error.message}`);
        }
        
        const { data } = validatedInput;

        // Idempotency Check: Verifique se já existe uma organização para este usuário
        const existingOrgQuery = await adminDb.collection('organizations').where('owner', '==', firebaseUID).limit(1).get();
        if (!existingOrgQuery.empty) {
            console.log(`Idempotency check: Organization already exists for user ${firebaseUID}. Skipping creation.`);
            return { success: true };
        }

        const orgRef = await adminDb.collection('organizations').add({
          name: data.organizationName,
          cnpj: data.cnpj,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          owner: firebaseUID,
          stripeCustomerId: data.customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          stripeSubscriptionStatus: subscription.status,
          createdAt: FieldValue.serverTimestamp(),
        });

        await userRef.set({
            organizationId: orgRef.id,
            planId: data.planId,
            stripeSubscriptionStatus: subscription.status,
            role: 'admin',
            permissions: {
                qoroCrm: true,
                qoroPulse: true,
                qoroTask: true,
                qoroFinance: true,
            }
        }, { merge: true }); // Use merge para não sobrescrever dados parciais do sign-up

        await adminAuth.setCustomUserClaims(firebaseUID, { organizationId: orgRef.id, role: 'admin', planId: data.planId });

      } else { // Atualizando uma assinatura existente (cancelamento, etc.)
         const userDoc = await userRef.get();
         if (!userDoc.exists) {
            console.error(`CRITICAL: User document not found for UID: ${firebaseUID} during subscription update.`);
            throw new Error(`Usuário não encontrado durante a atualização da assinatura.`);
         }
         const organizationId = userDoc.data()?.organizationId;
         if (!organizationId) {
             throw new Error(`Organização não encontrada para o UID: ${firebaseUID}`);
         }
         const orgRef = adminDb.collection('organizations').doc(organizationId);

         const subscriptionData = {
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          stripeSubscriptionStatus: subscription.status,
        };
    
        await orgRef.update(subscriptionData);
        await userRef.update({ stripeSubscriptionStatus: subscription.status });
      }

      return { success: true };
    }
);


// --- Exported Functions ---

export async function createCheckoutSession(input: z.infer<typeof CreateCheckoutSessionSchema>): Promise<{ sessionId: string }> {
  return createCheckoutSessionFlow(input);
}

export async function createBillingPortalSession(input: z.infer<typeof CreateBillingPortalSessionSchema>): Promise<{ url: string }> {
  return createBillingPortalSessionFlow(input);
}

export async function updateSubscription(input: z.infer<typeof UpdateSubscriptionSchema>): Promise<{ success: boolean }> {
  return updateSubscriptionFlow(input);
}
