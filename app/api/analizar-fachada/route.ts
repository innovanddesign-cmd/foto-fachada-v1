import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Gemini 1.5 Flash is great for quick visual analysis
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Actúa como un Consultor Senior de Marca y Estratega de Marketing.
            Analiza la imagen de esta fachada de negocio y extrae su ADN visual y estratégico.
            
            Debes responder UNICAMENTE en formato JSON con la siguiente estructura exacta:
            {
                "paletaColores": {
                    "primario": "HEX",
                    "secundario": "HEX",
                    "acento": "HEX",
                    "fondo": "HEX",
                    "superficieGlass": "RGBA"
                },
                "estiloTipografico": "SANS_GEOMETRICA" | "SERIF_ELEGANTE" | "MANUSCRITA" | "TECH_MONO",
                "ambiente": "Descripción corta del ambiente (ej: Minimalista, Rústico, Industrial...)",
                "analisisMarketing": "Un párrafo de 3-4 líneas analizando el potencial del negocio, sus debilidades visuales actuales y cómo el nuevo diseño generativo ayudará a captar clientes.",
                "logoExtraido": null,
                "publicoObjetivo": "Descripción del cliente ideal basado en el tipo de negocio y zona.",
                "contextoMercado": "Breve análisis de la competencia o mercado detectado.",
                "confianza": 0-100
            }

            Reglas:
            1. Los colores deben ser elegantes y contrastados.
            2. El análisis de marketing debe ser profesional y persuasivo.
            3. Idioma: ESPAÑOL.
        `;

        // Clean base64 if needed
        const base64Data = image.split(",")[1] || image;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/png", // Assuming PNG from capture
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Extract JSON from response (Gemini sometimes adds markdown blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Could not parse AI response as JSON");
        }

        const adn = JSON.parse(jsonMatch[0]);

        return NextResponse.json(adn);
    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: "Error al analizar la imagen" }, { status: 500 });
    }
}
