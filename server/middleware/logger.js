/**
 * Request Logger Middleware
 * Logs all incoming requests with timing information
 */

export function requestLogger(req, res, next) {
    const start = Date.now();
    const { method, url, ip } = req;

    // Log request start
    console.log(`[${new Date().toISOString()}] --> ${method} ${url} from ${ip || 'unknown'}`);

    // Capture response finish
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        const statusEmoji = statusCode >= 400 ? '❌' : '✅';

        console.log(`[${new Date().toISOString()}] <-- ${method} ${url} ${statusEmoji} ${statusCode} (${duration}ms)`);
    });

    next();
}
