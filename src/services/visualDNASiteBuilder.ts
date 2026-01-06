/**
 * Visual DNA Site Builder Service
 * ================================
 * 
 * Generates landing pages following the 4 Laws of Visual Composition:
 * 
 * 1. LEY DE PROFUNDIDAD (Depth) - Contextual backgrounds with overlays
 * 2. LEY DEL TACTO (Touch) - Buttons with physical volume
 * 3. LEY DE JERARQUÍA (Hierarchy) - Logo → Tagline → Actions → Footer
 * 4. LEY DE COHERENCIA CROMÁTICA (Chromatic) - Automatic palette generation
 * 
 * NO TEMPLATES - Pure generative design based on business DNA
 */

import {
    generateVisualDNAPalette,
    paletteToCSSVars,
    type ColorPalette
} from './colorScience';
import type { BrandData } from '../types';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface VisualDNA {
    businessName: string;
    businessType: string;
    tagline: string;
    palette: ColorPalette;
    buttonStyle: ButtonStyle;
    backgroundKeywords: string[];
    fontPair: FontPair;
}

interface ButtonStyle {
    borderRadius: string;
    shadow: string;
    innerShadow: string;
    border: string;
    hover: {
        transform: string;
        shadow: string;
    };
}

interface FontPair {
    heading: string;
    body: string;
    accent: string;
}

interface GeneratedLanding {
    html: string;
    css: string;
    meta: {
        title: string;
        description: string;
        keywords: string[];
    };
}

// ─────────────────────────────────────────────────────────────
// LEY 1: PROFUNDIDAD (Background Generator)
// ─────────────────────────────────────────────────────────────

/**
 * Generate contextual background keywords based on business type
 */
function getBackgroundKeywords(businessType: string, businessName: string): string[] {
    const typeKeywords: Record<string, string[]> = {
        'restaurante': ['restaurant interior', 'dining ambiance', 'food texture'],
        'bar': ['bar counter', 'cocktail lounge', 'neon lights bar'],
        'cafetería': ['coffee beans', 'cafe interior', 'latte art'],
        'panadería': ['bakery shelves', 'fresh bread', 'flour dust'],
        'peluquería': ['salon interior', 'hair styling', 'mirrors salon'],
        'gimnasio': ['gym equipment', 'fitness motivation', 'workout'],
        'tienda de ropa': ['fashion boutique', 'clothing rack', 'retail interior'],
        'figuras de acción': ['collector shelf', 'toy collection', 'action figures display'],
        'escuela de surf': ['ocean waves', 'surfboard texture', 'beach sunset'],
        'taller mecánico': ['car workshop', 'metal texture', 'tools garage'],
        'floristería': ['flower arrangement', 'floral boutique', 'petals close-up'],
        'joyería': ['jewelry display', 'gold texture', 'luxury showcase'],
        'spa': ['zen stones', 'spa ambiance', 'candles wellness'],
        'veterinaria': ['pet clinic', 'animals pets', 'veterinary care'],
        'default': ['professional business', 'elegant interior', 'modern office']
    };

    const type = businessType.toLowerCase();
    const keywords = typeKeywords[type] || typeKeywords['default'];

    return [...keywords, businessName.toLowerCase()];
}

/**
 * Generate CSS for depth background with overlay
 */
