/**
 * FOTO FACHADA V2 — Store de Estado Global
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Zustand store con nomenclatura 100% español.
 * Persistencia via funciones de Semilla de Estado.
 */

import { create } from 'zustand';
import {
    registrarCambio,
    cargarEstadoInicial,
    obtenerMarcaTiempo,
} from '@/lib/estado/SemillaEstado';
import type {
    PasoAplicacion,
    DatosImagen,
    AdnMarca,
    DatosEscaparate,
    EstadoTienda,
    AccionesTienda,
} from '@/lib/estado/tipos-estado';

// ═══════════════════════════════════════════════════════════════
// TIPO COMPLETO DEL STORE
// ═══════════════════════════════════════════════════════════════

type TiendaCompleta = EstadoTienda & AccionesTienda;

// ═══════════════════════════════════════════════════════════════
// ESTADO INICIAL
// ═══════════════════════════════════════════════════════════════

const estadoInicial: EstadoTienda = {
    pasoActual: 'CAPTURA',
    imagenSubida: null,
    analizando: false,
    adnMarca: null,
    datosEscaparate: null,
    ultimaModificacion: new Date().toISOString(),
};

// ═══════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════

export const useTiendaEstado = create<TiendaCompleta>()((set, get) => {
    // Cargar estado inicial desde semilla si existe
    const estadoGuardado = cargarEstadoInicial();
    const estadoBase = estadoGuardado
        ? { ...estadoInicial, ...estadoGuardado }
        : estadoInicial;

    return {
        // Estado inicial
        ...estadoBase,

        // ═══════════════════════════════════════════════════════════
        // ACCIONES
        // ═══════════════════════════════════════════════════════════

        establecerPaso: (paso: PasoAplicacion) => {
            const anterior = get();
            set({
                pasoActual: paso,
                ultimaModificacion: obtenerMarcaTiempo(),
            });
            registrarCambio(
                { pasoActual: anterior.pasoActual },
                { pasoActual: paso },
                'establecerPaso'
            );
        },

        guardarImagenCapturada: (imagen: DatosImagen) => {
            const anterior = get();
            set({
                imagenSubida: imagen,
                ultimaModificacion: obtenerMarcaTiempo(),
            });
            registrarCambio(
                { imagenSubida: anterior.imagenSubida },
                { imagenSubida: imagen },
                'guardarImagenCapturada'
            );
        },

        iniciarAnalisis: () => {
            const anterior = get();
            set({
                analizando: true,
                pasoActual: 'ANALISIS',
                ultimaModificacion: obtenerMarcaTiempo(),
            });
            registrarCambio(
                { analizando: anterior.analizando, pasoActual: anterior.pasoActual },
                { analizando: true, pasoActual: 'ANALISIS' },
                'iniciarAnalisis'
            );
        },

        completarAnalisis: (adn: AdnMarca, escaparate: DatosEscaparate) => {
            const anterior = get();
            set({
                analizando: false,
                adnMarca: adn,
                datosEscaparate: escaparate,
                pasoActual: 'ESCAPARATE',
                ultimaModificacion: obtenerMarcaTiempo(),
            });
            registrarCambio(
                { adnMarca: anterior.adnMarca, datosEscaparate: anterior.datosEscaparate },
                { adnMarca: adn, datosEscaparate: escaparate },
                'completarAnalisis'
            );
        },

        regenerarEscaparate: (datos: DatosEscaparate) => {
            const anterior = get();
            set({
                datosEscaparate: datos,
                ultimaModificacion: obtenerMarcaTiempo(),
            });
            registrarCambio(
                { datosEscaparate: anterior.datosEscaparate },
                { datosEscaparate: datos },
                'regenerarEscaparate'
            );
        },

        reiniciar: () => {
            set({
                ...estadoInicial,
                ultimaModificacion: obtenerMarcaTiempo(),
            });
            registrarCambio({}, estadoInicial, 'reiniciar');
        },
    };
});

// ═══════════════════════════════════════════════════════════════
// SELECTORES
// ═══════════════════════════════════════════════════════════════

export const usePasoActual = () => useTiendaEstado((s) => s.pasoActual);
export const useImagenSubida = () => useTiendaEstado((s) => s.imagenSubida);
export const useAnalizando = () => useTiendaEstado((s) => s.analizando);
export const useAdnMarca = () => useTiendaEstado((s) => s.adnMarca);
export const useDatosEscaparate = () => useTiendaEstado((s) => s.datosEscaparate);

// ═══════════════════════════════════════════════════════════════
// ACCIONES EXPORTADAS
// ═══════════════════════════════════════════════════════════════

export const accionesTienda = {
    establecerPaso: (paso: PasoAplicacion) =>
        useTiendaEstado.getState().establecerPaso(paso),
    guardarImagenCapturada: (imagen: DatosImagen) =>
        useTiendaEstado.getState().guardarImagenCapturada(imagen),
    iniciarAnalisis: () =>
        useTiendaEstado.getState().iniciarAnalisis(),
    completarAnalisis: (adn: AdnMarca, escaparate: DatosEscaparate) =>
        useTiendaEstado.getState().completarAnalisis(adn, escaparate),
    regenerarEscaparate: (datos: DatosEscaparate) =>
        useTiendaEstado.getState().regenerarEscaparate(datos),
    reiniciar: () =>
        useTiendaEstado.getState().reiniciar(),
};
