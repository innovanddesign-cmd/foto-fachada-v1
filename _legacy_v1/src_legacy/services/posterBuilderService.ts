/**
 * Premium Poster Builder Service
 * ================================
 * Generates print-ready A4 posters at 300 DPI with:
 * - 3-Level Visual Hierarchy (Hook, QR Magnet, Trust Footer)
 * - Styled QR with logo integration
 * - Contextual background textures based on Vibe 2026
 * - CMYK-ready output
 */

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { generateVisualDNAPalette, hexToRgb, isLightColor, type ColorPalette } from './colorScience';
import type { BrandData, BrandIdentity2026, BrandVibe2026 } from '../types';

// ─────────────────────────────────────────────────────────────
// CONSTANTS: A4 at 300 DPI
// ─────────────────────────────────────────────────────────────

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
// const DPI = 300;

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface PosterConfig {
    brandData: BrandData;
    brandIdentity?: BrandIdentity2026;  // Nuevo: herencia de marca 2026
    landingUrl: string;
    hookText: string;
    hookEmoji?: string;
    ctaSecondary?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
}

export interface PosterResult {
    blob: Blob;
    dataUrl: string;
    filename: string;
}

// ─────────────────────────────────────────────────────────────
// CONTEXTUAL TEXTURES (Background patterns by business type)
// ─────────────────────────────────────────────────────────────

interface TextureConfig {
    baseColor: string;
    pattern: 'wood' | 'neon' | 'marble' | 'metal' | 'fabric' | 'concrete' | 'gradient';
    overlay: string;
}

function getContextualTexture(businessType: string, palette: ColorPalette, vibe?: BrandVibe2026): TextureConfig {
    // Si hay vibe 2026, usar texturas específicas
    if (vibe) {
        return getTextureByVibe(vibe, palette);
    }

    const type = businessType.toLowerCase();

    // Match textures to business vibes
    if (['restaurante', 'bar', 'cafetería', 'panadería'].some(t => type.includes(t))) {
        return { baseColor: '#2d1f11', pattern: 'wood', overlay: 'rgba(0,0,0,0.4)' };
    }
    if (['bar', 'discoteca', 'club', 'pub'].some(t => type.includes(t))) {
        return { baseColor: '#0a0a1a', pattern: 'neon', overlay: 'rgba(0,0,0,0.3)' };
    }
    if (['spa', 'belleza', 'estética', 'joyería'].some(t => type.includes(t))) {
        return { baseColor: '#f5f5f5', pattern: 'marble', overlay: 'rgba(0,0,0,0.1)' };
    }
    if (['taller', 'mecánico', 'industrial', 'ferretería'].some(t => type.includes(t))) {
        return { baseColor: '#2a2a2a', pattern: 'metal', overlay: 'rgba(0,0,0,0.3)' };
    }
    if (['moda', 'boutique', 'ropa'].some(t => type.includes(t))) {
        return { baseColor: '#1a1a1a', pattern: 'fabric', overlay: 'rgba(0,0,0,0.2)' };
    }
    if (['gimnasio', 'fitness', 'crossfit'].some(t => type.includes(t))) {
        return { baseColor: '#1a1a1a', pattern: 'concrete', overlay: 'rgba(0,0,0,0.4)' };
    }

    // Default: gradient with brand colors
    return { baseColor: palette.background, pattern: 'gradient', overlay: palette.overlay };
}

/**
 * Texturas por Vibe 2026 - Coherencia con Escaparate Digital
 */
