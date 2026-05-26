/**
 * FOTO FACHADA V2 — Semilla de Estado (Sistema de Persistencia)
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Funciones de persistencia para localStorage.
 * El middleware se aplica directamente en el store.
 */

import type {
    EstadoTienda,
    SemillaEstadoData,
    RegistroCambio,
} from './tipos-estado';

// ═══════════════════════════════════════════════════════════════
// CONSTANTES DE CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

const CLAVE_ALMACENAMIENTO = 'foto-fachada-v2-semilla';
const VERSION_ESQUEMA = '2.0.0';
const LIMITE_HISTORIAL = 50;

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

export function generarIdCambio(): string {
    return `cambio_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function obtenerMarcaTiempo(): string {
    return new Date().toISOString();
}

function serializarEstado(datos: SemillaEstadoData): string {
    return JSON.stringify(datos, null, 2);
}

function deserializarEstado(json: string): SemillaEstadoData | null {
    try {
        const datos = JSON.parse(json) as SemillaEstadoData;
        if (datos.versionEsquema !== VERSION_ESQUEMA) {
            console.warn(
                `[SemillaEstado] Versión de esquema incompatible: ${datos.versionEsquema} vs ${VERSION_ESQUEMA}`
            );
            return null;
        }
        return datos;
    } catch (error) {
        console.error('[SemillaEstado] Error al deserializar:', error);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE PERSISTENCIA
// ═══════════════════════════════════════════════════════════════

export function guardarSemilla(datos: SemillaEstadoData): void {
    if (typeof window === 'undefined') return;

    try {
        const json = serializarEstado(datos);
        localStorage.setItem(CLAVE_ALMACENAMIENTO, json);
    } catch (error) {
        console.error('[SemillaEstado] Error al guardar:', error);
    }
}

export function cargarSemilla(): SemillaEstadoData | null {
    if (typeof window === 'undefined') return null;

    try {
        const json = localStorage.getItem(CLAVE_ALMACENAMIENTO);
        if (!json) return null;
        return deserializarEstado(json);
    } catch (error) {
        console.error('[SemillaEstado] Error al cargar:', error);
        return null;
    }
}

export function limpiarSemilla(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CLAVE_ALMACENAMIENTO);
}

export function exportarSemilla(): void {
    const datos = cargarSemilla();
    if (!datos) {
        console.warn('[SemillaEstado] No hay datos para exportar');
        return;
    }

    const blob = new Blob([serializarEstado(datos)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `foto-fachada-semilla-${Date.now()}.json`;
    enlace.click();
    URL.revokeObjectURL(url);
}

export async function importarSemilla(archivo: File): Promise<SemillaEstadoData | null> {
    return new Promise((resolve) => {
        const lector = new FileReader();
        lector.onload = (evento) => {
            const json = evento.target?.result as string;
            const datos = deserializarEstado(json);
            if (datos) {
                guardarSemilla(datos);
            }
            resolve(datos);
        };
        lector.onerror = () => resolve(null);
        lector.readAsText(archivo);
    });
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES PARA USO EN STORE
// ═══════════════════════════════════════════════════════════════

const ESTADO_VACIO: EstadoTienda = {
    pasoActual: 'CAPTURA',
    imagenSubida: null,
    analizando: false,
    adnMarca: null,
    datosEscaparate: null,
    ultimaModificacion: '',
    galeriaActivos: [],
    redesSociales: {},
    logoStatus: 'PENDING_AI',
    mensajeExito: null,
    slug: null,
    cartelesGenerados: [],
    indicePreguntaActual: 0,
    seccionResaltada: null,
    sugerenciasIA: {},
    campañas: [],
    registroEscaneos: [],
    insightsIA: [],
};

export function crearSemillaInicial(estado: Partial<EstadoTienda>): SemillaEstadoData {
    return {
        versionEsquema: VERSION_ESQUEMA,
        estadoActual: {
            ...ESTADO_VACIO,
            ...estado,
            ultimaModificacion: obtenerMarcaTiempo(),
        },
        historialCambios: [],
        ultimaSincronizacion: obtenerMarcaTiempo(),
    };
}

export function registrarCambio(
    estadoAnterior: Partial<EstadoTienda>,
    estadoNuevo: Partial<EstadoTienda>,
    tipoAccion: string
): void {
    const registro: RegistroCambio = {
        id: generarIdCambio(),
        marcaTiempo: obtenerMarcaTiempo(),
        tipoAccion,
        estadoAnterior,
        estadoNuevo,
    };

    const semillaActual = cargarSemilla() || crearSemillaInicial(estadoNuevo);
    semillaActual.estadoActual = {
        ...semillaActual.estadoActual,
        ...estadoNuevo,
        ultimaModificacion: obtenerMarcaTiempo(),
    };
    semillaActual.historialCambios = [
        registro,
        ...semillaActual.historialCambios,
    ].slice(0, LIMITE_HISTORIAL);
    semillaActual.ultimaSincronizacion = obtenerMarcaTiempo();

    guardarSemilla(semillaActual);
}

export function cargarEstadoInicial(): Partial<EstadoTienda> | null {
    const semilla = cargarSemilla();
    return semilla?.estadoActual ?? null;
}