function generateDepthCSS(keywords: string[], palette: ColorPalette): string {
    // Use Unsplash source API for contextual images
    const keyword = encodeURIComponent(keywords[0] || 'business');
    const bgImageUrl = `https://source.unsplash.com/1920x1080/?${keyword}`;

    return `
/* ═══════════════════════════════════════════════════════════
   LEY 1: PROFUNDIDAD - Layered Background with Depth
═══════════════════════════════════════════════════════════ */

.landing-container {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
}

/* Base background image */
.landing-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('${bgImageUrl}');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    z-index: -3;
    filter: blur(2px) brightness(0.8);
}

/* Gradient overlay for depth (Opacity 0.4 - 0.6 enforced) */
.landing-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -2;
    background: linear-gradient(
        135deg,
        ${palette.overlay}99 0%, /* ~60% opacity */
        rgba(0,0,0,0.5) 50%,
        ${palette.overlay}99 100%
    );
    backdrop-filter: blur(8px); /* Blur effect */
    -webkit-backdrop-filter: blur(8px);
}

/* Texture layer */
.landing-texture {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    background: 
        radial-gradient(circle at 20% 80%, ${palette.primary}22 0%, transparent 40%),
        radial-gradient(circle at 80% 20%, ${palette.secondary}22 0%, transparent 40%);
    backdrop-filter: blur(1px);
}

/* Content wrapper with glass effect */
.landing-content {
    position: relative;
    z-index: 1;
    padding: 2rem;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.glass-card {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    padding: 3rem;
    box-shadow: 
        0 25px 50px -12px rgba(0,0,0,0.5),
        inset 0 1px 0 rgba(255,255,255,0.1);
}
    `;
}

// ─────────────────────────────────────────────────────────────
// LEY 2: TACTO (Button Volume Generator)
// ─────────────────────────────────────────────────────────────

/**
 * Generate button style based on business personality (2026 Standard)
 */
function generateButtonStyle(palette: ColorPalette, businessType: string): ButtonStyle {
    // Common 2026 base styles
    const baseTransform = 'scale(1.05)'; // Mandatory hover scale
    const baseInnerShadow = `inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)`; // Relief
    const baseShadow = `0 10px 20px -5px ${palette.primary}66, 0 4px 6px -2px rgba(0,0,0,0.1)`;

    const isPlayful = ['figuras de acción', 'juguetería', 'escuela de surf'].some(
        t => businessType.toLowerCase().includes(t)
    );
    const isLuxury = ['joyería', 'spa', 'boutique'].some(
        t => businessType.toLowerCase().includes(t)
    );
    const isIndustrial = ['taller', 'mecánico', 'ferretería'].some(
        t => businessType.toLowerCase().includes(t)
    );

    let style: ButtonStyle;

    if (isPlayful) {
        // Rounded, bouncy, high relief
        style = {
            borderRadius: '50px',
            shadow: `0 8px 25px ${palette.primary}66, ${baseShadow}`,
            innerShadow: `inset 0 4px 6px rgba(255,255,255,0.4), inset 0 -4px 6px rgba(0,0,0,0.2)`,
            border: `2px solid rgba(255,255,255,0.2)`,
            hover: {
                transform: `translateY(-4px) ${baseTransform}`,
                shadow: `0 20px 40px ${palette.primary}88, 0 10px 20px rgba(0,0,0,0.3)`
            }
        };
    } else if (isLuxury) {
        // Elegant, subtle bevel, glass-like
        style = {
            borderRadius: '4px', // Slightly softer square
            shadow: `0 4px 15px rgba(0,0,0,0.2)`,
            innerShadow: `inset 0 1px 0 rgba(255,255,255,0.3), inset 0 0 20px rgba(255,255,255,0.05)`,
            border: `1px solid rgba(255,255,255,0.1)`,
            hover: {
                transform: baseTransform,
                shadow: `0 15px 35px rgba(0,0,0,0.3)`
            }
        };
    } else if (isIndustrial) {
        // Strong bevel, machined look
        style = {
            borderRadius: '2px',
            shadow: `3px 3px 0 ${palette.primaryDark}`,
            innerShadow: `inset 2px 2px 0 rgba(255,255,255,0.1), inset -2px -2px 0 rgba(0,0,0,0.3)`,
            border: `2px solid ${palette.primaryDark}`,
            hover: {
                transform: `translate(-1px, -1px) ${baseTransform}`,
                shadow: `5px 5px 0 ${palette.primaryDark}, 0 10px 25px rgba(0,0,0,0.4)`
            }
        };
    } else {
        // Modern 2026 Default (Apple/Vercel style)
        style = {
            borderRadius: '12px',
            shadow: baseShadow,
            innerShadow: baseInnerShadow,
            border: `1px solid rgba(255,255,255,0.1)`,
            hover: {
                transform: `translateY(-2px) ${baseTransform}`,
                shadow: `0 20px 40px ${palette.primary}88, 0 8px 16px rgba(0,0,0,0.2)`
            }
        };
    }

    return style;
}

