/**
 * Strategic Categories Data
 * =========================
 * Defines the 3 strategic categories (VENTAS, FIDELIZACIÓN, AUTORIDAD)
 * with their 9 associated actions and No-Code configuration schemas.
 */

import type { WidgetConfigField } from '../types';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type StrategicCategoryId = 'VENTAS' | 'FIDELIZACION' | 'AUTORIDAD';

export interface StrategicAction {
    id: number;
    name: string;
    emoji: string;
    description: string;
    example: string;
    configSchema: WidgetConfigField[];
    pageTemplate: string;
}

export interface StrategicCategory {
    id: StrategicCategoryId;
    emoji: string;
    title: string;
    tagline: string;
    description: string;
    gradient: string;
    glowColor: string;
    actions: StrategicAction[];
}

// ─────────────────────────────────────────────────────────────
// CONFIG SCHEMAS (No-Code Form Fields)
// ─────────────────────────────────────────────────────────────

const SCHEMAS = {
    // VENTAS schemas
    ofertaFlash: [
        { key: 'producto', label: 'Nombre del producto', type: 'text' as const, placeholder: 'Ej: Menú del día', default: '' },
        { key: 'precio_original', label: 'Precio original (€)', type: 'number' as const, placeholder: '15.90', default: '' },
        { key: 'precio_oferta', label: 'Precio oferta (€)', type: 'number' as const, placeholder: '9.90', default: '' },
        { key: 'tiempo_limite', label: 'Tiempo límite', type: 'text' as const, placeholder: 'Ej: Solo hoy, 24 horas', default: 'Solo hoy' },
        { key: 'mensaje_urgencia', label: 'Mensaje de urgencia', type: 'text' as const, placeholder: '¡Últimas unidades!', default: '¡Oferta limitada!' },
    ],
    comparadorPro: [
        { key: 'servicio_estandar', label: 'Nombre servicio estándar', type: 'text' as const, placeholder: 'Servicio Básico', default: 'Servicio Estándar' },
        { key: 'precio_estandar', label: 'Precio estándar (€)', type: 'number' as const, placeholder: '49.90', default: '' },
        { key: 'servicio_oferta', label: 'Nombre de TU oferta', type: 'text' as const, placeholder: 'Pack Premium', default: 'Oferta Exclusiva' },
        { key: 'precio_oferta', label: 'Precio oferta (€)', type: 'number' as const, placeholder: '29.90', default: '' },
        { key: 'beneficios', label: 'Beneficios incluidos (uno por línea)', type: 'list' as const, placeholder: 'Entrega express\\nGarantía 2 años\\nSoporte 24/7', default: '' },
        { key: 'cta', label: 'Texto del botón', type: 'text' as const, placeholder: 'Aprovechar ahora', default: 'Aprovechar ahora' },
    ],
    rascaGana: [
        { key: 'premio', label: 'Premio a descubrir', type: 'text' as const, placeholder: '20% de descuento', default: '' },
        { key: 'codigo_premio', label: 'Código del premio', type: 'text' as const, placeholder: 'RASCA20', default: '' },
        { key: 'mensaje_inicial', label: 'Mensaje antes de rascar', type: 'text' as const, placeholder: '¡Rasca y descubre tu premio!', default: '¡Rasca y gana!' },
        { key: 'mensaje_ganador', label: 'Mensaje al ganar', type: 'text' as const, placeholder: '¡Felicidades, has ganado!', default: '¡Enhorabuena!' },
        { key: 'validez', label: 'Validez del premio', type: 'text' as const, placeholder: 'Válido hasta 31/12/2026', default: '' },
    ],

    // FIDELIZACIÓN schemas  
    rachasVisita: [
        { key: 'nombre_programa', label: 'Nombre del programa', type: 'text' as const, placeholder: 'Racha de Fuego', default: 'Mi Racha' },
        { key: 'visitas_meta', label: 'Visitas para premio', type: 'number' as const, placeholder: '7', default: '7' },
        { key: 'premio', label: 'Premio al completar', type: 'text' as const, placeholder: 'Café gratis', default: '' },
        { key: 'mensaje_motivacional', label: 'Mensaje motivacional', type: 'text' as const, placeholder: '¡Sigue así!', default: '¡Sigue así!' },
    ],
    productoGancho: [
        { key: 'producto_gratis', label: 'Producto gratuito', type: 'text' as const, placeholder: 'Café gratis, Tapa de bienvenida...', default: '' },
        { key: 'descripcion', label: 'Descripción del regalo', type: 'text' as const, placeholder: 'Tu primer café va por nuestra cuenta', default: '' },
        { key: 'tiempo_validez', label: 'Tiempo de validez (minutos)', type: 'number' as const, placeholder: '15', default: '15' },
        { key: 'instrucciones', label: 'Instrucciones de canje', type: 'text' as const, placeholder: 'Muestra esta pantalla en barra', default: 'Muestra esta pantalla en barra' },
    ],
    traeAmigo: [
        { key: 'premio_referidor', label: 'Premio para quien invita', type: 'text' as const, placeholder: 'Café gratis', default: '' },
        { key: 'premio_invitado', label: 'Premio para el invitado', type: 'text' as const, placeholder: 'Café gratis', default: '' },
        { key: 'mensaje_whatsapp', label: 'Mensaje para WhatsApp', type: 'textarea' as const, placeholder: '¡Te invito a probar el mejor café!', default: '' },
    ],

    // AUTORIDAD schemas
    feedbackIncentivo: [
        { key: 'pregunta_1', label: 'Pregunta 1', type: 'text' as const, placeholder: '¿Cómo fue tu experiencia?', default: '¿Cómo fue tu experiencia?' },
        { key: 'pregunta_2', label: 'Pregunta 2', type: 'text' as const, placeholder: '¿Nos recomendarías?', default: '¿Nos recomendarías?' },
        { key: 'pregunta_3', label: 'Pregunta 3 (opcional)', type: 'text' as const, placeholder: '¿Qué podemos mejorar?', default: '' },
        { key: 'recompensa', label: 'Recompensa por responder', type: 'text' as const, placeholder: '10% descuento en tu próxima visita', default: '' },
        { key: 'codigo_recompensa', label: 'Código del cupón', type: 'text' as const, placeholder: 'GRACIAS10', default: '' },
    ],
    guiaExperto: [
        { key: 'titulo_guia', label: 'Título de la guía', type: 'text' as const, placeholder: 'Los 3 secretos para...', default: '' },
        { key: 'nombre_experto', label: 'Nombre del experto', type: 'text' as const, placeholder: 'Antonio García', default: '' },
        { key: 'cargo_experto', label: 'Cargo o especialidad', type: 'text' as const, placeholder: 'Fundador y Maestro Barista', default: '' },
        { key: 'secreto_1', label: 'Secreto 1', type: 'textarea' as const, placeholder: 'El primer secreto es...', default: '' },
        { key: 'secreto_2', label: 'Secreto 2', type: 'textarea' as const, placeholder: 'El segundo aspecto clave...', default: '' },
        { key: 'secreto_3', label: 'Secreto 3', type: 'textarea' as const, placeholder: 'Por último, no olvides...', default: '' },
        { key: 'producto_cta', label: 'Producto a promocionar', type: 'text' as const, placeholder: 'café de especialidad', default: '' },
    ],
    recomendadoParaTi: [
        { key: 'pregunta_1', label: 'Pregunta 1 (apetito)', type: 'text' as const, placeholder: '¿Cómo tienes el hambre hoy?', default: '¿Cómo tienes el hambre hoy?' },
        { key: 'pregunta_2', label: 'Pregunta 2 (preferencia)', type: 'text' as const, placeholder: '¿Dulce o Salado?', default: '¿Dulce o salado?' },
        { key: 'pregunta_3', label: 'Pregunta 3 (momento)', type: 'text' as const, placeholder: '¿Para comer aquí o para llevar?', default: '¿Para comer aquí o para llevar?' },
        { key: 'producto_estrella', label: 'Producto recomendado', type: 'text' as const, placeholder: 'Tarta de queso artesana', default: '' },
        { key: 'descripcion_match', label: 'Por qué es tu Match Perfecto', type: 'textarea' as const, placeholder: 'Hecha con nata fresca de granja...', default: '' },
        { key: 'precio', label: 'Precio del producto', type: 'text' as const, placeholder: '4.50€', default: '' },
    ],
};

