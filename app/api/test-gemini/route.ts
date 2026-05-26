import { NextResponse } from "next/server";

export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "GEMINI_API_KEY no configurada" }, { status: 500 });
    }

    // Listar todos los modelos disponibles para esta API key
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );
    const data = await response.json();

    // Filtrar solo los que soportan generateContent (los útiles para nosotros)
    const modelosConGeneracion = (data.models || [])
        .filter((m: { supportedGenerationMethods?: string[] }) =>
            m.supportedGenerationMethods?.includes("generateContent")
        )
        .map((m: { name: string; displayName: string; description: string }) => ({
            id: m.name,
            nombre: m.displayName,
            descripcion: m.description,
        }));

    return NextResponse.json({
        total: modelosConGeneracion.length,
        modelos: modelosConGeneracion,
        raw: data,
    });
}
