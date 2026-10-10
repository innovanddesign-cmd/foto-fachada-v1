import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { requireAIUser, aiRequestId } from '@/lib/ai/access';
import { recordAIUsage } from '@/lib/ai/usage';
import { withAIQuota, saveAIAttempt } from '@/lib/ai/quota';

const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    const access = await requireAIUser(req);
    if (access.response) return access.response;
    const requestId = aiRequestId(req);
    if(!requestId)return NextResponse.json({error:'Identificador de solicitud inválido.'},{status:400});
    return withAIQuota(access.userId!, requestId, async () => {
    let attempted = false, recorded = false;
    try {
        const { image } = await req.json();

        if (typeof image !== 'string' || !image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }
        if (image.length > 14_000_000) return NextResponse.json({ error: 'La imagen es demasiado grande.' }, { status: 413 });

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY not set");
            return NextResponse.json({ error: "Server API Key not configured" }, { status: 500 });
        }

        // Decode base64 
        // Expecting image to be "data:image/jpeg;base64,..."
        const base64Data = image.split(",")[1];

        if (!base64Data) {
            return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
      Role: You are an Elite Digital Designer & Marketing Strategist for luxury brands.
      Task: Analyze this facade/storefront image and generate a complete "Brand DNA" and a high-converting digital storefront structure.
      
      Output JSON Schema:
      {
        "dna": {
          "palette": ["#primary", "#secondary", "#background", "#accent", "#text"],
          "typography": "Modern" | "Classic" | "Playful" | "Minimal",
          "vibe": "Short poetic description of the brand's feeling (max 5 words)"
        },
        "storefront": {
          "heroHeadline": "Impactful 3-5 word headline selling a lifestyle",
          "heroSubline": "Persuasive 1 sentence description",
          "layout": "hero-split" | "hero-center" | "gallery-grid",
          "offers": [
            { "title": "Product/Service Name", "price": "Price or CTA" }
          ] (Generate exactly 3 relevant offers based on the business type)
        }
      }

      Rules:
      1. Colors must be sophisticated. Ensure high contrast for text.
      2. If you see a specific business name, use it in the headline.
      3. If you can't identify products, generate generic high-end ones for that industry (e.g., if Cafe: "Artisan Latte", "Brunch Special").
      4. STRICTLY RETURN ONLY JSON.
    `;

        attempted = true;
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        recordAIUsage(access.userId!, requestId, modelName, response.usageMetadata);
        await saveAIAttempt(requestId, 1, modelName, 200, response.usageMetadata);
        recorded = true;
        const text = response.text();

        // Clean potential markdown code blocks if the model adds them despite MIME type
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return NextResponse.json(JSON.parse(cleanedText));

    } catch (error) {
        if(attempted && !recorded) await saveAIAttempt(requestId, 1, modelName, null, null);
        console.error("Gemini Analysis Error");
        return NextResponse.json(
            { error: "Failed to analyze image" },
            { status: 500 }
        );
    }
    }, req.headers.has('x-ai-expected-cost')?Number(req.headers.get('x-ai-expected-cost')):undefined, req.headers.get('x-ai-campaign-id')||undefined,req.headers.get('x-ai-initial')==='true');
}
