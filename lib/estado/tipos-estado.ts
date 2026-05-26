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
    | 'BIBLIOTECA_CARTELERIA'
    | 'CONFIGURACION'// Fase 5: Ajustes finales
    | 'DASHBOARD'    // Fase 6: Panel de control
    | 'DESPLIEGUE';  // Fase 6B: Publicación

// ═══════════════════════════════════════════════════════════════
// FASE 6: GESTIÓN DE CAMPAÑAS Y MÉTRICAS
// ═══════════════════════════════════════════════════════════════

export interface MetricasCampaña {
    visitas: number;
    conversiones: number;
    escaneos: number; // QR del cartel
    ratioConversion: number; // conversiones/visitas * 100
    puntajeSaludMarca: number; // 1-100
    tendencia: 'CRECIMIENTO' | 'ESTABLE' | 'DECLIVE';
}

export interface CampañaUsuario {
    id: string;
    nombreCampaña: string;
    idEscaparate: string;
    idCartel: string | null;
    estado: 'EN_LINEA' | 'PAUSADA' | 'BORRADOR';
    metricas: MetricasCampaña;
    fechaCreacion: string; // ISO 8601
    ultimaActualizacion: string; // ISO 8601
    urlPublica?: string;
    thumbnailUrl?: string;
}

export interface DatosDashboard {
    campañas: CampañaUsuario[];
    resumenGlobal: {
        visitasTotales: number;
        conversionesTotales: number;
        escaneosTotales: number;
        puntajePromedioSalud: number;
    };
}

// ═══════════════════════════════════════════════════════════════
// FASE 6B: INTELIGENCIA DE ESCANEOS Y OPTIMIZACIÓN
// ═══════════════════════════════════════════════════════════════

export interface RegistroEscaneo {
    id: string;
    campañaId: string;
    timestamp: string; // ISO 8601
    dispositivo: {
        modelo: string; // "iPhone 15 Pro", "Samsung S24"
        os: 'iOS' | 'Android' | 'Desktop' | 'Unknown';
    };
    ubicacionEstimada?: {
        ciudad: string;
        pais: string;
        lat: number;
        lng: number;
    };
}

export interface InsightIA {
    id: string;
    tipo: 'ALERTA' | 'CONSEJO' | 'OPORTUNIDAD';
    titulo: string;
    descripcion: string;
    accionSugerida?: {
        label: string;
        accion: () => void; // Serialized ID or function ref
    };
    impactoEstimado: 'ALTO' | 'MEDIO' | 'BAJO';
}


// ═══════════════════════════════════════════════════════════════
// DATOS DE IMAGEN CAPTURADA
// ═══════════════════════════════════════════════════════════════

export interface DatosImagen {
    /** URL de la imagen (base64 o blob URL) */
    urlImagen: string;

    /** Nombre original del archivo */
    nombreArchivo: string;

    /** Tipo MIME del archivo */
    tipoMime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic';

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

    /** Análisis de marketing y estrategia */
    analisisMarketing: string;

    /** Metadatos de Visión Artificial (Fase 2) */
    analisisVision?: AnalisisADN;

    /** Inteligencia de Marketing (Fase 2B) */
    inteligenciaMarketing?: MarketingIntelligence;

    /** --- FASE 7: PERFORMANCE & BRANDING --- */
    tipografiaSugerida?: string;
    estiloVisual?: string;
    arquetipo?: string;
    tonoVoz?: string;
    valoresClave?: string[];

    /** Logo extraído directamente o procesado
(URL base64/blob) */
    logoExtraido: string | null;

    /** Definición de público objetivo */
    publicoObjetivo: string;

    /** Análisis de competencia y mercado */
    contextoMercado: string;

    /** Nivel de confianza del análisis (0-100) */
    confianza: number;

    /** Estrategia de Conversión Recomendada (Fase 1) */
    estrategiaPrincipal?: 'OFERTA_FLASH' | 'CITA_PREVIA' | 'LEAD_MAGNET';

    /** Palabras clave visuales para generación de imágenes */
    keywords?: string[];
}

// ═══════════════════════════════════════════════════════════════
// DATOS DEL ESCAPARATE GENERADO
// ═══════════════════════════════════════════════════════════════

export type TipoSeccion = 'Hero' | 'Catalog' | 'Promo' | 'Info' | 'Social' | 'Bento' | 'Masonry' | 'Conversion';
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

// ═══════════════════════════════════════════════════════════════
// CARTELERÍA Y CAMPAÑAS (FASE 4 - BLOQUE 1 - PARTE B)
// ═══════════════════════════════════════════════════════════════

export type FormatoPoster = 'A4' | 'A5' | 'SQUARE';

export interface CampanaCartel {
    id: string;
    nombre: string;
    estado: 'ACTIVO' | 'BORRADOR' | 'PROGRAMADO';
    fechaCreacion: string;
}

export interface CartelGenerado {
    id: string;
    formato: FormatoPoster;
    campana: CampanaCartel;
    configVisual: {
        fraseImpacto: string;
        mostrarIconos: boolean;
        filtroPapel: boolean;
    };
    thumbnailUrl?: string; // Preview en base64 para la biblioteca
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

    /** --- FASE 5 BLOQUE 1B: SINCRONIZACIÓN HÍBRIDA --- */

    /** Datos proporcionados explícitamente por el usuario */
    datosReales?: Partial<DatosEscaparateBase>;

    /** Datos generados por IA como sugerencia/placeholder */
    datosSugeridos?: Partial<DatosEscaparateBase>;
}