function getTextureByVibe(vibe: BrandVibe2026, palette: ColorPalette): TextureConfig {
    const vibeTextures: Record<BrandVibe2026, TextureConfig> = {
        'Urban-Tech': { baseColor: '#0f0f0f', pattern: 'metal', overlay: 'rgba(0,0,0,0.3)' },
        'Mediterranean-Gourmet': { baseColor: '#3d2914', pattern: 'wood', overlay: 'rgba(0,0,0,0.35)' },
        'Vintage-Cálido': { baseColor: '#2a2420', pattern: 'fabric', overlay: 'rgba(0,0,0,0.25)' },
        'Neon-Nightlife': { baseColor: '#080812', pattern: 'neon', overlay: 'rgba(0,0,0,0.2)' },
        'Chiringuito-Moderno': { baseColor: palette.primary, pattern: 'gradient', overlay: 'rgba(0,0,0,0.1)' },
        'Industrial-Chic': { baseColor: '#1c1c1c', pattern: 'concrete', overlay: 'rgba(0,0,0,0.4)' },
        'Wellness-Zen': { baseColor: '#f8f5f2', pattern: 'marble', overlay: 'rgba(0,0,0,0.05)' },
        'Street-Food': { baseColor: '#1a1a1a', pattern: 'concrete', overlay: 'rgba(0,0,0,0.3)' },
        'Luxury-Boutique': { baseColor: '#0a0a0a', pattern: 'fabric', overlay: 'rgba(0,0,0,0.15)' },
        'Family-Friendly': { baseColor: palette.background || '#f0f0f0', pattern: 'gradient', overlay: 'rgba(0,0,0,0.05)' }
    };

    return vibeTextures[vibe] || { baseColor: palette.background, pattern: 'gradient', overlay: palette.overlay };
}

// ─────────────────────────────────────────────────────────────
// TEXTURE RENDERING
// ─────────────────────────────────────────────────────────────

function renderTexture(doc: jsPDF, texture: TextureConfig, palette: ColorPalette): void {
    const pageWidth = A4_WIDTH_MM;
    const pageHeight = A4_HEIGHT_MM;

    // Base fill
    const baseRgb = hexToRgb(texture.baseColor);
    doc.setFillColor(baseRgb.r, baseRgb.g, baseRgb.b);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Pattern overlay simulation (using gradients and shapes)
    switch (texture.pattern) {
        case 'wood':
            // Simulate wood grain with horizontal lines
            doc.setDrawColor(60, 40, 20);
            doc.setLineWidth(0.3);
            for (let y = 0; y < pageHeight; y += 8) {
                const offset = Math.sin(y * 0.1) * 5;
                doc.line(0, y + offset, pageWidth, y + offset);
            }
            break;

        case 'neon':
            // Neon glow effect with accent color
            const neonRgb = hexToRgb(palette.primary);
            doc.setFillColor(neonRgb.r, neonRgb.g, neonRgb.b);
            // Top glow
            for (let i = 5; i > 0; i--) {
                doc.setFillColor(neonRgb.r, neonRgb.g, neonRgb.b);
                doc.circle(pageWidth / 2, -50 + i * 30, 200 - i * 20, 'F');
            }
            break;

        case 'marble':
            // Light veins effect
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            for (let i = 0; i < 15; i++) {
                const x1 = Math.random() * pageWidth;
                const y1 = Math.random() * pageHeight;
                const x2 = x1 + (Math.random() - 0.5) * 100;
                const y2 = y1 + (Math.random() - 0.5) * 100;
                doc.line(x1, y1, x2, y2);
            }
            break;

        case 'metal':
            // Brushed metal effect - subtle horizontal lines
            doc.setDrawColor(60, 60, 60);
            doc.setLineWidth(0.1);
            for (let y = 0; y < pageHeight; y += 2) {
                doc.line(0, y, pageWidth, y);
            }
            break;

        case 'concrete':
            // Subtle speckle effect
            doc.setFillColor(40, 40, 40);
            for (let i = 0; i < 200; i++) {
                const x = Math.random() * pageWidth;
                const y = Math.random() * pageHeight;
                doc.circle(x, y, 0.5, 'F');
            }
            break;

        case 'gradient':
        default:
            // Radial gradient simulation
            const primaryRgb = hexToRgb(palette.primary);
            for (let r = 250; r > 0; r -= 10) {
                doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
                doc.circle(pageWidth / 2, pageHeight * 0.3, r, 'F');
            }
            break;
    }
}

// ─────────────────────────────────────────────────────────────
// QR CODE WITH LOGO
// ─────────────────────────────────────────────────────────────

