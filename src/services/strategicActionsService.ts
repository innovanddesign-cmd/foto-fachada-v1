/**
 * Strategic Actions Service
 * =========================
 * Connects the No-Code form configuration with Simple Page generation.
 * Maps action templates to actual page output.
 */

import type { StrategicAction, StrategicCategory } from '../data/strategicCategories';
import type { BrandData } from '../types';
import { generateFlashOfferPage } from './flashOfferTemplate';
import { generateComparadorProPage } from './comparadorProTemplate';
import { generateScratchCardPage } from './scratchCardTemplate';
import { generateVisitStreakPage } from './visitStreakTemplate';
import { generateLeadMagnetPage } from './leadMagnetTemplate';
import { generateReferralPage } from './referralTemplate';
import { generateFeedbackSurveyPage } from './feedbackSurveyTemplate';
import { generateExpertGuidePage } from './expertGuideTemplate';
import { generateRecommendationPage } from './recommendationTemplate';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface SimplePageConfig {
    id: string;
    slug: string;
    title: string;
    actionId: number;
    categoryId: string;
    config: Record<string, any>;
    brandData: BrandData;
    htmlContent: string;
    createdAt: Date;
    expiresAt?: Date;
}

export interface GeneratePageResult {
    success: boolean;
    page?: SimplePageConfig;
    url?: string;
    error?: string;
}

// ─────────────────────────────────────────────────────────────
// MAIN GENERATOR FUNCTION
// ─────────────────────────────────────────────────────────────

/**
 * Generates a Simple Page from action configuration
 */
export async function generateSimplePage(
    action: StrategicAction,
    category: StrategicCategory,
    config: Record<string, any>,
    brandData: BrandData
): Promise<GeneratePageResult> {
    try {
        // Generate unique ID and slug
        const timestamp = Date.now();
        const slug = generateSlug(action.name, brandData.name, timestamp);

        // Generate HTML content based on action template
        const htmlContent = await generatePageHtml(action, category, config, brandData);

        // Create the page configuration
        const pageConfig: SimplePageConfig = {
            id: `page-${timestamp}`,
            slug,
            title: `${action.name} - ${brandData.name}`,
            actionId: action.id,
            categoryId: category.id,
            config,
            brandData,
            htmlContent,
            createdAt: new Date(),
        };

        // Store in localStorage for now (in production, this would go to backend)
        storePageLocally(pageConfig);

        // Generate URL
        const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const baseUrl = isDev ? 'http://localhost:5173' : 'https://fotofachada.com';
        const url = `${baseUrl}/p/${slug}`;

        console.log('[StrategicActions] ✅ Page generated:', { slug, url, actionId: action.id });

        return {
            success: true,
            page: pageConfig,
            url,
        };

    } catch (error) {
        console.error('[StrategicActions] Error generating page:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error generating page',
        };
    }
}

// ─────────────────────────────────────────────────────────────
// HTML GENERATION
// ─────────────────────────────────────────────────────────────

/**
 * Generates full HTML page based on action template
 * Uses specialized templates for premium pages (Flash Offer)
 */
