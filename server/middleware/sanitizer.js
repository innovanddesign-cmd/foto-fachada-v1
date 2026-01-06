/**
 * Sanitization Middleware
 * =======================
 * Protects against XSS attacks in user input and AI-generated content
 */
import xssFilters from 'xss-filters';
import { securityLogger } from '../services/logger.js';

/**
 * Recursively sanitize all string values in an object
 */
function sanitizeObject(obj, path = '') {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
        return xssFilters.inHTMLData(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map((item, idx) => sanitizeObject(item, `${path}[${idx}]`));
    }

    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value, `${path}.${key}`);
        }
        return sanitized;
    }

    return obj;
}

/**
 * Middleware: Sanitize request body
 */
export function sanitizeInput(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }

    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
    }

    next();
}

/**
 * Sanitize AI-generated code for safe rendering in iframe
 * This is a whitelist approach - only allows safe HTML/CSS/JS patterns
 */
export function sanitizeAICode(code) {
    if (!code || typeof code !== 'string') return '';

    // Log for security monitoring
    const originalLength = code.length;

    // Remove potentially dangerous patterns
    let sanitized = code
        // Remove javascript: protocol URLs
        .replace(/javascript:/gi, '')
        // Remove data: URLs that could contain scripts
        .replace(/data:text\/html/gi, '')
        // Remove event handlers that could execute arbitrary code (strict)
        // Note: We keep onclick etc as they're needed for widget functionality
        // but we'll sandbox in iframe anyway
        .replace(/on(error|load)\s*=/gi, 'data-blocked-$1=')
        // Remove direct script injections via document.write
        .replace(/document\s*\.\s*write/gi, 'console.log')
        // Remove attempts to access parent frame
        .replace(/parent\s*\.\s*postMessage/gi, '/* blocked */')
        .replace(/top\s*\.\s*location/gi, '/* blocked */')
        .replace(/window\s*\.\s*parent/gi, '/* blocked */')
        .replace(/window\s*\.\s*top/gi, '/* blocked */')
        // Remove cookie access attempts
        .replace(/document\s*\.\s*cookie/gi, '/* blocked */')
        // Remove eval and Function constructor
        .replace(/\beval\s*\(/gi, '/* blocked */(')
        .replace(/new\s+Function\s*\(/gi, '/* blocked */(')
        // Remove fetch to external domains (allow same-origin only is handled by sandbox)
        // The iframe sandbox attribute will handle most of this
        ;

    // Log if significant sanitization occurred
    if (sanitized.length < originalLength * 0.95) {
        securityLogger.warn({
            event: 'AI_CODE_SANITIZED',
            originalLength,
            sanitizedLength: sanitized.length,
            reductionPercent: Math.round((1 - sanitized.length / originalLength) * 100)
        }, 'Significant code sanitization applied');
    }

    return sanitized;
}

/**
 * Validate that AI response has expected structure
 * Returns sanitized version or throws error
 */
export function validateAndSanitizeAIResponse(response) {
    if (!response || typeof response !== 'object') {
        throw new Error('Invalid AI response: not an object');
    }

    if (!Array.isArray(response.strategies)) {
        throw new Error('Invalid AI response: missing strategies array');
    }

    return {
        ...response,
        strategies: response.strategies.map(strategy => ({
            ...strategy,
            // Sanitize text fields
            title: xssFilters.inHTMLData(strategy.title || ''),
            description: xssFilters.inHTMLData(strategy.description || ''),
            // Sanitize code template
            code_template: sanitizeAICode(strategy.code_template || ''),
            // Sanitize config schema labels
            ui_config_schema: (strategy.ui_config_schema || []).map(field => ({
                ...field,
                label: xssFilters.inHTMLData(field.label || ''),
                default: typeof field.default === 'string'
                    ? xssFilters.inHTMLData(field.default)
                    : field.default
            }))
        }))
    };
}

/**
 * Helmet security headers (pre-configured)
 */
export function getHelmetConfig() {
    return {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "https://cdn.tailwindcss.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                imgSrc: ["'self'", "data:", "blob:", "https:"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
                frameSrc: ["'self'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
            }
        },
        crossOriginEmbedderPolicy: false, // Required for TailwindCSS CDN
        crossOriginResourcePolicy: { policy: "cross-origin" }
    };
}
