/**
 * Link Content Generator Service
 * Generates meaningful URLs and content pages for each link/button
 */

import type { LandingLink, BrandData } from '../types';

/**
 * Generates a content URL for a specific link based on its type and description
 */
export function generateLinkContentUrl(link: LandingLink, brandData: BrandData): string {
    const isDev = import.meta.env.DEV;
    const protocol = isDev ? 'http' : 'https';
    const domain = isDev ? 'localhost:3000' : 'foto-fachada-v1.vercel.app';
    const brandSlug = brandData.name.toLowerCase().replace(/\s+/g, '-');
    const linkSlug = link.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    // Generate specific URLs based on link type
    switch (link.type) {
        case 'menu':
            return `${protocol}://${domain}/menu/${brandSlug}`;

        case 'reservation':
        case 'contact':
            return `${protocol}://${domain}/reservas/${brandSlug}`;

        case 'social':
            // If it's Instagram/Facebook, link directly to social media
            if (brandData.instagram && link.name.toLowerCase().includes('instagram')) {
                return `https://instagram.com/${brandData.instagram.replace('@', '')}`;
            }
            if (brandData.facebook && link.name.toLowerCase().includes('facebook')) {
                return `https://facebook.com/${brandData.facebook}`;
            }
            if (brandData.whatsapp && link.name.toLowerCase().includes('whatsapp')) {
                const phone = brandData.whatsapp.replace(/\D/g, '');
                return `https://wa.me/${phone}`;
            }
            return `${protocol}://${domain}/social/${brandSlug}`;

        case 'gamification':
            return `${protocol}://${domain}/juego/${brandSlug}/${linkSlug}`;

        case 'promo':
            return `${protocol}://${domain}/ofertas/${brandSlug}/${linkSlug}`;

        case 'info':
            return `${protocol}://${domain}/info/${brandSlug}/${linkSlug}`;

        default:
            return `${protocol}://${domain}/link/${brandSlug}/${linkSlug}`;
    }
}

/**
 * Enriches links with generated URLs
 */
export function enrichLinksWithUrls(links: LandingLink[], brandData: BrandData): LandingLink[] {
    return links.map(link => ({
        ...link,
        url: link.url || generateLinkContentUrl(link, brandData)
    }));
}

/**
 * Generates complete page content for a link (for future implementation)
 * This will be used to create actual landing pages for each button
 */
export interface LinkPageContent {
    link: LandingLink;
    url: string;
    pageTitle: string;
    pageDescription: string;
    content: {
        headline: string;
        subheadline: string;
        cta: string;
        features: string[];
    };
}

export function generateLinkPageContent(link: LandingLink, brandData: BrandData): LinkPageContent {
    const url = link.url || generateLinkContentUrl(link, brandData);

    // Content templates based on link type
    const contentTemplates: Record<LandingLink['type'], Partial<LinkPageContent['content']>> = {
        menu: {
            headline: `Menú de ${brandData.name}`,
            subheadline: 'Descubre nuestra deliciosa selección',
            cta: 'Ver Menú Completo',
            features: ['Platos del día', 'Especialidades', 'Bebidas', 'Postres']
        },
        reservation: {
            headline: `Reserva en ${brandData.name}`,
            subheadline: 'Asegura tu mesa en minutos',
            cta: 'Reservar Ahora',
            features: ['Confirmación instantánea', 'Elige tu horario', 'Mesas disponibles', 'Sin compromiso']
        },
        contact: {
            headline: `Contacta con ${brandData.name}`,
            subheadline: 'Estamos aquí para ayudarte',
            cta: 'Enviar Mensaje',
            features: ['Respuesta rápida', 'Atención personalizada', 'Consultas y sugerencias']
        },
        social: {
            headline: `Síguenos en redes`,
            subheadline: `Mantente al día con ${brandData.name}`,
            cta: 'Seguir',
            features: ['Ofertas exclusivas', 'Eventos especiales', 'Contenido único', 'Comunidad activa']
        },
        gamification: {
            headline: link.name,
            subheadline: link.description,
            cta: '¡Jugar Ahora!',
            features: ['Diversión garantizada', 'Premios increíbles', 'Fácil de participar', 'Comparte con amigos']
        },
        promo: {
            headline: link.name,
            subheadline: `Oferta exclusiva de ${brandData.name}`,
            cta: 'Aprovechar Oferta',
            features: ['Oferta limitada', 'Ahorra ahora', 'Sin letra pequeña', 'Fácil de canjear']
        },
        info: {
            headline: link.name,
            subheadline: link.description,
            cta: 'Más Información',
            features: ['Detalles completos', 'Preguntas frecuentes', 'Guías útiles']
        }
    };

    const content = contentTemplates[link.type] || {
        headline: link.name,
        subheadline: link.description,
        cta: 'Ver Más',
        features: []
    };

    return {
        link,
        url,
        pageTitle: `${link.name} - ${brandData.name}`,
        pageDescription: link.description,
        content: content as LinkPageContent['content']
    };
}
