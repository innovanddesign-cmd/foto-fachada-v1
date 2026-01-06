/**
 * Health Check Route
 * ==================
 * Provides endpoint to verify server and database status
 */
import { Router, Request, Response } from 'express';
import { testConnection } from '../db/pool.js';

const router = Router();

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    environment: string;
    database: 'connected' | 'disconnected';
    version: string;
}

/**
 * GET /api/health
 * Returns server health status including database connectivity
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
    const dbConnected = await testConnection();

    const health: HealthStatus = {
        status: dbConnected ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: dbConnected ? 'connected' : 'disconnected',
        version: '2.1.0'
    };

    res.status(dbConnected ? 200 : 503).json(health);
});

/**
 * GET /api/health/live
 * Kubernetes liveness probe - quick check
 */
router.get('/live', (_req: Request, res: Response): void => {
    res.status(200).json({ status: 'ok' });
});

/**
 * GET /api/health/ready
 * Kubernetes readiness probe - includes DB check
 */
router.get('/ready', async (_req: Request, res: Response): Promise<void> => {
    const dbConnected = await testConnection();

    if (dbConnected) {
        res.status(200).json({ status: 'ready' });
    } else {
        res.status(503).json({ status: 'not ready', reason: 'database unavailable' });
    }
});

export default router;
