/**
 * Logger Service
 * ===============
 * Pino-based logging with pretty printing in development
 */
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

// Base logger configuration
const logger = pino({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname'
            }
        }
        : undefined
});

// Specialized loggers
export const appLogger = logger.child({ context: 'app' });
export const httpLogger = logger.child({ context: 'http' });
export const securityLogger = logger.child({ context: 'security' });
export const dbLogger = logger.child({ context: 'database' });

export default logger;
