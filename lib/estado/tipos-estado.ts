/**
 * FOTO FACHADA V2 — Tipos de Estado (100% Español)
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Sistema de tipado completo en castellano neutro premium.
 * Cero anglicismos en la definición de interfaces.
 */

// ═══════════════════════════════════════════════════════════════
// ESTADOS DE LA APLICACIÓN (MÁQUINA DE ESTADOS LINEAL)
// ═══════════════════════════════════════════════════════════════

export type PasoAplicacion =
    | 'CAPTURA'      // Fase 1: Ingesta de imagen
    | 'ANALISIS'     // Fase 2: Procesamiento con IA (futuro)
    | 'ESCAPARATE'   // Fase 3: Generación de tienda
    | 'CARTELERIA'   // Fase 4: Diseño de carteles
    | 'CONFIGURACION'// Fase 5: Ajustes finales
    | 'DESPLIEGUE';  // Fase 6: Publicación

// ═══════════════════════════════════════════════════════════════
// DATOS DE IMAGEN CAPTURADA
// ═══════════════════════════════════════════════════════════════

export interface DatosImagen {
    /** URL de la imagen (base64 o blob URL) */
    urlImagen: string;

    /** Nombre original del archivo */
    nombreArchivo: string;

    /** Tipo MIME del archivo */
    tipoMime: 'image/jpeg' | 'image/png' | 'image/webp';

    /** Tamaño en bytes */
    tamanoBytes: number;

    /** Dimensiones en píxeles */
    dimensiones: {
        ancho: number;
        alto: number;
    };

    /** Fecha de captura */
    fechaCaptura: string; // ISO 8601

    /** Metadatos EXIF extraídos (opcional) */
    metadatosExif?: MetadatosExif;
}

export interface MetadatosExif {
    fechaOriginal?: string;
    fabricanteCamara?: string;
    modeloCamara?: string;
    ubicacionGps?: {
        latitud: number;
        longitud: number;
    };
}

// ═══════════════════════════════════════════════════════════════
// ADN DE MARCA (RESULTADO DEL ANÁLISIS IA - FUTURO)
// ═══════════════════════════════════════════════════════════════

export interface AdnMarca {
    /** Paleta de colores extraída de la fachada (5 niveles) */
    paletaColores: {
        primario: string;
        secundario: string;
        acento: string;
        fondo: string;
        superficieGlass: string;
    };

    /** Estilo tipográfico detectado */
    estiloTipografico: 'SANS_GEOMETRICA' | 'SERIF_ELEGANTE' | 'MANUSCRITA' | 'TECH_MONO';

    /** Ambiente/vibra del negocio */
    ambiente: string;

    /** Análisis detallado de marketing del negocio */
    analisisMarketing: string;

    /** Logotipo extraído de la imagen (URL base64/blob) */
    logoExtraido: string | null;

    /** Definición de público objetivo */
    publicoObjetivo: string;

    /** Análisis de competencia y mercado */
    contextoMercado: string;

    /** Nivel de confianza del análisis (0-100) */
    confianza: number;
}

// ═══════════════════════════════════════════════════════════════
// DATOS DEL ESCAPARATE GENERADO
// ═══════════════════════════════════════════════════════════════

export type TipoSeccion = 'Hero' | 'Catalog' | 'Promo' | 'Info' | 'Social';
export type VarianteSeccion = 'Glass' | 'Mesh' | 'Gradient';

export interface ContenidoSeccion {
    titulo: string;
    descripcion?: string;
    cta?: {
        texto: string;
        accion: string;
    };
    elementos?: any[];
}

export interface SeccionEscaparate {
    id: string;
    tipo: TipoSeccion;
    variante: VarianteSeccion;
    contenido: ContenidoSeccion;
}

export interface OfertaProducto {
    titulo: string;
    precio: string;
    descripcion?: string;
}

export interface DatosEscaparate {
    /** Titular principal */
    titularPrincipal: string;

    /** Subtítulo */
    subtitulo: string;

    /** Diseño de página seleccionado */
    disenoSeleccionado: 'heroe-dividido' | 'heroe-centrado' | 'galeria-cuadricula';

    /** Lista de ofertas */
    ofertas: OfertaProducto[];

    /** ESTRUCTURA GENERATIVA FASE 3 */
    secciones?: SeccionEscaparate[];
}

// ═══════════════════════════════════════════════════════════════
// ESTADO GLOBAL DE LA TIENDA
// ═══════════════════════════════════════════════════════════════

export interface EstadoTienda {
    /** Paso actual en el flujo */
    pasoActual: PasoAplicacion;

    /** Imagen subida por el usuario */
    imagenSubida: DatosImagen | null;

    /** Indicador de análisis en progreso */
    analizando: boolean;

    /** ADN de marca detectado */
    adnMarca: AdnMarca | null;

    /** Datos del escaparate generado */
    datosEscaparate: DatosEscaparate | null;

    /** Marca de tiempo de última modificación */
    ultimaModificacion: string; // ISO 8601
}

// ═══════════════════════════════════════════════════════════════
// ACCIONES DEL STORE
// ═══════════════════════════════════════════════════════════════

export interface AccionesTienda {
    /** Establecer el paso actual */
    establecerPaso: (paso: PasoAplicacion) => void;

    /** Guardar imagen capturada */
    guardarImagenCapturada: (imagen: DatosImagen) => void;

    /** Iniciar proceso de análisis */
    iniciarAnalisis: () => void;

    /** Completar análisis con resultados */
    completarAnalisis: (adn: AdnMarca, escaparate: DatosEscaparate) => void;

    /** Regenerar escaparate */
    regenerarEscaparate: (datos: DatosEscaparate) => void;

    /** Reiniciar aplicación */
    reiniciar: () => void;
}

// ═══════════════════════════════════════════════════════════════
// REGISTRO DE SEMILLA DE ESTADO (PERSISTENCIA)
// ═══════════════════════════════════════════════════════════════

export interface RegistroCambio {
    /** Identificador único del cambio */
    id: string;

    /** Marca de tiempo */
    marcaTiempo: string; // ISO 8601

    /** Tipo de acción ejecutada */
    tipoAccion: string;

    /** Estado anterior (parcial) */
    estadoAnterior: Partial<EstadoTienda>;

    /** Estado nuevo (parcial) */
    estadoNuevo: Partial<EstadoTienda>;
}

export interface SemillaEstadoData {
    /** Versión del esquema */
    versionEsquema: string;

    /** Estado actual completo */
    estadoActual: EstadoTienda;

    /** Historial de cambios */
    historialCambios: RegistroCambio[];

    /** Última sincronización */
    ultimaSincronizacion: string; // ISO 8601
}
