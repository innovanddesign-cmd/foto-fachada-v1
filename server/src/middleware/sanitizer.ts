/**
 * Input Sanitizer Middleware
 * ===========================
 * XSS protection and input sanitization
 */
import { Request, Response, NextFunction } from 'express';
import xssFilters from 'xss-filters';
import { HelmetOptions } from 'helmet';

/**
 * Recursively sanitizes object values against XSS
 */
function sanitizeObject(obj: unknown): unknown {
    if (typeof obj === 'string') {
        return xssFilters.inHTMLData(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
    }

    return obj;
}

/**
 * Middleware to sanitize request body against XSS attacks
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
}

/**
 * Helmet security configuration
 */
export function getHelmetConfig(): HelmetOptions {
    return {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
                fontSrc: ["'self'", 'fonts.gstatic.com'],
                imgSrc: ["'self'", 'data:', 'https:'],
                scriptSrc: ["'self'"],
                connectSrc: ["'self'", 'https://api.stripe.com']
            }
        },
        crossOriginEmbedderPolicy: false, // Allow embedding resources
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    };
}
