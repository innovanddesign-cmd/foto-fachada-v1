/**
 * CreativeEngineService
 * =======================
 * AI-powered "Creative Tech Lead" that generates unique, implementable
 * marketing widgets in real-time. No templates - pure generative code.
 * 
 * Security: All AI API calls happen here. Keys never exposed to frontend.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as LinkContentGenerator from './LinkContentGenerator.js';

// Types
export interface BrandData {
    name: string;
    businessType: string;
    style?: string;
    targetAudience?: string;
    description?: string;
    niche?: string;
    primaryColor?: string;
    location?: string;
}

interface SeasonalContext {
    date: string;
    season: string;
    events: string[];
    weatherHint: string;
    location: string;
}

export interface UIConfigField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'color' | 'tel' | 'email' | 'textarea';
    default?: string | number;
    placeholder?: string;
}

export interface Strategy {
    id: string;
    emoji: string;
    title: string;
    description: string;
    vibe_analysis: string;
    typography: string;
    visual_mechanic: string;
    ui_config_schema: UIConfigField[];
    code_template: string;
    // Optional enrichment fields
    url?: string;
    slug?: string;
    type?: 'gamification' | 'promo' | 'social' | 'menu' | 'reservation' | 'info';
    _enrichment?: {
        brandSlug: string;
        index: number;
        enrichedAt: string;
    };
    _meta?: {
        generatedAt: string;
        seasonalContext: string[];
        index: number;
    };
}

// Configuration
const MAX_RETRIES = 2;
const MODEL_NAME = 'gemini-1.5-flash'; // Optimized for speed/cost

// Cache System (Simple In-Memory)
const strategyCache = new Map<string, { data: Strategy[]; expires: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Get the AI client instance
 */
function getAIClient(): GoogleGenerativeAI {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('[CreativeEngine] GEMINI_API_KEY not configured. Check server/.env');
    }
    return new GoogleGenerativeAI(apiKey);
}

/**
 * Detect seasonal context based on date and location
 */
function detectSeasonalContext(date: Date, location: string): SeasonalContext {
    const month = date.getMonth(); // 0-11
    const day = date.getDate();
    const isSpain = location.toLowerCase().includes('españa') || location.toLowerCase().includes('spain');
    const isLatam = ['mexico', 'argentina', 'chile', 'colombia', 'peru'].some(c =>
        location.toLowerCase().includes(c)
    );

    // Special events (priority)
    const events: string[] = [];

    // December events
    if (month === 11) {
        if (day >= 1 && day <= 24) events.push('Advent', 'Pre-Christmas');
        if (day >= 24 && day <= 26) events.push('Christmas');
        if (day >= 28 && day <= 31) events.push('New Year Eve', 'End of Year');
    }
    // November events
    if (month === 10) {
        if (day >= 20 && day <= 30) events.push('Black Friday', 'Cyber Monday');
        if (day === 1 && isLatam) events.push('Día de los Muertos');
    }
    // February
    if (month === 1 && day >= 10 && day <= 14) events.push('Valentine\'s Day');
    // Halloween
    if (month === 9 && day >= 25) events.push('Halloween');
    // Mother's Day (varies by country)
    if (month === 4 && isSpain && day >= 1 && day <= 7) events.push('Mother\'s Day');
    // Father's Day Spain (March 19)
    if (month === 2 && day === 19 && isSpain) events.push('Father\'s Day');

    // Seasons
    let season: string;
    if (month >= 2 && month <= 4) season = 'Spring';
    else if (month >= 5 && month <= 7) season = 'Summer';
    else if (month >= 8 && month <= 10) season = 'Autumn';
    else season = 'Winter';

    // Weather hints
    const weatherHint = season === 'Summer' ? 'hot weather, outdoor activities, vacations' :
        season === 'Winter' ? 'cold weather, indoor comfort, holidays' :
            season === 'Spring' ? 'renewal, allergies, outdoor sports' :
                'cozy vibes, back to routine, harvest';

    return {
        date: date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        season,
        events: events.length > 0 ? events : ['Regular day'],
        weatherHint,
        location
    };
}

/**
 * Build the Creative Tech Lead system prompt
 */