/**
 * Generate CSS for tactile buttons
 */
function generateButtonCSS(buttonStyle: ButtonStyle, palette: ColorPalette): string {
    return `
/* ═══════════════════════════════════════════════════════════
   LEY 2: TACTO - Physical Volume Buttons
═══════════════════════════════════════════════════════════ */

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    font-weight: 600;
    font-size: 1.1rem;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.btn-primary {
    background: linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDark} 100%);
    color: ${palette.textOnPrimary};
    border-radius: ${buttonStyle.borderRadius};
    box-shadow: ${buttonStyle.shadow}, ${buttonStyle.innerShadow};
    border: ${buttonStyle.border};
}

.btn-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.15), transparent);
    border-radius: ${buttonStyle.borderRadius} ${buttonStyle.borderRadius} 50% 50%;
}

.btn-primary:hover {
    transform: ${buttonStyle.hover.transform};
    box-shadow: ${buttonStyle.hover.shadow}, ${buttonStyle.innerShadow};
}

.btn-primary:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px ${palette.primary}44;
}

.btn-secondary {
    background: rgba(255,255,255,0.1);
    color: ${palette.text};
    border-radius: ${buttonStyle.borderRadius};
    box-shadow: inset 0 0 0 2px ${palette.text}33;
    border: none;
    backdrop-filter: blur(10px);
}

.btn-secondary:hover {
    background: rgba(255,255,255,0.2);
    box-shadow: inset 0 0 0 2px ${palette.text}66, 0 5px 20px rgba(0,0,0,0.2);
}

.btn-icon {
    width: 1.25em;
    height: 1.25em;
}
    `;
}

// ─────────────────────────────────────────────────────────────
// LEY 3: JERARQUÍA (Structure Generator)
// ─────────────────────────────────────────────────────────────

/**
 * Generate the landing page HTML structure
 */
function generateHierarchyHTML(dna: VisualDNA, landingUrl: string, links: any[]): string {
    const linksHTML = links.map(link => `
        <a href="${link.url || '#'}" class="btn btn-${link.isPrimary ? 'primary' : 'secondary'}">
            <span class="btn-icon">${link.emoji || '🔗'}</span>
            <span>${link.name}</span>
        </a>
    `).join('\n');

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${dna.businessName} | ${dna.businessType}</title>
    <meta name="description" content="${dna.tagline}">
    
    <!-- OpenGraph -->
    <meta property="og:title" content="${dna.businessName}">
    <meta property="og:description" content="${dna.tagline}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${landingUrl}">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(dna.fontPair.heading)}:wght@600;700&family=${encodeURIComponent(dna.fontPair.body)}:wght@400;500&display=swap" rel="stylesheet">
    
    <style>
        {{CSS_PLACEHOLDER}}
    </style>
