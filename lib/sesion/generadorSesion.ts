/**
 * FOTO FACHADA V2 — Generador de Sesión
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Generación de hash único SHA-256 para identificar la sesión.
 */

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const CLAVE_SESION = 'foto-fachada-v2-sesion-id';

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE HASH
// ═══════════════════════════════════════════════════════════════

/**
 * Genera un hash SHA-256 a partir de datos de entrada
 */
export async function generarHashSHA256(datos: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(datos);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Genera un hash único basado en archivo y timestamp
 */
export async function generarHashArchivo(archivo: File): Promise<string> {
    const datosArchivo = `${archivo.name}-${archivo.size}-${archivo.lastModified}-${Date.now()}`;
    return generarHashSHA256(datosArchivo);
}

/**
 * Genera un ID de sesión corto (primeros 12 caracteres del hash)
 */
export async function generarIdSesion(archivo: File): Promise<string> {
    const hashCompleto = await generarHashArchivo(archivo);
    return hashCompleto.substring(0, 12).toUpperCase();
}

// ═══════════════════════════════════════════════════════════════
// GESTIÓN DE SESIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Obtiene el ID de sesión actual o genera uno nuevo
 */
export function obtenerIdSesionActual(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(CLAVE_SESION);
}

/**
 * Guarda el ID de sesión
 */
export function guardarIdSesion(idSesion: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(CLAVE_SESION, idSesion);
}

/**
 * Limpia el ID de sesión
 */
export function limpiarIdSesion(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(CLAVE_SESION);
}

/**
 * Genera y guarda un nuevo ID de sesión basado en el archivo
 */
export async function iniciarNuevaSesion(archivo: File): Promise<string> {
    const idSesion = await generarIdSesion(archivo);
    guardarIdSesion(idSesion);
    console.info(`[Sesión] Nueva sesión iniciada: ${idSesion}`);
    return idSesion;
}
