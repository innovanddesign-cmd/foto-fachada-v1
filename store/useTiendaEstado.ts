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
    ActivoGaleria,
    RedesSociales,
    CartelGenerado,
    LogoStatus,
    CampañaUsuario, // Fase 6
    RegistroEscaneo, // Fase 6B
    InsightIA,       // Fase 6B
} from '@/lib/estado/tipos-estado';

// Interface extendida para incluir acciones asíncronas
export interface AccionesExtendidas extends AccionesTienda {
    cargarPorSlug: (slug: string) => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════
// TIPO COMPLETO DEL STORE
// ═══════════════════════════════════════════════════════════════

type TiendaCompleta = EstadoTienda & AccionesExtendidas;

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
    galeriaActivos: [],
    redesSociales: {},
    logoStatus: 'PENDING_AI',
    mensajeExito: null,
    slug: null,
    cartelesGenerados: [],
    indicePreguntaActual: 0,
    seccionResaltada: null,
    sugerenciasIA: {},
    campañas: [], // Fase 6: Array de campañas del usuario
    registroEscaneos: [], // Fase 6B
    insightsIA: [],       // Fase 6B
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

            // Generación automática de Slug si no existe
            const nombreNegocio = adn.analisisVision?.nombreSugerido || "negocio";
            const slugGenerado = nombreNegocio
                .toLowerCase()
                .trim()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
                .replace(/[^a-z0-9]+/g, '-')                      // Reemplazar no alfanuméricos por guiones
                .replace(/^-+|-+$/g, '');                         // Quitar guiones al inicio/final

            set({
                analizando: false,
                adnMarca: adn,
                datosEscaparate: escaparate,
                slug: slugGenerado,
                pasoActual: 'ESCAPARATE',
                ultimaModificacion: obtenerMarcaTiempo(),
            });

