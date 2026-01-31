/**
 * FOTO FACHADA V2 — MotorEstructura.ts (Versión Senior Lead)
 * Motor de Inferencia Comercial y Arquitectura de Datos Generativa.
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS Y DEFINICIONES
// ═══════════════════════════════════════════════════════════════

export interface BrandDNA {
    nombre: string;
    rubro: string;
    vibe: 'Elegante' | 'Urgente/Rapido' | 'Minimalista' | 'Vibrante';
    publico: string;
    colores: string[];
}

export type VarianteEstilo = 'Glass' | 'Solid' | 'MeshGradient';
export type TipoSeccion = 'Hero' | 'Galeria' | 'Marketing' | 'Info' | 'Feedback' | 'Contacto';
export type AnguloVenta = 'Calidad Premium' | 'Precio Competitivo' | 'Innovacion' | 'Tradicion';

export interface SeccionEscaparate {
    id: string;
    tipo: TipoSeccion;
    prioridad: number;
    datos: {
        titulo: string;
        subtitulo: string;
        cuerpo?: string;
        llamada_a_la_accion?: string;
        imagen_url?: string;
        icono?: string;
        items?: any[];
        [key: string]: any;
    };
    varianteEstilo: VarianteEstilo;
}

export interface ResultadoMotor {
    version: string;
    semilla: string;
    configuracion: {
        anguloVenta: AnguloVenta;
        tipoEstructura: 'storytelling' | 'compacta';
        longitudEsperada: number;
    };
    secciones: SeccionEscaparate[];
    bitacora: string[]; // Log de decisiones en español
}

// ═══════════════════════════════════════════════════════════════
// MOTOR PRINCIPAL
// ═══════════════════════════════════════════════════════════════

/**
 * Función principal para generar el escaparate con lógica de mutación.
 */
