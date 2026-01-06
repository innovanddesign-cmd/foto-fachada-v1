/**
 * Proposals Routes
 * =================
 * CRUD operations for marketing proposals (widgets configuration)
 */
import { Router, Response, NextFunction } from 'express';
import pool from '../db/pool.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * POST /api/proposals
 * Save or update a proposal
 */
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { campaign_id, strategy_id, title, description, visual_mechanic, ui_config, code_template, status } = req.body;
        const userId = req.user?.userId;

        if (!campaign_id || !strategy_id || !ui_config || !code_template) {
            res.status(400).json({ success: false, error: 'Missing required fields' });
            return;
        }

        // Verify ownership (join campaigns -> client_id)
        const campaignCheck = await pool.query(
            'SELECT id FROM campaigns WHERE id = $1 AND client_id = $2',
            [campaign_id, userId]
        );

        if (campaignCheck.rows.length === 0) {
            res.status(403).json({ success: false, error: 'Unauthorized or campaign not found' });
            return;
        }

        const result = await pool.query(
            `INSERT INTO marketing_proposals 
            (campaign_id, strategy_id, title, description, visual_mechanic, ui_config, code_template, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [campaign_id, strategy_id, title, description, visual_mechanic, ui_config, code_template, status || 'draft']
        );

        res.status(201).json({
            success: true,
            proposal: result.rows[0]
        });

    } catch (error) {
        console.error('[Proposals] Error saving proposal:', error);
        next(error);
    }
});

/**
 * GET /api/proposals/:campaignId
 * Get proposals for a campaign
 */
router.get('/:campaignId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { campaignId } = req.params;
        const userId = req.user?.userId;

        // Verify ownership
        const campaignCheck = await pool.query(
            'SELECT id FROM campaigns WHERE id = $1 AND client_id = $2',
            [campaignId, userId]
        );

        if (campaignCheck.rows.length === 0) {
            res.status(403).json({ success: false, error: 'Unauthorized or campaign not found' });
            return;
        }

        const result = await pool.query(
            'SELECT * FROM marketing_proposals WHERE campaign_id = $1 ORDER BY created_at DESC',
            [campaignId]
        );

        res.json({
            success: true,
            proposals: result.rows
        });

    } catch (error) {
        next(error);
    }
});

export default router;
