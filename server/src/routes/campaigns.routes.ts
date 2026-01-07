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

// ─────────────────────────────────────────────────────────────
// POST /api/campaigns/:id/auto-generate - FASE 1 Complete Flow
// ─────────────────────────────────────────────────────────────
// Generates 1 optimized strategy with 3 widgets, creates 3 individual widget pages
// Flow: Analysis (done) → Generate 1 Strategy + 3 Widgets → Create 3 Widget Pages
router.post('/:id/auto-generate', async (req: AuthRequest, res: Response, next: NextFunction) => {
    const client = await pool.connect();

    try {
        const userId = req.user?.id;
        const { id: campaignId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, error: 'No autorizado' });
            return;
        }

        await client.query('BEGIN');

        appLogger.info({ campaignId, userId }, '[AutoGenerate] Starting FASE 1: 1 strategy + 3 widgets');

        // 1. Get campaign and brand analysis
        const campaignResult = await client.query(`
            SELECT c.*, 
                   ba.business_name,
                   ba.business_type,
                   ba.primary_color,
                   ba.secondary_color,
                   ba.description,
                   ba.location,
                   ba.analysis_data
            FROM campaigns c
            LEFT JOIN brand_analysis ba ON c.brand_analysis_id = ba.id
            WHERE c.id = $1 AND c.client_id = $2
        `, [campaignId, userId]);

        if (campaignResult.rows.length === 0) {
            await client.query('ROLLBACK');
            res.status(404).json({ success: false, error: 'Campaña no encontrada' });
            return;
        }

        const campaign = campaignResult.rows[0];

        if (!campaign.brand_analysis_id) {
            await client.query('ROLLBACK');
            res.status(400).json({
                success: false,
                error: 'La campaña no tiene análisis de marca asociado'
            });
            return;
        }

        // 2. Generate 1 optimized strategy with 3 widgets using NEW method
        appLogger.info({ campaignId }, '[AutoGenerate] Generating 1 optimized strategy with 3 widgets...');

        const { generateOptimizedStrategy } = await import('../services/CreativeEngineService.js');

        const { strategy, widgets } = await generateOptimizedStrategy({
            name: campaign.business_name,
            businessType: campaign.business_type,
            style: 'Modern',
            targetAudience: 'Local customers',
            description: campaign.description,
            primaryColor: campaign.primary_color,
            location: campaign.location
        });

        appLogger.info({
            campaignId,
            strategyTitle: strategy.title,
            widgetsCount: widgets.length
        }, '[AutoGenerate] Strategy generated successfully');

        // 3. Save the strategy as a marketing proposal
        const proposalResult = await client.query(`
            INSERT INTO marketing_proposals (
                campaign_id,
                strategy_id,
                title,
                description,
                status
            )
            VALUES ($1, $2, $3, $4, 'approved')
            RETURNING id
        `, [
            campaignId,
            `optimized-strategy-${Date.now()}`,
            strategy.title,
            strategy.description
        ]);

        const proposalId = proposalResult.rows[0].id;

        appLogger.info({
            campaignId,
            proposalId
        }, '[AutoGenerate] Marketing proposal created');

        // 4. For each widget, create an individual functional page
        const { LandingGeneratorService } = await import('../services/LandingGeneratorService.js');
        const { slugify } = await import('../services/LinkContentGenerator.js');

        const brandSlug = slugify(campaign.business_name);
        const generatedWidgets: any[] = [];

        for (let i = 0; i < widgets.length; i++) {
            const widget = widgets[i];

            //Build default config from UI schema
            const defaultConfig: Record<string, any> = {
                business_name: campaign.business_name,
                business_type: campaign.business_type,
                primary_color: campaign.primary_color || '#6366f1'
            };

            widget.ui_config_schema?.forEach((field: any) => {
                if (field.default) {
                    defaultConfig[field.key] = field.default;
                }
            });

            // Replace variables in widget code
            const widgetHtml = LandingGeneratorService.replaceVariables(
                widget.code_template,
                defaultConfig
            );

            // Get external libraries for this widget type
            const externalLibraries = LandingGeneratorService.getLibrariesForStrategy(widget.id);

            // Generate complete HTML page for this widget
            const html = LandingGeneratorService.generateHtml({
                title: `${campaign.business_name} - ${widget.title}`,
                description: widget.description,
                widgetCode: widgetHtml,
                brandColors: {
                    primary: campaign.primary_color || '#6366f1',
                    secondary: campaign.secondary_color || '#8b5cf6'
                },
                contactInfo: {
                    address: campaign.location
                },
                externalLibraries
            });

            // Generate widget slug
            const widgetSlug = slugify(widget.title);
            const fullSlug = `/w/${brandSlug}/${widgetSlug}`;

            // Ensure unique slug
            let uniqueSlug = fullSlug;
            let counter = 1;
            while (true) {
                const existingResult = await client.query(
                    'SELECT id FROM widget_pages WHERE slug = $1',
                    [uniqueSlug]
                );
                if (existingResult.rows.length === 0) break;
                uniqueSlug = `${fullSlug}-${counter}`;
                counter++;
            }

            // Insert widget page
            const widgetPageResult = await client.query(`
                INSERT INTO widget_pages (
                    proposal_id,
                    campaign_id,
                    title,
                    slug,
                    widget_id,
                    widget_type,
                    html_content,
                    status
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'published')
                RETURNING *
            `, [
                proposalId,
                campaignId,
                `${campaign.business_name} - ${widget.title}`,
                uniqueSlug,
                widget.id,
                widget.visual_mechanic || 'interactive',
                html
            ]);

            const isDev = process.env.NODE_ENV !== 'production';
            const protocol = isDev ? 'http' : 'https';
            const domain = isDev ? 'localhost:3000' : process.env.PUBLIC_DOMAIN || 'foto-fachada-v1.vercel.app';

            generatedWidgets.push({
                ...widgetPageResult.rows[0],
                widget_title: widget.title,
                widget_emoji: widget.emoji,
                publicUrl: `${protocol}://${domain}${uniqueSlug}`
            });
        }

        await client.query('COMMIT');

        appLogger.info({
            campaignId,
            proposalId,
            widgetPagesCount: generatedWidgets.length
        }, '[AutoGenerate] FASE 1 completed: 3 widget pages created and published');

        res.status(201).json({
            success: true,
            message: `FASE 1 completada: ${generatedWidgets.length} páginas de widgets generadas automáticamente`,
            strategy: {
                title: strategy.title,
                description: strategy.description
            },
            widgets: generatedWidgets.map(w => ({
                id: w.id,
                title: w.widget_title,
                emoji: w.widget_emoji,
                url: w.publicUrl,
                slug: w.slug
            })),
            campaignId,
            proposalId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        appLogger.error({ error, context: 'auto-generate' }, 'Error in automatic widget generation');
        next(error);
    } finally {
        client.release();
    }
});


