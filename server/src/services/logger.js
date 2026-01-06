/**
 * Logger Service
 * ==============
 * Production-grade logging with Pino
 * Features: JSON format, log levels, request correlation
 */
import pino from 'pino';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine environment
const isDev = process.env.NODE_ENV !== 'production';

// Create base logger
const logger = pino({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),

    // Base configuration
    base: {
        pid: process.pid,
        env: process.env.NODE_ENV || 'development'
    },

    // Timestamp format
    timestamp: pino.stdTimeFunctions.isoTime,

    // Pretty print in development
    transport: isDev ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
            singleLine: false
        }
    } : undefined,

    // Redact sensitive information
    redact: {
        paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers["set-cookie"]',
            'body.password',
            'body.apiKey',
            'body.token',
            '*.password',
            '*.apiKey',
            '*.secret'
        ],
        censor: '[REDACTED]'
    }
});

// Create child loggers for different contexts
export const appLogger = logger.child({ context: 'app' });
export const authLogger = logger.child({ context: 'auth' });
export const aiLogger = logger.child({ context: 'ai' });
export const dbLogger = logger.child({ context: 'db' });
export const securityLogger = logger.child({ context: 'security' });

/**
 * HTTP Request logger (middleware)
 */
export function httpLogger(req, res, next) {
    const startTime = Date.now();
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Attach request ID to request object
    req.requestId = requestId;

    // Log request start
    logger.info({
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('user-agent')?.substring(0, 100),
        contentLength: req.get('content-length')
    }, `→ ${req.method} ${req.url}`);

    // Capture response
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logLevel = res.statusCode >= 500 ? 'error' :
            res.statusCode >= 400 ? 'warn' : 'info';

        logger[logLevel]({
            requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('content-length')
        }, `← ${req.method} ${req.url} ${res.statusCode} (${duration}ms)`);
    });

    next();
}

/**
 * Error logger
 */
export function logError(error, context = {}) {
    securityLogger.error({
        ...context,
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack
        }
    }, `Error: ${error.message}`);
}

/**
 * Security event logger
 */
export function logSecurityEvent(event, details = {}) {
    securityLogger.warn({
        event,
        ...details,
        timestamp: new Date().toISOString()
    }, `Security Event: ${event}`);
}

/**
 * AI call logger
 */
export function logAICall(operation, details = {}) {
    aiLogger.info({
        operation,
        ...details
    }, `AI: ${operation}`);
}

export default logger;
