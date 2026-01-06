/**
 * Analytics Routes
 * =================
 * Endpoints for tracking and viewing analytics
 */
import { Router, Response, NextFunction } from 'express';
import pool from '../db/pool.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AnalyticsService } from '../services/AnalyticsService.js';

const router = Router();

/**
 * POST /api/analytics/track
 * Public endpoint to track events from landing pages
 * (Should be protected strictly by CORS/Origin referer in production or token)
 */
router.post('/track', async (req, res, next) => {
    try {
        const { landingId, eventType, deviceType, source, metadata } = req.body;

        if (!landingId || !eventType) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        await AnalyticsService.trackEvent({
            landingId,
            eventType,
            deviceType,
            source,
            metadata
        });

        res.json({ success: true });
    } catch (error) {
        console.error('[Analytics] Track Error:', error);
        next(error);
    }
});

/**
 * GET /api/analytics/:landingId
 * Get stats for dashboard (Protected)
 */
router.get('/:landingId', requireAuth, async (req: any, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const { landingId } = req.params;
        const { range } = req.query;
        const userId = authReq.user?.userId;

        // Verify ownership via Campaign
        const check = await pool.query(
            `SELECT l.id FROM landings l 
             JOIN campaigns c ON l.campaign_id = c.id 
             WHERE l.id = $1 AND c.client_id = $2`,
            [landingId, userId]
        );

        if (check.rows.length === 0) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        const stats = await AnalyticsService.getDashboardStats(
            landingId,
            (range as '7d' | '30d' | 'all') || '30d'
        );

        res.json({ success: true, stats });

    } catch (error) {
        next(error);
    }
});

export default router;