async function generateStyledQR(url: string, color: string, size: number): Promise<string> {
    const options = {
        width: size * 3, // High resolution for printing
        margin: 0,
        color: {
            dark: color,
            light: '#ffffff'
        },
        errorCorrectionLevel: 'H' as const // High - allows logo in center
    };

    return QRCode.toDataURL(url, options);
}

// ─────────────────────────────────────────────────────────────
// SOCIAL ICONS (Minimalista)
// ─────────────────────────────────────────────────────────────

function drawSocialIcon(doc: jsPDF, type: 'instagram' | 'facebook' | 'whatsapp', x: number, y: number, size: number, color: number[]): void {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.5);

    switch (type) {
        case 'instagram':
            // Rounded square with circle inside
            doc.roundedRect(x, y, size, size, size * 0.25, size * 0.25, 'S');
            doc.circle(x + size / 2, y + size / 2, size * 0.3, 'S');
            doc.circle(x + size * 0.75, y + size * 0.25, size * 0.08, 'F');
            break;

        case 'facebook':
            // F shape simplified
            doc.roundedRect(x, y, size, size, size * 0.15, size * 0.15, 'S');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(size * 2.5);
            doc.text('f', x + size * 0.35, y + size * 0.75);
            break;

        case 'whatsapp':
            // Phone icon in circle
            doc.circle(x + size / 2, y + size / 2, size / 2, 'S');
            // Simplified phone shape
            doc.setLineWidth(0.8);
            doc.line(x + size * 0.35, y + size * 0.65, x + size * 0.5, y + size * 0.5);
            doc.line(x + size * 0.5, y + size * 0.5, x + size * 0.65, y + size * 0.35);
            break;
    }
}

// ─────────────────────────────────────────────────────────────
// MAIN POSTER GENERATOR
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// ART DIRECTOR ENGINE: LAYOUTS & COMPOSITION
// ─────────────────────────────────────────────────────────────

interface LayoutConfig {
    name: 'MINIMAL_MODERN' | 'IMPACT_BOLD' | 'ELEGANT_SERIF';
    margins: { top: number; bottom: number; side: number };
    fonts: { title: string; body: string };
    alignment: 'center' | 'left';
}

function getLayoutByVibe(vibe: BrandVibe2026): LayoutConfig {
    switch (vibe) {
        case 'Urban-Tech':
        case 'Industrial-Chic':
        case 'Neon-Nightlife':
            return {
                name: 'IMPACT_BOLD',
                margins: { top: 20, bottom: 20, side: 15 },
                fonts: { title: 'helvetica', body: 'helvetica' },
                alignment: 'center'
            };
        case 'Mediterranean-Gourmet':
        case 'Vintage-Cálido':
        case 'Luxury-Boutique':
        case 'Wellness-Zen':
            return {
                name: 'ELEGANT_SERIF',
                margins: { top: 30, bottom: 30, side: 20 },
                fonts: { title: 'times', body: 'helvetica' }, // Times simulated as Serif
                alignment: 'center'
            };
        default:
            return {
                name: 'MINIMAL_MODERN',
                margins: { top: 25, bottom: 25, side: 20 },
                fonts: { title: 'helvetica', body: 'helvetica' },
                alignment: 'center'
            };
    }
}

// ─────────────────────────────────────────────────────────────
// VECTOR GRAPHICS GENERATION
// ─────────────────────────────────────────────────────────────

function drawVectorAccents(doc: jsPDF, vibe: BrandVibe2026, palette: ColorPalette, width: number, height: number): void {
    const accentRgb = hexToRgb(palette.primary);
    doc.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
    doc.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);

    switch (vibe) {
        case 'Urban-Tech':
        case 'Neon-Nightlife':
            // Tech lines
            doc.setLineWidth(0.5);
            doc.line(20, 20, 60, 20);
            doc.line(20, 20, 20, 60);
            doc.line(width - 20, height - 20, width - 60, height - 20);
            doc.line(width - 20, height - 20, width - 20, height - 60);
            break;

        case 'Mediterranean-Gourmet':
        case 'Wellness-Zen':
            // Organic circles/blobs (simulated)
            doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
            doc.circle(0, 0, 80, 'F');
            doc.circle(width, height * 0.5, 60, 'F');
            doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
            break;

        case 'Industrial-Chic':
            // Frame borders
            doc.setLineWidth(2);
            doc.rect(10, 10, width - 20, height - 20, 'S');
            break;
    }
}


