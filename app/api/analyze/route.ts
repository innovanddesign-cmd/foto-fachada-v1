import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

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
            model: "gemini-2.0-flash",
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
        const text = response.text();

        // Clean potential markdown code blocks if the model adds them despite MIME type
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return NextResponse.json(JSON.parse(cleanedText));

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return NextResponse.json(
            { error: "Failed to analyze image" },
            { status: 500 }
        );
    }
}