function buildSystemPrompt(brandData: BrandData, seasonalContext: SeasonalContext): string {
    return `
# ROLE: Creative Tech Lead at a Digital Marketing Agency

You are the lead creative technologist. Your job is to INVENT and PROGRAM unique, interactive marketing experiences for local businesses. You don't use templates - you CREATE original code.

## YOUR MISSION
Generate exactly 3 unique, creative, and FULLY IMPLEMENTABLE digital marketing strategies for:
- **Business**: ${brandData.name} (${brandData.businessType})
- **Style**: ${brandData.style || 'Modern'}
- **Target Audience**: ${brandData.targetAudience || 'General public'}

## CURRENT CONTEXT
- **Date**: ${seasonalContext.date}
- **Season**: ${seasonalContext.season}
- **Active Events**: ${seasonalContext.events.join(', ')}
- **Weather Context**: ${seasonalContext.weatherHint}
- **Location**: ${seasonalContext.location}

═════════════════════════════════════════════════════════════════
## CEREBRO DE DISEÑO GENERATIVO - ANÁLISIS PREVIO (OBLIGATORIO)
═════════════════════════════════════════════════════════════════

Antes de generar código, realiza INTERNAMENTE este análisis:

### 1. ANÁLISIS DE VIBE (¿Qué sentimiento transmite el negocio?)
Detecta el "vibe" emocional del negocio y elige tipografías acordes (Google Fonts).

### 2. SELECCIÓN DE ACTIVOS
- **Tipografía**: Elige una fuente de Google Fonts que encaje.
- **Mecánica Visual**: Slider, Checklist, Leaderboard, Ruleta, Countdown, Tarjeta 3D, etc.

### 3. SMART FOOTER (Generar automáticamente)
Cada widget DEBE incluir un footer con variables para redes sociales y dirección.

═════════════════════════════════════════════════════════════════

## CREATIVE RULES (MANDATORY)

### 1. SEASONAL RELEVANCE
Use current events/season to make ideas TIMELY and VIRAL.

### 2. INFINITE VARIETY - DO NOT REPEAT
Each strategy must be DIFFERENT. Use varied mechanics.

## TECHNICAL RULES (STRICT)

### Code Requirements
1. Generate COMPLETE, WORKING code in HTML5 + TailwindCSS (via CDN) + Vanilla JavaScript
2. Each widget must be SELF-CONTAINED (single HTML block)
3. Use localStorage for persistence (remember if user played, scores, etc.)
4. Mobile-first design (works on phones)
5. Include smooth animations (CSS transitions or simple JS)
6. NEVER hardcode business-specific text
7. INCLUDE Google Fonts link for the chosen typography
8. INCLUDE Smart Footer section

### Variable System
- Use \`{{variable_name}}\` syntax for all configurable text
- Each variable MUST appear in the ui_config_schema

### JSON Escaping (CRITICAL)
- The code_template field is a JSON string
- You MUST escape: double quotes (\\"), backslashes (\\\\), newlines (\\n)

## OUTPUT FORMAT (EXACT)

\`\`\`json
{
  "strategies": [
    {
      "id": "unique_snake_case_id",
      "emoji": "🎰",
      "title": "Short Catchy Title (max 5 words)",
      "description": "One sentence explaining the benefit.",
      "vibe_analysis": "Brief description of the emotional vibe",
      "typography": "Font name",
      "visual_mechanic": "Name of the mechanic",
      "ui_config_schema": [
        {
          "key": "variable_name",
          "label": "Question for owner",
          "type": "text|number|color|tel|email|textarea",
          "default": "Default value"
        }
      ],
      "code_template": "<div class='...'>Complete HTML with {{variables}}</div><script>...</script>"
    }
  ]
}
\`\`\`

Now generate 3 strategies.
`;
}

/**
 * Validate the response structure
 */
function validateResponse(json: any): boolean {
    if (!json.strategies || !Array.isArray(json.strategies)) {
        throw new Error('Response missing "strategies" array');
    }

    if (json.strategies.length === 0) {
        throw new Error('No strategies generated');
    }

    for (const strategy of json.strategies) {
        const required = ['id', 'title', 'description', 'ui_config_schema', 'code_template'];
        for (const field of required) {
            if (!strategy[field]) {
                throw new Error(`Strategy "${strategy.id || 'unknown'}" missing required field: ${field}`);
            }
        }

        if (!Array.isArray(strategy.ui_config_schema)) {
            throw new Error(`Strategy "${strategy.id}" ui_config_schema must be an array`);
        }

        if (typeof strategy.code_template !== 'string' || strategy.code_template.length < 50) {
            throw new Error(`Strategy "${strategy.id}" code_template is too short or invalid`);
        }
    }

    return true;
}

/**
 * Main strategy generation function
 */
