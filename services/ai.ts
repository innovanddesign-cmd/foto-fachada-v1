import type { AdnMarca, DatosEscaparate } from "@/lib/estado/tipos-estado";

export class AISignInRequired extends Error {}
export class AIQuotaNotice extends Error {}
export function identidadManual(): AdnMarca {
    return {
        paletaColores: { primario:'#000000', secundario:'#333333', acento:'#c9a45c', fondo:'#FFFFFF', superficieGlass:'rgba(0,0,0,0.1)' },
        estiloTipografico:'SANS_GEOMETRICA', ambiente:'Edición manual',
        analisisMarketing:'Completa el nombre y los datos de tu negocio. Puedes crear tu escaparate sin usar IA.',
        logoExtraido:null, publicoObjetivo:'', contextoMercado:'', confianza:0,
        analisisVision: {nombreSugerido:'Mi negocio',categoriaSugerida:'Negocio local',paletaColores:{primario:'#000000',secundario:'#333333',acento:'#c9a45c',fondo:'#FFFFFF',primarioHSL:'0 0% 0%',secundarioHSL:'0 0% 20%'},objetosDetectados:[],confianzaAnalisis:0,logoDetectado:false,logoCreationRequired:true}
    };
}

export const AIService = {
    analizarImagen: async (imagenBase64: string, expectedCost?: number, campaignId?: string, initial=false, sectorBrief?: import('@/lib/marketing/sectors').SectorBrief): Promise<AdnMarca> => {
        try {
            const response = await fetch("/api/analizar-fachada", {
                method: "POST",
                headers: { "Content-Type": "application/json", 'x-request-id': crypto.randomUUID(), ...(expectedCost!==undefined ? {'x-ai-expected-cost': String(expectedCost)} : {}), ...(campaignId?{'x-ai-campaign-id':campaignId}:{}),'x-ai-initial':String(initial) },
                body: JSON.stringify({ image: imagenBase64, sectorBrief }),
            });

            if (!response.ok) {
                if (response.status === 401) throw new AISignInRequired('Inicia sesión para usar la IA.');
                const errorData = await response.json().catch(() => ({}));
                if (['AI_QUOTA','AI_RETRY','AI_UNAVAILABLE','AI_PRICE_CONFIRMATION_REQUIRED'].includes(errorData.code)) throw new AIQuotaNotice(errorData.error);
                const detalle = errorData.detalle || errorData.error || `HTTP ${response.status}`;
                throw new Error(`Error de API: ${detalle}`);
            }

            return await response.json();

        } catch (error) {
            if (error instanceof AISignInRequired) throw error;
            if (error instanceof AIQuotaNotice) throw error;
            // A failed request must not look like a successful AI analysis.
            // Manual creation is an explicit user choice in AnalizadorADN.
            throw new Error('No se pudo completar el análisis. Vuelve a intentarlo o continúa sin IA.');
        }
    },

    generarEscaparate: async (adn: AdnMarca): Promise<DatosEscaparate> => {
        const nombre = adn.analisisVision?.nombreSugerido || "Tu negocio";
        const categoria = adn.analisisVision?.categoriaSugerida || "Servicios";
        const servicios = adn.sectorBrief?.services ? adn.sectorBrief.services.split(/[;\n]+/).map(x=>x.trim()).filter(Boolean).reduce<string[]>((items, part) => { if (items.length && /^(duraci[oó]n\b|incluye\b|precio\b)/i.test(part)) items[items.length - 1] += '. ' + part; else items.push(part); return items; }, []) : adn.inteligenciaMarketing?.serviciosDetectados || [];
        const gap = adn.inteligenciaMarketing?.gapDeMercado || "";
        const arquetipoRaw = adn.inteligenciaMarketing?.arquetipoMarca || "El Explorador";

        let estrategia: AdnMarca['estrategiaPrincipal'] = 'CITA_PREVIA';

        if (adn.estrategiaConversion?.confirmadaEn) {
            estrategia = adn.estrategiaConversion.objetivo === 'CITAS' ? 'CITA_PREVIA' : 'LEAD_MAGNET';
        }

        // Generar titulares basados en el arquetipo
        const titular = { principal: adn.propuestaInicial?.titulo || nombre, sub: adn.propuestaInicial?.descripcion || adn.sectorBrief?.services || `${categoria} · Conoce nuestro negocio y contacta con nuestro equipo.` };

        // Generar ofertas desde servicios detectados
        const ofertas = servicios.length > 0
            ? servicios.slice(0, 3).map((s) => ({
                titulo: s,
                precio: "",
                descripcion: ""
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
                    cta: { texto: adn.estrategiaConversion?.cta || 'Consultar', accion: '#contacto' }
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
                        texto: adn.estrategiaConversion?.cta || 'Contactar con el negocio',
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
            disenoSeleccionado: (adn.propuestaInicial?.layout || "heroe-centrado") as DatosEscaparate['disenoSeleccionado'],
            ofertas,
            datosReales: adn.sectorBrief ? {descripcionValor:[titular.sub,adn.sectorBrief.propertyPrice,adn.sectorBrief.incentiveApproved?adn.sectorBrief.offer:''].filter(Boolean).join(' · ')} : undefined,
            secciones: [...secciones,...(adn.propuestaInicial?.secciones||[]).filter(section=>!adn.sectorBrief?.availability||!/(horarios|franjas|disponibilidad)/i.test(section.titulo)).map((section,index)=>({id:'campaign-info-'+index,tipo:'Info' as const,variante:'Glass' as const,contenido:{titulo:section.titulo,descripcion:section.texto}})),...(adn.sectorBrief?.availability?[{id:'campaign-availability',tipo:'Info' as const,variante:'Glass' as const,contenido:{titulo:'Consulta estos horarios',descripcion:adn.sectorBrief.availability+' · La cita queda pendiente de confirmación por el negocio.'}}]:[]),...(adn.sectorBrief?.incentiveApproved&&adn.sectorBrief.offer?[{id:'campaign-conditions',tipo:'Promo' as const,variante:'Glass' as const,contenido:{titulo:'Condiciones de la campaña',descripcion:[adn.sectorBrief.offer,adn.sectorBrief.startDate&&adn.sectorBrief.endDate?`Del ${adn.sectorBrief.startDate} al ${adn.sectorBrief.endDate}`:'',adn.sectorBrief.capacity?`${adn.sectorBrief.capacity} unidades o plazas. Confirma disponibilidad con el negocio.`:''].filter(Boolean).join(' · ')}}]:[])],
            datosSugeridos: {
                titularPrincipal: titular.principal,
                subtitulo: titular.sub,
                descripcionValor: adn.propuestaInicial?.descripcion || "",
                ctaPrincipal: adn.estrategiaConversion?.cta || 'Contactar con el negocio',
                horario: "",
                telefono: "",
            }
        };

        return escaparate;
    },
};

