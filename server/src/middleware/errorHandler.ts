/**
 * Error Handler Middleware
 * ========================
 * Centralized error handling for Express with security best practices
 * 
 * Features:
 * - Error classification (operational vs programming)
 * - Request ID tracking
 * - Stack trace hidden in production
 * - Structured logging
 */
import { Request, Response, NextFunction } from 'express';
import { appLogger, securityLogger } from '../services/logger.js';
import { randomUUID } from 'crypto';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
    code?: string;
    details?: unknown;
}

interface ErrorResponse {
    success: false;
    error: string;
    code?: string;
    requestId: string;
    path?: string;
    method?: string;
    timestamp: string;
    stack?: string;
    details?: unknown;
}

// ─────────────────────────────────────────────────────────────
// Request ID Middleware
// ─────────────────────────────────────────────────────────────

/**
 * Adds a unique request ID to each request for tracking
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
    const requestId = req.headers['x-request-id'] as string || randomUUID();

    // Attach to request for logging
    (req as Request & { requestId: string }).requestId = requestId;

    // Send back in response headers
    res.setHeader('X-Request-ID', requestId);

    next();
}

// ─────────────────────────────────────────────────────────────
// Error Handlers
// ─────────────────────────────────────────────────────────────

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req: Request, res: Response): void {
    const requestId = (req as Request & { requestId?: string }).requestId || randomUUID();

    const response: ErrorResponse = {
        success: false,
        error: 'Resource not found',
        code: 'NOT_FOUND',
        requestId,
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    };

    appLogger.warn({
        requestId,
        path: req.originalUrl,
        method: req.method
    }, '404 Not Found');

    res.status(404).json(response);
}

/**
 * Global Error Handler
 * Catches all errors and returns appropriate responses
 */
export function errorHandler(
    err: AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    const requestId = (req as Request & { requestId?: string }).requestId || randomUUID();
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = !isProduction;

    // Determine error details
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational ?? (statusCode < 500);

    // Use generic message for non-operational errors in production
    const message = isProduction && !isOperational
        ? 'An unexpected error occurred'
        : err.message || 'Internal Server Error';

    // Log error with appropriate level
    const logData = {
        requestId,
        error: err.message,
        code: err.code,
        statusCode,
        isOperational,
        path: req.originalUrl,
        method: req.method,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        ...(isDevelopment && { stack: err.stack })
    };

    if (statusCode >= 500) {
        appLogger.error(logData, 'Server error');

        // Log security-relevant errors
        if (statusCode === 401 || statusCode === 403) {
            securityLogger.warn({
                requestId,
                path: req.originalUrl,
                ip: req.ip
            }, 'Security-related error');
        }
    } else if (statusCode >= 400) {
        appLogger.warn(logData, 'Client error');
    } else {
        appLogger.info(logData, 'Request error');
    }

    // Build response
    const response: ErrorResponse = {
        success: false,
        error: message,
        code: err.code || (statusCode === 500 ? 'INTERNAL_ERROR' : 'ERROR'),
        requestId,
        timestamp: new Date().toISOString()
    };

    // Include stack trace only in development
    if (isDevelopment && err.stack) {
        response.stack = err.stack;
    }

    // Include details if provided and safe
    if (err.details && isOperational) {
        response.details = err.details;
    }

    res.status(statusCode).json(response);
}

// ─────────────────────────────────────────────────────────────
// Custom Error Classes
// ─────────────────────────────────────────────────────────────

/**
 * Operational error that is safe to show to users
 */
export class OperationalError extends Error implements AppError {
    statusCode: number;
    isOperational = true;
    code?: string;
    details?: unknown;

    constructor(message: string, statusCode = 400, code?: string, details?: unknown) {
        super(message);
        this.name = 'OperationalError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Authentication error
 */
export class AuthenticationError extends OperationalError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTH_REQUIRED');
        this.name = 'AuthenticationError';
    }
}

/**
 * Authorization error
 */
export class AuthorizationError extends OperationalError {
    constructor(message = 'Access denied') {
        super(message, 403, 'ACCESS_DENIED');
        this.name = 'AuthorizationError';
    }
}

/**
 * Validation error
 */
export class ValidationError extends OperationalError {
    constructor(message: string, details?: unknown) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

/**
 * Rate limit error
 */
export class RateLimitError extends OperationalError {
    constructor(message = 'Rate limit exceeded') {
        super(message, 429, 'RATE_LIMIT');
        this.name = 'RateLimitError';
    }
}
