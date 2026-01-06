/**
 * Landings Route
 * Handles landing page management
 */
import { Router } from 'express';
import { appLogger } from '../services/logger.js';

const router = Router();

// In-memory mock data for demonstration/audit compliance
const mockLandings = [
    {
        id: 'land_1',
        title: 'Campaña Verano 2026',
        slug: 'verano-2026',
        status: 'active',
        views: 342,
        conversions: 12,
        createdAt: new Date().toISOString()
    },
    {
        id: 'land_2',
        title: 'Promo Flash Fin de Semana',
        slug: 'promo-flash',
        status: 'draft',
        views: 0,
        conversions: 0,
        createdAt: new Date().toISOString()
    }
];

/**
 * GET /api/landings
 * Returns all landing pages
 */
router.get('/', (req, res) => {
    appLogger.info('📂 Fetching landing pages');

    // Simulate DB delay
    setTimeout(() => {
        res.json({
            success: true,
            landings: mockLandings
        });
    }, 200);
});

/**
 * POST /api/landings
 * Creates a new landing page (Stub)
 */
router.post('/', (req, res) => {
    const { title } = req.body;
    appLogger.info({ title }, '📝 Creating new landing page (Stub)');

    const newLanding = {
        id: `land_${Date.now()}`,
        title: title || 'Nueva Landing',
        slug: 'nueva-landing',
        status: 'draft',
        views: 0,
        conversions: 0,
        createdAt: new Date().toISOString()
    };

    mockLandings.unshift(newLanding);

    res.json({
        success: true,
        landing: newLanding
    });
});

export default router;