export async function generateStrategies(
    brandData: BrandData,
    dateStr?: string,
    location?: string
): Promise<Strategy[]> {
    console.log('[CreativeEngine] 🎨 Starting strategy generation...');

    // Generate Cache Key
    const cacheKey = JSON.stringify({
        name: brandData.name,
        type: brandData.businessType,
        style: brandData.style,
        date: dateStr ? dateStr.substring(0, 10) : new Date().toISOString().substring(0, 10), // Daily cache
        location
    });

    // Check Cache
    const cached = strategyCache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
        console.log('[CreativeEngine] ⚡ Cache HIT. Returning stored strategies.');
        return cached.data;
    }

    console.log(`[CreativeEngine] 📍 Business: ${brandData.name} (${brandData.businessType})`);

    // Parse date
    const date = dateStr ? new Date(dateStr) : new Date();
    const loc = location || brandData.location || 'España';

    // Detect seasonal context
    const seasonalContext = detectSeasonalContext(date, loc);
    console.log(`[CreativeEngine] 📅 Season: ${seasonalContext.season}, Events: ${seasonalContext.events.join(', ')}`);

    // Build prompt
    const systemPrompt = buildSystemPrompt(brandData, seasonalContext);

    const userMessage = `Generate 3 creative marketing strategies for:
    
Business Name: ${brandData.name}
Business Type: ${brandData.businessType}
Style/Vibe: ${brandData.style || 'Modern'}
Target Audience: ${brandData.targetAudience || 'Locals'}
Description: ${brandData.description || ''}
${brandData.niche ? `Niche: ${brandData.niche}` : ''}
${brandData.primaryColor ? `Brand Color: ${brandData.primaryColor}` : ''}`;

    // Get AI client
    const genAI = getAIClient();
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.9,
            topP: 0.95
        }
    });

    // Retry loop
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
        try {
            console.log(`[CreativeEngine] 🤖 Calling Gemini (attempt ${attempt})...`);

            const result = await model.generateContent([systemPrompt, userMessage]);
            const response = await result.response;
            const text = response.text();

            console.log(`[CreativeEngine] 📦 Response received (${text.length} chars)`);

            // Parse JSON
            const json = JSON.parse(text);

            // Validate structure
            validateResponse(json);

            console.log(`[CreativeEngine] ✅ Generated ${json.strategies.length} valid strategies`);

            // Add metadata
            const strategies = json.strategies.map((s: any, idx: number) => ({
                ...s,
                _meta: {
                    generatedAt: new Date().toISOString(),
                    seasonalContext: seasonalContext.events,
                    index: idx
                }
            }));

            // Enrich strategies with URLs using LinkContentGenerator
            console.log('[CreativeEngine] 🔗 Enriching strategies with URLs...');
            const enrichedStrategies = LinkContentGenerator.enrichStrategiesWithUrls(
                strategies,
                {
                    name: brandData.name,
                    businessType: brandData.businessType,
                    location: brandData.location
                }
            );

            console.log(`[CreativeEngine] ✅ Enriched ${enrichedStrategies.length} strategies with URLs`);

            // Store enriched strategies in Cache
            strategyCache.set(cacheKey, {
                data: enrichedStrategies,
                expires: Date.now() + CACHE_TTL
            });

            return enrichedStrategies;

        } catch (error: any) {
            lastError = error;
            console.error(`[CreativeEngine] ❌ Attempt ${attempt} failed:`, error.message);

            if (attempt <= MAX_RETRIES) {
                console.log(`[CreativeEngine] 🔄 Retrying...`);
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
    }

    throw new Error(`[CreativeEngine] Failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
}

/**
 * New method: Generate 1 optimized strategy with 3 widgets
 * This is the recommended method for FASE 1
 */
export async function generateOptimizedStrategy(
    brandData: BrandData,
    dateStr?: string,
    location?: string
): Promise<{ strategy: any; widgets: any[] }> {
    console.log('[CreativeEngine] 🎯 Generating 1 optimized strategy with 3 widgets...');

    // Parse date and location
    const date = dateStr ? new Date(dateStr) : new Date();
    const loc = location || brandData.location || 'España';
    const seasonalContext = detectSeasonalContext(date, loc);

    console.log(`[CreativeEngine] 📅 Context: ${seasonalContext.season}, Events: ${seasonalContext.events.join(', ')}`);

    // Build system prompt for 1 strategy + 3 widgets
    const systemPrompt = `
# ROLE: Creative Tech Lead at a Digital Marketing Agency

You are creating ONE cohesive marketing strategy with EXACTLY 3 interactive widgets.

## YOUR MISSION
Generate 1 optimized marketing strategy that includes 3 unique, interactive widgets for:
- **Business**: ${brandData.name} (${brandData.businessType})
- **Style**: ${brandData.style || 'Modern'}
- **Target Audience**: ${brandData.targetAudience || 'General public'}

## CURRENT CONTEXT
- **Date**: ${seasonalContext.date}
- **Season**: ${seasonalContext.season}
- **Active Events**: ${seasonalContext.events.join(', ')}
- **Weather Context**: ${seasonalContext.weatherHint}
- **Location**: ${seasonalContext.location}

## STRATEGY REQUIREMENTS

### 1. The strategy must be COHESIVE
All 3 widgets should work together as part of a unified campaign, not 3 separate unrelated ideas.

### 2. Optimize for CURRENT CONTEXT
Use the season, events, and location to make the strategy TIMELY and RELEVANT.

Example: If it's near Christmas in Spain, create a "Festive Campaign" with:
- Widget 1: Christmas Prize Wheel
- Widget 2: Holiday Flash Offers
- Widget 3: Festive Photo Wall

### 3. Each widget must be DIFFERENT
Use varied mechanics (not 3 roulettes):
- Gamification (wheel, scratch card, quiz,game)
- Urgency (countdown, flash offers, limited stock)
- Social Proof (photo wall, testimonials, reviews)
- Engagement (polls, quizzes, forms)

## TECHNICAL RULES (STRICT)

### Code Requirements
1. Generate COMPLETE, WORKING code in HTML5 + TailwindCSS (via CDN) + Vanilla JavaScript
2. Each widget must be SELF-CONTAINED (single HTML block)
3. Use localStorage for persistence
4. Mobile-first design
5. Include smooth animations
6. NEVER hardcode business-specific text - use {{variables}}
7. INCLUDE Google Fonts link
8. INCLUDE Smart Footer

### Variable System
- Use \`{{variable_name}}\` syntax for all configurable text
- Each variable MUST appear in the ui_config_schema

### JSON Escaping (CRITICAL)
- The code_template field is a JSON string
- You MUST escape: double quotes (\\"), backslashes (\\\\), newlines (\\n)

## OUTPUT FORMAT (EXACT)

\`\`\`json
{
  "strategy": {
    "title": "Campaign Name (e.g., 'Festive Interactive Campaign 2024')",
    "description": "Brief description of the overall strategy",
    "seasonal_context": "Why this strategy is optimized for current date/season"
  },
  "widgets": [
    {
      "id": "unique_snake_case_id",
      "emoji": "🎰",
      "title": "Widget Name (max 5 words)",
      "description": "One sentence explaining the widget benefit",
      "vibe_analysis": "Emotional vibe",
      "typography": "Google Font name",
      "visual_mechanic": "Mechanic name",
      "ui_config_schema": [
        {
          "key": "variable_name",
          "label": "Question for owner",
          "type": "text|number|color|tel|email|textarea",
          "default": "Default value"
        }
      ],
      "code_template": "<div>Complete HTML with {{variables}}</div><script>...</script>"
    }
  ]
}
\`\`\`

Now generate 1 strategy with 3 widgets.
`;

    const userMessage = `Generate 1 cohesive marketing strategy with 3 interactive widgets for:
    
Business: ${brandData.name}
Type: ${brandData.businessType}
Style: ${brandData.style || 'Modern'}
Target: ${brandData.targetAudience || 'Locals'}
${brandData.description ? `Description: ${brandData.description}` : ''}
${brandData.niche ? `Niche: ${brandData.niche}` : ''}
${brandData.primaryColor ? `Brand Color: ${brandData.primaryColor}` : ''}

Remember: Create 1 unified strategy optimized for ${seasonalContext.season} and ${seasonalContext.events.join(', ')}.`;

    // Get AI client
    const genAI = getAIClient();
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.9,
            topP: 0.95
        }
    });

    // Call AI
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
        try {
            console.log(`[CreativeEngine] 🤖 Calling Gemini (attempt ${attempt})...`);

            const result = await model.generateContent([systemPrompt, userMessage]);
            const response = await result.response;
            const text = response.text();

            console.log(`[CreativeEngine] 📦 Response received (${text.length} chars)`);

            const json = JSON.parse(text);

            // Validate
            if (!json.strategy || !json.widgets || !Array.isArray(json.widgets)) {
                throw new Error('Invalid response structure');
            }

            if (json.widgets.length !== 3) {
                console.warn(`[CreativeEngine] Expected 3 widgets, got ${json.widgets.length}. Using first 3.`);
                json.widgets = json.widgets.slice(0, 3);
            }

            // Add metadata
            const enrichedWidgets = json.widgets.map((w: any, idx: number) => ({
                ...w,
                _meta: {
                    generatedAt: new Date().toISOString(),
                    seasonalContext: seasonalContext.events,
                    index: idx
                }
            }));

            console.log(`[CreativeEngine] ✅ Generated 1 strategy with ${enrichedWidgets.length} widgets`);

            return {
                strategy: {
                    ...json.strategy,
                    _meta: {
                        generatedAt: new Date().toISOString(),
                        seasonalContext: seasonalContext.events,
                        location: loc
                    }
                },
                widgets: enrichedWidgets
            };

        } catch (error: any) {
            lastError = error;
            console.error(`[CreativeEngine] ❌ Attempt ${attempt} failed:`, error.message);

            if (attempt <= MAX_RETRIES) {
                console.log(`[CreativeEngine] 🔄 Retrying...`);
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
    }

    throw new Error(`[CreativeEngine] Failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
}