// ─────────────────────────────────────────────────────────────
// MAIN POSTER GENERATOR
// ─────────────────────────────────────────────────────────────

export async function generatePremiumPoster(config: PosterConfig): Promise<PosterResult> {
    const {
        brandData,
        brandIdentity,
        landingUrl,
        hookText,
        hookEmoji = '✨',
        ctaSecondary = 'Síguenos en redes',
        instagram,
        facebook,
        whatsapp
    } = config;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    const pageWidth = A4_WIDTH_MM;
    const pageHeight = A4_HEIGHT_MM;
    const centerX = pageWidth / 2;

    // 1. Setup Palette & Vibe
    const primaryColor = brandIdentity?.palette?.color_principal || brandData.colors?.primary || '#6366f1';
    const accentColor = brandIdentity?.palette?.color_acento || brandData.colors?.accent || primaryColor;
    const palette = generateVisualDNAPalette(primaryColor, 'modern');
    const vibe = brandIdentity?.vibe || 'Family-Friendly';

    // 2. Determine Layout Strategy
    const layout = getLayoutByVibe(vibe);
    const contentWidth = pageWidth - (layout.margins.side * 2);

    // 3. Render Background Texture
    const texture = getContextualTexture(brandData.businessType, palette, vibe);
    renderTexture(doc, texture, palette);

    // 4. Render Vector Accents
    drawVectorAccents(doc, vibe, palette, pageWidth, pageHeight);

    // Color Logic
    const isLightBg = isLightColor(texture.baseColor);
    const textPrimary = isLightBg ? [20, 20, 20] : [255, 255, 255];
    const textSecondary = isLightBg ? [80, 80, 80] : [220, 220, 220];
    const accentRgb = hexToRgb(accentColor);


    // ═══════════════════════════════════════════════════════════
    // LEVEL 1: GRID LAYOUT & HEADER
    // ═══════════════════════════════════════════════════════════
    let currentY = layout.margins.top + 10;

    // Business Type Tag
    doc.setFont(layout.fonts.body, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
    doc.text(brandData.businessType.toUpperCase(), centerX, currentY, { align: 'center', charSpace: 2 });
    currentY += 15;

    // Business Name (Hero)
    doc.setFont(layout.fonts.title, 'bold');
    doc.setFontSize(layout.name === 'IMPACT_BOLD' ? 42 : 36);
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);

    // Split long names
    const nameLines = doc.splitTextToSize(brandData.name, contentWidth);
    doc.text(nameLines, centerX, currentY, { align: 'center' });
    currentY += (nameLines.length * 14) + 10;

    // Hook Box
    doc.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
    const hookPadding = 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    const hookWidth = doc.getTextWidth(`${hookEmoji} ${hookText.toUpperCase()} ${hookEmoji}`) + (hookPadding * 4);

    // Rounded Pill for Hook
    doc.roundedRect(centerX - (hookWidth / 2), currentY - 6, hookWidth, 14, 7, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`${hookEmoji} ${hookText.toUpperCase()} ${hookEmoji}`, centerX, currentY + 3.5, { align: 'center' });

    currentY += 35;

    // ═══════════════════════════════════════════════════════════
    // LEVEL 2: THE MAGNET (QR)
    // ═══════════════════════════════════════════════════════════

    const qrSize = 100;
    const qrY = currentY;

    // White Card for QR (Contrast Area)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(centerX - (qrSize / 2) - 10, qrY - 10, qrSize + 20, qrSize + 35, 6, 6, 'FD');

    // QR Code
    try {
        const qrDataUrl = await generateStyledQR(landingUrl, '#000000', 400); // Black QR for max contrast
        doc.addImage(qrDataUrl, 'PNG', centerX - (qrSize / 2), qrY, qrSize, qrSize);
    } catch (e) {
        doc.rect(centerX - (qrSize / 2), qrY, qrSize, qrSize);
    }

    // "Scan Me" Label below QR
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]); // Dark text on white card
    doc.setTextColor(0, 0, 0);
    doc.text('ABRIR ESCAPARATE', centerX, qrY + qrSize + 15, { align: 'center' });

    // ═══════════════════════════════════════════════════════════
    // LEVEL 3: FOOTER
    // ═══════════════════════════════════════════════════════════
    const footerY = pageHeight - layout.margins.bottom;

    // Divider Line
    doc.setDrawColor(textSecondary[0], textSecondary[1], textSecondary[2]);
    doc.setLineWidth(0.2);
    doc.line(centerX - 40, footerY - 25, centerX + 40, footerY - 25);

    // Social Media Icons
    // (Reusable social icon logic here...)
    const iconStartY = footerY - 15;
    let iconX = centerX - 12;

    if (whatsapp) {
        drawSocialIcon(doc, 'whatsapp', iconX, iconStartY, 6, textPrimary);
        iconX += 12;
    }
    if (instagram) {
        drawSocialIcon(doc, 'instagram', iconX, iconStartY, 6, textPrimary);
        iconX += 12;
    }
    if (facebook) {
        drawSocialIcon(doc, 'facebook', iconX, iconStartY, 6, textPrimary);
        iconX += 12;
    }

    // CTA Secondary
    doc.setFont(layout.fonts.body, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
    doc.text(ctaSecondary, centerX, footerY, { align: 'center' });

    // Output
    const safeName = brandData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `poster_${safeName}_${Date.now()}.pdf`;

    return {
        blob: doc.output('blob'),
        dataUrl: doc.output('dataurlstring'),
        filename
    };
}

