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
 * Helper: Generate friendly slug from business name
 */
function generateSlug(businessName: string): string {
    return businessName
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .trim()
        .replace(/\s+/g, '-') // Spaces to hyphens
        .replace(/-+/g, '-'); // Multiple hyphens to single
}

/**
 * Helper: Ensure unique slug
 */
async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = excludeId
            ? 'SELECT id FROM landings WHERE slug = $1 AND id != $2'
            : 'SELECT id FROM landings WHERE slug = $1';
        const params = excludeId ? [slug, excludeId] : [slug];
        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

/**
 * GET /l/:slug (PUBLIC ROUTE)
 * Serve landing page by slug without authentication
 */
router.get('/l/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;

        const result = await pool.query(
            'SELECT html_content, status FROM landings WHERE slug = $1',
            [slug]
        );

        if (result.rows.length === 0) {
            res.status(404).send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Página No Encontrada</title>
                    <style>
                        body {
                            font-family: 'Inter', sans-serif;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                            color: white;
                        }
                        .container {
                            text-align: center;
                        }
                        h1 { font-size: 4rem; margin: 0; }
                        p { font-size: 1.2rem; opacity: 0.9; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>404</h1>
                        <p>Esta página no existe o ha sido eliminada</p>
                    </div>
                </body>
                </html>
            `);
            return;
        }

        const landing = result.rows[0];

        // Optionally check if published (uncomment if needed)
        // if (landing.status !== 'published') {
        //     res.status(403).send('This landing is not published yet');
        //     return;
        // }

        // Track view in analytics (fire and forget)
        pool.query(
            'INSERT INTO analytics_events (landing_id, event_type, device_type, source) VALUES ((SELECT id FROM landings WHERE slug = $1), $2, $3, $4)',
            [slug, 'view', req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop', 'direct']
        ).catch(err => console.error('Analytics error:', err));

        // Increment view counter
        pool.query(
            'UPDATE landings SET views = views + 1 WHERE slug = $1',
            [slug]
        ).catch(err => console.error('View counter error:', err));

        res.setHeader('Content-Type', 'text/html');
        res.send(landing.html_content);

    } catch (error) {
        next(error);
    }
});

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
                b.description as business_desc,
                b.business_type
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

        // Get external libraries for this strategy
        const externalLibraries = LandingGeneratorService.getLibrariesForStrategy(proposal.strategy_id);

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
                email: 'contacto@' + (proposal.business_name?.replace(/\s+/g, '').toLowerCase() || 'negocio') + '.com'
            },
            bgKeyword: proposal.business_type, // Use business type for unsplash
            externalLibraries
        });

        // Generate friendly slug from business name
        const baseSlug = generateSlug(proposal.business_name || `landing-${Date.now()}`);

        // Save to Landings table
        // Check if landing already exists for this campaign, otherwise create
        let landingId;
        let slug;
        const existingLanding = await pool.query('SELECT id FROM landings WHERE campaign_id = $1', [proposal.campaign_id]);

        if (existingLanding.rows.length > 0) {
            // Update existing
            slug = await ensureUniqueSlug(baseSlug, existingLanding.rows[0].id);
            const update = await pool.query(
                'UPDATE landings SET html_content = $1, title = $2, slug = $3 WHERE id = $4 RETURNING id',
                [html, proposal.title, slug, existingLanding.rows[0].id]
            );
            landingId = update.rows[0].id;
        } else {
            // Create new
            slug = await ensureUniqueSlug(baseSlug);
            const insert = await pool.query(
                'INSERT INTO landings (campaign_id, title, html_content, slug) VALUES ($1, $2, $3, $4) RETURNING id',
                [proposal.campaign_id, proposal.title, html, slug]
            );
            landingId = insert.rows[0].id;
        }

        // Build public URL
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = process.env.PUBLIC_DOMAIN || req.get('host') || 'localhost:3000';
        const publicUrl = `${protocol}://${host}/l/${slug}`;

        res.json({
            success: true,
            landingId,
            slug,
            publicUrl,
            previewUrl: `/l/${slug}` // Relative URL for frontend
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

/**
 * PUT /api/landings/:id/strategy
 * Change the strategy of an existing landing
 */
router.put('/:id/strategy', requireAuth, async (req: any, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const { id } = req.params;
        const { proposalId } = req.body;
        const userId = authReq.user?.userId;

        if (!proposalId) {
            res.status(400).json({ success: false, error: 'Missing proposalId' });
            return;
        }

        // Verify ownership of the landing
        const landingCheck = await pool.query(
            'SELECT l.id, l.campaign_id FROM landings l JOIN campaigns c ON l.campaign_id = c.id WHERE l.id = $1 AND c.client_id = $2',
            [id, userId]
        );

        if (landingCheck.rows.length === 0) {
            res.status(403).json({ success: false, error: 'Landing not found or unauthorized' });
            return;
        }

        // Fetch new proposal data
        const query = `
            SELECT 
                p.*,
                c.client_id,
                b.business_name,
                b.primary_color,
                b.secondary_color,
                b.description as business_desc,
                b.business_type
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

        // Replace config values in template
        let finalWidgetCode = proposal.code_template;
        if (proposal.ui_config) {
            Object.keys(proposal.ui_config).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                finalWidgetCode = finalWidgetCode.replace(regex, proposal.ui_config[key] || '');
            });
            finalWidgetCode = finalWidgetCode.replace(/{{.*?}}/g, '');
        }

        // Get external libraries for this strategy
        const externalLibraries = LandingGeneratorService.getLibrariesForStrategy(proposal.strategy_id);

        // Regenerate HTML with new strategy
        const html = LandingGeneratorService.generateHtml({
            title: proposal.title || proposal.business_name,
            description: proposal.description || proposal.business_desc,
            widgetCode: finalWidgetCode,
            brandColors: {
                primary: proposal.primary_color || '#6366f1',
                secondary: proposal.secondary_color || '#4338ca'
            },
            contactInfo: {
                address: 'Calle Mayor, 12, Madrid',
                email: 'contacto@' + (proposal.business_name?.replace(/\s+/g, '').toLowerCase() || 'negocio') + '.com'
            },
            bgKeyword: proposal.business_type,
            externalLibraries
        });

        // Update landing
        await pool.query(
            'UPDATE landings SET html_content = $1, title = $2, updated_at = NOW() WHERE id = $3',
            [html, proposal.title, id]
        );

        // Get updated landing
        const updatedLanding = await pool.query('SELECT * FROM landings WHERE id = $1', [id]);

        res.json({
            success: true,
            landing: updatedLanding.rows[0]
        });

    } catch (error) {
        console.error('[LandingStrategy] Error:', error);
        next(error);
    }
});

/**
 * GET /api/landings/campaign/:campaignId
 * Get all landings for a specific campaign
 */
router.get('/campaign/:campaignId', requireAuth, async (req: any, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const { campaignId } = req.params;
        const userId = authReq.user?.userId;

        // Verify campaign ownership
        const campaignCheck = await pool.query(
            'SELECT id FROM campaigns WHERE id = $1 AND client_id = $2',
            [campaignId, userId]
        );

        if (campaignCheck.rows.length === 0) {
            res.status(403).json({ success: false, error: 'Campaign not found or unauthorized' });
            return;
        }

        const result = await pool.query(
            'SELECT * FROM landings WHERE campaign_id = $1 ORDER BY created_at DESC',
            [campaignId]
        );

        res.json({
            success: true,
            landings: result.rows
        });

    } catch (error) {
        console.error('[Landings] Error fetching campaign landings:', error);
        next(error);
    }
});

/**
 * PATCH /api/landings/:id/publish
 * Publish or unpublish a landing
 */
router.patch('/:id/publish', requireAuth, async (req: any, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const { id } = req.params;
        const { status } = req.body;
        const userId = authReq.user?.userId;

        if (!status || !['draft', 'published', 'archived'].includes(status)) {
            res.status(400).json({ success: false, error: 'Invalid status' });
            return;
        }

        // Verify ownership
        const landingCheck = await pool.query(
            'SELECT l.id FROM landings l JOIN campaigns c ON l.campaign_id = c.id WHERE l.id = $1 AND c.client_id = $2',
            [id, userId]
        );

        if (landingCheck.rows.length === 0) {
            res.status(403).json({ success: false, error: 'Landing not found or unauthorized' });
            return;
        }

        // Update status
        const publishedAt = status === 'published' ? new Date() : null;
        const result = await pool.query(
            'UPDATE landings SET status = $1, published_at = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [status, publishedAt, id]
        );

        res.json({
            success: true,
            landing: result.rows[0]
        });

    } catch (error) {
        console.error('[Landings] Error publishing landing:', error);
        next(error);
    }
});

export default router;
