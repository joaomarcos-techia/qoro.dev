
'use server';
// Flows will be imported for their side effects in this file.
import './flows/user-management';
import './flows/crm-management';
import './flows/task-management';
import './flows/pulse-flow';
import './flows/finance-management';
import './flows/supplier-management';
import { stripeWebhookFlow } from './flows/billing-flow';


// Tools will be imported for their side effects in this file.
import './tools/crm-tools';
import './tools/task-tools';
import './tools/finance-tools';
import './tools/supplier-tools';

// We need express for the Stripe webhook to get the raw body
import express from 'express';
import { runFlow } from '@genkit-ai/flow';

const app = express();

// Stripe requires the raw body to verify webhook signatures.
// This middleware configures express to parse JSON and also to capture the raw body.
app.use('/api/stripeWebhook', express.raw({ type: 'application/json' }), (req, res, next) => {
    (req as any).rawBody = req.body;
    next();
});

app.post('/api/stripeWebhook', async (req, res) => {
    // We must acknowledge the event to Stripe immediately to prevent timeouts
    // and retries, which could lead to a disabled webhook endpoint.
    // The actual processing can happen in the background.
    res.json({ received: true });

    // Process the webhook event in the background.
    try {
        await runFlow(stripeWebhookFlow, (req as any).rawBody, {
            // Pass headers to the context for signature verification
            headers: req.headers,
        });
        console.log('Stripe webhook processed successfully.');
    } catch (error: any) {
        // Log the error for debugging, but don't send a failure response to Stripe.
        // A failure response would cause Stripe to retry and eventually disable the webhook.
        console.error('Stripe webhook processing failed:', error.message);
    }
});

export { app };
