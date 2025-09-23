'use server';
/**
 * @fileOverview Billing and subscription management flows.
 * - createCheckoutSession: Creates a Stripe Checkout session for a user to subscribe.
 * - createBillingPortalSession: Creates a Stripe Billing Portal session for a user to manage their subscription.
 * - updateSubscription: Updates the subscription status in Firestore based on Stripe webhook events.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { stripe } from '@/lib/stripe';
import { getAdminAndOrg } from '@/services/utils';
import type { Stripe } from 'stripe';

const CreateCheckoutSessionSchema = z.object({
  priceId: z.string(),
  actor: z.string(),
});

const CreateBillingPortalSessionSchema = z.object({
  actor: z.string(),
});

const UpdateSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  customerId: z.string(),
  isCreating: z.boolean(),
});

// --- Helper Functions ---

/**
 * Copies billing details from a payment method or customer to a new customer object.
 * This ensures that when a user subscribes, their billing information (name, address, etc.)
 * is correctly mirrored from the checkout session to their customer profile in Stripe.
 */
function copyBillingDetailsToCustomer(
  payment_method: Stripe.PaymentMethod | string | null,
  customer: Stripe.Customer | string | null
): Stripe.CustomerUpdateParams | undefined {
  if (!payment_method || typeof payment_method === 'string' || !customer || typeof customer !== 'string') {
    return;
  }
  const billingDetails = payment_method.billing_details;
  if (!billingDetails) return;

  const customerUpdate: Stripe.CustomerUpdateParams = {
    name: billingDetails.name ?? undefined,
    phone: billingDetails.phone ?? undefined,
    address: billingDetails.address ?? undefined,
  };

  return customerUpdate;
}


// --- Genkit Flows ---

const createCheckoutSessionFlow = ai.defineFlow(
  {
    name: 'createCheckoutSessionFlow',
    inputSchema: CreateCheckoutSessionSchema,
    outputSchema: z.object({ sessionId: z.string() }),
  },
  async ({ priceId, actor }) => {
    const { organizationId, organizationName, userData } = await getAdminAndOrg(actor);
    const orgRef = adminDb.collection('organizations').doc(organizationId);
    const orgDoc = await orgRef.get();
    const orgData = orgDoc.data();

    let stripeCustomerId = orgData?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.name || undefined,
        metadata: {
          firebaseUID: actor,
          organizationId: organizationId,
          organizationName: organizationName,
        },
      });
      stripeCustomerId = customer.id;
      await orgRef.update({ stripeCustomerId });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'required',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment_cancelled=true`,
    });

    if (!session.id) {
      throw new Error('Failed to create Stripe checkout session.');
    }

    return { sessionId: session.id };
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
      inputSchema: UpdateSubscriptionSchema,
      outputSchema: z.object({ success: z.boolean() }),
    },
    async ({ subscriptionId, customerId, isCreating }) => {
      const orgQuery = await adminDb
        .collection('organizations')
        .where('stripeCustomerId', '==', customerId)
        .limit(1)
        .get();
  
      if (orgQuery.empty) {
        throw new Error(`Organização não encontrada para o customerId: ${customerId}`);
      }
      const orgDoc = orgQuery.docs[0];
  
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['default_payment_method'],
      });
  
      const subscriptionData = {
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionStatus: subscription.status,
      };
  
      await orgDoc.ref.update(subscriptionData);
      
      // On creation, copy billing details to the customer object in Stripe
      if (isCreating) {
        const customerUpdateParams = copyBillingDetailsToCustomer(
          subscription.default_payment_method,
          subscription.customer
        );
        if (customerUpdateParams) {
          await stripe.customers.update(customerId, customerUpdateParams);
        }
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
