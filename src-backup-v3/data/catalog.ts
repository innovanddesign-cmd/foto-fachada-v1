
// NIVEL 1: BÁSICAS (Estáticas / JS Cliente / Sin Backend complejo)
// Se incluyen en el Plan BASE (y superiores)
export const BASIC_FEATURES = {
    "roulette_promo": "Ruleta de descuentos (Probabilidad en JS)",
    "digital_menu": "Carta digital interactiva/PDF",
    "social_wall": "Muro de últimas fotos Instagram/Google",
    "event_countdown": "Cuenta atrás para próximo evento",
    "community_poll": "Votación simple (LocalStorage)",
    "music_playlist": "Embed de Spotify/Youtube",
    "whatsapp_direct": "Botón flotante de contacto directo",
    "photo_gallery": "Galería inmersiva tipo Stories"
} as const;

// NIVEL 2: PREMIUM (Dinámicas / Requieren DB / Auth Usuarios)
// Se incluyen en Plan PLUS (1 Premium) y PRO (3 Premium)
export const PREMIUM_FEATURES = {
    "loyalty_system": "Sistema de Puntos y Recompensas (Login Clientes)",
    "smart_bookings": "Gestión de Citas y Calendario Real",
    "order_delivery": "Pedidos a mesa o domicilio (Carrito + Estado)"
} as const;

export type BasicFeatureId = keyof typeof BASIC_FEATURES;
export type PremiumFeatureId = keyof typeof PREMIUM_FEATURES;

export const PLAN_LIMITS = {
    BASE: {
        max_campaigns: 1,
        max_basic: 3,
        max_premium: 0,
        price: "100€/año"
    },
    PLUS: {
        max_campaigns: 3,
        max_basic: 5,
        max_premium: 1,
        price: "29€/mes" // Keeping previous pricing for consistency or should I switch? User said 'PLUS 5 basica 1 premium 3 campañas'. The prompt said 'PLUS 5 funcionalidades básicas 1 funcionalidad premium / año 3 campañas / año'. Let's stick to the limits logic.
    },
    PRO: {
        max_campaigns: 5,
        max_basic: 5,
        max_premium: 3,
        price: "PRO"
    }
} as const;
