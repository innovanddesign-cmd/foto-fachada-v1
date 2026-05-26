import { NextResponse } from "next/server";

/** Detecta el mimeType real desde el header del data URL */
function detectarMimeType(base64ConHeader: string): string {
    if (base64ConHeader.startsWith("data:")) {
        const match = base64ConHeader.match(/^data:([^;]+);base64,/);
        if (match) return match[1];
    }
    if (base64ConHeader.startsWith("/9j/")) return "image/jpeg";
    if (base64ConHeader.startsWith("iVBORw")) return "image/png";
    if (base64ConHeader.startsWith("UklGR")) return "image/webp";
    return "image/jpeg";
}

/** Llama a Gemini REST API v1 directamente (evita limitaciones del SDK v1beta) */
async function llamarGeminiREST(apiKey: string, modelo: string, base64Data: string, mimeType: string, prompt: string) {
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelo}:generateContent?key=${apiKey}`;

    const body = {
        contents: [{
            parts: [
                { inline_data: { mime_type: mimeType, data: base64Data } },
                { text: prompt }
            ]
        }],
        generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`[${response.status}] ${errorBody}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Respuesta vacía del modelo");
    return text;
}

export async function POST(req: Request) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "API Key no configurada. Añade GEMINI_API_KEY en tu archivo .env" },
            { status: 500 }
        );
    }

    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const mimeType = detectarMimeType(image);
        const base64Data = image.includes(",") ? image.split(",")[1] : image;

        if (!base64Data || base64Data.length < 100) {
            return NextResponse.json({ error: "Imagen inválida o demasiado pequeña" }, { status: 400 });
        }

        console.log(`[analizar-fachada] Iniciando análisis. MimeType: ${mimeType}, Tamaño base64: ${base64Data.length} chars`);

        const prompt = `Actúa como un Ingeniero OSINT y Estratega de Marketing de Élite.
Analiza esta imagen de fachada/local comercial y extrae el ADN semántico y estratégico del negocio.

Responde ÚNICAMENTE con un objeto JSON válido, sin bloques markdown, sin texto adicional:

{
  "nombreSugerido": "nombre del negocio detectado por OCR o inferido",
  "categoriaSugerida": "categoría específica del negocio (ej: Cafetería, Peluquería, Farmacia...)",
  "paletaColores": {
    "primario": "#RRGGBB",
    "secundario": "#RRGGBB",
    "acento": "#RRGGBB",
    "fondo": "#RRGGBB",
    "primarioHSL": "hsl(H, S%, L%)",
    "secundarioHSL": "hsl(H, S%, L%)"
  },
  "objetosDetectados": ["elemento1", "elemento2", "elemento3"],
  "confianzaAnalisis": 0.85,
  "logoDetectado": true,
  "logoCreationRequired": false,
  "analisisMarketing": "Análisis estratégico de 3-4 líneas sobre posicionamiento y oportunidades del negocio.",
  "inteligenciaMarketing": {
    "arquetipoMarca": "El Explorador",
    "tonoVoz": "casual",
    "serviciosDetectados": ["Servicio 1", "Servicio 2", "Servicio 3"],
    "gapDeMercado": "Descripción del océano azul: qué ofrece que otros no tienen",
    "puntosDeDolorPublico": ["Dolor 1", "Dolor 2", "Dolor 3"]
  }
}

Reglas:
- arquetipoMarca debe ser uno de: El Rebelde, El Cuidador, El Sabio, El Mago, El Héroe, El Explorador, El Creador, El Inocente
- tonoVoz debe ser uno de: formal, casual, agresivo, emocional
- Usa colores HEX reales extraídos de la imagen
- Idioma: ESPAÑOL`;

        // Modelos confirmados disponibles para esta API key (via /api/test-gemini)
        const MODELOS_FALLBACK = [
            "gemini-2.0-flash-lite",
            "gemini-2.0-flash-lite-001",
            "gemini-2.0-flash-001",
            "gemini-2.0-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.5-flash",
        ];

        let text = "";
        let modeloUsado = "";
        let ultimoError = "";

        for (const modelo of MODELOS_FALLBACK) {
            try {
                text = await llamarGeminiREST(apiKey, modelo, base64Data, mimeType, prompt);
                modeloUsado = modelo;
                break;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                ultimoError = msg;
                if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
                    console.warn(`[analizar-fachada] Modelo ${modelo} sin cuota, probando siguiente...`);
                    continue;
                }
                if (msg.includes("404") || msg.includes("not found")) {
                    console.warn(`[analizar-fachada] Modelo ${modelo} no disponible, probando siguiente...`);
                    continue;
                }
                throw err;
            }
        }

        if (!text) {
            return NextResponse.json(
                { error: "Cuota de API agotada en todos los modelos. Espera unos minutos e inténtalo de nuevo.", detalle: ultimoError },
                { status: 429 }
            );
        }

        console.log(`[analizar-fachada] Usando modelo: ${modeloUsado}`);
        console.log("[analizar-fachada] Respuesta raw (primeros 200 chars):", text.substring(0, 200));

        // Extraer JSON limpio (Gemini a veces añade ```json ... ```)
        let jsonText = text;
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            jsonText = jsonMatch[1];
        } else {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                jsonText = text.substring(start, end + 1);
            }
        }

        const rawData = JSON.parse(jsonText);

        if (!rawData.paletaColores?.primario) {
            throw new Error("Respuesta de IA incompleta: falta paletaColores");
        }

        const adn = {
            paletaColores: {
                primario: rawData.paletaColores.primario || "#3b82f6",
                secundario: rawData.paletaColores.secundario || "#8b5cf6",
                acento: rawData.paletaColores.acento || "#f43f5e",
                fondo: rawData.paletaColores.fondo || "#050505",
                superficieGlass: "rgba(255, 255, 255, 0.05)",
            },
            estiloTipografico: "SANS_GEOMETRICA" as const,
            ambiente: rawData.categoriaSugerida || "Comercio Local",
            analisisMarketing: rawData.analisisMarketing || "",
            analisisVision: {
                nombreSugerido: rawData.nombreSugerido || "Mi Negocio",
                categoriaSugerida: rawData.categoriaSugerida || "Comercio",
                paletaColores: rawData.paletaColores,
                objetosDetectados: rawData.objetosDetectados || [],
                confianzaAnalisis: rawData.confianzaAnalisis || 0.7,
                logoDetectado: rawData.logoDetectado || false,
                logoCreationRequired: rawData.logoCreationRequired || true,
            },
            inteligenciaMarketing: rawData.inteligenciaMarketing || {
                arquetipoMarca: "El Explorador",
                tonoVoz: "casual",
                serviciosDetectados: [],
                gapDeMercado: "",
                puntosDeDolorPublico: [],
            },
            logoExtraido: null,
            publicoObjetivo: rawData.inteligenciaMarketing?.puntosDeDolorPublico?.[0] || "Clientes locales",
            contextoMercado: rawData.inteligenciaMarketing?.gapDeMercado || "Mercado local",
            confianza: Math.round((rawData.confianzaAnalisis || 0.7) * 100),
        };

        console.log(`[analizar-fachada] Análisis completado: ${adn.analisisVision.nombreSugerido} (${adn.analisisVision.categoriaSugerida})`);

        return NextResponse.json(adn);

    } catch (error: unknown) {
        const mensaje = error instanceof Error ? error.message : String(error);
        console.error("[analizar-fachada] Error:", mensaje);

        return NextResponse.json(
            {
                error: "Error al analizar la imagen",
                detalle: mensaje.includes("API_KEY") ? "API Key inválida" : mensaje
            },
            { status: 500 }
        );
    }
}
