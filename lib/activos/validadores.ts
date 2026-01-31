/**
 * FOTO FACHADA V2 — Validadores de Activos
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Funciones de validación para archivos de imagen.
 * Nomenclatura 100% español.
 */

import type { DatosImagen } from '../estado/tipos-estado';

// ═══════════════════════════════════════════════════════════════
// CONSTANTES DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════

/** Tipos MIME permitidos */
export const TIPOS_MIME_PERMITIDOS = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
] as const;

/** Tamaño máximo de archivo (10 MB) */
export const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024;

/** Dimensiones mínimas en píxeles */
export const DIMENSIONES_MINIMAS = {
    ancho: 400,
    alto: 300,
} as const;

/** Dimensiones máximas en píxeles */
export const DIMENSIONES_MAXIMAS = {
    ancho: 8000,
    alto: 6000,
} as const;

// ═══════════════════════════════════════════════════════════════
// TIPOS DE RESULTADO DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════

export interface ResultadoValidacion {
    esValido: boolean;
    errores: string[];
    advertencias: string[];
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Valida el tipo MIME del archivo
 */
export function validarTipoMime(archivo: File): ResultadoValidacion {
    const resultado: ResultadoValidacion = {
        esValido: true,
        errores: [],
        advertencias: [],
    };

    if (!TIPOS_MIME_PERMITIDOS.includes(archivo.type as typeof TIPOS_MIME_PERMITIDOS[number])) {
        resultado.esValido = false;
        resultado.errores.push(
            `Formato no permitido: "${archivo.type}". Formatos aceptados: JPG, PNG, WEBP, AVIF.`
        );
    }

    return resultado;
}

/**
 * Valida el tamaño del archivo
 */
export function validarTamanoArchivo(archivo: File): ResultadoValidacion {
    const resultado: ResultadoValidacion = {
        esValido: true,
        errores: [],
        advertencias: [],
    };

    if (archivo.size > TAMANO_MAXIMO_BYTES) {
        const tamanoMB = (archivo.size / (1024 * 1024)).toFixed(2);
        const maximoMB = (TAMANO_MAXIMO_BYTES / (1024 * 1024)).toFixed(0);
        resultado.esValido = false;
        resultado.errores.push(
            `Archivo demasiado grande: ${tamanoMB} MB. El tamaño máximo es ${maximoMB} MB.`
        );
    } else if (archivo.size > TAMANO_MAXIMO_BYTES * 0.8) {
        resultado.advertencias.push(
            'El archivo es grande. Considera usar una imagen más pequeña para mejor rendimiento.'
        );
    }

    return resultado;
}

/**
 * Valida las dimensiones de una imagen
 */
export async function validarDimensiones(
    urlImagen: string
): Promise<ResultadoValidacion> {
    return new Promise((resolve) => {
        const resultado: ResultadoValidacion = {
            esValido: true,
            errores: [],
            advertencias: [],
        };

        const imagen = new Image();
        imagen.onload = () => {
            const { width: ancho, height: alto } = imagen;

            // Validar mínimos
            if (ancho < DIMENSIONES_MINIMAS.ancho || alto < DIMENSIONES_MINIMAS.alto) {
                resultado.esValido = false;
                resultado.errores.push(
                    `Imagen muy pequeña: ${ancho}×${alto}px. ` +
                    `Mínimo requerido: ${DIMENSIONES_MINIMAS.ancho}×${DIMENSIONES_MINIMAS.alto}px.`
                );
            }

            // Validar máximos
            if (ancho > DIMENSIONES_MAXIMAS.ancho || alto > DIMENSIONES_MAXIMAS.alto) {
                resultado.advertencias.push(
                    `Imagen muy grande: ${ancho}×${alto}px. Se redimensionará automáticamente.`
                );
            }

            // Validar proporción para fachadas (preferiblemente horizontal)
            const proporcion = ancho / alto;
            if (proporcion < 0.5) {
                resultado.advertencias.push(
                    'La imagen es muy vertical. Las fachadas suelen fotografiarse en formato horizontal.'
                );
            }

            resolve(resultado);
        };

        imagen.onerror = () => {
            resultado.esValido = false;
            resultado.errores.push('No se pudo cargar la imagen para validar dimensiones.');
            resolve(resultado);
        };

        imagen.src = urlImagen;
    });
}

/**
 * Valida un archivo completo
 */
export async function validarArchivoCompleto(
    archivo: File,
    urlImagen: string
): Promise<ResultadoValidacion> {
    const resultado: ResultadoValidacion = {
        esValido: true,
        errores: [],
        advertencias: [],
    };

    // Validar tipo MIME
    const resultadoTipo = validarTipoMime(archivo);
    resultado.errores.push(...resultadoTipo.errores);
    resultado.advertencias.push(...resultadoTipo.advertencias);

    // Validar tamaño
    const resultadoTamano = validarTamanoArchivo(archivo);
    resultado.errores.push(...resultadoTamano.errores);
    resultado.advertencias.push(...resultadoTamano.advertencias);

    // Validar dimensiones
    const resultadoDimensiones = await validarDimensiones(urlImagen);
    resultado.errores.push(...resultadoDimensiones.errores);
    resultado.advertencias.push(...resultadoDimensiones.advertencias);

    // Determinar validez final
    resultado.esValido = resultado.errores.length === 0;

    return resultado;
}

/**
 * Obtiene las dimensiones de una imagen
 */
export async function obtenerDimensiones(
    urlImagen: string
): Promise<{ ancho: number; alto: number }> {
    return new Promise((resolve, reject) => {
        const imagen = new Image();
        imagen.onload = () => {
            resolve({
                ancho: imagen.width,
                alto: imagen.height,
            });
        };
        imagen.onerror = () => reject(new Error('Error al cargar imagen'));
        imagen.src = urlImagen;
    });
}

/**
 * Crea objeto DatosImagen desde un archivo
 */
export async function crearDatosImagen(
    archivo: File,
    urlImagen: string
): Promise<DatosImagen> {
    const dimensiones = await obtenerDimensiones(urlImagen);

    return {
        urlImagen,
        nombreArchivo: archivo.name,
        tipoMime: archivo.type as DatosImagen['tipoMime'],
        tamanoBytes: archivo.size,
        dimensiones,
        fechaCaptura: new Date().toISOString(),
    };
}
