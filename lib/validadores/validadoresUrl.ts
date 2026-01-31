/**
 * FOTO FACHADA V2 — Validadores de URL
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Validación en tiempo real de URLs de redes sociales y sitios web.
 * Nomenclatura 100% español.
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type PlataformaSocial =
    | 'instagram'
    | 'facebook'
    | 'tiktok'
    | 'twitter'
    | 'linkedin'
    | 'youtube'
    | 'pinterest';

export interface ResultadoValidacionUrl {
    esValida: boolean;
    mensaje: string;
    plataformaDetectada?: PlataformaSocial;
    urlNormalizada?: string;
}

// ═══════════════════════════════════════════════════════════════
// PATRONES REGEX POR PLATAFORMA
// ═══════════════════════════════════════════════════════════════

const PATRONES_REDES_SOCIALES: Record<PlataformaSocial, RegExp> = {
    instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9_.]+)\/?$/,
    facebook: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/([a-zA-Z0-9.]+)\/?$/,
    tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/@([a-zA-Z0-9_.]+)\/?$/,
    twitter: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/?$/,
    linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/(company|in)\/([a-zA-Z0-9-]+)\/?$/,
    youtube: /^(https?:\/\/)?(www\.)?(youtube\.com\/(c\/|channel\/|@)?|youtu\.be\/)([a-zA-Z0-9_-]+)\/?$/,
    pinterest: /^(https?:\/\/)?(www\.)?pinterest\.(com|es)\/([a-zA-Z0-9_]+)\/?$/,
};

const PATRON_SITIO_WEB = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Valida una URL de red social específica
 */
export function validarUrlRedSocial(
    url: string,
    plataforma: PlataformaSocial
): ResultadoValidacionUrl {
    if (!url || url.trim() === '') {
        return {
            esValida: true, // Campo vacío es válido (opcional)
            mensaje: '',
        };
    }

    const urlLimpia = url.trim().toLowerCase();
    const patron = PATRONES_REDES_SOCIALES[plataforma];

    if (!patron) {
        return {
            esValida: false,
            mensaje: 'Plataforma no soportada',
        };
    }

    if (patron.test(urlLimpia)) {
        return {
            esValida: true,
            mensaje: 'URL válida',
            plataformaDetectada: plataforma,
            urlNormalizada: normalizarUrl(urlLimpia),
        };
    }

    // Mensajes de ayuda específicos por plataforma
    const mensajesAyuda: Record<PlataformaSocial, string> = {
        instagram: 'Formato: instagram.com/usuario',
        facebook: 'Formato: facebook.com/pagina',
        tiktok: 'Formato: tiktok.com/@usuario',
        twitter: 'Formato: twitter.com/usuario o x.com/usuario',
        linkedin: 'Formato: linkedin.com/in/usuario',
        youtube: 'Formato: youtube.com/@canal',
        pinterest: 'Formato: pinterest.com/usuario',
    };

    return {
        esValida: false,
        mensaje: mensajesAyuda[plataforma],
    };
}

/**
 * Detecta automáticamente la plataforma de una URL
 */
export function detectarPlataforma(url: string): PlataformaSocial | null {
    if (!url || url.trim() === '') return null;

    const urlLimpia = url.trim().toLowerCase();

    for (const [plataforma, patron] of Object.entries(PATRONES_REDES_SOCIALES)) {
        if (patron.test(urlLimpia)) {
            return plataforma as PlataformaSocial;
        }
    }

    return null;
}

/**
 * Valida una URL de sitio web genérico
 */
export function validarUrlSitioWeb(url: string): ResultadoValidacionUrl {
    if (!url || url.trim() === '') {
        return {
            esValida: true,
            mensaje: '',
        };
    }

    const urlLimpia = url.trim();

    if (PATRON_SITIO_WEB.test(urlLimpia)) {
        return {
            esValida: true,
            mensaje: 'URL válida',
            urlNormalizada: normalizarUrl(urlLimpia),
        };
    }

    return {
        esValida: false,
        mensaje: 'Ingresa una URL válida (ej: www.ejemplo.com)',
    };
}

/**
 * Normaliza una URL añadiendo https:// si no tiene protocolo
 */
function normalizarUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
    }
    return url;
}

/**
 * Valida múltiples URLs de redes sociales
 */
export function validarRedesSociales(
    redes: Partial<Record<PlataformaSocial, string>>
): Record<PlataformaSocial, ResultadoValidacionUrl> {
    const resultados: Partial<Record<PlataformaSocial, ResultadoValidacionUrl>> = {};

    for (const [plataforma, url] of Object.entries(redes)) {
        if (url !== undefined) {
            resultados[plataforma as PlataformaSocial] = validarUrlRedSocial(
                url,
                plataforma as PlataformaSocial
            );
        }
    }

    return resultados as Record<PlataformaSocial, ResultadoValidacionUrl>;
}

// ═══════════════════════════════════════════════════════════════
// ICONOS DE PLATAFORMAS (para uso en UI)
// ═══════════════════════════════════════════════════════════════

export const ICONOS_PLATAFORMAS: Record<PlataformaSocial, string> = {
    instagram: '📸',
    facebook: '📘',
    tiktok: '🎵',
    twitter: '🐦',
    linkedin: '💼',
    youtube: '▶️',
    pinterest: '📌',
};

export const NOMBRES_PLATAFORMAS: Record<PlataformaSocial, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    twitter: 'X (Twitter)',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    pinterest: 'Pinterest',
};