async function generatePageHtml(
    action: StrategicAction,
    category: StrategicCategory,
    config: Record<string, any>,
    brandData: BrandData
): Promise<string> {
    // Use specialized premium template for Flash Offer (Action ID 1)
    if (action.pageTemplate === 'flash-offer') {
        return generateFlashOfferPage({
            producto: config.producto || 'Producto',
            precio_original: config.precio_original || '0',
            precio_oferta: config.precio_oferta || '0',
            tiempo_limite: config.tiempo_limite || '24 horas',
            mensaje_urgencia: config.mensaje_urgencia || '¡Oferta limitada!',
            imagen_producto: config.imagen_producto,
            stock_porcentaje: config.stock_porcentaje || 92,
        }, brandData);
    }

    // Use specialized premium template for Comparador Pro (Action ID 2)
    if (action.pageTemplate === 'comparador-pro') {
        return generateComparadorProPage({
            servicio_estandar: config.servicio_estandar || 'Servicio Estándar',
            precio_estandar: config.precio_estandar || '0',
            servicio_oferta: config.servicio_oferta || 'Oferta Exclusiva',
            precio_oferta: config.precio_oferta || '0',
            beneficios: config.beneficios || '',
            cta: config.cta || 'Aprovechar ahora',
        }, brandData);
    }

    // Use specialized premium template for Scratch Card (Action ID 3)
    if (action.pageTemplate === 'scratch-card') {
        return generateScratchCardPage({
            premio: config.premio || 'Premio Sorpresa',
            codigo_premio: config.codigo_premio || '',
            mensaje_inicial: config.mensaje_inicial || '¡Rasca y gana!',
            mensaje_ganador: config.mensaje_ganador || '¡Enhorabuena!',
            validez: config.validez || '',
        }, brandData);
    }

    // Use specialized premium template for Visit Streak (Action ID 4)
    if (action.pageTemplate === 'visit-streak') {
        return generateVisitStreakPage({
            nombre_programa: config.nombre_programa || 'Mi Racha',
            visitas_meta: config.visitas_meta || '7',
            premio: config.premio || 'Premio sorpresa',
            mensaje_motivacional: config.mensaje_motivacional || '¡Sigue así!',
        }, brandData);
    }

    // Use specialized premium template for Lead Magnet (Action ID 5)
    if (action.pageTemplate === 'lead-magnet') {
        return generateLeadMagnetPage({
            producto_gratis: config.producto_gratis || 'Regalo Gratis',
            descripcion: config.descripcion || 'Tu regalo te está esperando',
            tiempo_validez: config.tiempo_validez || '15',
            instrucciones: config.instrucciones || 'Muestra esta pantalla en barra',
        }, brandData);
    }

    // Use specialized premium template for Referral (Action ID 6)
    if (action.pageTemplate === 'referral') {
        return generateReferralPage({
            premio_referidor: config.premio_referidor || 'Regalo',
            premio_invitado: config.premio_invitado || 'Regalo',
            mensaje_whatsapp: config.mensaje_whatsapp || '',
        }, brandData);
    }

    // Use specialized premium template for Feedback Survey (Action ID 7)
    if (action.pageTemplate === 'feedback-survey') {
        return generateFeedbackSurveyPage({
            pregunta_1: config.pregunta_1 || '¿Cómo fue tu experiencia?',
            pregunta_2: config.pregunta_2 || '¿Nos recomendarías?',
            pregunta_3: config.pregunta_3 || '',
            recompensa: config.recompensa || 'Descuento especial',
            codigo_recompensa: config.codigo_recompensa || '',
        }, brandData);
    }

    // Use specialized premium template for Expert Guide (Action ID 8)
    if (action.pageTemplate === 'expert-guide') {
        return generateExpertGuidePage({
            titulo_guia: config.titulo_guia || 'Los 3 secretos que nadie te cuenta',
            nombre_experto: config.nombre_experto || 'Nuestro Experto',
            cargo_experto: config.cargo_experto || 'Especialista',
            secreto_1: config.secreto_1 || '',
            secreto_2: config.secreto_2 || '',
            secreto_3: config.secreto_3 || '',
            producto_cta: config.producto_cta || '',
        }, brandData);
    }

    // Use specialized premium template for Recommendation Quiz (Action ID 9)
    if (action.pageTemplate === 'recommendation') {
        return generateRecommendationPage({
            pregunta_1: config.pregunta_1 || '¿Cómo tienes el hambre hoy?',
            pregunta_2: config.pregunta_2 || '¿Dulce o salado?',
            pregunta_3: config.pregunta_3 || '¿Para comer aquí o para llevar?',
            producto_estrella: config.producto_estrella || 'Nuestro favorito',
            descripcion_match: config.descripcion_match || '',
            precio: config.precio || '',
        }, brandData);
    }

    // For other templates, use the generic generator
    const { primary, accent } = brandData.colors || {
        primary: '#6366f1',
        accent: '#f59e0b'
    };

    // Category-specific gradient
    const gradientMap = {
        VENTAS: `linear-gradient(135deg, #f59e0b, #ef4444)`,
        FIDELIZACION: `linear-gradient(135deg, #10b981, #06b6d4)`,
        AUTORIDAD: `linear-gradient(135deg, #8b5cf6, #ec4899)`,
    };

    const gradient: string = gradientMap[category.id] || `linear-gradient(135deg, ${primary}, ${accent})`;

    // Generate content based on template type
    const contentHtml = generateTemplateContent(action, config, gradient);

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${action.name} - ${brandData.name}</title>
    <meta name="description" content="${action.description}">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            text-align: center;
        }
        
        .container {
            max-width: 480px;
            width: 100%;
        }
        
        .card {
            background: rgba(30, 41, 59, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(100, 116, 139, 0.2);
            border-radius: 24px;
            padding: 2.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        .brand-logo {
            width: 80px;
            height: 80px;
            background: ${gradient};
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2.5rem;
        }
        
        h1 {
            font-size: 1.75rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            background: ${gradient};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            color: #94a3b8;
            font-size: 1rem;
            margin-bottom: 2rem;
        }
        
        .content {
            text-align: left;
            margin-bottom: 2rem;
        }
        
        .cta-button {
            display: block;
            width: 100%;
            background: ${gradient};
            color: white;
            border: none;
            padding: 1rem 2rem;
            font-size: 1.1rem;
            font-weight: 700;
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            text-align: center;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .footer {
            margin-top: 2rem;
            font-size: 0.8rem;
            color: #64748b;
        }
        
        .footer a {
            color: #6366f1;
            text-decoration: none;
        }
        
        /* Template-specific styles */
        .price-display {
            margin: 1.5rem 0;
        }
        
        .price-original {
            font-size: 1.25rem;
            color: #64748b;
            text-decoration: line-through;
        }
        
        .price-offer {
            font-size: 3rem;
            font-weight: 800;
            color: #f59e0b;
            display: block;
        }
        
        .urgency-badge {
            display: inline-block;
            background: rgba(239, 68, 68, 0.2);
            color: #f87171;
            padding: 0.5rem 1rem;
            border-radius: 100px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        
        .discount-circle {
            width: 140px;
            height: 140px;
            background: ${gradient};
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
        }
        
        .discount-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: white;
        }
        
        .discount-label {
            font-size: 0.9rem;
            color: rgba(255,255,255,0.8);
        }
        
        .coupon-code {
            background: rgba(99, 102, 241, 0.2);
            border: 2px dashed #6366f1;
            padding: 1rem;
            border-radius: 12px;
            font-family: monospace;
            font-size: 1.25rem;
            margin: 1rem 0;
        }
        
        .benefits-list {
            list-style: none;
            margin: 1.5rem 0;
        }
        
        .benefits-list li {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(100, 116, 139, 0.2);
            color: #e2e8f0;
        }
        
        .benefits-list li::before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
        }
        
        .testimonial {
            background: rgba(71, 85, 105, 0.2);
            border-radius: 16px;
            padding: 1.25rem;
            margin-bottom: 1rem;
            text-align: left;
        }
        
        .testimonial-text {
            font-style: italic;
            color: #e2e8f0;
            margin-bottom: 0.75rem;
        }
        
        .testimonial-author {
            color: #6366f1;
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .levels-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin: 1.5rem 0;
        }
        
        .level-card {
            background: rgba(71, 85, 105, 0.2);
            border-radius: 12px;
            padding: 1rem;
            text-align: left;
        }
        
        .level-name {
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 0.25rem;
        }
        
        .level-benefit {
            font-size: 0.9rem;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="brand-logo">${category.emoji}</div>
            ${contentHtml}
        </div>
        <p class="footer">
            Powered by <a href="#">${brandData.name}</a>
        </p>
    </div>
</body>
</html>`;
}

/**
 * Generates template-specific content HTML
 */
function generateTemplateContent(
    action: StrategicAction,
    config: Record<string, any>,
    _gradient: string
): string {
    switch (action.pageTemplate) {
        case 'flash-offer':
            return `
                <span class="urgency-badge">⚡ ${config.mensaje_urgencia || 'OFERTA FLASH'}</span>
                <h1>${config.producto || 'Oferta Especial'}</h1>
                <div class="price-display">
                    <span class="price-original">${config.precio_original || '0'}€</span>
                    <span class="price-offer">${config.precio_oferta || '0'}€</span>
                </div>
                <p class="subtitle">⏰ ${config.tiempo_limite || 'Tiempo limitado'}</p>
                <a href="#" class="cta-button">¡Lo quiero ahora!</a>
            `;

        case 'discount-coupon':
            return `
                <div class="discount-circle">
                    <span class="discount-value">${config.porcentaje || '0'}%</span>
                    <span class="discount-label">DESCUENTO</span>
                </div>
                <h1>Descuento Especial</h1>
                <p class="subtitle">${config.productos_aplicables || 'En productos seleccionados'}</p>
                ${config.codigo_cupon ? `<div class="coupon-code">Código: <strong>${config.codigo_cupon}</strong></div>` : ''}
                ${config.condiciones ? `<p style="font-size:0.8rem;color:#64748b;">* ${config.condiciones}</p>` : ''}
                <a href="#" class="cta-button">Usar mi cupón</a>
            `;

        case 'clearance-sale':
            const products = (config.productos || '').split('\n').filter(Boolean);
            return `
                <h1>${config.titulo || 'Gran Liquidación'}</h1>
                <p class="subtitle">${config.mensaje || '¡Hasta agotar existencias!'}</p>
                <ul class="benefits-list">
                    ${products.map((p: string) => `<li>${p}</li>`).join('') || '<li>Productos en liquidación</li>'}
                </ul>
                <a href="#" class="cta-button">Ver todos los productos</a>
            `;

        case 'loyalty-points':
            return `
                <h1>${config.nombre_programa || 'Club de Puntos'}</h1>
                <p class="subtitle">Acumula puntos con cada compra</p>
                <div class="content">
                    <p style="margin-bottom:1rem;">Por cada euro gastado, ganas <strong style="color:#10b981;">${config.puntos_por_euro || '1'} punto</strong></p>
                    <p>Con <strong>${config.puntos_recompensa || '100'} puntos</strong> obtienes:</p>
                    <p style="font-size:1.25rem;color:#10b981;font-weight:700;margin-top:0.5rem;">${config.recompensa || 'Tu recompensa'}</p>
                </div>
                <a href="#" class="cta-button">Unirme gratis</a>
            `;

        case 'vip-club':
            const benefits = (config.beneficios || '').split('\n').filter(Boolean);
            return `
                <h1>${config.nombre_club || 'Club VIP'}</h1>
                <p class="subtitle">Beneficios exclusivos para ti</p>
                <ul class="benefits-list">
                    ${benefits.map((b: string) => `<li>${b}</li>`).join('') || '<li>Beneficios exclusivos</li>'}
                </ul>
                <p style="font-size:1.5rem;font-weight:700;color:#10b981;margin:1rem 0;">
                    ${config.cuota ? `${config.cuota}€/mes` : '¡Gratis!'}
                </p>
                <a href="#" class="cta-button">${config.cta || 'Hazte VIP'}</a>
            `;

        case 'tier-rewards':
            return `
                <h1>Programa de Recompensas</h1>
                <p class="subtitle">Sube de nivel y desbloquea beneficios</p>
                <div class="levels-container">
                    ${config.nivel_1_nombre ? `
                        <div class="level-card">
                            <p class="level-name">🥉 ${config.nivel_1_nombre}</p>
                            <p class="level-benefit">${config.nivel_1_beneficio || ''}</p>
                        </div>
                    ` : ''}
                    ${config.nivel_2_nombre ? `
                        <div class="level-card">
                            <p class="level-name">🥈 ${config.nivel_2_nombre}</p>
                            <p class="level-benefit">${config.nivel_2_beneficio || ''}</p>
                        </div>
                    ` : ''}
                    ${config.nivel_3_nombre ? `
                        <div class="level-card">
                            <p class="level-name">🥇 ${config.nivel_3_nombre}</p>
                            <p class="level-benefit">${config.nivel_3_beneficio || ''}</p>
                        </div>
                    ` : ''}
                </div>
                <a href="#" class="cta-button">Empezar ahora</a>
            `;

        case 'expert-guide':
            const steps = (config.pasos || '').split('\n').filter(Boolean);
            return `
                <h1>${config.titulo_guia || 'Guía de Experto'}</h1>
                <p class="subtitle">${config.introduccion || ''}</p>
                <ol style="text-align:left;margin:1.5rem 0;padding-left:1.25rem;color:#cbd5e1;">
                    ${steps.map((s: string) => `<li style="padding:0.5rem 0;">${s}</li>`).join('') || '<li>Contenido de la guía</li>'}
                </ol>
                <a href="#" class="cta-button">${config.cta_final || 'Consúltanos'}</a>
            `;

        case 'testimonials':
            return `
                <h1>Lo que dicen nuestros clientes</h1>
                ${config.testimonio_1_nombre ? `
                    <div class="testimonial">
                        <p class="testimonial-text">"${config.testimonio_1_texto || ''}"</p>
                        <span class="testimonial-author">— ${config.testimonio_1_nombre} ⭐⭐⭐⭐⭐</span>
                    </div>
                ` : ''}
                ${config.testimonio_2_nombre ? `
                    <div class="testimonial">
                        <p class="testimonial-text">"${config.testimonio_2_texto || ''}"</p>
                        <span class="testimonial-author">— ${config.testimonio_2_nombre} ⭐⭐⭐⭐⭐</span>
                    </div>
                ` : ''}
                <a href="#" class="cta-button">${config.cta || 'Únete a ellos'}</a>
            `;

        case 'certifications':
            const certs = (config.certificados || '').split('\n').filter(Boolean);
            return `
                <h1>${config.titulo || 'Premios y Certificaciones'}</h1>
                <ul class="benefits-list">
                    ${certs.map((c: string) => `<li>🏅 ${c}</li>`).join('') || '<li>Certificaciones profesionales</li>'}
                </ul>
                <p style="color:#94a3b8;margin:1rem 0;font-size:0.95rem;">${config.mensaje || ''}</p>
                <a href="#" class="cta-button">Conoce más</a>
            `;

        default:
            return `
                <h1>${action.name}</h1>
                <p class="subtitle">${action.description}</p>
                <a href="#" class="cta-button">Continuar</a>
            `;
    }
}

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Generates a URL-friendly slug
 */
function generateSlug(actionName: string, brandName: string, timestamp: number): string {
    const base = `${brandName}-${actionName}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${base}-${timestamp.toString(36)}`;
}

/**
 * Stores page in localStorage
 */
function storePageLocally(page: SimplePageConfig): void {
    try {
        const key = `simple_page_${page.slug}`;
        localStorage.setItem(key, JSON.stringify(page));

        // Also store in an index for easy retrieval
        const indexKey = 'simple_pages_index';
        const existingIndex = JSON.parse(localStorage.getItem(indexKey) || '[]');
        existingIndex.push({
            slug: page.slug,
            title: page.title,
            createdAt: page.createdAt,
        });
        localStorage.setItem(indexKey, JSON.stringify(existingIndex));

    } catch (error) {
        console.error('[StrategicActions] Error storing page:', error);
    }
}

/**
 * Retrieves a page by slug
 */
export function getPageBySlug(slug: string): SimplePageConfig | null {
    try {
        const key = `simple_page_${slug}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('[StrategicActions] Error retrieving page:', error);
        return null;
    }
}

/**
 * Gets all stored pages
 */
export function getAllStoredPages(): SimplePageConfig[] {
    try {
        const indexKey = 'simple_pages_index';
        const index = JSON.parse(localStorage.getItem(indexKey) || '[]');

        return index.map((entry: any) => {
            const page = getPageBySlug(entry.slug);
            return page;
        }).filter(Boolean);

    } catch (error) {
        console.error('[StrategicActions] Error getting all pages:', error);
        return [];
    }
}
