/**
 * FOTO FACHADA V2 — Tipos de Metadatos de Negocio
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Definición de tipos para metadatos opcionales del negocio.
 * Nomenclatura 100% español.
 */

import type { DatosImagen } from './tipos-estado';
import type { PlataformaSocial } from '../validadores/validadoresUrl';

// ═══════════════════════════════════════════════════════════════
// METADATOS DE REDES SOCIALES
// ═══════════════════════════════════════════════════════════════

export interface RedesSociales {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    pinterest?: string;
}

// ═══════════════════════════════════════════════════════════════
// METADATOS DE NEGOCIO
// ═══════════════════════════════════════════════════════════════

export interface MetadatosNegocio {
    /** URLs de redes sociales */
    redesSociales: RedesSociales;

    /** URL del sitio web existente */
    sitioWeb?: string;

    /** Logotipo del negocio */
    logotipo?: DatosImagen;

    /** Nombre del negocio (extraído o ingresado) */
    nombreNegocio?: string;

    /** Descripción breve */
    descripcion?: string;
}

// ═══════════════════════════════════════════════════════════════
// ESTADO DE VALIDACIÓN DE CAMPOS
// ═══════════════════════════════════════════════════════════════

export interface EstadoValidacionCampo {
    tocado: boolean;
    validando: boolean;
    esValido: boolean;
    mensaje: string;
}

export interface EstadoValidacionMetadatos {
    redesSociales: Partial<Record<PlataformaSocial, EstadoValidacionCampo>>;
    sitioWeb: EstadoValidacionCampo;
    logotipo: EstadoValidacionCampo;
}

// ═══════════════════════════════════════════════════════════════
// ESTADO INICIAL
// ═══════════════════════════════════════════════════════════════

export const METADATOS_INICIALES: MetadatosNegocio = {
    redesSociales: {},
    sitioWeb: undefined,
    logotipo: undefined,
    nombreNegocio: undefined,
    descripcion: undefined,
};

export const VALIDACION_CAMPO_INICIAL: EstadoValidacionCampo = {
    tocado: false,
    validando: false,
    esValido: true,
    mensaje: '',
};
