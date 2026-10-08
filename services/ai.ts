import type { AdnMarca, DatosEscaparate } from "@/lib/estado/tipos-estado";

export class AISignInRequired extends Error {}
export class AIQuotaNotice extends Error {}
export function identidadManual(): AdnMarca {
    return {
        paletaColores: { primario:'#000000', secundario:'#333333', acento:'#c9a45c', fondo:'#FFFFFF', superficieGlass:'rgba(0,0,0,0.1)' },
        estiloTipografico:'SANS_GEOMETRICA', ambiente:'Edición manual',
        analisisMarketing:'Completa el nombre y los datos de tu negocio. Puedes crear tu escaparate sin usar IA.',
        logoExtraido:null, publicoObjetivo:'', contextoMercado:'', confianza:0,
        analisisVision: {nombreSugerido:'Mi inmobiliaria',categoriaSugerida:'Inmobiliaria',paletaColores:{primario:'#000000',secundario:'#333333',acento:'#c9a45c',fondo:'#FFFFFF',primarioHSL:'0 0% 0%',secundarioHSL:'0 0% 20%'},objetosDetectados:[],confianzaAnalisis:0,logoDetectado:false,logoCreationRequired:true}
    };
}

export const AIService = {
    analizarImagen: async (imagenBase64: string): Promise<AdnMarca> => {
        try {
            const response = await fetch("/api/analizar-fachada", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'x-request-id': crypto.randomUUID() },
                body: JSON.stringify({ image: imagenBase64 }),
            });

            if (!response.ok) {
                if (response.status === 401) throw new AISignInRequired('Inicia sesión para usar la IA.');
                const errorData = await response.json().catch(() => ({}));
                if (['AI_QUOTA','AI_RETRY'].includes(errorData.code)) throw new AIQuotaNotice(errorData.error);
                const detalle = errorData.detalle || errorData.error || `HTTP ${response.status}`;
                throw new Error(`Error de API: ${detalle}`);
            }

            return await response.json();

        } catch (error) {
            if (error instanceof AISignInRequired) throw error;
            if (error instanceof AIQuotaNotice) throw error;
            console.error("Error en Servicio AI:", error);
            return {
                paletaColores: {
                    primario: "#000000",
                    secundario: "#333333",
                    acento: "#FF0000",
                    fondo: "#FFFFFF",
                    superficieGlass: "rgba(0,0,0,0.1)"
                },
                estiloTipografico: "SANS_GEOMETRICA",
                ambiente: "Edición manual",
                analisisMarketing: "La IA no está disponible. Completa el nombre y la categoría para crear tu escaparate con las mismas plantillas.",
                logoExtraido: null,
                publicoObjetivo: "Desconocido",
                contextoMercado: "Sin datos",
                analisisVision: {nombreSugerido:'Mi inmobiliaria',categoriaSugerida:'Inmobiliaria',paletaColores:{primario:'#000000',secundario:'#333333',acento:'#c9a45c',fondo:'#FFFFFF',primarioHSL:'0 0% 0%',secundarioHSL:'0 0% 20%'},objetosDetectados:[],confianzaAnalisis:0,logoDetectado:false,logoCreationRequired:true},
                confianza: 0
            };
        }
    },

    generarEscaparate: async (adn: AdnMarca): Promise<DatosEscaparate> => {
        const nombre = adn.analisisVision?.nombreSugerido || "Tu Inmobiliaria";
        const categoria = adn.analisisVision?.categoriaSugerida || "Servicios";
        const servicios = adn.inteligenciaMarketing?.serviciosDetectados || [];
        const gap = adn.inteligenciaMarketing?.gapDeMercado || "";
        const arquetipoRaw = adn.inteligenciaMarketing?.arquetipoMarca || "El Explorador";

        let estrategia: AdnMarca['estrategiaPrincipal'] = 'CITA_PREVIA';

        if (adn.estrategiaConversion?.confirmadaEn) {
            estrategia = adn.estrategiaConversion.objetivo === 'CITAS' ? 'CITA_PREVIA' : 'LEAD_MAGNET';
        }

        // Generar titulares basados en el arquetipo
        const titular = { principal: nombre, sub: `${categoria} · Conoce nuestra agencia y contacta con nuestro equipo.` };

        // Generar ofertas desde servicios detectados
        const ofertas = servicios.length > 0
            ? servicios.slice(0, 3).map((s) => ({
                titulo: s,
                precio: "Consultar",
                descripcion: `${s} profesional con los mejores estándares.`
            }))
            : [];

        // Generar secciones dinámicas
        const secciones = [
            {
                id: "hero-pro",
                tipo: "Hero" as const,
                variante: "Glass" as const,
                contenido: {
                    titulo: titular.principal,
                    descripcion: titular.sub,
                    cta: { texto: "Descubrir Más", accion: "#catalogo" }
                }
            },
            {
                id: "bento-valor",
                tipo: "Bento" as const,
                variante: "Glass" as const,
                contenido: {
                    titulo: "Propuesta de Valor",
                    elementos: servicios.map((s, i) => ({ id: `sv-${i}`, titulo: s, descripcion: gap || "Consulta los detalles con nuestro equipo." }))
                }
            },
            {
                id: "conversion-core",
                tipo: "Conversion" as const,
                variante: "Glass" as const,
                contenido: {
                    titulo: "Contacta con Nosotros",
                    cta: {
                        texto: adn.estrategiaConversion?.cta || 'Contactar con la agencia',
                        accion: "#contacto"
                    }
                }
            }
        ];

        // Actualizar la estrategia en el ADN (side effect controlado)
        // Esto se hará en el store al completar análisis

        const escaparate: DatosEscaparate = {
            titularPrincipal: titular.principal,
            subtitulo: titular.sub,
            disenoSeleccionado: "heroe-centrado",
            ofertas,
            secciones,
            datosSugeridos: {
                titularPrincipal: titular.principal,
                subtitulo: titular.sub,
                descripcionValor: adn.analisisMarketing || gap || "",
                ctaPrincipal: adn.estrategiaConversion?.cta || 'Contactar con la agencia',
                horario: "",
                telefono: "",
            }
        };

        return escaparate;
    },
};

