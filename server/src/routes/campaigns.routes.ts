/**
 * Campaigns Routes
 * =================
 * CRUD operations for campaign management
 */
import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db/pool.js';
import { appLogger } from '../services/logger.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

// Types
interface AuthRequest extends Request {
    user?: { id: string; email: string; plan: string };
}

// ─────────────────────────────────────────────────────────────
// GET /api/campaigns - List all campaigns for user
// ─────────────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: 'No autorizado' });
            return;
        }

        const result = await pool.query(`
            SELECT c.*, 
                   ba.business_name,
                   ba.business_type,
                   COUNT(l.id) as landing_count
            FROM campaigns c
            LEFT JOIN brand_analysis ba ON c.brand_analysis_id = ba.id
            LEFT JOIN landings l ON l.campaign_id = c.id
            WHERE c.client_id = $1
            GROUP BY c.id, ba.id
            ORDER BY c.created_at DESC
        `, [userId]);

        res.json({
            success: true,
            campaigns: result.rows
        });

    } catch (error) {
        appLogger.error({ error, context: 'campaigns' }, 'Error listing campaigns');
        next(error);
    }
});

// ─────────────────────────────────────────────────────────────
// GET /api/campaigns/:id - Get single campaign
// ─────────────────────────────────────────────────────────────
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        const result = await pool.query(`
            SELECT c.*, 
                   ba.business_name,
                   ba.business_type,
                   ba.primary_color,
                   ba.secondary_color,
                   ba.analysis_data
            FROM campaigns c
            LEFT JOIN brand_analysis ba ON c.brand_analysis_id = ba.id
            WHERE c.id = $1 AND c.client_id = $2
        `, [id, userId]);

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Campaña no encontrada' });
            return;
        }

        // Get associated landings
        const landingsResult = await pool.query(`
            SELECT * FROM landings WHERE campaign_id = $1 ORDER BY created_at DESC
        `, [id]);

        res.json({
            success: true,
            campaign: result.rows[0],
            landings: landingsResult.rows
        });

    } catch (error) {
        appLogger.error({ error, context: 'campaigns' }, 'Error getting campaign');
        next(error);
    }
});

// ─────────────────────────────────────────────────────────────
// POST /api/campaigns - Create new campaign
// ─────────────────────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: 'No autorizado' });
            return;
        }

        const { name, description, thumbnail_url, brand_analysis_id } = req.body;

        if (!name) {
            res.status(400).json({ success: false, error: 'Nombre es requerido' });
            return;
        }

        const result = await pool.query(`
            INSERT INTO campaigns (client_id, name, description, thumbnail_url, brand_analysis_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [userId, name, description, thumbnail_url, brand_analysis_id]);

        appLogger.info({
            campaignId: result.rows[0].id,
            userId,
            name
        }, 'Campaign created');

        res.status(201).json({
            success: true,
            campaign: result.rows[0],
            redirectTo: '/strategies' // Navigate to strategies module
        });

    } catch (error) {
        appLogger.error({ error, context: 'campaigns' }, 'Error creating campaign');
        next(error);
    }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/campaigns/:id - Update campaign
// ─────────────────────────────────────────────────────────────
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
    const client = await pool.connect();

    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { name, description, status, thumbnail_url } = req.body;

        await client.query('BEGIN');

        // Verify ownership
        const checkResult = await client.query(
            'SELECT id FROM campaigns WHERE id = $1 AND client_id = $2',
            [id, userId]
        );

        if (checkResult.rows.length === 0) {
            await client.query('ROLLBACK');
            res.status(404).json({ success: false, error: 'Campaña no encontrada' });
            return;
        }

        // Update campaign
        const updateResult = await client.query(`
            UPDATE campaigns 
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                status = COALESCE($3, status),
                thumbnail_url = COALESCE($4, thumbnail_url),
                updated_at = NOW()
            WHERE id = $5
            RETURNING *
        `, [name, description, status, thumbnail_url, id]);

        await client.query('COMMIT');

        res.json({
            success: true,
            campaign: updateResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        appLogger.error({ error, context: 'campaigns' }, 'Error updating campaign');
        next(error);
    } finally {
        client.release();
    }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/campaigns/:id - Delete campaign + files
// ─────────────────────────────────────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
    const client = await pool.connect();

    try {
        const userId = req.user?.id;
        const { id } = req.params;

        await client.query('BEGIN');

        // Get campaign with thumbnail for file cleanup
        const campaignResult = await client.query(
            'SELECT * FROM campaigns WHERE id = $1 AND client_id = $2',
            [id, userId]
        );

        if (campaignResult.rows.length === 0) {
            await client.query('ROLLBACK');
            res.status(404).json({ success: false, error: 'Campaña no encontrada' });
            return;
        }

        const _campaign = campaignResult.rows[0];

        // Delete campaign (cascades to landings due to FK)
        await client.query('DELETE FROM campaigns WHERE id = $1', [id]);

        await client.query('COMMIT');

        // Clean up files (non-blocking)
        try {
            const campaignDir = path.join(UPLOAD_DIR, userId!, id);
            await fs.rm(campaignDir, { recursive: true, force: true });
            appLogger.info({ campaignId: id }, 'Campaign files deleted');
        } catch (fileError) {
            appLogger.warn({ error: fileError, campaignId: id }, 'No files to delete or error deleting');
        }

        res.json({
            success: true,
            message: 'Campaña eliminada correctamente'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        appLogger.error({ error, context: 'campaigns' }, 'Error deleting campaign');
        next(error);
    } finally {
        client.release();
    }
});

// ─────────────────────────────────────────────────────────────
// POST /api/campaigns/:id/duplicate - Clone campaign
// ─────────────────────────────────────────────────────────────
router.post('/:id/duplicate', async (req: AuthRequest, res: Response, next: NextFunction) => {
    const client = await pool.connect();

    try {
        const userId = req.user?.id;
        const { id } = req.params;

        await client.query('BEGIN');

        // Get original campaign
        const originalResult = await client.query(
            'SELECT * FROM campaigns WHERE id = $1 AND client_id = $2',
            [id, userId]
        );

        if (originalResult.rows.length === 0) {
            await client.query('ROLLBACK');
            res.status(404).json({ success: false, error: 'Campaña no encontrada' });
            return;
        }

        const original = originalResult.rows[0];

        // Create duplicate
        const duplicateResult = await client.query(`
            INSERT INTO campaigns (
                client_id, brand_analysis_id, name, description, 
                thumbnail_url, status
            )
            VALUES ($1, $2, $3, $4, $5, 'draft')
            RETURNING *
        `, [
            userId,
            original.brand_analysis_id,
            `${original.name} (copia)`,
            original.description,
            original.thumbnail_url
        ]);

        const newCampaignId = duplicateResult.rows[0].id;

        // Duplicate landings
        await client.query(`
            INSERT INTO landings (campaign_id, title, slug, html_content, style_config, seo_meta, status)
            SELECT $1, title, slug || '-copy-' || $1, html_content, style_config, seo_meta, 'draft'
            FROM landings
            WHERE campaign_id = $2
        `, [newCampaignId, id]);

        await client.query('COMMIT');

        appLogger.info({
            originalId: id,
            newId: newCampaignId,
            userId
        }, 'Campaign duplicated');

        res.status(201).json({
            success: true,
            campaign: duplicateResult.rows[0],
            message: 'Campaña duplicada correctamente'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        appLogger.error({ error, context: 'campaigns' }, 'Error duplicating campaign');
        next(error);
    } finally {
        client.release();
    }
});

export default router;
