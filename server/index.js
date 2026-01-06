/**
 * Foto Fachada Backend Server
 * ============================
 * Production-ready server with security hardening
 * 
 * Security Features:
 * - Helmet (HTTP headers)
 * - Rate limiting (general, AI, auth)
 * - XSS sanitization
 * - Pino logging
 * - CORS configuration
 * - Graceful shutdown
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Services
import logger, { httpLogger, appLogger } from './services/logger.js';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { generalLimiter, aiLimiter } from './middleware/rateLimiter.js';
import { sanitizeInput, getHelmetConfig } from './middleware/sanitizer.js';

// Routes
import healthRoutes from './routes/health.js';
import strategiesRoutes from './routes/strategies.js';
import billingRoutes from './routes/billing.js';
import postersRoutes from './routes/posters.js';
import landingsRoutes from './routes/landings.js';

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envResult = dotenv.config({ path: join(__dirname, '.env') });
if (envResult.error) {
    appLogger.warn({ error: envResult.error.message }, '⚠️ Error loading .env file');
} else {
    appLogger.info({ keys: Object.keys(envResult.parsed || {}) }, '✅ Environment loaded');
}

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// ─────────────────────────────────────────────────────────────
// Security Middleware Stack
// ─────────────────────────────────────────────────────────────

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Helmet - Security headers
app.use(helmet(getHelmetConfig()));

// CORS - Explicit configuration
app.use(cors({
    origin: [
        FRONTEND_ORIGIN,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
}));

// Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET || 'foto-fachada-secret'));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(httpLogger);

// Input sanitization (XSS protection)
app.use(sanitizeInput);

// General rate limiting
app.use('/api', generalLimiter);

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────

// Health check (no rate limit)
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// Strategies (with AI-specific rate limiting)
app.use('/api/strategies', aiLimiter, strategiesRoutes);

// Legacy route support (backward compatibility)
app.post('/api/generate-strategies', aiLimiter, (req, res, next) => {
    appLogger.info({ url: req.url }, '[Legacy] Redirecting to new endpoint');
    req.url = '/generate';
    strategiesRoutes(req, res, next);
});

// Billing routes (Stripe)
app.use('/api/billing', billingRoutes);

// New Routes (Audit Fix)
app.use('/api/posters', postersRoutes);
app.use('/api/landings', landingsRoutes);

// ─────────────────────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// Server Startup
// ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    const banner = `
═══════════════════════════════════════════════════════════
  🚀 FOTO FACHADA BACKEND v2.0
═══════════════════════════════════════════════════════════
  ✅ Backend listo y rutas cargadas
  📍 Server: http://localhost:${PORT}
  🔗 Health: http://localhost:${PORT}/health
  🎯 API:    http://localhost:${PORT}/api/strategies/generate
  🌐 CORS:   Allowing ${FRONTEND_ORIGIN}
  🔒 Security: Helmet, Rate Limiting, XSS Protection
  📝 Logging: Pino (${NODE_ENV === 'production' ? 'JSON' : 'Pretty'})
═══════════════════════════════════════════════════════════
`;
    console.log(banner);
    appLogger.info({ port: PORT, env: NODE_ENV }, 'Server started');
});

// ─────────────────────────────────────────────────────────────
// Graceful Shutdown
// ─────────────────────────────────────────────────────────────
const shutdown = (signal) => {
    appLogger.info({ signal }, 'Shutting down gracefully...');

    server.close(() => {
        appLogger.info('Server closed');
        process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
        appLogger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    appLogger.error({ reason, promise }, 'Unhandled Rejection');
});

process.on('uncaughtException', (error) => {
    appLogger.fatal({ error }, 'Uncaught Exception');
    process.exit(1);
});

export default app;
