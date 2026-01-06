/**
 * Type declarations for legacy JavaScript services
 * ==================================================
 * These declarations provide TypeScript compatibility for JS services
 * that haven't been fully migrated yet.
 */

// xss-filters module
declare module 'xss-filters' {
    export function inHTMLData(input: string): string;
    export function inDoubleQuotedAttr(input: string): string;
    export function inSingleQuotedAttr(input: string): string;
    export function inUnQuotedAttr(input: string): string;
    export function uriInHTMLData(input: string): string;
    export function uriInDoubleQuotedAttr(input: string): string;
    export function uriInSingleQuotedAttr(input: string): string;
    export function uriInUnQuotedAttr(input: string): string;
    export function uriComponentInHTMLData(input: string): string;
    export function uriComponentInDoubleQuotedAttr(input: string): string;
    export function uriComponentInSingleQuotedAttr(input: string): string;
    export function uriComponentInUnQuotedAttr(input: string): string;
}

// CreativeEngineService (JavaScript)
declare module '../services/CreativeEngineService.js' {
    interface BrandData {
        name: string;
        businessType: string;
        style?: string;
        targetAudience?: string;
        description?: string;
        niche?: string;
        primaryColor?: string;
        location?: string;
    }

    interface Strategy {
        id: string;
        emoji: string;
        title: string;
        description: string;
        vibe_analysis?: string;
        typography?: string;
        visual_mechanic?: string;
        ui_config_schema: Array<{
            key: string;
            label: string;
            type: string;
            default?: string;
            placeholder?: string;
        }>;
        code_template: string;
        _meta?: {
            generatedAt: string;
            seasonalContext: string[];
            index: number;
        };
    }

    export function generateStrategies(
        brandData: BrandData,
        dateStr?: string,
        location?: string
    ): Promise<Strategy[]>;

    export function testCreativeEngine(): Promise<Strategy[]>;
}

// PosterService (JavaScript)
declare module '../services/PosterService.js' {
    interface PosterConfig {
        businessName: string;
        businessType?: string;
        tagline?: string;
        landingUrl: string;
        primaryColor?: string;
        phone?: string;
        address?: string;
    }

    export class PosterService {
        static generatePosterPdf(config: PosterConfig): Promise<Buffer>;
        static generateCSS(palette: unknown, businessType: string): string;
    }

    export default PosterService;
}

// stripeService (JavaScript)
declare module '../services/stripeService.js' {
    import Stripe from 'stripe';

    interface Plan {
        name: string;
        priceId: string | null;
        price?: number;
        features: string[];
        limits: {
            projects: number;
            landings: number;
            regenerations: number;
        };
    }

    export const PLANS: Record<'free' | 'plus' | 'pro' | 'premium', Plan>;

    export function createCheckoutSession(
        userId: string,
        userEmail: string,
        planId: string,
        successUrl?: string,
        cancelUrl?: string
    ): Promise<{ sessionId: string; url: string }>;

    export function createCustomerPortalSession(
        customerId: string,
        returnUrl?: string
    ): Promise<{ url: string }>;

    export function getOrCreateCustomer(
        userId: string,
        email: string,
        name?: string
    ): Promise<Stripe.Customer>;

    export function getSubscriptionStatus(
        customerId: string
    ): Promise<{
        plan: string;
        status: string;
        currentPeriodEnd?: Date;
        cancelAtPeriodEnd?: boolean;
    }>;

    export function handleWebhookEvent(event: Stripe.Event): Promise<void>;
}

// colorScience (from PosterService imports)
declare module '../services/colorScience.js' {
    interface VisualDNAPalette {
        primary: string;
        primaryLight: string;
        primaryDark: string;
        secondary: string;
        text: string;
        textSecondary: string;
        textOnPrimary: string;
        overlay: string;
        background: string;
    }

    export function generateVisualDNAPalette(
        primaryColor: string,
        style?: string
    ): VisualDNAPalette;
}

// logger (JavaScript - using our new TS version)
declare module '../services/logger.js' {
    import { Logger } from 'pino';

    export const appLogger: Logger;
    export const httpLogger: Logger;
    export const securityLogger: Logger;
    export const dbLogger: Logger;

    const logger: Logger;
    export default logger;
}
