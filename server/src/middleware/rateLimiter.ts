/**
 * Rate Limiter Middleware
 * ========================
 * Protects API endpoints from abuse with granular control
 * 
 * Security Features:
 * - IP-based rate limiting
 * - Tiered limits for different endpoint types
 * - Specific limits for expensive AI endpoints (GPT-4, Claude)
 * - Standard headers for client feedback
 */
import rateLimit from 'express-rate-limit';

// ─────────────────────────────────────────────────────────────
// General API Limiters
// ─────────────────────────────────────────────────────────────

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        error: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false
});

// ─────────────────────────────────────────────────────────────
// Authentication Limiters
// ─────────────────────────────────────────────────────────────

/**
 * Auth endpoint rate limiter
 * Protects against brute force attacks
 * 5 attempts per minute per IP
 */
export const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: {
        success: false,
        error: 'Too many authentication attempts. Please wait.',
        code: 'AUTH_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Only count failed attempts
});

/**
 * Strict auth limiter for sensitive operations
 * 3 attempts per 5 minutes (password reset, etc.)
 */
export const strictAuthLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3,
    message: {
        success: false,
        error: 'Too many attempts. Please try again in 5 minutes.',
        code: 'STRICT_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// ─────────────────────────────────────────────────────────────
// AI Endpoint Limiters
// ─────────────────────────────────────────────────────────────

/**
 * General AI endpoint rate limiter
 * 10 requests per minute per IP
 */
export const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
        success: false,
        error: 'AI rate limit exceeded. Please wait before trying again.',
        code: 'AI_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * GPT-4 Vision rate limiter (VERY EXPENSIVE)
 * 3 requests per minute per IP
 * Critical: This prevents cost explosions
 */
export const visionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3,
    message: {
        success: false,
        error: 'Vision API rate limit exceeded. This is a resource-intensive operation.',
        code: 'VISION_RATE_LIMIT',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Claude API rate limiter
 * 5 requests per minute per IP
 */
export const claudeLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: {
        success: false,
        error: 'Claude API rate limit exceeded. Please wait.',
        code: 'CLAUDE_RATE_LIMIT',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Gemini API rate limiter
 * 10 requests per minute per IP (relatively cheaper)
 */
export const geminiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
        success: false,
        error: 'Gemini API rate limit exceeded.',
        code: 'GEMINI_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// ─────────────────────────────────────────────────────────────
// Resource-Specific Limiters
// ─────────────────────────────────────────────────────────────

/**
 * PDF generation rate limiter
 * 5 requests per minute (resource-intensive)
 */
export const pdfLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: 'PDF generation limit exceeded. Please wait.',
        code: 'PDF_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * File upload rate limiter
 * 10 uploads per 5 minutes
 */
export const uploadLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message: {
        success: false,
        error: 'Too many uploads. Please wait.',
        code: 'UPLOAD_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// ─────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────

/**
 * Create a custom rate limiter with specific settings
 */
export function createCustomLimiter(options: {
    windowMs: number;
    max: number;
    message?: string;
    code?: string;
}) {
    return rateLimit({
        windowMs: options.windowMs,
        max: options.max,
        message: {
            success: false,
            error: options.message || 'Rate limit exceeded',
            code: options.code || 'RATE_LIMIT'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
}