</head>
<body>
    <!-- LEY 1: PROFUNDIDAD - Layered backgrounds -->
    <div class="landing-bg"></div>
    <div class="landing-overlay"></div>
    <div class="landing-texture"></div>
    
    <div class="landing-container">
        <div class="landing-content">
            <main class="glass-card">
                <!-- LEY 3: JERARQUÍA - Logo → Tagline → Actions → Footer -->
                
                <!-- 1. LOGO / NAME -->
                <header class="header">
                    <h1 class="business-name">${dna.businessName}</h1>
                    <span class="business-type">${dna.businessType}</span>
                </header>

                <!-- 2. TAGLINE DE ALTO IMPACTO -->
                <div class="tagline-section">
                    <p class="tagline">${dna.tagline}</p>
                </div>

                <!-- 3. BLOQUE DE ACCIONES -->
                <nav class="actions-section">
                    ${linksHTML}
                </nav>

                <!-- 4. FOOTER -->
                <footer class="footer">
                    <p class="footer-text">© ${new Date().getFullYear()} ${dna.businessName}</p>
                    <div class="legal-links">
                        <a href="/privacidad">Privacidad</a>
                        <span>·</span>
                        <a href="/terminos">Términos</a>
                    </div>
                </footer>
            </main>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Generate CSS for hierarchy structure
 */
function generateHierarchyCSS(dna: VisualDNA): string {
    return `
/* ═══════════════════════════════════════════════════════════
   LEY 3: JERARQUÍA - Content Structure
═══════════════════════════════════════════════════════════ */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    min-height: 100vh;
    font-family: '${dna.fontPair.body}', sans-serif;
    color: ${dna.palette.text};
    line-height: 1.6;
}

/* Header - Business Identity */
.header {
    text-align: center;
    margin-bottom: 2rem;
}

.business-name {
    font-family: '${dna.fontPair.heading}', sans-serif;
    font-size: clamp(2rem, 8vw, 3.5rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, ${dna.palette.text} 0%, ${dna.palette.textSecondary} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
}

.business-type {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: ${dna.palette.primary};
    font-weight: 500;
}

/* Tagline Section */
.tagline-section {
    text-align: center;
    margin-bottom: 2.5rem;
}

.tagline {
    font-size: clamp(1.1rem, 4vw, 1.5rem);
    color: ${dna.palette.textSecondary};
    font-weight: 400;
    max-width: 32ch;
    margin: 0 auto;
    line-height: 1.5;
}

/* Actions Section */
.actions-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 320px;
    margin: 0 auto 2rem;
}

/* Footer */
.footer {
    text-align: center;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255,255,255,0.1);
}

.footer-text {
    font-size: 0.8rem;
    color: ${dna.palette.textSecondary};
    margin-bottom: 0.5rem;
}

.legal-links {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    font-size: 0.75rem;
}

.legal-links a {
    color: ${dna.palette.textSecondary};
    text-decoration: none;
    transition: color 0.2s;
}

.legal-links a:hover {
    color: ${dna.palette.primary};
}

.legal-links span {
    color: ${dna.palette.textSecondary};
    opacity: 0.5;
}

/* Responsive */
@media (max-width: 480px) {
    .glass-card {
        padding: 2rem 1.5rem;
        border-radius: 16px;
    }
    
    .actions-section {
        max-width: 100%;
    }
}
    `;
}

// ─────────────────────────────────────────────────────────────
// LEY 4: COHERENCIA CROMÁTICA (Integration)
// ─────────────────────────────────────────────────────────────

/**
 * Get font pair based on business type
 */
function getFontPair(businessType: string): FontPair {
    const type = businessType.toLowerCase();

    if (['restaurante', 'bar', 'cafetería'].some(t => type.includes(t))) {
        return { heading: 'Playfair Display', body: 'Lato', accent: 'Georgia' };
    }
    if (['gimnasio', 'fitness', 'deportes'].some(t => type.includes(t))) {
        return { heading: 'Oswald', body: 'Open Sans', accent: 'Impact' };
    }
    if (['joyería', 'spa', 'boutique', 'moda'].some(t => type.includes(t))) {
        return { heading: 'Cormorant Garamond', body: 'Nunito', accent: 'Didot' };
    }
    if (['tecnología', 'startup', 'digital'].some(t => type.includes(t))) {
        return { heading: 'Space Grotesk', body: 'Inter', accent: 'Roboto Mono' };
    }
    if (['figuras', 'juguetes', 'surf', 'skate'].some(t => type.includes(t))) {
        return { heading: 'Bangers', body: 'Quicksand', accent: 'Comic Neue' };
    }

    // Default modern
    return { heading: 'Poppins', body: 'Inter', accent: 'Roboto' };
}

