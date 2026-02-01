import {
    AdnMarca,
    SeccionEscaparate,
    TipoSeccion,
    VarianteSeccion,
    ContenidoSeccion
} from "@/lib/estado/tipos-estado";

/**
 * MOTOR DE ESTRUCTURA GENERATIVA - FASE 3
 * Version: 2.3.1
 * Estandar: Elite_Marketing_2026
 */

export const SEMILLA_MOTOR = {
    version: "2.3.1",
    fase: 3,
    bloque: "1A_Motor_Logico",
    estandar: "Elite_Marketing_2026"
};

type TipoNegocio = 'Alimentacion' | 'Servicios' | 'Salud' | 'Moda' | 'Generico';

export class MotorEstructura {

    /**
     * Traduce el ADN de marca en un esquema de 5+ secciones de alta conversión.
     */
    static generarEstructuraPrincipal(adn: AdnMarca): SeccionEscaparate[] {
        const secciones: SeccionEscaparate[] = [];
        const tipoNegocio = this.detectarTipoNegocio(adn);

        // 1. HERO SECTION (Obligatoria)
        secciones.push(this.crearSeccion(
            'hero_main',
            'Hero',
            'Glass',
            this.generarCopyHero(adn, tipoNegocio)
        ));

        // 2. GROWTH/OFFER SECTION (Estrategica)
        const accionGrowth = this.generarAccionGrowth(tipoNegocio);
        secciones.push(this.crearSeccion(
            'growth_trigger',
            'Promo',
            'Gradient',
            {
                titulo: accionGrowth.titulo,
                descripcion: accionGrowth.descripcion,
                cta: { texto: accionGrowth.cta, accion: '#offer' }
            }
        ));

        // 3. CATALOG/SERVICES (Core)
        secciones.push(this.crearSeccion(
            'catalog_core',
            'Catalog',
            'Mesh', // Variante Mesh para productos
            {
                titulo: tipoNegocio === 'Servicios' || tipoNegocio === 'Salud' ? 'Nuestros Servicios' : 'Colección Destacada',
                descripcion: `Explora lo mejor de ${adn.ambiente || 'nuestra selección'}.`
            }
        ));

        // 4. SOCIAL PROOF / INFO (Confianza)
        secciones.push(this.crearSeccion(
            'social_proof',
            'Social',
            'Glass',
            {
                titulo: 'Lo que dicen nuestros clientes',
                descripcion: 'Experiencias reales, satisfacción garantizada.',
                cta: { texto: 'Ver más reseñas', accion: '#reviews' }
            }
        ));

        // 5. FINAL CTA / INFO (Cierre)
        secciones.push(this.crearSeccion(
            'final_action',
            'Info',
            'Gradient',
            {
                titulo: '¿Listo para empezar?',
                descripcion: adn.analisisMarketing || 'Visítanos hoy mismo.',
                cta: { texto: 'Contactar Ahora', accion: '#contact' }
            }
        ));

        // Lógica de Densidad: Relleno si falta "carne"
        if (secciones.length < 5) {
            // Esto no debería pasar con la lógica imperativa arriba, 
            // pero si fuera dinámica, aquí inyectaríamos más.
        }

        // Si el ADN tiene confianza baja, inyectamos secciones inventadas coherentes
        if (adn.confianza < 50) {
            secciones.splice(3, 0, this.crearSeccion(
                'ai_generated_feature',
                'Info',
                'Mesh',
                {
                    titulo: 'Innovación y Calidad',
                    descripcion: 'Descubre por qué somos referentes en el sector.',
                }
            ));
        }

        return secciones;
    }

    /**
     * Detecta categoría de negocio basada en el ADN (simple heurística para demo).
     */
    private static detectarTipoNegocio(adn: AdnMarca): TipoNegocio {
        const textoAnalisis = (adn.analisisMarketing + adn.contextoMercado).toLowerCase();

        if (textoAnalisis.includes('comida') || textoAnalisis.includes('restaurante') || textoAnalisis.includes('café')) return 'Alimentacion';
        if (textoAnalisis.includes('dental') || textoAnalisis.includes('clinica') || textoAnalisis.includes('salud') || textoAnalisis.includes('medico')) return 'Salud';
        if (textoAnalisis.includes('ropa') || textoAnalisis.includes('moda') || textoAnalisis.includes('boutique')) return 'Moda';
        if (textoAnalisis.includes('lavanderia') || textoAnalisis.includes('taller') || textoAnalisis.includes('servicio')) return 'Servicios';

        return 'Generico';
    }

    private static crearSeccion(id: string, tipo: TipoSeccion, variante: VarianteSeccion, contenido: ContenidoSeccion): SeccionEscaparate {
        return { id, tipo, variante, contenido };
    }

