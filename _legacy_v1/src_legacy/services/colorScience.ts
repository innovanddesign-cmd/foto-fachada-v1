/**
 * Color Science Service
 * ======================
 * Advanced color algorithms for automatic palette generation
 * Implements: HSL manipulation, contrast calculation, complementary generation
 */

// ─────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface HSL {
    h: number;
    s: number;
    l: number;
}

export interface ColorPalette {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    textOnPrimary: string;
    border: string;
    shadow: string;
    gradient: {
        start: string;
        mid: string;
        end: string;
    };
    overlay: string;
}

// ─────────────────────────────────────────────────────────────
// HEX <-> RGB <-> HSL CONVERSIONS
// ─────────────────────────────────────────────────────────────

export function hexToRgb(hex: string): RGB {
    const clean = hex.replace('#', '');
    return {
        r: parseInt(clean.substring(0, 2), 16) || 0,
        g: parseInt(clean.substring(2, 4), 16) || 0,
        b: parseInt(clean.substring(4, 6), 16) || 0
    };
}

export function rgbToHex(rgb: RGB): string {
    const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function rgbToHsl(rgb: RGB): HSL {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb(hsl: HSL): RGB {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    if (s === 0) {
        const v = Math.round(l * 255);
        return { r: v, g: v, b: v };
    }

    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
        r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
    };
}

export function hexToHsl(hex: string): HSL {
    return rgbToHsl(hexToRgb(hex));
}

export function hslToHex(hsl: HSL): string {
    return rgbToHex(hslToRgb(hsl));
}

// ─────────────────────────────────────────────────────────────
// CONTRAST & LUMINANCE
// ─────────────────────────────────────────────────────────────

export function getLuminance(rgb: RGB): number {
    const sRGB = [rgb.r, rgb.g, rgb.b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

export function getContrastRatio(color1: string, color2: string): number {
    const l1 = getLuminance(hexToRgb(color1));
    const l2 = getLuminance(hexToRgb(color2));
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

export function isLightColor(hex: string): boolean {
    return getLuminance(hexToRgb(hex)) > 0.5;
}

export function getReadableTextColor(background: string): string {
    return isLightColor(background) ? '#1a1a2e' : '#ffffff';
}

// ─────────────────────────────────────────────────────────────
// COLOR MANIPULATION
// ─────────────────────────────────────────────────────────────

export function darken(hex: string, amount: number): string {
    const hsl = hexToHsl(hex);
    hsl.l = Math.max(0, hsl.l - amount);
    return hslToHex(hsl);
}

export function lighten(hex: string, amount: number): string {
    const hsl = hexToHsl(hex);
    hsl.l = Math.min(100, hsl.l + amount);
    return hslToHex(hsl);
}

export function saturate(hex: string, amount: number): string {
    const hsl = hexToHsl(hex);
    hsl.s = Math.min(100, hsl.s + amount);
    return hslToHex(hsl);
}

export function desaturate(hex: string, amount: number): string {
    const hsl = hexToHsl(hex);
    hsl.s = Math.max(0, hsl.s - amount);
    return hslToHex(hsl);
}

export function adjustHue(hex: string, degrees: number): string {
    const hsl = hexToHsl(hex);
    hsl.h = (hsl.h + degrees + 360) % 360;
    return hslToHex(hsl);
}

export function mix(color1: string, color2: string, weight = 0.5): string {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    return rgbToHex({
        r: Math.round(rgb1.r * weight + rgb2.r * (1 - weight)),
        g: Math.round(rgb1.g * weight + rgb2.g * (1 - weight)),
        b: Math.round(rgb1.b * weight + rgb2.b * (1 - weight))
    });
}

// ─────────────────────────────────────────────────────────────
// PALETTE GENERATION ALGORITHMS
// ─────────────────────────────────────────────────────────────

/**
 * Generate complementary color (opposite on wheel)
 */
export function getComplementary(hex: string): string {
    return adjustHue(hex, 180);
}

/**
 * Generate analogous colors (adjacent on wheel)
 */
export function getAnalogous(hex: string): [string, string, string] {
    return [
        adjustHue(hex, -30),
        hex,
        adjustHue(hex, 30)
    ];
}

/**
 * Generate triadic colors (120° apart)
 */
export function getTriadic(hex: string): [string, string, string] {
    return [
        hex,
        adjustHue(hex, 120),
        adjustHue(hex, 240)
    ];
}

/**
 * Generate split-complementary colors
 */
export function getSplitComplementary(hex: string): [string, string, string] {
    return [
        hex,
        adjustHue(hex, 150),
        adjustHue(hex, 210)
    ];
}

// ─────────────────────────────────────────────────────────────
// FULL PALETTE GENERATOR (LEY DE COHERENCIA CROMÁTICA)
// ─────────────────────────────────────────────────────────────

/**
 * Generate a complete, harmonious color palette from a primary color
 * Follows the "Ley de Coherencia Cromática" for optimal contrast
 */
export function generateVisualDNAPalette(primaryHex: string, businessStyle: 'modern' | 'classic' | 'bold' | 'minimal' = 'modern'): ColorPalette {
    const primary = primaryHex;
    // const hsl = hexToHsl(primary);
    const isLight = isLightColor(primary);

    // Style-based adjustments
    const styleConfig = {
        modern: { satAdjust: 0, lightAdjust: 0, contrast: 'balanced' },
        classic: { satAdjust: -10, lightAdjust: 5, contrast: 'soft' },
        bold: { satAdjust: 15, lightAdjust: -5, contrast: 'high' },
        minimal: { satAdjust: -20, lightAdjust: 10, contrast: 'low' }
    };
    const style = styleConfig[businessStyle];

    // Generate primary variants
    const primaryDark = darken(saturate(primary, style.satAdjust), 15);
    const primaryLight = lighten(desaturate(primary, 10), 20);

    // Complementary accent
    const accent = saturate(adjustHue(primary, 180), 10);

    // Secondary color (split-complementary)
    const secondary = adjustHue(primary, 150);

    // Background and surface colors
    let background: string;
    let surface: string;
    let text: string;
    let textSecondary: string;

    if (isLight) {
        // Light primary -> dark backgrounds
        background = darken(desaturate(primary, 60), 70);
        surface = darken(desaturate(primary, 50), 60);
        text = '#ffffff';
        textSecondary = 'rgba(255,255,255,0.7)';
    } else {
        // Dark primary -> can use dark backgrounds with the primary as accent
        background = darken(desaturate(primary, 70), 45);
        surface = darken(desaturate(primary, 60), 35);
        text = '#ffffff';
        textSecondary = 'rgba(255,255,255,0.7)';
    }

    // Text on primary
    const textOnPrimary = getReadableTextColor(primary);

    // Border and shadow
    const border = mix(primary, surface, 0.3);
    const shadow = darken(background, 15);

    // Gradient (based on primary)
    const gradient = {
        start: primary,
        mid: adjustHue(primary, 30),
        end: adjustHue(primary, 60)
    };

    // Overlay color for depth effect
    const overlay = isLight
        ? 'rgba(0,0,0,0.6)'
        : `rgba(${hexToRgb(background).r},${hexToRgb(background).g},${hexToRgb(background).b},0.7)`;

    return {
        primary,
        primaryDark,
        primaryLight,
        secondary,
        accent,
        background,
        surface,
        text,
        textSecondary,
        textOnPrimary,
        border,
        shadow,
        gradient,
        overlay
    };
}

/**
 * Generate CSS variables from palette
 */
export function paletteToCSSVars(palette: ColorPalette): string {
    return `
    --color-primary: ${palette.primary};
    --color-primary-dark: ${palette.primaryDark};
    --color-primary-light: ${palette.primaryLight};
    --color-secondary: ${palette.secondary};
    --color-accent: ${palette.accent};
    --color-background: ${palette.background};
    --color-surface: ${palette.surface};
    --color-text: ${palette.text};
    --color-text-secondary: ${palette.textSecondary};
    --color-text-on-primary: ${palette.textOnPrimary};
    --color-border: ${palette.border};
    --color-shadow: ${palette.shadow};
    --gradient-start: ${palette.gradient.start};
    --gradient-mid: ${palette.gradient.mid};
    --gradient-end: ${palette.gradient.end};
    --color-overlay: ${palette.overlay};
    `.trim();
}