/** Campos base editables (usados en datosReales y datosSugeridos) */
export interface DatosEscaparateBase {
    titularPrincipal: string;
    subtitulo: string;
    descripcionValor: string;
    ctaPrincipal: string;
    horario: string;
    telefono: string;
}

// ═══════════════════════════════════════════════════════════════
// ACTIVOS Y REDES SOCIALES (FASE 1 - BLOQUE 1 - PARTE B)
// ═══════════════════════════════════════════════════════════════

export interface ActivoGaleria {
    id: string;
    url: string;
    tipo: 'FACHADA' | 'LOGO' | 'OTRO';
    nombreArchivo: string;
    tamanoBytes: number;
    timestamp: string; // ISO 8601
}

export interface RedesSociales {
    instagram?: string;
    tiktok?: string;
    web?: string;
}

export type LogoStatus = 'PENDING_AI' | 'UPLOADED';

export interface AnalisisADN {
    nombreSugerido: string;
    categoriaSugerida: string;
    paletaColores: {
        primario: string; // HEX
        secundario: string; // HEX
        acento: string; // HEX
        fondo: string; // HEX
        primarioHSL: string;
        secundarioHSL: string;
    };
    objetosDetectados: string[];
    confianzaAnalisis: number; // 0 a 1
    logoDetectado: boolean;
    recorteLogoUrl?: string;
    logoCreationRequired: boolean;
}

export interface MarketingIntelligence {
    arquetipoMarca: string;
    tonoVoz: 'formal' | 'casual' | 'agresivo' | 'emocional';
    serviciosDetectados: string[];
    gapDeMercado: string; // Lo que el cliente ofrece que su competencia no.
    puntosDeDolorPublico: string[]; // Qué problemas resuelve a sus clientes.
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

    /** Galería de activos del negocio */
    galeriaActivos: ActivoGaleria[];

    /** Rastro digital (redes sociales) */
    redesSociales: RedesSociales;

    /** Estado del logotipo */
    logoStatus: LogoStatus;

    /** Mensaje temporal para la Dynamic Island */
    mensajeExito: string | null;

    /** Slug único para la URL del negocio */
    slug: string | null;

    /** Colección de carteles generados */
    cartelesGenerados: CartelGenerado[];

    /** --- FASE 5: EDITOR CONVERSACIONAL --- */

    /** Índice de la pregunta actual en el flujo Zen */
    indicePreguntaActual: number;

    /** ID de la sección del escaparate resaltada en el mockup */
    seccionResaltada: string | null;

    /** Sugerencias de IA para textos y copies */
    sugerenciasIA: Record<string, string[]>;

    /** --- FASE 6: GESTIÓN DE CAMPAÑAS --- */

    /** Array de campañas del usuario */
    campañas: CampañaUsuario[];

    /** --- FASE 6B: TRACKING E INSIGHTS --- */

    /** Registro de todos los escaneos de QR */
    registroEscaneos: RegistroEscaneo[];

    /** Insights y recomendaciones de la IA */
    insightsIA: InsightIA[];
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

    /** Actualiza campos específicos del ADN de marca */
    actualizarAdn: (adn: Partial<AdnMarca>) => void;

    /** Reiniciar todo el estado */
    reiniciar: () => void;

    /** Guardar foto de fachada procesada */
    setFotoFachada: (archivo: File | null, preview: string) => void;

    /** Agregar activo a la galería */
    agregarActivo: (archivo: File, tipo: 'FACHADA' | 'LOGO' | 'OTRO') => Promise<void>;

    /** Actualizar rastro digital */
    actualizarRedes: (redes: Partial<RedesSociales>) => void;

    /** Establecer estado del logo */
    setLogoStatus: (status: LogoStatus) => void;

    /** Mostrar feedback visual en la Dynamic Island */
    mostrarExito: (mensaje: string | null) => void;

    /** Establecer el slug único */
    setSlug: (slug: string) => void;

    /** Gestionar biblioteca de carteles */
    guardarCartel: (cartel: CartelGenerado) => void;
    eliminarCartel: (id: string) => void;

    /** --- ACCIONES FASE 5 (EDITOR ZEN) --- */

    /** Cambiar la pregunta activa */
    setIndicePregunta: (indice: number) => void;

    /** Resaltar sección en el mockup */
    resaltarSeccion: (seccionId: string | null) => void;

    /** Actualizar contenido de una sección específica */
    actualizarSeccion: (seccionId: string, contenido: Partial<ContenidoSeccion>) => void;

    /** --- FASE 6: GESTIÓN DE CAMPAÑAS (CRUD) --- */

    /** Guardar campaña en el store (añadir o actualizar) */
    guardarCampaña: (campaña: CampañaUsuario) => void;

    /** Eliminar campaña por ID */
    eliminarCampaña: (id: string) => void;

    /** Duplicar campaña existente con nuevo nombre */
    duplicarCampaña: (id: string, nuevoNombre: string) => void;

    /** Cambiar estado de una campaña */
    cambiarEstadoCampaña: (id: string, estado: CampañaUsuario['estado']) => void;

    /** --- FASE 6B: TRACKING INTELIGENTE --- */

    /** Registrar nuevo escaneo físico */
    registrarEscaneo: (escaneo: Omit<RegistroEscaneo, 'id' | 'timestamp'>) => void;

    /** Generar insights basados en datos actuales */
    generarInsights: (campañaId: string) => void;
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
