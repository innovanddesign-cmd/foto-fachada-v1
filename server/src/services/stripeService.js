/**
 * Stripe Service
 * ================
 * Handles Stripe billing, subscriptions, and customer management
 */
import Stripe from 'stripe';
import { appLogger } from './logger.js';

// Initialize Stripe (will throw if key missing)
function getStripeClient() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('[Stripe] STRIPE_SECRET_KEY not configured in server/.env');
    }
    return new Stripe(secretKey, {
        apiVersion: '2024-11-20.acacia'
    });
}

// Subscription plans configuration
export const PLANS = {
    free: {
        name: 'Free',
        priceId: null, // No Stripe price for free tier
        features: ['1 proyecto', '1 landing', '3 regeneraciones', 'Watermark en carteles'],
        limits: { projects: 1, landings: 1, regenerations: 3 }
    },
    plus: {
        name: 'Plus',
        priceId: process.env.STRIPE_PRICE_PLUS || 'price_plus_placeholder',
        price: 9.99,
        features: ['5 proyectos', '3 landings/proyecto', '10 regeneraciones', 'Sin watermark', 'Analytics básico'],
        limits: { projects: 5, landings: 3, regenerations: 10 }
    },
    pro: {
        name: 'Pro',
        priceId: process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder',
        price: 29.99,
        features: ['20 proyectos', '10 landings/proyecto', 'Regeneraciones ilimitadas', 'Analytics avanzado', 'Soporte prioritario'],
        limits: { projects: 20, landings: 10, regenerations: -1 }
    },
    premium: {
        name: 'Premium',
        priceId: process.env.STRIPE_PRICE_PREMIUM || 'price_premium_placeholder',
        price: 79.99,
        features: ['Proyectos ilimitados', 'Landings ilimitadas', 'Todo ilimitado', 'API access', 'Soporte dedicado', 'White-label'],
        limits: { projects: -1, landings: -1, regenerations: -1 }
    }
};

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(userId, userEmail, planId, successUrl, cancelUrl) {
    const stripe = getStripeClient();
    const plan = PLANS[planId];

    if (!plan || !plan.priceId) {
        throw new Error(`Invalid plan: ${planId}`);
    }

    appLogger.info({ userId, planId }, 'Creating Stripe checkout session');

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: plan.priceId,
                quantity: 1
            }
        ],
        customer_email: userEmail,
        metadata: {
            userId,
            planId
        },
        success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing/cancelled`,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        // GDPR compliant
        consent_collection: {
            terms_of_service: 'required'
        }
    });

    return {
        sessionId: session.id,
        url: session.url
    };
}

/**
 * Create Stripe Customer Portal session
 */
export async function createCustomerPortalSession(customerId, returnUrl) {
    const stripe = getStripeClient();

    appLogger.info({ customerId }, 'Creating customer portal session');

    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings`
    });

    return {
        url: session.url
    };
}

/**
 * Get or create Stripe customer for user
 */
export async function getOrCreateCustomer(userId, email, name) {
    const stripe = getStripeClient();

    // Search for existing customer
    const customers = await stripe.customers.search({
        query: `metadata['userId']:'${userId}'`
    });

    if (customers.data.length > 0) {
        return customers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
            userId
        }
    });

    appLogger.info({ userId, customerId: customer.id }, 'Created new Stripe customer');
    return customer;
}

/**
 * Get subscription status for customer
 */
export async function getSubscriptionStatus(customerId) {
    const stripe = getStripeClient();

    const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1
    });

    if (subscriptions.data.length === 0) {
        return { plan: 'free', status: 'none' };
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price.id;

    // Find plan by priceId
    const planEntry = Object.entries(PLANS).find(([_, p]) => p.priceId === priceId);
    const planId = planEntry ? planEntry[0] : 'free';

    return {
        plan: planId,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
    };
}

/**
 * Process Stripe webhook event
 */
export async function handleWebhookEvent(event) {
    appLogger.info({ type: event.type }, 'Processing Stripe webhook');

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            // Update user tier in database
            appLogger.info({
                userId: session.metadata?.userId,
                planId: session.metadata?.planId
            }, 'Checkout completed');
            // TODO: Update user subscription in Supabase
            break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            appLogger.info({
                customerId: subscription.customer,
                status: subscription.status
            }, 'Subscription updated');
            // TODO: Update user tier based on subscription status
            break;
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object;
            appLogger.warn({
                customerId: invoice.customer
            }, 'Payment failed');
            // TODO: Notify user of payment failure
            break;
        }

        default:
            appLogger.debug({ type: event.type }, 'Unhandled webhook event');
    }
}