// ─────────────────────────────────────────────────────────────
// STRATEGIC CATEGORIES DATA
// ─────────────────────────────────────────────────────────────

export const STRATEGIC_CATEGORIES: StrategicCategory[] = [
    {
        id: 'VENTAS',
        emoji: '💰',
        title: 'VENTAS',
        tagline: '¡Dinero rápido!',
        description: 'Para locales vacíos o stock parado. Activa ventas inmediatas con ofertas irresistibles.',
        gradient: 'from-amber-500 via-orange-500 to-red-500',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        actions: [
            {
                id: 1,
                name: 'Oferta Flash',
                emoji: '⚡',
                description: 'Promoción con tiempo límite para crear urgencia',
                example: 'Ej: "Solo hoy: Menú completo a 9.90€"',
                configSchema: SCHEMAS.ofertaFlash,
                pageTemplate: 'flash-offer',
            },
            {
                id: 2,
                name: 'Comparador Pro',
                emoji: '⚖️',
                description: 'Tabla comparativa que destaca tu oferta vs la competencia',
                example: 'Ej: "Estándar 49€ vs Oferta Exclusiva 29€"',
                configSchema: SCHEMAS.comparadorPro,
                pageTemplate: 'comparador-pro',
            },
            {
                id: 3,
                name: 'Rasca y Gana',
                emoji: '🎰',
                description: 'Experiencia interactiva de rascar para descubrir premios',
                example: 'Ej: "Rasca con el dedo y descubre tu descuento"',
                configSchema: SCHEMAS.rascaGana,
                pageTemplate: 'scratch-card',
            },
        ],
    },
    {
        id: 'FIDELIZACION',
        emoji: '🤝',
        title: 'FIDELIZACIÓN',
        tagline: '¡Que vuelvan!',
        description: 'Para que el turista o vecino repita visita. Construye relaciones duraderas con incentivos.',
        gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        actions: [
            {
                id: 4,
                name: 'Rachas de Visita',
                emoji: '🔥',
                description: 'Sistema de rachas que premia la constancia semanal',
                example: 'Ej: "7 días seguidos = Café gratis"',
                configSchema: SCHEMAS.rachasVisita,
                pageTemplate: 'visit-streak',
            },
            {
                id: 5,
                name: 'Producto Gancho',
                emoji: '🎁',
                description: 'Regalo gratuito a cambio de datos de contacto',
                example: 'Ej: "Café gratis a cambio de tu email"',
                configSchema: SCHEMAS.productoGancho,
                pageTemplate: 'lead-magnet',
            },
            {
                id: 6,
                name: 'Trae a un Amigo',
                emoji: '👫',
                description: 'Programa viral de referidos con doble beneficio',
                example: 'Ej: "Gana un café para ti y otro para tu amigo"',
                configSchema: SCHEMAS.traeAmigo,
                pageTemplate: 'referral',
            },
        ],
    },
    {
        id: 'AUTORIDAD',
        emoji: '🏆',
        title: 'AUTORIDAD',
        tagline: '¡Soy el mejor!',
        description: 'Para justificar precios y ganar confianza. Demuestra tu expertise y credibilidad.',
        gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
        glowColor: 'rgba(139, 92, 246, 0.4)',
        actions: [
            {
                id: 7,
                name: 'Feedback + Incentivo',
                emoji: '📝',
                description: 'Encuesta rápida con recompensa al completar',
                example: 'Ej: "Responde 3 preguntas y gana 10% dto"',
                configSchema: SCHEMAS.feedbackIncentivo,
                pageTemplate: 'feedback-survey',
            },
            {
                id: 8,
                name: 'Guía del Experto',
                emoji: '📚',
                description: 'Contenido editorial tipo revista que demuestra autoridad',
                example: 'Ej: "Los 3 secretos para el café perfecto"',
                configSchema: SCHEMAS.guiaExperto,
                pageTemplate: 'expert-guide',
            },
            {
                id: 9,
                name: 'Recomendado para Ti',
                emoji: '🎯',
                description: 'Quiz visual que recomienda el producto ideal',
                example: 'Ej: "Descubre tu café perfecto en 3 preguntas"',
                configSchema: SCHEMAS.recomendadoParaTi,
                pageTemplate: 'recommendation',
            },
        ],
    },
];

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

export function getCategoryById(id: StrategicCategoryId): StrategicCategory | undefined {
    return STRATEGIC_CATEGORIES.find(cat => cat.id === id);
}

export function getActionById(actionId: number): StrategicAction | undefined {
    for (const category of STRATEGIC_CATEGORIES) {
        const action = category.actions.find(a => a.id === actionId);
        if (action) return action;
    }
    return undefined;
}

export function getCategoryForAction(actionId: number): StrategicCategory | undefined {
    return STRATEGIC_CATEGORIES.find(cat =>
        cat.actions.some(a => a.id === actionId)
    );
}
