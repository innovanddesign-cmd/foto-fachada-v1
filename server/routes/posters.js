/**
 * Posters Route
 * Handles PDF generation requests
 */
import { Router } from 'express';
import { PosterService } from '../services/PosterService.js';
import { appLogger } from '../services/logger.js';

const router = Router();

/**
 * POST /api/posters/generate
 * Generates a PDF poster based on the provided configuration
 */
router.post('/generate', async (req, res, next) => {
    try {
        const config = req.body;

        // Basic validation
        if (!config.businessName || !config.landingUrl) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: businessName and landingUrl are required'
            });
        }

        appLogger.info({ business: config.businessName }, '📄 Poster generation request received');

        const pdfBuffer = await PosterService.generatePosterPdf(config);

        // Send PDF as response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="cartel_${Date.now()}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);

        appLogger.info('✅ Poster generated and sent successfully');

    } catch (error) {
        appLogger.error({ error: error.message }, 'Poster generation failed');
        next(error);
    }
});

export default router;
