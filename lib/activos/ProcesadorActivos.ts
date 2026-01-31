/**
 * FOTO FACHADA V2 — Procesador de Activos
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Utilidades para procesamiento y optimización de imágenes.
 * Nomenclatura 100% español.
 */

// ═══════════════════════════════════════════════════════════════
// CONSTANTES DE PROCESAMIENTO
// ═══════════════════════════════════════════════════════════════

/** Ancho máximo para normalización */
const ANCHO_NORMALIZADO = 1920;

/** Calidad de compresión JPEG/WEBP (0-1) */
const CALIDAD_COMPRESION = 0.85;

/** Formato de salida preferido */
const FORMATO_SALIDA = 'image/webp';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface OpcionesProcesamiento {
    anchoMaximo?: number;
    calidad?: number;
    formato?: 'image/jpeg' | 'image/png' | 'image/webp';
    mantenerProporcion?: boolean;
}

export interface ResultadoProcesamiento {
    urlProcesada: string;
    formatoFinal: string;
    dimensionesFinales: {
        ancho: number;
        alto: number;
    };
    tamanoFinalBytes: number;
    compresionAplicada: boolean;
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE PROCESAMIENTO
// ═══════════════════════════════════════════════════════════════

/**
 * Carga una imagen desde URL y retorna el elemento Image
 */
async function cargarImagen(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const imagen = new Image();
        imagen.onload = () => resolve(imagen);
        imagen.onerror = () => reject(new Error('Error al cargar imagen'));
        imagen.src = url;
    });
}

/**
 * Calcula las dimensiones normalizadas manteniendo proporción
 */
function calcularDimensionesNormalizadas(
    anchoOriginal: number,
    altoOriginal: number,
    anchoMaximo: number
): { ancho: number; alto: number } {
    if (anchoOriginal <= anchoMaximo) {
        return { ancho: anchoOriginal, alto: altoOriginal };
    }

    const proporcion = altoOriginal / anchoOriginal;
    return {
        ancho: anchoMaximo,
        alto: Math.round(anchoMaximo * proporcion),
    };
}

/**
 * Procesa y optimiza una imagen
 */
export async function procesarImagen(
    urlImagen: string,
    opciones: OpcionesProcesamiento = {}
): Promise<ResultadoProcesamiento> {
    const {
        anchoMaximo = ANCHO_NORMALIZADO,
        calidad = CALIDAD_COMPRESION,
        formato = FORMATO_SALIDA,
        mantenerProporcion = true,
    } = opciones;

    // Cargar imagen original
    const imagenOriginal = await cargarImagen(urlImagen);
    const { width: anchoOriginal, height: altoOriginal } = imagenOriginal;

    // Calcular dimensiones finales
    const dimensionesFinales = mantenerProporcion
        ? calcularDimensionesNormalizadas(anchoOriginal, altoOriginal, anchoMaximo)
        : { ancho: anchoMaximo, alto: Math.round(anchoMaximo * 0.75) };

    // Crear canvas para procesamiento
    const canvas = document.createElement('canvas');
    canvas.width = dimensionesFinales.ancho;
    canvas.height = dimensionesFinales.alto;

    const contexto = canvas.getContext('2d');
    if (!contexto) {
        throw new Error('No se pudo obtener contexto 2D del canvas');
    }

    // Configurar suavizado de alta calidad
    contexto.imageSmoothingEnabled = true;
    contexto.imageSmoothingQuality = 'high';

    // Dibujar imagen redimensionada
    contexto.drawImage(
        imagenOriginal,
        0,
        0,
        dimensionesFinales.ancho,
        dimensionesFinales.alto
    );

    // Exportar como blob
    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) => {
                if (b) resolve(b);
                else reject(new Error('Error al crear blob'));
            },
            formato,
            calidad
        );
    });

    // Crear URL para el blob
    const urlProcesada = URL.createObjectURL(blob);

    return {
        urlProcesada,
        formatoFinal: formato,
        dimensionesFinales,
        tamanoFinalBytes: blob.size,
        compresionAplicada: anchoOriginal > anchoMaximo,
    };
}

/**
 * Convierte archivo a base64
 */
export function archivoABase64(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onload = () => resolve(lector.result as string);
        lector.onerror = () => reject(new Error('Error al leer archivo'));
        lector.readAsDataURL(archivo);
    });
}

/**
 * Convierte blob URL a base64
 */
export async function blobUrlABase64(blobUrl: string): Promise<string> {
    const respuesta = await fetch(blobUrl);
    const blob = await respuesta.blob();
    return new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onload = () => resolve(lector.result as string);
        lector.onerror = () => reject(new Error('Error al convertir blob'));
        lector.readAsDataURL(blob);
    });
}

/**
 * Libera URL de blob de memoria
 */
export function liberarUrlBlob(url: string): void {
    if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
}

/**
 * Extrae colores dominantes de una imagen (para futuro análisis de marca)
 */
export async function extraerColoresDominantes(
    urlImagen: string,
    cantidadColores: number = 5
): Promise<string[]> {
    const imagen = await cargarImagen(urlImagen);

    const canvas = document.createElement('canvas');
    const tamanoMuestra = 100; // Reducir para rendimiento
    canvas.width = tamanoMuestra;
    canvas.height = tamanoMuestra;

    const contexto = canvas.getContext('2d');
    if (!contexto) return [];

    contexto.drawImage(imagen, 0, 0, tamanoMuestra, tamanoMuestra);
    const datosImagen = contexto.getImageData(0, 0, tamanoMuestra, tamanoMuestra);

    // Algoritmo simple de muestreo de colores
    const coloresMap = new Map<string, number>();

    for (let i = 0; i < datosImagen.data.length; i += 4) {
        const r = Math.round(datosImagen.data[i] / 32) * 32;
        const g = Math.round(datosImagen.data[i + 1] / 32) * 32;
        const b = Math.round(datosImagen.data[i + 2] / 32) * 32;
        const color = `rgb(${r},${g},${b})`;

        coloresMap.set(color, (coloresMap.get(color) || 0) + 1);
    }

    // Ordenar por frecuencia y retornar los más comunes
    return Array.from(coloresMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, cantidadColores)
        .map(([color]) => color);
}
