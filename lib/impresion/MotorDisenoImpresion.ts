/**
 * MotorDisenoImpresion.ts
 * Lógica de cálculos y procesamiento para cartelería física.
 * Basado en estándares de impresión A4 (210mm x 297mm).
 */

export const DIMENSIONES_A4 = {
    ANCHO_MM: 210,
    ALTO_MM: 297,
    MARGEN_SEGURIDAD_MM: 10,
    DPI_PREVIEW: 96,
    DPI_EXPORT: 300,
};

export const DIMENSIONES_A5 = {
    ANCHO_MM: 148,
    ALTO_MM: 210,
    MARGEN_SEGURIDAD_MM: 8,
};

export const DIMENSIONES_SQUARE = {
    ANCHO_MM: 210,
    ALTO_MM: 210,
    MARGEN_SEGURIDAD_MM: 12,
};

/**
 * Convierte milímetros a píxeles según el DPI.
 */
export const mmAPx = (mm: number, dpi: number = DIMENSIONES_A4.DPI_PREVIEW) => {
    return Math.floor((mm * dpi) / 25.4);
};

export interface ConfigLayoutPoster {
    anchoPx: number;
    altoPx: number;
    margenPx: number;
    colorPrimario: string;
    escala: number;
}

/**
 * Genera la configuración de layout según el factor de escala de la UI y formato.
 */
export const obtenerConfigLayout = (formato: 'A4' | 'A5' | 'SQUARE' = 'A4', escala: number = 1): ConfigLayoutPoster => {
    let dims = DIMENSIONES_A4;
    if (formato === 'A5') dims = { ...DIMENSIONES_A5, DPI_PREVIEW: 96, DPI_EXPORT: 300 };
    if (formato === 'SQUARE') dims = { ...DIMENSIONES_SQUARE, DPI_PREVIEW: 96, DPI_EXPORT: 300 };

    return {
        anchoPx: mmAPx(dims.ANCHO_MM) * escala,
        altoPx: mmAPx(dims.ALTO_MM) * escala,
        margenPx: mmAPx(dims.MARGEN_SEGURIDAD_MM) * escala,
        colorPrimario: '#0ea5e9',
        escala
    };
};

/**
 * Filtros de "Enfoque Editorial" para imágenes de fachada.
 * Aplica técnicas de post-procesamiento visual para que la foto se vea profesional.
 */
export const aplicarFiltroEditorial = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    // 1. Capa de viñeteado suave
    const gradient = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, w / 2);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);

    // 2. Incremento de contraste sutil (Vía Overlay)
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = 'source-over';
};
