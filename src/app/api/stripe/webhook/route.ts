// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { updateSubscription } from '@/ai/flows/billing-flow';
import type Stripe from 'stripe';

// Lista de eventos relevantes
const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
]);

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('❌ Webhook secret não configurado.');
    return NextResponse.json({ error: 'Missing webhook secret' }, { status: 400 });
  }

  // ⚠️ Next.js App Router requer arrayBuffer()
  const rawBody = await req.arrayBuffer();
  const bodyBuffer = Buffer.from(rawBody);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(bodyBuffer, sig, webhookSecret);
  } catch (err: any) {
    console.error('⚠️ Erro ao validar webhook:', err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      let subscriptionId: string;
      let isCreating = false;

      switch (event.type) {
        case 'checkout.session.completed': {
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (!checkoutSession.subscription || typeof checkoutSession.subscription !== 'string') {
            throw new Error('Subscription ID não encontrado na sessão.');
          }
          subscriptionId = checkoutSession.subscription;
          isCreating = true;
          break;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'customer.subscription.paused':
        case 'customer.subscription.resumed': {
          const subscription = event.data.object as Stripe.Subscription;
          subscriptionId = subscription.id;
          isCreating = false;
          break;
        }
        default:
          console.log(`⚙️ Evento ignorado: ${event.type}`);
          return NextResponse.json({ received: true });
      }

      await updateSubscription({ subscriptionId, isCreating });
      console.log(`✅ Webhook processado: ${event.type}`);
    } catch (err) {
      console.error('🔥 Erro no handler do webhook:', err);
      return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
