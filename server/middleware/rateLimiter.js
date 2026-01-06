/**
 * Rate Limiter Middleware
 * =======================
 * Prevents brute force attacks and AI cost abuse
 * Different limits for different endpoints
 */
import rateLimit from 'express-rate-limit';
import { securityLogger } from '../services/logger.js';

/**
 * General API rate limiter
 * Applies to all API routes
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: 15 * 60
    },
    handler: (req, res, next, options) => {
        securityLogger.warn({
            event: 'RATE_LIMIT_EXCEEDED',
            ip: req.ip,
            url: req.url,
            limit: options.max,
            windowMs: options.windowMs
        }, `Rate limit exceeded: ${req.ip}`);

        res.status(429).json(options.message);
    }
});

/**
 * AI endpoint rate limiter
 * More restrictive for expensive AI operations
 */
export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 AI requests per hour (cost protection)
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false }, // Fix for IPv6/Proxy validation error
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP
        return req.user?.id || req.ip;
    },
    message: {
        success: false,
        error: 'AI request limit reached. Upgrade your plan for more requests.',
        retryAfter: 60 * 60
    },
    handler: (req, res, next, options) => {
        securityLogger.warn({
            event: 'AI_RATE_LIMIT_EXCEEDED',
            ip: req.ip,
            userId: req.user?.id,
            url: req.url
        }, `AI rate limit exceeded: ${req.user?.id || req.ip}`);

        res.status(429).json(options.message);
    },
    skip: (req) => {
        // Skip rate limiting for admin users (if implemented)
        return req.user?.role === 'admin';
    }
});

/**
 * Auth endpoint rate limiter
 * Prevents brute force login attempts
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many login attempts. Please try again in 15 minutes.',
        retryAfter: 15 * 60
    },
    handler: (req, res, next, options) => {
        securityLogger.warn({
            event: 'AUTH_RATE_LIMIT_EXCEEDED',
            ip: req.ip,
            email: req.body?.email
        }, `Auth rate limit exceeded: ${req.ip}`);

        res.status(429).json(options.message);
    }
});

/**
 * Dynamic rate limiter factory
 * Create custom limiters for specific use cases
 */
export function createLimiter(options = {}) {
    return rateLimit({
        windowMs: options.windowMs || 15 * 60 * 1000,
        max: options.max || 100,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: options.keyGenerator || ((req) => req.ip),
        message: options.message || {
            success: false,
            error: 'Rate limit exceeded.'
        }
    });
}
