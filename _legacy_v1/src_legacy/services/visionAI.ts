import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BrandData, VisionAnalysisResponse } from '../types';

// Initialize with API key from environment
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Analyzes business images (storefront, interior, etc.) and extracts brand information
 */
export async function analyzeBusinessMedia(imagesBase64: string[]): Promise<VisionAnalysisResponse> {
    try {
        if (!genAI) {
            console.log('No API key found, using mock data for vision analysis');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
            return {
                success: true,
                data: getMockBrandData()
            };
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Analiza estas imágenes del negocio (pueden ser fachada, interior, productos, etc.) y extrae la siguiente información en formato JSON. Si hay varias imágenes, combina la información para crear un perfil de marca coherente.

{
  "name": "Nombre del negocio (busca señales en fachada o interior)",
  "businessType": "Tipo de negocio (ej: bar, peluquería, restaurante, tienda, gimnasio...)",
  "niche": "Nicho específico (ej: peluquería urbana, bar de copas universitario, restaurante italiano elegante)",
  "description": "Descripción DETALLADA del estilo, ambiente y 'vibe' del negocio. Menciona detalles de decoración, iluminación y atmósfera.",
  "colors": {
    "primary": "Color principal dominante (hex)",
    "secondary": "Color secundario (hex)", 
    "accent": "Color de acento o contraste (hex)"
  },
  "typography": "Estilo tipográfico observado o sugerido (ej: moderna, clásica, manuscrita...)",
  "style": "Estilo visual general (ej: industrial, minimalista, rústico, vibrante, lujoso...)",
  "targetAudience": "Público objetivo estimado basándote en el diseño y ambiente"
}

IMPORTANTE: 
- Responde SOLO con el JSON.
- Sé creativo y descriptivo.
- Si no ves el nombre, usa "Tu Negocio" o infiérelo.`;

        // Prepare image parts
        const imageParts = imagesBase64.map(base64 => {
            const data = base64.replace(/^data:image\/\w+;base64,/, '');
            return {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: data
                }
            };
        });

        const result = await model.generateContent([
            prompt,
            ...imageParts
        ]);

        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        const brandData: BrandData = JSON.parse(cleanedText);

        return {
            success: true,
            data: brandData
        };

    } catch (error) {
        console.error('Error analyzing images:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al analizar las imágenes'
        };
    }
}

/**
 * Mock function for testing without API key
 */
export function getMockBrandData(): BrandData {
    return {
        name: "Cafetería El Aroma",
        businessType: "cafetería",
        niche: "Café de especialidad",
        tagline: "El mejor café de la ciudad",
        description: "Un espacio acogedor para amantes del café.",
        colors: {
            primary: "#d97706",
            secondary: "#92400e",
            accent: "#f59e0b"
        },
        typography: "Lato",
        style: "Moderno y rústico",
        targetAudience: "Jóvenes profesionales y estudiantes"
    };
}
