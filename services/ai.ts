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
                throw new Error("Fallo en la respuesta de la API");
            }

            return await response.json();

        } catch (error) {
            console.error("Error en Servicio AI:", error);
            // Fallback en caso de error extremo
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
        // Generar datos basados en el ADN
        return {
            titularPrincipal: "Tu Negocio, Reinventado",
            subtitulo: `Diseño generado basado en estilo ${adn.ambiente}`,
            disenoSeleccionado: "heroe-centrado",
            ofertas: [
                { titulo: "Producto Estrella", precio: "$99.99", descripcion: "Lo mejor de tu catálogo" },
                { titulo: "Servicio Premium", precio: "$149.00", descripcion: "Experiencia completa" }
            ]
        };
    },
};
