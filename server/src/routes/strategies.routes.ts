/**
 * Strategies Route
 * =================
 * Handles AI-powered marketing strategy generation via CreativeEngineService
 */
import { Router, Request, Response, NextFunction } from 'express';
import { generateStrategies, type BrandData, type Strategy } from '../services/CreativeEngineService.js';

const router = Router();

interface GenerateStrategiesBody {
    brandData: BrandData;
    date?: string;
    location?: string;
}

/**
 * POST /api/generate-strategies
 * Generates creative marketing strategies based on brand data
 */
router.post('/', async (
    req: Request<object, object, GenerateStrategiesBody>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { brandData, date, location } = req.body;

        // Validation
        if (!brandData) {
            res.status(400).json({
                success: false,
                error: 'Missing brandData in request body'
            });
            return;
        }

        if (!brandData.name || !brandData.businessType) {
            res.status(400).json({
                success: false,
                error: 'brandData must include name and businessType'
            });
            return;
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
 * GET /api/generate-strategies/test
 * Quick test endpoint for development
 */
router.get('/test', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const testBrand: BrandData = {
            name: 'Demo Bar',
            businessType: 'Bar',
            style: 'Moderno',
            targetAudience: 'Jóvenes 20-35',
            description: 'Bar de copas en zona universitaria',
            location: 'Madrid, España'
        };

        const strategies = await generateStrategies(testBrand);

        res.json({
            success: true,
            message: 'Test completed successfully',
            strategies: strategies.map((s: Strategy) => ({
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
