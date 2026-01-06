/**
 * Foto Fachada Backend Server
 * ============================
 * Production-ready server with security hardening
 */
import './loadEnv.js';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Services
import { appLogger } from './services/logger.js';

// Middleware
import { errorHandler, notFoundHandler, requestIdMiddleware } from './middleware/errorHandler.js';
import {
    generalLimiter,
    aiLimiter,
    authLimiter,
    pdfLimiter,
    uploadLimiter
} from './middleware/rateLimiter.js';
import { sanitizeInput, getHelmetConfig } from './middleware/sanitizer.js';
import { requireAuth, optionalAuth } from './middleware/authMiddleware.js';

// Routes
import {
    healthRoutes,
    authRoutes,
    strategiesRoutes,
    landingsRoutes,
    postersRoutes,
    billingRoutes,
    uploadRoutes,
    campaignsRoutes
} from './routes/index.js';
import proposalsRoutes from './routes/proposals.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────
const app: Express = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// ─────────────────────────────────────────────────────────────
// Security Middleware Stack
// ─────────────────────────────────────────────────────────────

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Request ID for tracking
app.use(requestIdMiddleware);

// Helmet - Security headers
app.use(helmet(getHelmetConfig()));

// CORS configuration
app.use(cors({
    origin: [
        FRONTEND_ORIGIN,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400
}));

// Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET || 'foto-fachada-secret'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// General rate limiting
app.use('/api', generalLimiter);

// ─────────────────────────────────────────────────────────────
// Route Registration
// ─────────────────────────────────────────────────────────────

// Public Routes
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);

// Protected Routes (Strategies made optional for dev compatibility)
app.use('/api/strategies', optionalAuth, aiLimiter, strategiesRoutes);
app.use('/api/landings', requireAuth, landingsRoutes);
app.use('/api/posters', requireAuth, pdfLimiter, postersRoutes);
app.use('/api/billing', requireAuth, billingRoutes);
app.use('/api/uploads', requireAuth, uploadLimiter, uploadRoutes);
app.use('/api/campaigns', requireAuth, campaignsRoutes);
app.use('/api/proposals', requireAuth, proposalsRoutes);
app.use('/api/analytics', requireAuth, analyticsRoutes);

// Legacy/Compatibility
app.use('/api/generate-strategies', requireAuth, aiLimiter, strategiesRoutes);

// Static files
app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

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
  🚀 FOTO FACHADA BACKEND v2.2 (Secure Edition)
═══════════════════════════════════════════════════════════
  ✅ Backend listo con autenticación JWT
  📍 Server: http://localhost:${PORT}
  🔗 Health: http://localhost:${PORT}/api/health
  🌐 CORS:   ${FRONTEND_ORIGIN}
  🔒 Security: JWT + HttpOnly Cookies + Rate Limiting
═══════════════════════════════════════════════════════════
`;
    console.log(banner);
    appLogger.info({ port: PORT, env: NODE_ENV }, 'Server started');
});

// ─────────────────────────────────────────────────────────────
// Graceful Shutdown
// ─────────────────────────────────────────────────────────────
const shutdown = (signal: string): void => {
    appLogger.info({ signal }, 'Shutting down gracefully...');
    server.close(() => {
        appLogger.info('Server closed');
        process.exit(0);
    });
    setTimeout(() => {
        appLogger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason, promise) => {
    appLogger.error({ reason, promise }, 'Unhandled Rejection');
});
process.on('uncaughtException', (error) => {
    appLogger.fatal({ error }, 'Uncaught Exception');
    process.exit(1);
});

export default app;
