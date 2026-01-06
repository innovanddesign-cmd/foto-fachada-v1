/**
 * Billing Routes
 * ===============
 * Handles Stripe billing endpoints: checkout, portal, webhooks
 */
import { Router, Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import {
    createCheckoutSession,
    createCustomerPortalSession,
    getSubscriptionStatus,
    handleWebhookEvent,
    PLANS
} from '../services/stripeService.js';
import { appLogger, securityLogger } from '../services/logger.js';

const router = Router();

interface CreateCheckoutBody {
    planId: string;
    successUrl?: string;
    cancelUrl?: string;
    userId?: string;
    email?: string;
}

interface CustomerPortalBody {
    customerId: string;
    returnUrl?: string;
}

interface Plan {
    id: string;
    name: string;
    price: number;
    features: string[];
    priceId?: string;
}

/**
 * GET /api/billing/plans
 * Returns available subscription plans
 */
router.get('/plans', (_req: Request, res: Response): void => {
    const plans: Plan[] = Object.entries(PLANS).map(([id, plan]) => ({
        id,
        name: (plan as { name: string }).name,
        price: (plan as { price?: number }).price || 0,
        features: (plan as { features: string[] }).features,
        priceId: (plan as { priceId?: string }).priceId
    }));

    res.json({ success: true, plans });
});

/**
 * POST /api/billing/create-checkout-session
 * Creates a Stripe Checkout session for subscription
 */
router.post('/create-checkout-session', async (
    req: Request<object, object, CreateCheckoutBody>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { planId, successUrl, cancelUrl } = req.body;

        // TODO: Get actual user from auth middleware
        const userId = req.body.userId || 'temp-user-id';
        const userEmail = req.body.email || 'user@example.com';

        if (!planId || planId === 'free') {
            res.status(400).json({
                success: false,
                error: 'Cannot create checkout for free plan'
            });
            return;
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
router.post('/customer-portal', async (
    req: Request<object, object, CustomerPortalBody>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { customerId, returnUrl } = req.body;

        if (!customerId) {
            res.status(400).json({
                success: false,
                error: 'Customer ID required'
            });
            return;
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
 * GET /api/billing/subscription/:customerId
 * Gets current subscription status for user
 */
router.get('/subscription/:customerId', async (
    req: Request<{ customerId: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { customerId } = req.params;

        if (!customerId) {
            res.status(400).json({
                success: false,
                error: 'Customer ID required'
            });
            return;
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
 * Note: This needs raw body parsing, configured in server/index.ts
 */
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'] as string | undefined;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        appLogger.warn('Stripe webhook secret not configured');
        res.status(400).json({ error: 'Webhook secret not configured' });
        return;
    }

    let event: Stripe.Event;

    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
        event = stripe.webhooks.constructEvent(
            (req as Request & { rawBody?: Buffer }).rawBody || req.body,
            sig || '',
            webhookSecret
        );
    } catch (err) {
        securityLogger.error({ error: (err as Error).message }, 'Webhook signature verification failed');
        res.status(400).json({ error: `Webhook Error: ${(err as Error).message}` });
        return;
    }

    // Process event
    try {
        await handleWebhookEvent(event);
        res.json({ received: true });
    } catch (error) {
        appLogger.error({ error: (error as Error).message, eventType: event.type }, 'Webhook processing error');
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

export default router;