    private static generarCopyHero(adn: AdnMarca, tipo: TipoNegocio): ContenidoSeccion {
        // Copywriting Generativo Básico
        const base = adn.ambiente ? `Experiencia ${adn.ambiente}` : 'Calidad Superior';

        const titulos: Record<string, string> = {
            'Alimentacion': `Sabor que despierta tus sentidos. ${base}.`,
            'Salud': `Tu bienestar, nuestra prioridad. ${base}.`,
            'Moda': `Estilo que define quién eres. ${base}.`,
            'Servicios': `Soluciones impecables para tu día a día.`,
            'Generico': `Excelencia y compromiso en cada detalle.`
        };

        return {
            titulo: titulos[tipo as string] || titulos['Generico'],
            descripcion: adn.publicoObjetivo || 'Pensado exclusivamente para ti.',
            cta: { texto: 'Descubrir Más', accion: '#main' }
        };
    }

    /**
     * PARTE B: GROWTH HACKING
     */
    static generarAccionGrowth(tipo: TipoNegocio): { titulo: string; descripcion: string; cta: string } {
        switch (tipo) {
            case 'Alimentacion':
                return {
                    titulo: 'Oferta exclusiva: Solo hoy 2x1',
                    descripcion: 'Date un gusto, nosotros invitamos al segundo.',
                    cta: 'Pedir Ahora'
                };
            case 'Servicios': // Ejemplo: Lavandería
                return {
                    titulo: 'Tu plan mensual de ahorro',
                    descripcion: 'Olvídate de las tareas pesadas con nuestra suscripción.',
                    cta: 'Ver Planes'
                };
            case 'Salud': // Ejemplo: Dentista
            case 'Moda':
                return {
                    titulo: 'Únete al club y obtén regalo',
                    descripcion: 'Tu primera visita tiene premio exclusivo.',
                    cta: 'Unirme al Club'
                };
            default:
                return {
                    titulo: 'Descuento de Bienvenida',
                    descripcion: 'Aprovecha un 10% off en tu primer pedido.',
                    cta: 'Obtener Cupón'
                };
        }
    }

    /**
     * Lógica de Mutación: Regenerar con nuevo ángulo de venta.
     */
    static regenerar(seccionesActuales: SeccionEscaparate[], angulo: 'Precio' | 'Calidad' | 'Exclusividad'): SeccionEscaparate[] {
        // Clonamos para mutar
        let nuevasSecciones = [...seccionesActuales];

        // Mutamos textos del Hero y orden basado en ángulo
        const heroIndex = nuevasSecciones.findIndex(s => s.tipo === 'Hero');
        if (heroIndex !== -1) {
            const hero = nuevasSecciones[heroIndex];
            if (angulo === 'Precio') {
                hero.contenido.titulo = 'Precios imbatibles, la mejor calidad.';
            } else if (angulo === 'Calidad') {
                hero.contenido.titulo = 'Excelencia certificada en cada detalle.';
            } else if (angulo === 'Exclusividad') {
                hero.contenido.titulo = 'Solo para quienes exigen lo mejor.';
            }
            nuevasSecciones[heroIndex] = hero;
        }

        // Reordenamiento simple para demo: Si es Precio, Promo va segundo. Si es Exclusividad, Catalog va segundo.
        const promoIndex = nuevasSecciones.findIndex(s => s.tipo === 'Promo');
        const catalogIndex = nuevasSecciones.findIndex(s => s.tipo === 'Catalog');

        if (promoIndex !== -1 && catalogIndex !== -1) {
            // Quitamos
            const promo = nuevasSecciones.splice(promoIndex, 1)[0];
            const catalog = nuevasSecciones.splice(catalogIndex > promoIndex ? catalogIndex - 1 : catalogIndex, 1)[0];

            // Reinsertamos según lógica
            // Nota: Indices son aproximados ya que splice modifica array. 
            // Simplificación: Reconstruir array básico
            const otros = nuevasSecciones.filter(s => s.id !== 'hero_main' && s.id !== 'final_action' && s.id !== 'social_proof');

            // Estructura fija mutada:
            const newOrder = [nuevasSecciones.find(s => s.tipo === 'Hero')!];

            if (angulo === 'Precio') {
                newOrder.push(promo); // Promo arriba
                newOrder.push(catalog);
            } else {
                newOrder.push(catalog); // Catalogo arriba (Calidad/Exclusividad)
                newOrder.push(promo);
            }

            // Rellenar resto
            // Esta lógica es simplificada para cumplir el requerimiento de "reordenar"
            const resto = seccionesActuales.filter(s => !newOrder.includes(s));
            nuevasSecciones = [...newOrder, ...resto];
        }

        return nuevasSecciones;
    }
}