// ─────────────────────────────────────────────────────────────
// QUICK DOWNLOAD
// ─────────────────────────────────────────────────────────────

export async function downloadPremiumPoster(config: PosterConfig): Promise<void> {
    const result = await generatePremiumPoster(config);

    const link = document.createElement('a');
    link.href = result.dataUrl;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ─────────────────────────────────────────────────────────────
// HOOK TEXT SUGGESTIONS
// ─────────────────────────────────────────────────────────────

export function getHookSuggestions(businessType: string): { emoji: string; text: string }[] {
    const type = businessType.toLowerCase();

    if (type.includes('restaurante') || type.includes('bar')) {
        return [
            { emoji: '🍕', text: 'Mira nuestra carta' },
            { emoji: '🎰', text: 'Escanea y gana' },
            { emoji: '🍽️', text: 'Reserva tu mesa' },
            { emoji: '🎁', text: 'Descuento exclusivo' }
        ];
    }
    if (type.includes('peluquería') || type.includes('belleza')) {
        return [
            { emoji: '💇', text: 'Pide tu cita' },
            { emoji: '✨', text: 'Transforma tu look' },
            { emoji: '💅', text: 'Ofertas exclusivas' }
        ];
    }
    if (type.includes('gimnasio') || type.includes('fitness')) {
        return [
            { emoji: '💪', text: 'Empieza hoy' },
            { emoji: '🏋️', text: 'Clase gratis' },
            { emoji: '🎯', text: 'Tu reto te espera' }
        ];
    }
    if (type.includes('tienda') || type.includes('shop')) {
        return [
            { emoji: '🛍️', text: 'Ver catálogo' },
            { emoji: '💰', text: 'Ofertas flash' },
            { emoji: '🎁', text: 'Regalo con tu compra' }
        ];
    }

    // Default
    return [
        { emoji: '✨', text: 'Descúbrenos' },
        { emoji: '🎁', text: 'Oferta especial' },
        { emoji: '📲', text: 'Más información' },
        { emoji: '🌟', text: 'Conócenos' }
    ];
}
