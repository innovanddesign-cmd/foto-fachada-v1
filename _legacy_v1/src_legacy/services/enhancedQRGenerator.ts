/**
 * Enhanced QR Generator Service
 * ==============================
 * Generates premium styled QR codes with:
 * - Dots instead of squares
 * - Gradient colors matching brand
 * - Depth effect with drop-shadow
 * - Clear safety margin
 * - Dynamic icon bar with relief
 */

import QRCode from 'qrcode';
import { hexToRgb, type ColorPalette } from './colorScience';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface StyledQRConfig {
    url: string;
    size: number;
    palette: ColorPalette;
    style?: 'dots' | 'rounded' | 'classic';
    logoText?: string;
    withGradient?: boolean;
}

export interface IconBarConfig {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    appStore?: string;
    playStore?: string;
    website?: string;
}

export interface QRWithIconsResult {
    qrCanvas: HTMLCanvasElement;
    qrDataUrl: string;
}

// ─────────────────────────────────────────────────────────────
// STYLED QR GENERATOR (Dots + Gradient)
// ─────────────────────────────────────────────────────────────

/**
 * Generate a styled QR code with dots and gradient
 */
export async function generateStyledQR(config: StyledQRConfig): Promise<string> {
    const {
        url,
        size,
        palette,
        style = 'dots',
        logoText,
        withGradient = true
    } = config;

    // Generate base QR data
    const qrData = await QRCode.create(url, {
        errorCorrectionLevel: 'H' // High - allows logo overlay
    });

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const moduleCount = qrData.modules.size;
    const moduleSize = Math.floor(size / moduleCount);
    const actualSize = moduleSize * moduleCount;
    const margin = moduleSize * 2; // Safety margin

    canvas.width = actualSize + margin * 2;
    canvas.height = actualSize + margin * 2;

    // White background with safety margin
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create gradient for QR modules
    let fillStyle: string | CanvasGradient = palette.primary;

    if (withGradient) {
        const gradient = ctx.createLinearGradient(margin, margin, actualSize + margin, actualSize + margin);
        gradient.addColorStop(0, palette.primary);
        gradient.addColorStop(0.5, palette.primaryDark);
        gradient.addColorStop(1, palette.secondary);
        fillStyle = gradient;
    }

    // Draw QR modules
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (qrData.modules.get(row, col)) {
                const x = col * moduleSize + margin;
                const y = row * moduleSize + margin;

                ctx.fillStyle = fillStyle;

                switch (style) {
                    case 'dots':
                        // Circular dots
                        ctx.beginPath();
                        ctx.arc(
                            x + moduleSize / 2,
                            y + moduleSize / 2,
                            moduleSize / 2 * 0.85, // Slightly smaller for spacing
                            0,
                            Math.PI * 2
                        );
                        ctx.fill();
                        break;

                    case 'rounded':
                        // Rounded squares
                        const radius = moduleSize * 0.3;
                        ctx.beginPath();
                        ctx.roundRect(x + 1, y + 1, moduleSize - 2, moduleSize - 2, radius);
                        ctx.fill();
                        break;

                    case 'classic':
                    default:
                        // Standard squares
                        ctx.fillRect(x, y, moduleSize, moduleSize);
                        break;
                }
            }
        }
    }

    // Draw logo/initial in center
    if (logoText) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const logoSize = moduleSize * 5;

        // White circle background
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = palette.primary;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text
        ctx.fillStyle = palette.primary;
        ctx.font = `bold ${logoSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(logoText.charAt(0).toUpperCase(), centerX, centerY + 2);
    }

    return canvas.toDataURL('image/png');
}

// ─────────────────────────────────────────────────────────────
// DEPTH EFFECT CONTAINER
// ─────────────────────────────────────────────────────────────

/**
 * Apply depth effect to QR (for use in Canvas/PDF)
 * Returns CSS-like shadow values for use in PDF generation
 */
export function getQRDepthStyles(): {
    outerShadow: string;
    innerGlow: string;
    borderWidth: number;
    borderRadius: number;
} {
    return {
        outerShadow: `0 15px 35px rgba(0,0,0,0.3), 0 5px 15px rgba(0,0,0,0.2)`,
        innerGlow: `inset 0 1px 0 rgba(255,255,255,0.8)`,
        borderWidth: 8, // White border in mm for PDF
        borderRadius: 12 // Rounded corners in mm for PDF
    };
}

/**
 * Generate QR with depth container as canvas
 */
export async function generateQRWithDepth(
    config: StyledQRConfig,
    padding: number = 20
): Promise<HTMLCanvasElement> {
    const qrDataUrl = await generateStyledQR(config);

    // Load QR image
    const qrImg = new Image();
    await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrDataUrl;
    });

    // Create container canvas with depth effect
    const totalSize = config.size + padding * 2;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = totalSize + 40; // Extra space for shadow
    canvas.height = totalSize + 40;

    // Draw drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    // Outer container (brand color)
    const primaryRgb = hexToRgb(config.palette.primary);
    ctx.fillStyle = `rgb(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b})`;

    const containerX = 20;
    const containerY = 15;
    const borderRadius = 16;

    ctx.beginPath();
    ctx.roundRect(containerX, containerY, totalSize, totalSize, borderRadius);
    ctx.fill();

    // Reset shadow for inner elements
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Inner white container
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(
        containerX + padding / 2,
        containerY + padding / 2,
        totalSize - padding,
        totalSize - padding,
        borderRadius - 4
    );
    ctx.fill();

    // Draw QR
    ctx.drawImage(
        qrImg,
        containerX + padding,
        containerY + padding,
        config.size,
        config.size
    );

    return canvas;
}

// ─────────────────────────────────────────────────────────────
// DYNAMIC ICON BAR WITH RELIEF EFFECT
// ─────────────────────────────────────────────────────────────

/**
 * Generate icon bar with relief/embossed effect
 */
export function generateIconBar(
    ctx: CanvasRenderingContext2D,
    icons: IconBarConfig,
    x: number,
    y: number,
    iconSize: number,
    palette: ColorPalette
): number {
    const availableIcons: { key: keyof IconBarConfig; draw: () => void }[] = [];
    const gap = iconSize * 1.5;

    // Collect available icons
    const iconKeys: (keyof IconBarConfig)[] = ['instagram', 'facebook', 'whatsapp', 'appStore', 'playStore', 'website'];

    iconKeys.forEach(key => {
        if (icons[key]) {
            availableIcons.push({ key, draw: () => { } });
        }
    });

    if (availableIcons.length === 0) return 0;

    const totalWidth = availableIcons.length * iconSize + (availableIcons.length - 1) * (gap - iconSize);
    let currentX = x - totalWidth / 2;

    const primaryRgb = hexToRgb(palette.primary);

    availableIcons.forEach(({ key }) => {
        // Relief effect background
        ctx.save();

        // Outer shadow (depth)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;

        // Icon container
        ctx.fillStyle = `rgb(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b})`;
        ctx.beginPath();
        ctx.roundRect(currentX, y, iconSize, iconSize, iconSize * 0.25);
        ctx.fill();

        ctx.restore();

        // Inner highlight (top)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(currentX + 2, y + 2, iconSize - 4, iconSize / 2 - 2, [iconSize * 0.2, iconSize * 0.2, 0, 0]);
        ctx.fill();

        // Draw icon symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${iconSize * 0.5}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const iconSymbols: Record<keyof IconBarConfig, string> = {
            instagram: '📷',
            facebook: 'f',
            whatsapp: '📱',
            appStore: '🍎',
            playStore: '▶',
            website: '🌐'
        };

        ctx.fillText(iconSymbols[key], currentX + iconSize / 2, y + iconSize / 2);

        currentX += gap;
    });

    return totalWidth;
}

/**
 * Generate icon bar as standalone canvas
 */
export function createIconBarCanvas(
    icons: IconBarConfig,
    iconSize: number,
    palette: ColorPalette
): HTMLCanvasElement {
    const iconCount = Object.values(icons).filter(Boolean).length;
    if (iconCount === 0) {
        const empty = document.createElement('canvas');
        empty.width = 1;
        empty.height = 1;
        return empty;
    }

    const gap = iconSize * 1.5;
    const totalWidth = iconCount * gap + 40;
    const height = iconSize + 30;

    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = height;

    const ctx = canvas.getContext('2d')!;

    // Transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    generateIconBar(ctx, icons, totalWidth / 2, 10, iconSize, palette);

    return canvas;
}

// ─────────────────────────────────────────────────────────────
// COMPLETE QR BLOCK GENERATOR (QR + Icons)
// ─────────────────────────────────────────────────────────────

export interface CompleteQRBlockConfig {
    url: string;
    size: number;
    palette: ColorPalette;
    logoText?: string;
    icons?: IconBarConfig;
    instructionText?: string;
}

/**
 * Generate complete QR block with styled QR, depth effect, and icon bar
 */
export async function generateCompleteQRBlock(config: CompleteQRBlockConfig): Promise<HTMLCanvasElement> {
    const {
        url,
        size,
        palette,
        logoText,
        icons,
        instructionText = '📱 Escanea con tu móvil'
    } = config;

    // Generate QR with depth
    const qrCanvas = await generateQRWithDepth({
        url,
        size,
        palette,
        style: 'dots',
        logoText,
        withGradient: true
    }, 15);

    // Calculate total height
    const iconBarHeight = icons && Object.values(icons).filter(Boolean).length > 0 ? 60 : 0;
    const instructionHeight = 30;
    const totalHeight = qrCanvas.height + instructionHeight + iconBarHeight;

    // Create final canvas
    const canvas = document.createElement('canvas');
    canvas.width = qrCanvas.width;
    canvas.height = totalHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw QR
    ctx.drawImage(qrCanvas, 0, 0);

    // Draw instruction text
    ctx.fillStyle = hexToRgb(palette.text).r > 128 ? '#ffffff' : '#333333';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(instructionText, canvas.width / 2, qrCanvas.height + 20);

    // Draw icon bar if present
    if (icons && Object.values(icons).filter(Boolean).length > 0) {
        generateIconBar(
            ctx,
            icons,
            canvas.width / 2,
            qrCanvas.height + instructionHeight + 5,
            35,
            palette
        );
    }

    return canvas;
}

/**
 * Get QR block as data URL
 */
export async function getCompleteQRBlockDataUrl(config: CompleteQRBlockConfig): Promise<string> {
    const canvas = await generateCompleteQRBlock(config);
    return canvas.toDataURL('image/png');
}
