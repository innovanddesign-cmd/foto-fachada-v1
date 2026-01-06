import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateStrategies(brandData, date, location) {
  // Support both new (GEMINI_API_KEY) and legacy (VITE_GEMINI_API_KEY) variable names
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[WidgetGen] ❌ GEMINI_API_KEY is missing in server/.env');
    throw new Error('GEMINI_API_KEY not configured on server. Check server/.env file.');
  }
  console.log('[WidgetGen] ✅ API Key loaded successfully');

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    generationConfig: { responseMimeType: "application/json" }
  });

  const currentDate = date || new Date().toLocaleDateString('es-ES');
  const currentLocation = location || 'España';

  const systemPrompt = `
    Role: Expert Creative Tech Lead
    Mission: Invent 3 unique, simple, and implementable digital marketing strategies for a local business ("${brandData.name}", ${brandData.businessType}).
    Current Context: Date: ${currentDate}, Location: ${currentLocation}.

    Creative Rules:
    1. Seasonal: If December, think Christmas. If Summer, think heat.
    2. Business Context: ${brandData.businessType} needs specific mechanics (e.g., Bar = aggressive/fun, Pharmacy = utility/trust).
    3. Infinite Variety: Create Scratch Cards, Voting, Personality Quizzes, Checklists, Budget Calculators, Wish Walls, Predictions, etc. do NOT limit to simple coupons.

    Technical Rules (Strict):
    - Generate widget code in HTML5 + TailwindCSS (via CDN) + Vanilla JS.
    - Code must be self-contained (one HTML block).
    - Use localStorage for simple persistence (e.g., to remember if user played).
    - Do NOT hardcode key texts. Use variables marked as {{variable_name}} in the code.
    - Output MUST be valid JSON.
    - IMPORTANT: The 'code_template' field must be a valid JSON string. You MUST escape all double quotes (\") and backslashes (\\) within the code HTML/JS. Verify your JSON validity before outputting.

    Format:
    {
      "strategies": [
        {
          "id": "unique_id_1",
          "emoji": "🎸",
          "title": "Short Title",
          "description": "1 sentence benefit explanation.",
          "ui_config_schema": [
            {
              "key": "promo_text",
              "label": "Question for the business owner?",
              "type": "text",
              "default": "Default value"
            },
            {
              "key": "whatsapp_phone",
              "label": "Phone to redeem",
              "type": "tel",
              "default": "34600000000"
            }
          ],
          "code_template": "<div class='p-4 ...'> ... {{promo_text}} ... </div>"
        }
      ]
    }
  `;

  const userMessage = `Generate strategies for:
  Name: ${brandData.name}
  Type: ${brandData.businessType}
  Style: ${brandData.style}
  Target: ${brandData.targetAudience}
  Description: ${brandData.description}
  `;

  try {
    console.log('Sending request to Gemini...');
    const result = await model.generateContent([systemPrompt, userMessage]);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini Response Text (First 100 chars):', text.substring(0, 100));

    try {
      const json = JSON.parse(text);
      if (!json.strategies || !Array.isArray(json.strategies)) {
        console.error('Invalid JSON structure:', json);
        throw new Error('Response JSON missing "strategies" array');
      }
      return json.strategies;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Text causing error:', text);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
  } catch (error) {
    console.error("AI Generation Error Details:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error);
    }
    throw new Error(`Failed to generate valid strategies from AI: ${error.message}`);
  }
}
