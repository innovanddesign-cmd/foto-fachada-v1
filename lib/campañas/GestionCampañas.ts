"use client";

import { useTiendaEstado } from '@/store/useTiendaEstado';
import type { CampañaUsuario, MetricasCampaña, DatosDashboard } from '@/lib/estado/tipos-estado';

/**
 * GestionCampañas.ts
 * Motor de gestión de campañas y cálculo de métricas.
 * Incluye algoritmo de predicción de éxito y simulación de tráfico.
 */

// ═══════════════════════════════════════════════════════════════
// ALGORITMO DE PUNTAJE DE SALUD DE MARCA
// ═══════════════════════════════════════════════════════════════

interface FactoresSalud {
    categoriaNegocio: string;
    tieneCartel: boolean;
    tieneLogoExtraido: boolean;
    tieneConfiguracionCompleta: boolean;
    ratioConversion: number;
    diasActivo: number;
}

export function calcularPuntajeSaludMarca(factores: FactoresSalud): number {
    let puntaje = 0;

    // Base por categoría de negocio (sectores con mayor demanda digital)
    const categoriasBonificadas = ['restaurante', 'café', 'peluquería', 'gimnasio', 'retail'];
    const categoriaLower = factores.categoriaNegocio.toLowerCase();
    if (categoriasBonificadas.some(cat => categoriaLower.includes(cat))) {
        puntaje += 15;
    } else {
        puntaje += 10;
    }

    // Puntos por completitud del perfil
    if (factores.tieneCartel) puntaje += 20;
    if (factores.tieneLogoExtraido) puntaje += 15;
    if (factores.tieneConfiguracionCompleta) puntaje += 20;

    // Puntos por ratio de conversión (máximo 20 puntos)
    const conversionBonus = Math.min(factores.ratioConversion * 4, 20);
    puntaje += conversionBonus;

    // Puntos por tiempo activo (máximo 10 puntos)
    const tiempoBonus = Math.min(factores.diasActivo * 0.5, 10);
    puntaje += tiempoBonus;

    return Math.min(Math.round(puntaje), 100);
}

// ═══════════════════════════════════════════════════════════════
// SIMULADOR DE TRÁFICO (PARA DEMO)
// ═══════════════════════════════════════════════════════════════

export function generarMetricasSimuladas(categoria: string): MetricasCampaña {
    // Base de visitas según categoría
    const baseVisitas: Record<string, number> = {
        'restaurante': 180,
        'peluquería': 120,
        'tienda': 90,
        'gimnasio': 150,
        'default': 75
    };

    const categoriaLower = categoria.toLowerCase();
    let base = baseVisitas['default'];
    for (const [key, val] of Object.entries(baseVisitas)) {
        if (categoriaLower.includes(key)) {
            base = val;
            break;
        }
    }

    // Añadir variación aleatoria (±30%)
    const variacion = 0.7 + Math.random() * 0.6;
    const visitas = Math.round(base * variacion);
    const conversiones = Math.round(visitas * (0.03 + Math.random() * 0.07)); // 3-10% conversión
    const escaneos = Math.round(visitas * 0.15 * Math.random()); // 0-15% escanean QR

    const ratioConversion = visitas > 0 ? (conversiones / visitas) * 100 : 0;

    // Determinar tendencia
    const tendenciaRandom = Math.random();
    const tendencia: MetricasCampaña['tendencia'] =
        tendenciaRandom > 0.6 ? 'CRECIMIENTO' :
            tendenciaRandom > 0.3 ? 'ESTABLE' : 'DECLIVE';

    // Calcular puntaje de salud
    const puntajeSaludMarca = calcularPuntajeSaludMarca({
        categoriaNegocio: categoria,
        tieneCartel: escaneos > 0,
        tieneLogoExtraido: true,
        tieneConfiguracionCompleta: conversiones > 0,
        ratioConversion,
        diasActivo: Math.floor(Math.random() * 30) + 1
    });

    return {
        visitas,
        conversiones,
        escaneos,
        ratioConversion: Math.round(ratioConversion * 100) / 100,
        puntajeSaludMarca,
        tendencia
    };
}

// ═══════════════════════════════════════════════════════════════
// CREAR NUEVA CAMPAÑA
// ═══════════════════════════════════════════════════════════════

export function crearCampañaDesdeEstadoActual(nombrePersonalizado?: string): CampañaUsuario | null {
    const store = useTiendaEstado.getState();
    const { adnMarca, datosEscaparate, cartelesGenerados, slug } = store;

    if (!adnMarca || !datosEscaparate) return null;

    const categoria = adnMarca.analisisVision?.categoriaSugerida || 'General';
    const nombreNegocio = adnMarca.analisisVision?.nombreSugerido || 'Mi Negocio';
    const ahora = new Date().toISOString();

    const nombreFinal = nombrePersonalizado
        || `${nombreNegocio} — ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`;

    const nuevaCampaña: CampañaUsuario = {
        id: `camp_${Date.now()}`,
        nombreCampaña: nombreFinal,
        idEscaparate: slug || `esc_${Date.now()}`,
        idCartel: cartelesGenerados.length > 0 ? cartelesGenerados[0].id : null,
        estado: 'BORRADOR',
        metricas: generarMetricasSimuladas(categoria),
        fechaCreacion: ahora,
        ultimaActualizacion: ahora,
        urlPublica: slug ? `/v/${slug}` : undefined,
        thumbnailUrl: undefined
    };

    return nuevaCampaña;
}

/**
 * Crea una campaña desde el estado actual y la guarda directamente en el store.
 * Evita duplicados: si ya existe una campaña con el mismo slug, no crea otra.
 */
export function guardarCampañaEnStore(nombrePersonalizado?: string): CampañaUsuario | null {
    const store = useTiendaEstado.getState();
    const { slug, campañas } = store;

    // Evitar duplicado del mismo escaparate
    if (slug && campañas.some(c => c.idEscaparate === slug)) {
        return campañas.find(c => c.idEscaparate === slug) || null;
    }

    const nuevaCampaña = crearCampañaDesdeEstadoActual(nombrePersonalizado);
    if (!nuevaCampaña) return null;

    store.guardarCampaña(nuevaCampaña);
    return nuevaCampaña;
}

// ═══════════════════════════════════════════════════════════════
// CALCULAR RESUMEN GLOBAL
// ═══════════════════════════════════════════════════════════════

export function calcularResumenGlobal(campañas: CampañaUsuario[]): DatosDashboard['resumenGlobal'] {
    if (campañas.length === 0) {
        return {
            visitasTotales: 0,
            conversionesTotales: 0,
            escaneosTotales: 0,
            puntajePromedioSalud: 0
        };
    }

    const visitasTotales = campañas.reduce((sum, c) => sum + c.metricas.visitas, 0);
    const conversionesTotales = campañas.reduce((sum, c) => sum + c.metricas.conversiones, 0);
    const escaneosTotales = campañas.reduce((sum, c) => sum + c.metricas.escaneos, 0);
    const puntajePromedioSalud = Math.round(
        campañas.reduce((sum, c) => sum + c.metricas.puntajeSaludMarca, 0) / campañas.length
    );

    return {
        visitasTotales,
        conversionesTotales,
        escaneosTotales,
        puntajePromedioSalud
    };
}

// ═══════════════════════════════════════════════════════════════
// HOOK DE DATOS DASHBOARD
// ═══════════════════════════════════════════════════════════════

export function useDatosDashboard(): DatosDashboard {
    const campañas = useTiendaEstado((s) => s.campañas || []);

    return {
        campañas,
        resumenGlobal: calcularResumenGlobal(campañas)
    };
}
