import type { AdnMarca, DatosEscaparate } from "@/lib/estado/tipos-estado";

export const AIService = {
    analizarImagen: async (imagenBase64: string): Promise<AdnMarca> => {
        try {
            const response = await fetch("/api/analizar-fachada", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: imagenBase64 }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const detalle = errorData.detalle || errorData.error || `HTTP ${response.status}`;
                throw new Error(`Error de API: ${detalle}`);
            }

            return await response.json();

        } catch (error) {
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
                ambiente: "Error Fallback",
                analisisMarketing: "No se pudo conectar con el motor de IA. Por favor verifica tu conexión o API Key.",
                logoExtraido: null,
                publicoObjetivo: "Desconocido",
                contextoMercado: "Sin datos",
                confianza: 0
            };
        }
    },

    generarEscaparate: async (adn: AdnMarca): Promise<DatosEscaparate> => {
        const nombre = adn.analisisVision?.nombreSugerido || "Tu Negocio";
        const categoria = adn.analisisVision?.categoriaSugerida || "Servicios";
        const servicios = adn.inteligenciaMarketing?.serviciosDetectados || [];
        const gap = adn.inteligenciaMarketing?.gapDeMercado || "";
        const arquetipoRaw = adn.inteligenciaMarketing?.arquetipoMarca || "El Explorador";

        // Determinar estrategia de conversión basada en categoría
        const categoriaLower = categoria.toLowerCase();
        let estrategia: AdnMarca['estrategiaPrincipal'] = 'LEAD_MAGNET';
        if (categoriaLower.includes('restaurante') || categoriaLower.includes('gastro') || categoriaLower.includes('café') || categoriaLower.includes('bar')) {
            estrategia = 'OFERTA_FLASH';
        } else if (categoriaLower.includes('peluquer') || categoriaLower.includes('salud') || categoriaLower.includes('clínica') || categoriaLower.includes('dentista')) {
            estrategia = 'CITA_PREVIA';
        }

        // Generar titulares basados en el arquetipo
        const titulares: Record<string, { principal: string; sub: string }> = {
            'El Rebelde': { principal: `${nombre}: Rompemos las Reglas`, sub: "La experiencia que otros no se atreven a ofrecer." },
            'El Cuidador': { principal: `${nombre} Cuida de Ti`, sub: "Tu bienestar es nuestra razón de ser." },
            'El Sabio': { principal: `Confía en la Experiencia de ${nombre}`, sub: "Conocimiento que marca la diferencia." },
            'El Mago': { principal: `${nombre}: Donde Ocurre la Magia`, sub: "Transformamos lo ordinario en extraordinario." },
            'El Héroe': { principal: `${nombre}: Supera Tus Límites`, sub: "Aquí empieza tu transformación." },
            'El Explorador': { principal: `Descubre ${nombre}`, sub: "Una nueva forma de vivir la experiencia." },
            'El Creador': { principal: `${nombre}: Arte en Cada Detalle`, sub: "Diseñado para quienes aprecian lo diferente." },
            'El Inocente': { principal: `${nombre}: Sencillamente Perfecto`, sub: "La pureza en su máxima expresión." },
        };

        const titular = titulares[arquetipoRaw] || { principal: `Bienvenido a ${nombre}`, sub: `${categoria} de excelencia en tu zona.` };

        // Generar ofertas desde servicios detectados
        const ofertas = servicios.length > 0
            ? servicios.slice(0, 3).map((s, i) => ({
                titulo: s,
                precio: i === 0 ? "Consultar" : `Desde €${(15 + i * 10).toFixed(0)}`,
                descripcion: `${s} profesional con los mejores estándares.`
            }))
            : [
                { titulo: "Servicio Destacado", precio: "Consultar", descripcion: "Nuestro servicio más solicitado." },
                { titulo: "Pack Premium", precio: "Desde €49", descripcion: "La experiencia completa." }
            ];

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
                    elementos: servicios.map((s, i) => ({ id: `sv-${i}`, titulo: s, descripcion: gap || "Excelencia garantizada." }))
                }
            },
            {
                id: "conversion-core",
                tipo: "Conversion" as const,
                variante: "Glass" as const,
                contenido: {
                    titulo: "Contacta con Nosotros",
                    cta: {
                        texto: estrategia === 'CITA_PREVIA' ? 'Reservar Cita' : estrategia === 'OFERTA_FLASH' ? 'Ver Oferta' : 'Contactar',
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
                descripcionValor: gap || `${categoria} de referencia.`,
                ctaPrincipal: estrategia === 'CITA_PREVIA' ? 'Reservar Cita' : estrategia === 'OFERTA_FLASH' ? 'Ver Oferta' : 'Contactar Ahora',
                horario: "Lunes a Sábado: 09:00 - 20:00",
                telefono: "",
            }
        };

        return escaparate;
    },
};
