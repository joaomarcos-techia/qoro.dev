
// src/ai/flows/billing-flow.ts

import { z } from 'zod';
import Stripe from 'stripe';
import { ai } from '../genkit';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

export const createCheckoutSessionFlow = ai.defineFlow(
  {
    name: 'createCheckoutSessionFlow',
    inputSchema: z.object({
      priceId: z.string(),
      actor: z.string(),
    }),
    outputSchema: z.object({
      sessionId: z.string(),
      url: z.string(),
    }),
  },
  async (input) => {
    if (!stripe) throw new Error('Stripe is not configured.');
    
    const userDoc = await adminDb.collection('users').doc(input.actor).get();
    if (!userDoc.exists) throw new Error('User not found');
    const organizationId = userDoc.data()?.organizationId;
    if (!organizationId) throw new Error('Organization not found for user');

    const organizationDoc = await adminDb
      .collection('organizations')
      .doc(organizationId)
      .get();

    if (!organizationDoc.exists) {
      throw new Error('Organization not found');
    }

    const organization = organizationDoc.data();
    let customerId = organization?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { organizationId: organizationId },
      });
      customerId = customer.id;

      await adminDb
        .collection('organizations')
        .doc(organizationId)
        .update({ stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: input.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe_canceled=true`,
      metadata: {
          userId: input.actor,
          organizationId: organizationId,
      }
    });

    return {
      sessionId: session.id,
      url: session.url!,
    };
  }
);


export const stripeWebhookFlow = ai.defineFlow(
  {
    name: 'stripeWebhookFlow',
    inputSchema: z.any(),
    outputSchema: z.any(),
  },
  async (
    payload: Buffer,
    { headers }: { headers: Record<string, string> } 
  ) => {
    if (!stripe) throw new Error('Stripe is not configured.');

    const signature = headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Stripe webhook secret is not configured.');
      throw new Error('Stripe webhook secret is not configured.');
    }
    if (!signature) {
      console.error('Stripe signature is missing from webhook request.');
      throw new Error('Stripe signature is missing.');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed.', err.message);
      throw new Error(`Webhook Error: ${err.message}`);
    }
    
    console.log(`✅ Stripe Webhook Received: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organizationId;
        const subscriptionId = session.subscription as string;

        if (!organizationId || !subscriptionId) {
            console.error('Missing metadata in checkout session', session.id);
            return { received: true, message: 'Missing metadata.' };
        }
        
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await adminDb.collection('organizations').doc(organizationId).update({
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
        });

        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (invoice.billing_reason === 'subscription_cycle') {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const customer = (await stripe.customers.retrieve(
              subscription.customer as string
            )) as Stripe.Customer;

            const organizationId = customer.metadata.organizationId;
            
            if(organizationId){
                 await adminDb.collection('organizations').doc(organizationId).update({
                    stripePriceId: subscription.items.data[0].price.id,
                    stripeCurrentPeriodEnd: new Date(
                    subscription.current_period_end * 1000
                    ),
                });
            }
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // On subscription changes, update plan status
        if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            const customer = (await stripe.customers.retrieve(
              subscription.customer as string
            )) as Stripe.Customer;
    
            const organizationId = customer.metadata.organizationId;
    
            if(organizationId) {
                await adminDb.collection('organizations').doc(organizationId).update({
                  stripePriceId: FieldValue.delete(),
                  stripeSubscriptionId: FieldValue.delete(),
                  stripeCurrentPeriodEnd: FieldValue.delete(),
                });
            }
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }
);


export const createStripePortalSession = ai.defineFlow(
    {
      name: 'createStripePortalSession',
      inputSchema: z.object({
        actor: z.string(),
      }),
      outputSchema: z.object({
        url: z.string(),
      }),
    },
    async (input) => {
      if (!stripe) throw new Error('Stripe is not configured.');
  
      const userDoc = await adminDb.collection('users').doc(input.actor).get();
      if (!userDoc.exists) throw new Error('User not found');
      const organizationId = userDoc.data()?.organizationId;
      if (!organizationId) throw new Error('Organization not found for user');
  
      const orgDoc = await adminDb.collection('organizations').doc(organizationId).get();
      const customerId = orgDoc.data()?.stripeCustomerId;
  
      if (!customerId) {
        throw new Error('Stripe customer ID not found for this organization.');
      }
  
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/organization`,
      });
  
      return { url: session.url! };
    }
);
