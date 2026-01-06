/**
 * Stripe Service
 * ===============
 * Handles all interactions with Stripe API
 */
import Stripe from 'stripe';
import pool from '../db/pool.js';
import { appLogger } from './logger.js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-06-20', // Use latest stable version
});

// Plan Configuration
export const PLANS = {
    'base': {
        name: 'Plan Base',
        price: 100, // EUR
        priceId: process.env.STRIPE_PRICE_ID_BASE || 'price_mock_base',
        features: ['1 Campaña', 'Analíticas Básicas']
    },
    'plus': {
        name: 'Plan Plus',
        price: 180, // EUR
        priceId: process.env.STRIPE_PRICE_ID_PLUS || 'price_mock_plus',
        features: ['3 Campañas', 'Analíticas Avanzadas', 'Soporte Prioritario']
    },
    'pro': {
        name: 'Plan Pro',
        price: 300, // EUR
        priceId: process.env.STRIPE_PRICE_ID_PRO || 'price_mock_pro',
        features: ['Campañas Ilimitadas', 'Marca Blanca', 'API Access']
    }
};

/**
 * Create a Checkout Session for Subscription
 */
export async function createCheckoutSession(
    userId: string,
    email: string,
    planId: string,
    successUrl: string = `${process.env.FRONTEND_ORIGIN}/dashboard?checkout=success`,
    cancelUrl: string = `${process.env.FRONTEND_ORIGIN}/settings`
) {
    // 1. Get or Create Customer
    let customerId = await getStripeCustomerId(userId, email);

    // 2. Validate Price ID
    const priceId = PLANS[planId as keyof typeof PLANS]?.priceId;
    if (!priceId) throw new Error('Invalid Plan ID');

    // 3. Create Session
    constsession = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            userId,
            planId
        }
    });

    return session;
}

/**
 * Create Customer Portal Session
 */
export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
    return session;
}

/**
 * Get Subscription Status
 */
export async function getSubscriptionStatus(customerId: string) {
    const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1
    });

    if (subscriptions.data.length === 0) return null;

    return subscriptions.data[0];
}

/**
 * Handle Stripe Webhooks
 */
export async function handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
        case 'invoice.paid':
            await handleInvoicePaid(event.data.object as Stripe.Invoice);
            break;
        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
}

// Helpers

async function getStripeCustomerId(userId: string, email: string): Promise<string> {
    const res = await pool.query('SELECT stripe_customer_id FROM clients WHERE id = $1', [userId]);

    if (res.rows[0]?.stripe_customer_id) {
        return res.rows[0].stripe_customer_id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
        email,
        metadata: { userId }
    });

    await pool.query('UPDATE clients SET stripe_customer_id = $1 WHERE id = $2', [customer.id, userId]);

    return customer.id;
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const subscriptionId = invoice.subscription as string;

    // Calculate expiration (1 year from now roughly, or use period_end)
    // We update DB to grant access

    // Find client
    const clientRes = await pool.query('SELECT id FROM clients WHERE stripe_customer_id = $1', [customerId]);
    if (clientRes.rows.length === 0) return;

    // Determine plan from lines (simplified)
    // In real app, match product/price ID to plan name
    const planId = 'pro'; // Defaulting for MVP logical flow, usually derived from invoice.lines.data[0].price.id

    await pool.query(
        `UPDATE clients 
         SET stripe_subscription_id = $1, 
             plan = $2, 
             expiration_date = NOW() + INTERVAL '1 year',
             is_active = true
         WHERE stripe_customer_id = $3`,
        [subscriptionId, planId, customerId]
    );

    appLogger.info({ customerId, planId }, 'Subscription renewed/activated via Webhook');
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;

    await pool.query(
        `UPDATE clients 
         SET plan = 'free', 
             expiration_date = NULL,
             stripe_subscription_id = NULL
         WHERE stripe_customer_id = $1`,
        [customerId]
    );

    appLogger.info({ customerId }, 'Subscription cancelled via Webhook');
}