/**
 * Generate high-impact tagline based on business type
 */
function generateTagline(businessType: string): string {
    const taglines: Record<string, string[]> = {
        'restaurante': ['Sabores que cuentan historias', 'Tu mesa te espera', 'Donde cada plato es una experiencia'],
        'bar': ['Donde las noches cobran vida', 'El ritual perfecto te espera', 'Atmósfera, sabor, momento'],
        'cafetería': ['Cada taza, un momento único', 'Tu ritual diario, elevado', 'El aroma del buen día'],
        'peluquería': ['Tu mejor versión te espera', 'Expertos en hacer brillar', 'Estilo que habla por ti'],
        'gimnasio': ['Supera tus límites hoy', 'Tu transformación empieza aquí', 'Fuerza. Disciplina. Resultados.'],
        'figuras de acción': ['Figuras que cobran vida en tu estantería', 'Tu colección, tu universo', 'Cada figura cuenta una historia'],
        'escuela de surf': ['Tu aventura sobre las olas', 'Surfea. Vive. Sueña.', 'El mar te está esperando'],
        'taller mecánico': ['Expertos en darte potencia', 'Tu vehículo, nuestro compromiso', 'Precisión en cada reparación'],
        'floristería': ['Emociones hechas flores', 'El lenguaje más bello', 'Cada ramo cuenta tu historia'],
        'default': ['Experiencia que marca la diferencia', 'Tu destino favorito', 'Calidad que se siente']
    };

    const type = businessType.toLowerCase();
    const options = taglines[type] || taglines['default'];
    return options[Math.floor(Math.random() * options.length)];
}

// ─────────────────────────────────────────────────────────────
// MAIN BUILDER
// ─────────────────────────────────────────────────────────────

/**
 * Build a complete landing page from brand data
 * Implements all 4 Laws of Visual Composition
 */
export function buildVisualDNALanding(
    brandData: BrandData,
    links: any[] = [],
    landingUrl: string = 'https://land.fotofachada.com'
): GeneratedLanding {
    // Extract primary color from brand colors
    const primaryColor = brandData.colors?.primary || '#6366f1';

    // Generate Visual DNA
    const palette = generateVisualDNAPalette(primaryColor, 'modern');
    const backgroundKeywords = getBackgroundKeywords(brandData.businessType, brandData.name);
    const fontPair = getFontPair(brandData.businessType);
    const buttonStyle = generateButtonStyle(palette, brandData.businessType);
    // tagline is defined in optional interface, if missing generate it
    const tagline = (brandData as any).tagline || generateTagline(brandData.businessType);

    const dna: VisualDNA = {
        businessName: brandData.name,
        businessType: brandData.businessType,
        tagline,
        palette,
        buttonStyle,
        backgroundKeywords,
        fontPair
    };

    // Generate CSS (combining all laws)
    const cssVars = paletteToCSSVars(palette);
    const depthCSS = generateDepthCSS(backgroundKeywords, palette);
    const buttonCSS = generateButtonCSS(buttonStyle, palette);
    const hierarchyCSS = generateHierarchyCSS(dna);

    const fullCSS = `
:root {
    ${cssVars}
}

${depthCSS}
${buttonCSS}
${hierarchyCSS}
    `.trim();

    // Generate HTML
    const html = generateHierarchyHTML(dna, landingUrl, links);
    const finalHTML = html.replace('{{CSS_PLACEHOLDER}}', fullCSS);

    return {
        html: finalHTML,
        css: fullCSS,
        meta: {
            title: `${brandData.name} | ${brandData.businessType}`,
            description: tagline,
            keywords: backgroundKeywords
        }
    };
}

export type { VisualDNA, GeneratedLanding };
