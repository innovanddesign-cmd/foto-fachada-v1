/**
 * Stripe Routes
 * ==============
 * Handles billing endpoints: checkout, portal, webhooks
 */
import { Router } from 'express';
import Stripe from 'stripe';
import {
    createCheckoutSession,
    createCustomerPortalSession,
    getOrCreateCustomer,
    getSubscriptionStatus,
    handleWebhookEvent,
    PLANS
} from '../services/stripeService.js';
import { appLogger, securityLogger } from '../services/logger.js';

const router = Router();

/**
 * GET /api/billing/plans
 * Returns available subscription plans
 */
router.get('/plans', (req, res) => {
    const plans = Object.entries(PLANS).map(([id, plan]) => ({
        id,
        name: plan.name,
        price: plan.price || 0,
        features: plan.features,
        priceId: plan.priceId // Only needed for frontend to know if it's a paid plan
    }));

    res.json({ success: true, plans });
});

/**
 * POST /api/billing/create-checkout-session
 * Creates a Stripe Checkout session for subscription
 */
router.post('/create-checkout-session', async (req, res, next) => {
    try {
        const { planId, successUrl, cancelUrl } = req.body;

        // TODO: Get actual user from auth middleware
        const userId = req.body.userId || 'temp-user-id';
        const userEmail = req.body.email || 'user@example.com';

        if (!planId || planId === 'free') {
            return res.status(400).json({
                success: false,
                error: 'Cannot create checkout for free plan'
            });
        }

        const session = await createCheckoutSession(
            userId,
            userEmail,
            planId,
            successUrl,
            cancelUrl
        );

        res.json({
            success: true,
            sessionId: session.sessionId,
            url: session.url
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/billing/customer-portal
 * Creates a Stripe Customer Portal session
 */
router.post('/customer-portal', async (req, res, next) => {
    try {
        const { customerId, returnUrl } = req.body;

        if (!customerId) {
            return res.status(400).json({
                success: false,
                error: 'Customer ID required'
            });
        }

        const session = await createCustomerPortalSession(customerId, returnUrl);

        res.json({
            success: true,
            url: session.url
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/billing/subscription
 * Gets current subscription status for user
 */
router.get('/subscription/:customerId', async (req, res, next) => {
    try {
        const { customerId } = req.params;

        if (!customerId) {
            return res.status(400).json({
                success: false,
                error: 'Customer ID required'
            });
        }

        const status = await getSubscriptionStatus(customerId);

        res.json({
            success: true,
            subscription: status
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/billing/webhook
 * Handles Stripe webhook events
 * Note: This needs raw body parsing, configured in server/index.js
 */
router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        appLogger.warn('Stripe webhook secret not configured');
        return res.status(400).json({ error: 'Webhook secret not configured' });
    }

    let event;

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
    } catch (err) {
        securityLogger.error({ error: err.message }, 'Webhook signature verification failed');
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Process event
    try {
        await handleWebhookEvent(event);
        res.json({ received: true });
    } catch (error) {
        appLogger.error({ error: error.message, eventType: event.type }, 'Webhook processing error');
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

export default router;
