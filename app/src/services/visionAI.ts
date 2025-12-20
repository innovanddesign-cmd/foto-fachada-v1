import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BrandData, VisionAnalysisResponse } from '../types';

// Initialize with API key from environment
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

/**
 * Analyzes a storefront image and extracts brand information
 */
export async function analyzeStorefrontImage(imageBase64: string): Promise<VisionAnalysisResponse> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Analiza esta imagen de la fachada de un negocio y extrae la siguiente información en formato JSON:

{
  "name": "Nombre del negocio visible en la fachada",
  "businessType": "Tipo de negocio (ej: bar, peluquería, restaurante, tienda, gimnasio, etc.)",
  "niche": "Nicho específico si lo hay (ej: peluquería urbana, bar de copas universitario, restaurante mexicano)",
  "description": "Breve descripción del estilo y ambiente del negocio basándote en lo que ves",
  "colors": {
    "primary": "Color principal en formato hexadecimal",
    "secondary": "Color secundario en formato hexadecimal", 
    "accent": "Color de acento en formato hexadecimal"
  },
  "typography": "Descripción del estilo tipográfico (ej: moderna, clásica, manuscrita, bold, etc.)",
  "style": "Estilo visual general (ej: urbano, elegante, rústico, minimalista, vibrante)",
  "targetAudience": "Público objetivo estimado basándote en el estilo del negocio"
}

IMPORTANTE: 
- Responde SOLO con el JSON, sin markdown ni texto adicional
- Si no puedes determinar algo, usa valores por defecto razonables
- Los colores deben ser códigos hexadecimales válidos (#RRGGBB)
- Sé específico y descriptivo`;

        // Remove data URL prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                }
            }
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
        console.error('Error analyzing image:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al analizar la imagen'
        };
    }
}

/**
 * Mock function for testing without API key
 */
export function getMockBrandData(): BrandData {
    return {
        name: 'LA MOVIDA',
        businessType: 'Bar de Copas',
        niche: 'Zona Universitaria',
        description: 'Bar de ambiente juvenil y vibrante, decoración urbana con toques neón y música moderna. Ideal para noches de copas con amigos.',
        colors: {
            primary: '#FF6B35',
            secondary: '#004E89',
            accent: '#F7B801'
        },
        typography: 'Bold, Moderna, Energética',
        style: 'Urbano, Juvenil, Vibrante',
        targetAudience: 'Estudiantes universitarios 18-25 años'
    };
}
