/**
 * Color Science Service (Backend Port)
 * =====================================
 * Advanced color algorithms for automatic palette generation
 * Ported from src/services/colorScience.ts for strict consistency
 */

// ─────────────────────────────────────────────────────────────
// HEX <-> RGB <-> HSL CONVERSIONS
// ─────────────────────────────────────────────────────────────

export function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    return {
        r: parseInt(clean.substring(0, 2), 16) || 0,
        g: parseInt(clean.substring(2, 4), 16) || 0,
        b: parseInt(clean.substring(4, 6), 16) || 0
    };
}

export function rgbToHex(rgb) {
    const toHex = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function rgbToHsl(rgb) {
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

export function hslToRgb(hsl) {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    if (s === 0) {
        const v = Math.round(l * 255);
        return { r: v, g: v, b: v };
    }

    const hue2rgb = (p, q, t) => {
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

export function hexToHsl(hex) {
    return rgbToHsl(hexToRgb(hex));
}

export function hslToHex(hsl) {
    return rgbToHex(hslToRgb(hsl));
}

// ─────────────────────────────────────────────────────────────
// CONTRAST & LUMINANCE
// ─────────────────────────────────────────────────────────────

export function getLuminance(rgb) {
    const sRGB = [rgb.r, rgb.g, rgb.b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

export function isLightColor(hex) {
    return getLuminance(hexToRgb(hex)) > 0.5;
}

export function getReadableTextColor(background) {
    return isLightColor(background) ? '#1a1a2e' : '#ffffff';
}

// ─────────────────────────────────────────────────────────────
// COLOR MANIPULATION
// ─────────────────────────────────────────────────────────────

export function darken(hex, amount) {
    const hsl = hexToHsl(hex);
    hsl.l = Math.max(0, hsl.l - amount);
    return hslToHex(hsl);
}

export function lighten(hex, amount) {
    const hsl = hexToHsl(hex);
    hsl.l = Math.min(100, hsl.l + amount);
    return hslToHex(hsl);
}

export function saturate(hex, amount) {
    const hsl = hexToHsl(hex);
    hsl.s = Math.min(100, hsl.s + amount);
    return hslToHex(hsl);
}

export function desaturate(hex, amount) {
    const hsl = hexToHsl(hex);
    hsl.s = Math.max(0, hsl.s - amount);
    return hslToHex(hsl);
}

export function adjustHue(hex, degrees) {
    const hsl = hexToHsl(hex);
    hsl.h = (hsl.h + degrees + 360) % 360;
    return hslToHex(hsl);
}

export function mix(color1, color2, weight = 0.5) {
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
 * Generate a complete, harmonious color palette from a primary color
 * Follows the "Ley de Coherencia Cromática" for optimal contrast
 */
export function generateVisualDNAPalette(primaryHex, businessStyle = 'modern') {
    const primary = primaryHex;
    const isLight = isLightColor(primary);

    // Style-based adjustments
    const styleConfig = {
        modern: { satAdjust: 0, lightAdjust: 0 },
        classic: { satAdjust: -10, lightAdjust: 5 },
        bold: { satAdjust: 15, lightAdjust: -5 },
        minimal: { satAdjust: -20, lightAdjust: 10 }
    };
    const style = styleConfig[businessStyle] || styleConfig.modern;

    // Generate primary variants
    const primaryDark = darken(saturate(primary, style.satAdjust), 15);
    const primaryLight = lighten(desaturate(primary, 10), 20);

    // Complementary accent
    const accent = saturate(adjustHue(primary, 180), 10);

    // Secondary color (split-complementary)
    const secondary = adjustHue(primary, 150);

    // Background and surface colors
    let background;
    let surface;
    let text;
    let textSecondary;
    let textOnPrimary;

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
    textOnPrimary = getReadableTextColor(primary);

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
