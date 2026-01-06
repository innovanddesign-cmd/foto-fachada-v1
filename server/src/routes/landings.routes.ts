/**
 * Landings Routes
 * ================
 * Operations for generating and retrieving landing pages
 */
import { Router, Response, NextFunction } from 'express';
import pool from '../db/pool.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { LandingGeneratorService } from '../services/LandingGeneratorService.js';

const router = Router();

/**
 * POST /api/landings/generate
 * Generate a full landing page from a proposal
 */
router.post('/generate', requireAuth, async (req: any, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const { proposalId } = req.body;
        const userId = authReq.user?.userId;

        if (!proposalId) {
            res.status(400).json({ success: false, error: 'Missing proposalId' });
            return;
        }

        // Fetch Proposal Data + Brand Analysis
        // Join marketing_proposals -> campaigns -> brand_analysis
        const query = `
            SELECT 
                p.*,
                c.client_id,
                b.business_name,
                b.primary_color,
                b.secondary_color,
                b.description as business_desc
            FROM marketing_proposals p
            JOIN campaigns c ON p.campaign_id = c.id
            LEFT JOIN brand_analysis b ON c.brand_analysis_id = b.id
            WHERE p.id = $1 AND c.client_id = $2
        `;

        const result = await pool.query(query, [proposalId, userId]);

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Proposal not found or unauthorized' });
            return;
        }

        const proposal = result.rows[0];

        // Replace config values in template logic (simplistic)
        // Similar to frontend LivePreview but static
        let finalWidgetCode = proposal.code_template;
        if (proposal.ui_config) {
            Object.keys(proposal.ui_config).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                finalWidgetCode = finalWidgetCode.replace(regex, proposal.ui_config[key] || '');
            });
            // Clean up unused
            finalWidgetCode = finalWidgetCode.replace(/{{.*?}}/g, '');
        }

        // Generate HTML
        const html = LandingGeneratorService.generateHtml({
            title: proposal.title || proposal.business_name,
            description: proposal.description || proposal.business_desc,
            widgetCode: finalWidgetCode,
            brandColors: {
                primary: proposal.primary_color || '#6366f1',
                secondary: proposal.secondary_color || '#4338ca'
            },
            contactInfo: {
                // Mocking extraction from description or profile if not available in DB fields yet
                address: 'Calle Mayor, 12, Madrid',
                email: 'contacto@' + (proposal.business_name.replace(/\s+/g, '').toLowerCase()) + '.com'
            },
            bgKeyword: proposal.business_type // Use business type for unsplash
        });


        // Save to Landings table
        // Check if landing already exists for this campaign, otherwise create
        let landingId;
        const existingLanding = await pool.query('SELECT id FROM landings WHERE campaign_id = $1', [proposal.campaign_id]);

        if (existingLanding.rows.length > 0) {
            const update = await pool.query(
                'UPDATE landings SET html_content = $1, title = $2 WHERE id = $3 RETURNING id',
                [html, proposal.title, existingLanding.rows[0].id]
            );
            landingId = update.rows[0].id;
        } else {
            const insert = await pool.query(
                'INSERT INTO landings (campaign_id, title, html_content, slug) VALUES ($1, $2, $3, $4) RETURNING id',
                [proposal.campaign_id, proposal.title, html, `landing-${Date.now()}`] // Simple slug
            );
            landingId = insert.rows[0].id;
        }

        res.json({
            success: true,
            landingId,
            previewUrl: `/api/landings/${landingId}/preview`
        });

    } catch (error) {
        console.error('[LandingGenerator] Error:', error);
        next(error);
    }
});

/**
 * GET /api/landings/:id/preview
 * Serve the raw HTML for preview
 */
router.get('/:id/preview', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT html_content FROM landings WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            res.status(404).send('Landing Page Not Found');
            return;
        }

        res.send(result.rows[0].html_content);
    } catch (error) {
        next(error);
    }
});

export default router;