export default router;

// Flow: Analysis (already done) → Generate 3 Strategies → Create 3 Landings
router.post('/:id/auto-generate', async (req: AuthRequest, res: Response, next: NextFunction) => {
    const client = await pool.connect();

    try {
        const userId = req.user?.id;
        const { id: campaignId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, error: 'No autorizado' });
            return;
        }

        await client.query('BEGIN');

        appLogger.info({ campaignId, userId }, '[AutoGenerate] Starting automatic landing generation');

        // 1. Get campaign and brand analysis
        const campaignResult = await client.query(`
            SELECT c.*, 
                   ba.business_name,
                   ba.business_type,
                   ba.primary_color,
                   ba.secondary_color,
                   ba.description,
                   ba.location,
                   ba.analysis_data
            FROM campaigns c
            LEFT JOIN brand_analysis ba ON c.brand_analysis_id = ba.id
            WHERE c.id = $1 AND c.client_id = $2
        `, [campaignId, userId]);

        if (campaignResult.rows.length === 0) {
            await client.query('ROLLBACK');
            res.status(404).json({ success: false, error: 'Campaña no encontrada' });
            return;
        }

        const campaign = campaignResult.rows[0];

        if (!campaign.brand_analysis_id) {
            await client.query('ROLLBACK');
            res.status(400).json({
                success: false,
                error: 'La campaña no tiene análisis de marca asociado'
            });
            return;
        }

        // 2. Generate 3 strategies using CreativeEngine
        appLogger.info({ campaignId }, '[AutoGenerate] Generating strategies with AI...');

        const { generateStrategies } = await import('../services/CreativeEngineService.js');

        const strategies = await generateStrategies({
            name: campaign.business_name,
            businessType: campaign.business_type,
            style: 'Modern',
            targetAudience: 'Local customers',
            description: campaign.description,
            primaryColor: campaign.primary_color,
            location: campaign.location
        });

        appLogger.info({
            campaignId,
            strategiesCount: strategies.length
        }, '[AutoGenerate] Strategies generated successfully');

        // 3. Create marketing proposals for each strategy
        const proposalIds: string[] = [];

        for (let i = 0; i < Math.min(3, strategies.length); i++) {
            const strategy = strategies[i];

            const proposalResult = await client.query(`
                INSERT INTO marketing_proposals (
                    campaign_id,
                    strategy_id,
                    title,
                    description,
                    code_template,
                    ui_config_schema,
                    status
                )
                VALUES ($1, $2, $3, $4, $5, $6, 'approved')
                RETURNING id
            `, [
                campaignId,
                strategy.id,
                strategy.title,
                strategy.description,
                strategy.code_template,
                JSON.stringify(strategy.ui_config_schema),
            ]);

            proposalIds.push(proposalResult.rows[0].id);
        }

        appLogger.info({
            campaignId,
            proposalsCount: proposalIds.length
        }, '[AutoGenerate] Marketing proposals created');

        // 4. Generate landings for each proposal
        const { LandingGeneratorService } = await import('../services/LandingGeneratorService.js');
        const generatedLandings: any[] = [];

        for (let i = 0; i < proposalIds.length; i++) {
            const proposalId = proposalIds[i];
            const strategy = strategies[i];

            // Build default UI config from schema
            const defaultConfig: Record<string, any> = {
                business_name: campaign.business_name,
                business_type: campaign.business_type
            };

            strategy.ui_config_schema.forEach((field: any) => {
                if (field.default) {
                    defaultConfig[field.key] = field.default;
                }
            });

            // Replace variables in widget code
            const widgetHtml = LandingGeneratorService.replaceVariables(
                strategy.code_template,
                defaultConfig
            );

            // Get external libraries
            const externalLibraries = LandingGeneratorService.getLibrariesForStrategy(strategy.id);

            // Generate complete HTML
            const html = LandingGeneratorService.generateHtml({
                title: `${campaign.business_name} - ${strategy.title}`,
                description: strategy.description,
                widgetCode: widgetHtml,
                brandColors: {
                    primary: campaign.primary_color || '#6366f1',
                    secondary: campaign.secondary_color || '#8b5cf6'
                },
                contactInfo: {
                    address: campaign.location
                },
                externalLibraries
            });

            // Generate slug
            const { slugify } = await import('../services/LinkContentGenerator.js');
            const baseSlug = slugify(`${campaign.business_name}-${strategy.title}`);

            // Ensure unique slug
            let slug = baseSlug;
            let counter = 1;
            while (true) {
                const existingResult = await client.query(
                    'SELECT id FROM landings WHERE slug = $1',
                    [slug]
                );
                if (existingResult.rows.length === 0) break;
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            // Insert landing
            const landingResult = await client.query(`
                INSERT INTO landings (
                    campaign_id,
                    proposal_id,
                    title,
                    slug,
                    html_content,
                    status
                )
                VALUES ($1, $2, $3, $4, $5, 'published')
                RETURNING *
            `, [
                campaignId,
                proposalId,
                `${campaign.business_name} - ${strategy.title}`,
                slug,
                html
            ]);

            generatedLandings.push({
                ...landingResult.rows[0],
                strategy: strategy.title,
                publicUrl: strategy.url || `/l/${slug}`
            });
        }

        await client.query('COMMIT');

        appLogger.info({
            campaignId,
            landingsCount: generatedLandings.length
        }, '[AutoGenerate] Landings created and published successfully');

        res.status(201).json({
            success: true,
            message: `${generatedLandings.length} landings generadas y publicadas automáticamente`,
            landings: generatedLandings,
            campaignId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        appLogger.error({ error, context: 'auto-generate' }, 'Error in automatic generation');
        next(error);
    } finally {
        client.release();
    }
});

export default router;