            registrarCambio(
                { adnMarca: anterior.adnMarca, datosEscaparate: anterior.datosEscaparate, slug: anterior.slug },
                { adnMarca: adn, datosEscaparate: escaparate, slug: slugGenerado },
                'completarAnalisis'
            );
        },

        actualizarAdn: (adn: Partial<AdnMarca>) => {
            const anterior = get();
            if (!anterior.adnMarca) return;

            const nuevoAdn = { ...anterior.adnMarca, ...adn };
            set({
                adnMarca: nuevoAdn,
                ultimaModificacion: obtenerMarcaTiempo(),
            });

            registrarCambio(
                { adnMarca: anterior.adnMarca },
                { adnMarca: nuevoAdn },
                'actualizarAdn'
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
            // Preservar campañas guardadas al reiniciar el flujo de creación
            const campañasActuales = get().campañas;
            set({
                ...estadoInicial,
                campañas: campañasActuales,
                ultimaModificacion: obtenerMarcaTiempo(),
            });
            registrarCambio({}, { ...estadoInicial, campañas: campañasActuales }, 'reiniciar');
        },

        setFotoFachada: (archivo: File | null, preview: string) => {
            const anterior = get();
            if (!archivo) {
                set({ imagenSubida: null, ultimaModificacion: obtenerMarcaTiempo() });
                return;
            }

            const nuevaImagen: DatosImagen = {
                urlImagen: preview,
                nombreArchivo: archivo.name,
                tipoMime: archivo.type as any,
                tamanoBytes: archivo.size,
                dimensiones: { ancho: 0, alto: 0 }, // Se actualizará al cargar la imagen si es necesario
                fechaCaptura: obtenerMarcaTiempo(),
            };

            set({
                imagenSubida: nuevaImagen,
                ultimaModificacion: obtenerMarcaTiempo(),
            });

            registrarCambio(
                { imagenSubida: anterior.imagenSubida },
                { imagenSubida: nuevaImagen },
                'setFotoFachada'
            );

            // También agregamos la fachada a la galería de activos
            get().agregarActivo(archivo, 'FACHADA');
        },

        agregarActivo: async (archivo: File, tipo: 'FACHADA' | 'LOGO' | 'OTRO') => {
            const anterior = get();
            const url = URL.createObjectURL(archivo);

            const nuevoActivo: ActivoGaleria = {
                id: `activo_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                url,
                tipo,
                nombreArchivo: archivo.name,
                tamanoBytes: archivo.size,
                timestamp: obtenerMarcaTiempo(),
            };

            const nuevaGaleria = [...anterior.galeriaActivos, nuevoActivo];

            set({
                galeriaActivos: nuevaGaleria,
                ultimaModificacion: obtenerMarcaTiempo(),
            });

            registrarCambio(
                { galeriaActivos: anterior.galeriaActivos },
                { galeriaActivos: nuevaGaleria },
                'agregarActivo'
            );
        },

        actualizarRedes: (redes: Partial<RedesSociales>) => {
            const anterior = get();
            const nuevasRedes = { ...anterior.redesSociales, ...redes };

            set({
                redesSociales: nuevasRedes,
                ultimaModificacion: obtenerMarcaTiempo(),
            });

            registrarCambio(
                { redesSociales: anterior.redesSociales },
                { redesSociales: nuevasRedes },
                'actualizarRedes'
            );
        },

        setLogoStatus: (status: LogoStatus) => {
            const anterior = get();
            set({
                logoStatus: status,
                ultimaModificacion: obtenerMarcaTiempo(),
            });
            registrarCambio(
                { logoStatus: anterior.logoStatus },
                { logoStatus: status },
                'setLogoStatus'
            );
        },

        mostrarExito: (mensaje: string | null) => {
            set({ mensajeExito: mensaje });
            if (mensaje) {
                setTimeout(() => set({ mensajeExito: null }), 4000);
            }
        },

        setSlug: (slug: string) => {
            const anterior = get();
            set({ slug, ultimaModificacion: obtenerMarcaTiempo() });
            registrarCambio({ slug: anterior.slug }, { slug }, 'setSlug');
        },

        guardarCartel: (cartel: CartelGenerado) => {
            const anterior = get();
            const nuevosCarteles = [...anterior.cartelesGenerados, cartel];
            set({
                cartelesGenerados: nuevosCarteles,
                ultimaModificacion: obtenerMarcaTiempo()
            });
            registrarCambio(
                { cartelesGenerados: anterior.cartelesGenerados },
                { cartelesGenerados: nuevosCarteles },
                'guardarCartel'
            );
        },

        eliminarCartel: (id: string) => {
            const anterior = get();
            const nuevosCarteles = anterior.cartelesGenerados.filter(c => c.id !== id);
            set({
                cartelesGenerados: nuevosCarteles,
                ultimaModificacion: obtenerMarcaTiempo()
            });
            registrarCambio(
                { cartelesGenerados: anterior.cartelesGenerados },
                { cartelesGenerados: nuevosCarteles },
                'eliminarCartel'
            );
        },

        setIndicePregunta: (indice: number) => {
            set({ indicePreguntaActual: indice, ultimaModificacion: obtenerMarcaTiempo() });
        },

        resaltarSeccion: (seccionId: string | null) => {
            set({ seccionResaltada: seccionId });
        },

        actualizarSeccion: (seccionId: string, contenido: any) => {
            const anterior = get();
            if (!anterior.datosEscaparate || !anterior.datosEscaparate.secciones) return;

            const nuevasSecciones = anterior.datosEscaparate.secciones.map(s =>
                s.id === seccionId
                    ? { ...s, contenido: { ...s.contenido, ...contenido } }
                    : s
            );

            const nuevosDatos = {
                ...anterior.datosEscaparate,
                secciones: nuevasSecciones
            };

            set({
                datosEscaparate: nuevosDatos,
                ultimaModificacion: obtenerMarcaTiempo()
            });

            registrarCambio(
                { datosEscaparate: anterior.datosEscaparate },
                { datosEscaparate: nuevosDatos },
                'actualizarSeccion'
            );
        },

        /** --- FASE 6: GESTIÓN DE CAMPAÑAS (CRUD) --- */

        guardarCampaña: (campaña) => {
            const anterior = get();
            const existente = anterior.campañas.findIndex(c => c.id === campaña.id);
            const nuevasCampañas = existente >= 0
                ? anterior.campañas.map(c => c.id === campaña.id ? campaña : c)
                : [...anterior.campañas, campaña];

            set({ campañas: nuevasCampañas, ultimaModificacion: obtenerMarcaTiempo() });
            registrarCambio(
                { campañas: anterior.campañas },
                { campañas: nuevasCampañas },
                'guardarCampaña'
            );
        },

        eliminarCampaña: (id) => {
            const anterior = get();
            const nuevasCampañas = anterior.campañas.filter(c => c.id !== id);
            set({ campañas: nuevasCampañas, ultimaModificacion: obtenerMarcaTiempo() });
            registrarCambio(
                { campañas: anterior.campañas },
                { campañas: nuevasCampañas },
                'eliminarCampaña'
            );
        },

        duplicarCampaña: (id, nuevoNombre) => {
            const anterior = get();
            const original = anterior.campañas.find(c => c.id === id);
            if (!original) return;

            const ahora = new Date().toISOString();
            const copia: CampañaUsuario = {
                ...original,
                id: `camp_${Date.now()}`,
                nombreCampaña: nuevoNombre,
                estado: 'BORRADOR',
                fechaCreacion: ahora,
                ultimaActualizacion: ahora,
                metricas: { ...original.metricas, visitas: 0, conversiones: 0, escaneos: 0 },
            };

            const nuevasCampañas = [...anterior.campañas, copia];
            set({ campañas: nuevasCampañas, ultimaModificacion: obtenerMarcaTiempo() });
            registrarCambio(
                { campañas: anterior.campañas },
                { campañas: nuevasCampañas },
                'duplicarCampaña'
            );
        },

        cambiarEstadoCampaña: (id, estado) => {
            const anterior = get();
            const nuevasCampañas = anterior.campañas.map(c =>
                c.id === id ? { ...c, estado, ultimaActualizacion: new Date().toISOString() } : c
            );
            set({ campañas: nuevasCampañas, ultimaModificacion: obtenerMarcaTiempo() });
            registrarCambio(
                { campañas: anterior.campañas },
                { campañas: nuevasCampañas },
                'cambiarEstadoCampaña'
            );
        },

        /** --- FASE 6B: TRACKING E INSIGHTS --- */

        registrarEscaneo: (escaneo) => {
            const nuevoRegistro: RegistroEscaneo = {
                id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString(),
                campañaId: escaneo.campañaId,
                dispositivo: escaneo.dispositivo,
                ubicacionEstimada: escaneo.ubicacionEstimada
            };

            set((state) => ({
                registroEscaneos: [...state.registroEscaneos, nuevoRegistro]
            }));

            // Actualizar métricas de la campaña asociada
            set((state) => {
                const campañas = [...state.campañas];
                const campañaIdx = campañas.findIndex(c => c.id === escaneo.campañaId);

                if (campañaIdx >= 0) {
                    const campaña = campañas[campañaIdx];
                    campañas[campañaIdx] = {
                        ...campaña,
                        metricas: {
                            ...campaña.metricas,
                            escaneos: campaña.metricas.escaneos + 1
                        },
                        ultimaActualizacion: new Date().toISOString()
                    };
                }

                return { campañas };
            });
        },

        generarInsights: (campañaId) => {
            // Lógica preliminar de insights (se expandirá con IA real)
            const insightDemo: InsightIA = {
                id: `ins_${Date.now()}`,
                tipo: 'CONSEJO',
                titulo: 'Optimiza tu QR',
                descripcion: 'Hemos detectado que el 60% de tus escaneos ocurren por la tarde. Considera una oferta "Happy Hour".',
                impactoEstimado: 'ALTO'
            };

            set((state) => ({
                insightsIA: [...state.insightsIA, insightDemo]
            }));
        },

        cargarPorSlug: async (slug: string) => {
            // Simulación de carga desde base de datos / localStorage
            console.log(`[Store] Intentando cargar negocio: ${slug}`);

            // 1. Intentar cargar desde localStorage primero (persistencia actual)
            const estadoGuardado = cargarEstadoInicial();

            // 2. Lógica de Fallback / Demo
            if (slug === 'mi-negocio-test' || !estadoGuardado) {
                // Si es el slug de test o no hay nada guardado, cargamos una semilla de demo
                const demoAdn: AdnMarca = {
                    paletaColores: {
                        primario: "#0ea5e9", // Sky 500
                        secundario: "#6366f1", // Indigo 500
                        acento: "#f43f5e", // Rose 500
                        fondo: "#050505",
                        superficieGlass: "rgba(255, 255, 255, 0.05)"
                    },
                    estiloTipografico: "SANS_GEOMETRICA",
                    ambiente: "Minimalista, Tecnológico, Acogedor",
                    analisisMarketing: "Enfoque en tecnología Aero-Glass.",
                    logoExtraido: null,
                    publicoObjetivo: "Jóvenes profesionales",
                    contextoMercado: "Cafetería de especialidad",
                    confianza: 95
                };

                const demoEscaparate: DatosEscaparate = {
                    titularPrincipal: "Experiencia Gourmet en cada Sorbo",
                    subtitulo: "Cafetería de especialidad con tecnología Aero-Glass.",
                    disenoSeleccionado: "heroe-dividido",
                    ofertas: [
                        { titulo: "Café Especial", precio: "$5.00", descripcion: "Grano seleccionado" }
                    ],
                    secciones: [
                        {
                            id: "galeria-1",
                            tipo: "Bento",
                            variante: "Glass",
                            contenido: {
                                titulo: "Nuestras Especialidades",
                                elementos: []
                            }
                        }
                    ]
                };

                set({
                    adnMarca: demoAdn,
                    datosEscaparate: demoEscaparate,
                    pasoActual: 'ESCAPARATE',
                    ultimaModificacion: obtenerMarcaTiempo()
                });
                return;
            }

            // 3. Si hay estado guardado, lo aplicamos
            if (estadoGuardado) {
                set({
                    ...estadoGuardado,
                    ultimaModificacion: obtenerMarcaTiempo()
                });
            }
        }
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
    actualizarAdn: (adn: Partial<AdnMarca>) =>
        useTiendaEstado.getState().actualizarAdn(adn),
    regenerarEscaparate: (datos: DatosEscaparate) =>
        useTiendaEstado.getState().regenerarEscaparate(datos),
    reiniciar: () =>
        useTiendaEstado.getState().reiniciar(),
    setFotoFachada: (archivo: File | null, preview: string) =>
        useTiendaEstado.getState().setFotoFachada(archivo, preview),
    agregarActivo: (archivo: File, tipo: 'FACHADA' | 'LOGO' | 'OTRO') =>
        useTiendaEstado.getState().agregarActivo(archivo, tipo),
    actualizarRedes: (redes: Partial<RedesSociales>) =>
        useTiendaEstado.getState().actualizarRedes(redes),
    setLogoStatus: (status: LogoStatus) =>
        useTiendaEstado.getState().setLogoStatus(status),
    mostrarExito: (mensaje: string | null) =>
        useTiendaEstado.getState().mostrarExito(mensaje),
    cargarPorSlug: async (slug: string) =>
        useTiendaEstado.getState().cargarPorSlug(slug),
    setSlug: (slug: string) =>
        useTiendaEstado.getState().setSlug(slug),
    guardarCartel: (cartel: CartelGenerado) =>
        useTiendaEstado.getState().guardarCartel(cartel),
    eliminarCartel: (id: string) =>
        useTiendaEstado.getState().eliminarCartel(id),
    setIndicePregunta: (indice: number) =>
        useTiendaEstado.getState().setIndicePregunta(indice),
    resaltarSeccion: (seccionId: string | null) =>
        useTiendaEstado.getState().resaltarSeccion(seccionId),
    actualizarSeccion: (seccionId: string, contenido: any) =>
        useTiendaEstado.getState().actualizarSeccion(seccionId, contenido),
};
