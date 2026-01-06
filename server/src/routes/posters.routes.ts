/**
 * Posters Routes
 * ===============
 * Endpoints for generating and retrieving posters
 */
import { Router, Response, NextFunction } from 'express';
import path from 'path';
import pool from '../db/pool.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { PosterGeneratorService } from '../services/PosterGeneratorService.js';
import { DeploymentService } from '../services/DeploymentService.js';

const router = Router();

/**
 * POST /api/posters/generate
 * Generate and Deploy process
 */
router.post('/generate', requireAuth, async (req: any, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        const { landingId } = req.body;
        const userId = authReq.user?.userId;

        if (!landingId) {
            res.status(400).json({ success: false, error: 'Missing landingId' });
            return;
        }

        // Fetch Landing Data + Brand
        const query = `
            SELECT 
                l.*, 
                c.brand_analysis_id,
                b.primary_color,
                b.secondary_color,
                b.business_type,
                mp.description as proposal_desc
            FROM landings l
            JOIN campaigns c ON l.campaign_id = c.id
            JOIN marketing_proposals mp ON l.campaign_id = mp.campaign_id
            LEFT JOIN brand_analysis b ON c.brand_analysis_id = b.id
            WHERE l.id = $1 AND c.client_id = $2
        `;

        const result = await pool.query(query, [landingId, userId]);

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Landing not found' });
            return;
        }

        const landing = result.rows[0];

        // 1. Deploy (Provision URL)
        // We use the slug from landing table
        const { url: publicUrl } = await DeploymentService.provisionSubdomain(landing.slug);

        // 2. Generate Poster PDF with that URL
        const pdfFilename = await PosterGeneratorService.generatePosterPdf({
            title: landing.title,
            description: landing.proposal_desc || 'Escanea para ver la experiencia.',
            landingUrl: publicUrl,
            brandColors: {
                primary: landing.primary_color || '#000000',
                secondary: landing.secondary_color || '#333333'
            },
            bgKeyword: landing.business_type
        });

        // Update landing with deployment status and poster url (or store in separate table)
        // For now, let's just return it or assuming we had columns for it.
        // Let's create a logic to update status.
        await pool.query(
            "UPDATE landings SET status = 'published', published_at = NOW() WHERE id = $1",
            [landingId]
        );

        res.json({
            success: true,
            publicUrl,
            posterDownloadUrl: `/api/posters/download/${pdfFilename}`
        });

    } catch (error) {
        console.error('[Posters] Error:', error);
        next(error);
    }
});

/**
 * GET /api/posters/download/:filename
 * Serve the PDF file
 */
router.get('/download/:filename', async (req, res) => {
    const { filename } = req.params;
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'uploads', 'posters', safeFilename);

    res.download(filePath, safeFilename, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            if (!res.headersSent) {
                res.status(404).send('File not found');
            }
        }
    });
});

export default router;
