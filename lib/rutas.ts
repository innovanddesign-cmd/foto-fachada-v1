/**
 * Utilidades de rutas con base path configurable (NEXT_PUBLIC_BASE_PATH).
 * Coherencia entre QR, enlaces públicos (/v/, /t/) y rutas de auth.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/+$/, '');

/** Devuelve una ruta interna aplicando el base path (ej: /v/mi-negocio). */
export function ruta(path: string): string {
    const normalizada = path.startsWith('/') ? path : `/${path}`;
    if (!BASE_PATH) return normalizada;
    if (normalizada === BASE_PATH) return `${BASE_PATH}/`;
    if (normalizada.startsWith(`${BASE_PATH}/`)) return normalizada;
    return `${BASE_PATH}${normalizada}`;
}

/** URL absoluta para QR / compartir (requiere origin en cliente o parámetro en servidor). */
export function urlAbsoluta(path: string, origin?: string): string {
    const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${base}${ruta(path)}`;
}

/** Origen de Supabase (para URLs firmadas y públicas de Storage). */
export function origenSupabase(): string | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url ? url.replace(/\/+$/, '') : null;
}
