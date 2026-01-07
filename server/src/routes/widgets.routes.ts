/**
 * Widgets Routes
 * ===============
 * Public routes for individual widget pages
 * No authentication required
 */
import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db/pool.js';
import { appLogger } from '../services/logger.js';

const router = Router();

// ─────────────────────────────────────────────────────────────
// GET /w/:brandSlug/:widgetSlug - Public widget page
// ─────────────────────────────────────────────────────────────
router.get('/w/:brandSlug/:widgetSlug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { brandSlug, widgetSlug } = req.params;
        const slug = `/w/${brandSlug}/${widgetSlug}`;

        // Get widget page by slug
        const result = await pool.query(`
            SELECT html_content, title, views, widget_type
            FROM widget_pages 
            WHERE slug = $1 AND status = 'published'
        `, [slug]);

        if (result.rows.length === 0) {
            appLogger.warn({ slug }, 'Widget page not found');
            res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Widget No Encontrado</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            margin: 0;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-align: center;
                            padding: 20px;
                        }
                        h1 { font-size: 3rem; margin: 0; }
                        p { font-size: 1.2rem; opacity: 0.9; }
                    </style>
                </head>
                <body>
                    <div>
                        <h1>404</h1>
                        <p>Widget no encontrado</p>
                        <p style="font-size: 0.9rem; opacity: 0.7;">La página que buscas no existe o no está publicada.</p>
                    </div>
                </body>
                </html>
            `);
            return;
        }

        const widget = result.rows[0];

        // Increment view count (async, non-blocking)
        pool.query(
            'UPDATE widget_pages SET views = views + 1 WHERE slug = $1',
            [slug]
        ).catch(err => {
            appLogger.warn({ error: err, slug }, 'Failed to increment widget views');
        });

        appLogger.info({
            slug,
            widgetType: widget.widget_type,
            views: widget.views + 1
        }, 'Widget page served');

        // Serve HTML
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(widget.html_content);

    } catch (error) {
        appLogger.error({ error, context: 'widgets' }, 'Error serving widget page');
        next(error);
    }
});

export default router;
