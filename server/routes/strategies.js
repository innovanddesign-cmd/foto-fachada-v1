/**
 * Strategies Route
 * Handles AI-powered marketing strategy generation via CreativeEngineService
 */
import { Router } from 'express';
import { generateStrategies } from '../services/CreativeEngineService.js';

const router = Router();

/**
 * POST /api/strategies/generate
 * Generates creative marketing strategies based on brand data
 * 
 * Body: {
 *   brandData: { name, businessType, style?, targetAudience?, description?, niche?, primaryColor? },
 *   date?: string,
 *   location?: string
 * }
 */
router.post('/generate', async (req, res, next) => {
    try {
        const { brandData, date, location } = req.body;

        // Validation
        if (!brandData) {
            return res.status(400).json({
                success: false,
                error: 'Missing brandData in request body'
            });
        }

        if (!brandData.name || !brandData.businessType) {
            return res.status(400).json({
                success: false,
                error: 'brandData must include name and businessType'
            });
        }

        console.log(`[Strategies] 🎯 Request for: ${brandData.name} (${brandData.businessType})`);

        const startTime = Date.now();
        const strategies = await generateStrategies(brandData, date, location);
        const duration = Date.now() - startTime;

        console.log(`[Strategies] ✅ Generated ${strategies.length} strategies in ${duration}ms`);

        res.json({
            success: true,
            strategies,
            meta: {
                generatedAt: new Date().toISOString(),
                durationMs: duration,
                count: strategies.length
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/strategies/test
 * Quick test endpoint for development
 */
router.get('/test', async (req, res, next) => {
    try {
        const testBrand = {
            name: 'Demo Bar',
            businessType: 'Bar',
            style: 'Moderno',
            targetAudience: 'Jóvenes 20-35',
            description: 'Bar de copas en zona universitaria'
        };

        const strategies = await generateStrategies(testBrand);

        res.json({
            success: true,
            message: 'Test completed successfully',
            strategies: strategies.map(s => ({
                id: s.id,
                title: s.title,
                description: s.description,
                configFields: s.ui_config_schema.length,
                codeLength: s.code_template.length
            }))
        });
    } catch (error) {
        next(error);
    }
});

export default router;
