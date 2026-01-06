/**
 * Error Handler Middleware
 * Centralized error handling with Pino logging
 */
import { securityLogger } from '../services/logger.js';

export function errorHandler(err, req, res, next) {
    // Log error details with Pino
    securityLogger.error({
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        error: {
            name: err.name,
            message: err.message,
            stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
        },
        statusCode: err.statusCode || err.status || 500
    }, `Error: ${err.message}`);

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal Server Error',
        requestId: req.requestId,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
}

/**
 * Not Found Handler
 */
export function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.url}`,
        requestId: req.requestId
    });
}