export function generarMapaSecciones(dna: BrandDNA, semilla: string = "FF_2026"): ResultadoMotor {
    const bitacora: string[] = [];
    bitacora.push(`Iniciando generación para "${dna.nombre}" con semilla "${semilla}".`);

    // 1. Inicializar Generador determinista
    const rng = crearRNG(semilla);

    // 2. Determinar Ángulo de Venta y Estructura
    const anguloVenta: AnguloVenta = rng() > 0.5 ? 'Calidad Premium' : 'Precio Competitivo';
    const tipoEstructura = rng() > 0.5 ? 'storytelling' : 'compacta';
    bitacora.push(`Ángulo de venta seleccionado: ${anguloVenta}.`);
    bitacora.push(`Estructura de página: ${tipoEstructura === 'storytelling' ? 'Página Larga (Narrativa)' : 'Landing Compacta (Directa)'}.`);

    let secciones: SeccionEscaparate[] = [];

    // 3. SECCIÓN 1: HERO (Siempre primero)
    secciones.push(generarHero(dna, anguloVenta));
    bitacora.push("Sección 'Hero' configurada según ángulo de venta.");

    // 4. SECCIONES SECUNDARIAS (Se reordenarán)
    const secundarias: SeccionEscaparate[] = [
        generarGaleria(dna, anguloVenta),
        generarInfo(dna),
        seleccionarAccionMarketing(dna, rng, bitacora),
        generarFeedback(dna, rng)
    ];

    // Si es storytelling, añadimos más profundidad
    if (tipoEstructura === 'storytelling') {
        bitacora.push("Expandiendo contenido por modo storytelling.");
        secundarias.push(generarSeccionHistorias(dna));
    }

    // 5. Aplicar Mutación de Orden (Excepto Hero)
    barajarLista(secundarias, rng);
    bitacora.push("Secciones secundarias reordenadas aleatoriamente por semilla.");

    secciones = [...secciones, ...secundarias];

    // 6. SECCIÓN FINAL: CONTACTO
    secciones.push(generarContacto(dna));

    // 7. Validación de Riqueza y Ajuste de Prioridades
    secciones.forEach((sec, index) => {
        sec.prioridad = index + 1;
        validarRiquezaContenido(sec, bitacora);
    });

    return {
        version: "2.3.2",
        semilla,
        configuracion: {
            anguloVenta,
            tipoEstructura,
            longitudEsperada: secciones.length
        },
        secciones,
        bitacora
    };
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES LÓGICOS (PRIVADOS)
// ═══════════════════════════════════════════════════════════════

/**
 * El Corazón de Ventas: Elige la mejor estrategia según contexto.
 */
function seleccionarAccionMarketing(dna: BrandDNA, rng: () => number, bitacora: string[]): SeccionEscaparate {
    const random = rng();

    // 1. Estrategia: Urgencia Scarcity
    if (random < 0.33 || dna.vibe === 'Urgente/Rapido') {
        bitacora.push("Seleccionada estrategia 'Urgencia Scarcity' por vibe o probabilidad.");
        return {
            id: 'mkt_urgencia',
            tipo: 'Marketing',
            prioridad: 0,
            varianteEstilo: 'MeshGradient',
            datos: {
                titulo: '¡Oferta de Apertura Exclusiva!',
                subtitulo: 'Solo para los primeros 50 clientes que reserven hoy.',
                cuerpo: 'Obtén un 30% de descuento inmediato en tu primer servicio.',
                llamada_a_la_accion: 'Canejar Cupón Ahora',
                icono: 'Timer',
                meta_datos: { tipo: 'countdown', valor: 3600 }
            }
        };
    }

    // 2. Estrategia: Social Proof Inverso
    if (random < 0.66) {
        const clientes = Math.floor(rng() * 200) + 50;
        bitacora.push(`Seleccionada estrategia 'Social Proof' con ${clientes} clientes.`);
        return {
            id: 'mkt_social_proof',
            tipo: 'Marketing',
            prioridad: 0,
            varianteEstilo: 'Glass',
            datos: {
                titulo: `Únete a los +${clientes} clientes de este mes`,
                subtitulo: 'Nuestra comunidad no deja de crecer gracias a la confianza depositada.',
                cuerpo: 'Más que un servicio, somos el estándar de calidad en el sector.',
                llamada_a_la_accion: 'Ver Testimonios Reales',
                icono: 'Users',
                items: ['Satisfacción 99%', 'Soporte Premium', 'Garantía Total']
            }
        };
    }

    // 3. Estrategia: Lead Magnet Específico
    bitacora.push("Seleccionada estrategia 'Lead Magnet' específica por rubro.");
    let leadMagnet = {
        titulo: 'Descarga nuestra Guía Gratuita',
        subtitulo: 'Todo lo que necesitas saber antes de contratar.',
        cuerpo: 'Hemos preparado un manual exclusivo para ayudarte a decidir.',
        accion: 'Descargar PDF Gratis'
    };

    if (dna.rubro.toLowerCase().includes('lavandería')) {
        leadMagnet = {
            titulo: 'Guía: Cuidado de Prendas Delicadas',
            subtitulo: 'Aprende los secretos para que tu ropa dure años.',
            cuerpo: 'Un regalo de nuestros expertos para tu armario.',
            accion: 'Recibir Guía por WhatsApp'
        };
    } else if (dna.rubro.toLowerCase().includes('bar') || dna.rubro.toLowerCase().includes('café')) {
        leadMagnet = {
            titulo: 'Tu Primera Ronda va por nuestra cuenta',
            subtitulo: 'Queremos que nos conozcas de la mejor manera.',
            cuerpo: 'Regístrate y recibe un QR válido para tu próxima visita.',
            accion: 'Obtener Invitación'
        };
    }

    return {
        id: 'mkt_lead_magnet',
        tipo: 'Marketing',
        prioridad: 0,
        varianteEstilo: 'Solid',
        datos: {
            titulo: leadMagnet.titulo,
            subtitulo: leadMagnet.subtitulo,
            cuerpo: leadMagnet.cuerpo,
            llamada_a_la_accion: leadMagnet.accion,
            icono: 'Gift'
        }
    };
}

function generarHero(dna: BrandDNA, angulo: AnguloVenta): SeccionEscaparate {
    const copy = {
        'Calidad Premium': {
            titulo: `Excelencia y Precisión en cada detalle de ${dna.nombre}`,
            subtitulo: `Descubre el estándar más alto en ${dna.rubro}.`
        },
        'Precio Competitivo': {
            titulo: `${dna.nombre}: Calidad Profesional al Mejor Precio`,
            subtitulo: `La solución inteligente para ${dna.rubro}, cuidando tu bolsillo.`
        },
        'Innovacion': { titulo: '', subtitulo: '' }, 'Tradicion': { titulo: '', subtitulo: '' }
    };

    return {
        id: 'hero_main',
        tipo: 'Hero',
        prioridad: 1,
        varianteEstilo: 'MeshGradient',
        datos: {
            titulo: copy[angulo]?.titulo || `Bienvenido a ${dna.nombre}`,
            subtitulo: copy[angulo]?.subtitulo || `Tu mejor opción en ${dna.rubro}.`,
            cuerpo: `Diseñado para ${dna.publico.toLowerCase()}.`,
            llamada_a_la_accion: 'Saber Más',
            imagen_url: '/assets/generative/hero_bg.webp'
        }
    };
}

function generarGaleria(dna: BrandDNA, angulo: AnguloVenta): SeccionEscaparate {
    return {
        id: 'galeria_01',
        tipo: 'Galeria',
        prioridad: 2,
        varianteEstilo: 'Solid',
        datos: {
            titulo: angulo === 'Calidad Premium' ? 'Resultados que Hablan' : 'Eficiencia en Acción',
            subtitulo: 'Una muestra de nuestra dedicación diaria.',
            cuerpo: 'Cada trabajo es una oportunidad para demostrar nuestra maestría.',
            items: [
                { id: 1, label: 'Proceso' },
                { id: 2, label: 'Acabado' },
                { id: 3, label: 'Entrega' }
            ]
        }
    };
}

function generarInfo(dna: BrandDNA): SeccionEscaparate {
    return {
        id: 'info_01',
        tipo: 'Info',
        prioridad: 3,
        varianteEstilo: 'Glass',
        datos: {
            titulo: 'Información y Horarios',
            subtitulo: 'Estamos aquí para servirte.',
            cuerpo: 'Visítanos en nuestras instalaciones de última generación.',
            detalles: { aperture: '08:00', cierre: '20:00' },
            icono: 'Clock'
        }
    };
}

function generarFeedback(dna: BrandDNA, rng: () => number): SeccionEscaparate {
    return {
        id: 'feedback_01',
        tipo: 'Feedback',
        prioridad: 5,
        varianteEstilo: 'Solid',
        datos: {
            titulo: 'Lo que opinan nuestros clientes',
            subtitulo: 'Experiencias reales, resultados reales.',
            cuerpo: 'La satisfacción de nuestra comunidad es nuestra mayor recompensa.',
            items: [
                { autor: 'Ana G.', comentario: 'Increíble servicio.' }
            ]
        }
    };
}

function generarSeccionHistorias(dna: BrandDNA): SeccionEscaparate {
    return {
        id: 'story_01',
        tipo: 'Info',
        prioridad: 4,
        varianteEstilo: 'Glass',
        datos: {
            titulo: 'Nuestra Trayectoria',
            subtitulo: 'Más que un negocio, una pasión familiar.',
            cuerpo: `Desde nuestros inicios, ${dna.nombre} ha buscado redefinir el sector de ${dna.rubro}.`,
            icono: 'History'
        }
    };
}

function generarContacto(dna: BrandDNA): SeccionEscaparate {
    return {
        id: 'contacto_01',
        tipo: 'Contacto',
        prioridad: 99,
        varianteEstilo: 'Glass',
        datos: {
            titulo: 'Contacta con nosotros',
            subtitulo: 'Estamos a un mensaje de distancia.',
            cuerpo: 'Consultas, presupuestos o simplemente un saludo.',
            llamada_a_la_accion: 'Enviar WhatsApp',
            icono: 'MessageCircle'
        }
    };
}

// ═══════════════════════════════════════════════════════════════
// UTILIDADES Y VALIDACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Validador de "Riqueza de Contenido": Mínimo 3 campos clave por sección.
 */
function validarRiquezaContenido(sec: SeccionEscaparate, bitacora: string[]) {
    const camposContados = ['titulo', 'subtitulo', 'cuerpo', 'llamada_a_la_accion', 'imagen_url', 'icono', 'items'];
    let presentes = 0;

    camposContados.forEach(c => {
        if (sec.datos[c]) presentes++;
    });

    if (presentes < 3) {
        // Si es pobre, inyectamos un cuerpo de respaldo
        sec.datos.cuerpo = sec.datos.cuerpo || "Comprometidos con la excelencia en cada paso del proceso.";
        bitacora.push(`Aviso: Sección '${sec.id}' enriquecida por falta de metadatos.`);
    }
}

/**
 * Generador Pseudo-Aleatorio (SFC32 o similar simplificado)
 */
function crearRNG(semilla: string) {
    let h = 0;
    for (let i = 0; i < semilla.length; i++) {
        h = Math.imul(31, h) + semilla.charCodeAt(i) | 0;
    }
    return function () {
        h = Math.imul(h ^ h >>> 15, h | 1);
        h ^= h + Math.imul(h ^ h >>> 7, h | 61);
        return ((h ^ h >>> 14) >>> 0) / 4294967296;
    };
}

function barajarLista(array: any[], rng: () => number) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
