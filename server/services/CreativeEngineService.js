/**
 * CreativeEngineService
 * =======================
 * AI-powered "Creative Tech Lead" that generates unique, implementable
 * marketing widgets in real-time. No templates - pure generative code.
 * 
 * Security: All AI API calls happen here. Keys never exposed to frontend.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────
const MAX_RETRIES = 2;
const MODEL_NAME = 'gemini-flash-latest';

/**
 * Get the AI client instance
 * @returns {GoogleGenerativeAI}
 */
function getAIClient() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('[CreativeEngine] GEMINI_API_KEY not configured. Check server/.env');
    }
    return new GoogleGenerativeAI(apiKey);
}

/**
 * Detect seasonal context based on date and location
 * @param {Date} date 
 * @param {string} location 
 * @returns {object} Seasonal context object
 */
function detectSeasonalContext(date, location) {
    const month = date.getMonth(); // 0-11
    const day = date.getDate();
    const isSpain = location.toLowerCase().includes('españa') || location.toLowerCase().includes('spain');
    const isLatam = ['mexico', 'argentina', 'chile', 'colombia', 'peru'].some(c =>
        location.toLowerCase().includes(c)
    );

    // Special events (priority)
    const events = [];

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
    let season;
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
 * Enhanced with: Vibe Analysis, Asset Selection, Smart Footer
 * @param {object} brandData 
 * @param {object} seasonalContext 
 * @returns {string}
 */
function buildSystemPrompt(brandData, seasonalContext) {
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

Detecta el "vibe" emocional según el tipo de negocio:
- **Coleccionismo/Figuras**: Nostalgia, detalle, pasión por el hobby → Tipografías retro/gaming
- **Surf/Skate/Aventura**: Energía, libertad, adrenalina → Tipografías bold/handwritten
- **Restaurante/Gourmet**: Sofisticación, sabor, experiencia → Tipografías serif elegantes
- **Panadería/Cafetería**: Calidez, hogar, artesanal → Tipografías rounded/friendly
- **Tecnología/Startup**: Innovación, futuro, precisión → Tipografías geometric/sans-serif
- **Spa/Bienestar**: Calma, equilibrio, zen → Tipografías light/minimal
- **Taller/Industrial**: Fuerza, durabilidad, confianza → Tipografías bold/industrial
- **Moda/Boutique**: Estilo, tendencia, exclusividad → Tipografías fashion/display
- **Fitness/Gym**: Potencia, disciplina, transformación → Tipografías impact/strong
- **Veterinaria/Mascotas**: Ternura, cuidado, familia → Tipografías playful/soft

### 2. SELECCIÓN DE ACTIVOS (Basada en el Vibe)

#### A) TIPOGRAFÍA (Incluir en code_template via Google Fonts CDN)
Ejemplos por sector:
- Gaming/Figuras: 'Press Start 2P', 'Orbitron', 'VT323'
- Surf/Extreme: 'Permanent Marker', 'Bangers', 'Satisfy'
- Tech/Modern: 'Space Grotesk', 'JetBrains Mono', 'Outfit'
- Gourmet: 'Playfair Display', 'Cormorant Garamond', 'Libre Baskerville'
- Artesanal: 'Quicksand', 'Nunito', 'Comfortaa'
- Wellness: 'Raleway', 'Josefin Sans', 'Montserrat Light'
- Industrial: 'Oswald', 'Bebas Neue', 'Anton'
- Fashion: 'DM Serif Display', 'Fraunces', 'Bodoni Moda'
- Fitness: 'Teko', 'Black Ops One', 'Russo One'
- Kids/Pets: 'Baloo 2', 'Comic Neue', 'Patrick Hand'

#### B) MECÁNICA VISUAL (Elegir la más apropiada)
- **Si es visual (antes/después)**: Slider comparativo (peluquería, detailing, reforma)
- **Si es servicios**: Checklist de beneficios animado
- **Si es juego/competición**: Leaderboard, puntuación
- **Si es colección**: Galería/carrusel con zoom
- **Si es experiencia**: Video testimonial placeholder
- **Si es producto**: Tarjeta 3D rotativa
- **Si es oferta**: Countdown timer dramático
- **Si es suerte**: Ruleta/rasca y gana

### 3. SMART FOOTER (Generar automáticamente)

Cada widget DEBE incluir un footer con:
\`\`\`html
<footer class="smart-footer">
  <!-- Redes Sociales (iconos SVG inline) -->
  <div class="social-icons">
    <a href="https://instagram.com/{{instagram_handle}}" aria-label="Instagram"><!-- SVG --></a>
    <a href="https://facebook.com/{{facebook_page}}" aria-label="Facebook"><!-- SVG --></a>
    <a href="https://wa.me/{{whatsapp_phone}}" aria-label="WhatsApp"><!-- SVG --></a>
  </div>
  
  <!-- Dirección vinculada a Google Maps -->
  <a href="https://maps.google.com/?q={{business_address}}" class="address-link">
    📍 {{business_address}}
  </a>
  
  <!-- Horario comercial -->
  <p class="business-hours">{{business_hours}}</p>
</footer>
\`\`\`

Añade al ui_config_schema:
- instagram_handle, facebook_page (type: text)
- whatsapp_phone (type: tel)
- business_address (type: text)
- business_hours (type: text, default: "L-V 10:00-20:00, S 10:00-14:00")

═════════════════════════════════════════════════════════════════

## CREATIVE RULES (MANDATORY)

### 1. SEASONAL RELEVANCE
- If near Christmas → Christmas themes, gift ideas, countdown
- If Summer → Beach vibes, hydration, vacation promos
- If Valentine's → Romance, couples offers, gifts
- USE the current events to make ideas TIMELY and VIRAL

### 2. BUSINESS-SPECIFIC MECHANICS
Different business types need different approaches:
- **Bar/Restaurant**: Gamification (roulettes, scratch cards), social sharing, group deals
- **Retail Shop**: Loyalty points, flash sales, wish lists
- **Pharmacy/Health**: Utility (symptom checkers, pill reminders), trust-building
- **Beauty/Salon**: Before/after visualizers, appointment booking, trend quizzes
- **Gym/Fitness**: Challenge trackers, leaderboards, body calculators
- **Figuras/Coleccionismo**: Catálogo interactivo, wishlist, buscador por serie

### 3. INFINITE VARIETY - DO NOT REPEAT
Each strategy must be DIFFERENT. Use varied mechanics:
- Scratch Cards, Roulettes, Slot Machines
- Personality Quizzes, Trivia Games
- Countdown Timers, Advent Calendars
- Voting Systems, Polls
- Budget Calculators, Savings Trackers
- Wish Walls, Vision Boards
- Challenge Leaderboards
- Lucky Number Generators
- Prediction Games
- Photo Contests (simulated)
- Before/After Sliders
- Interactive Checklists
- 3D Product Cards

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
- Common variables: title, subtitle, prize_text, button_text, whatsapp_phone, business_name
- Each variable MUST appear in the ui_config_schema
- INCLUDE social media and footer variables

### JSON Escaping (CRITICAL)
- The code_template field is a JSON string
- You MUST escape: double quotes (\\"), backslashes (\\\\), newlines (\\n)
- Test your JSON mentally before outputting

## OUTPUT FORMAT (EXACT)

\`\`\`json
{
  "strategies": [
    {
      "id": "unique_snake_case_id",
      "emoji": "🎰",
      "title": "Short Catchy Title (max 5 words)",
      "description": "One sentence explaining the benefit to the business owner.",
      "vibe_analysis": "Brief description of the emotional vibe detected",
      "typography": "Font name chosen from Google Fonts",
      "visual_mechanic": "Name of the visual mechanic used",
      "ui_config_schema": [
        {
          "key": "variable_name",
          "label": "Question for the business owner",
          "type": "text|number|color|tel|email|textarea",
          "default": "Default value",
          "placeholder": "Optional placeholder"
        }
      ],
      "code_template": "<div class='...'>Complete HTML with {{variables}}</div><script>...</script>"
    }
  ]
}
\`\`\`

## EXAMPLES OF GOOD ui_config_schema

For a Roulette:
- key: "prize_1", label: "¿Cuál es el premio principal?", type: "text", default: "10% Descuento"
- key: "prize_2", label: "¿Segundo premio?", type: "text", default: "Bebida gratis"
- key: "whatsapp", label: "WhatsApp para canjear", type: "tel", default: "+34600000000"
- key: "brand_color", label: "Color de tu marca", type: "color", default: "#FF6B6B"

For a Quiz:
- key: "quiz_title", label: "Título del quiz", type: "text", default: "¿Qué tipo de cliente eres?"
- key: "result_text", label: "Mensaje al completar", type: "textarea", default: "¡Descubre tu perfil!"

## FINAL REMINDERS
- Be CREATIVE. Surprise the user with novel ideas.
- Be PRACTICAL. The code must actually work.
- Be RELEVANT. Use the seasonal context.
- Be COMPLETE. Include ALL necessary code (no placeholders like "// add logic here").
- APPLY the Vibe Analysis - choose fonts and mechanics that FEEL right for the business.
- INCLUDE the Smart Footer in every widget.

Now generate 3 strategies.
`;
}

/**
 * Validate the response structure
 * @param {object} json 
 * @returns {boolean}
 */
function validateResponse(json) {
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
 * @param {object} brandData - Business information
 * @param {string} [dateStr] - Optional date string
 * @param {string} [location] - Optional location
 * @returns {Promise<Array>} Array of generated strategies
 */
export async function generateStrategies(brandData, dateStr, location) {
    console.log('[CreativeEngine] 🎨 Starting strategy generation...');
    console.log(`[CreativeEngine] 📍 Business: ${brandData.name} (${brandData.businessType})`);

    // Parse date
    const date = dateStr ? new Date(dateStr) : new Date();
    const loc = location || brandData.location || 'España';

    // Detect seasonal context
    const seasonalContext = detectSeasonalContext(date, loc);
    console.log(`[CreativeEngine] 📅 Season: ${seasonalContext.season}, Events: ${seasonalContext.events.join(', ')}`);

    // Build prompt
    const systemPrompt = buildSystemPrompt(brandData, seasonalContext);

    const userMessage = `Generate 3 creative marketing strategies for this business:
    
Business Name: ${brandData.name}
Business Type: ${brandData.businessType}
Style/Vibe: ${brandData.style || 'Modern and friendly'}
Target Audience: ${brandData.targetAudience || 'Local customers'}
Description: ${brandData.description || 'A local business looking to grow'}
${brandData.niche ? `Niche: ${brandData.niche}` : ''}
${brandData.primaryColor ? `Brand Color: ${brandData.primaryColor}` : ''}`;

    // Get AI client
    const genAI = getAIClient();
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.9, // High creativity
            topP: 0.95
        }
    });

    // Retry loop
    let lastError = null;
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

            // Add metadata to each strategy
            const strategies = json.strategies.map((s, idx) => ({
                ...s,
                _meta: {
                    generatedAt: new Date().toISOString(),
                    seasonalContext: seasonalContext.events,
                    index: idx
                }
            }));

            return strategies;

        } catch (error) {
            lastError = error;
            console.error(`[CreativeEngine] ❌ Attempt ${attempt} failed:`, error.message);

            if (attempt <= MAX_RETRIES) {
                console.log(`[CreativeEngine] 🔄 Retrying...`);
                await new Promise(r => setTimeout(r, 1000 * attempt)); // Backoff
            }
        }
    }

    // All retries failed
    throw new Error(`[CreativeEngine] Failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
}

/**
 * Quick test function for development
 */
export async function testCreativeEngine() {
    const testBrand = {
        name: 'Bar El Rincón',
        businessType: 'Bar',
        style: 'Tradicional con toque moderno',
        targetAudience: 'Jóvenes profesionales 25-40',
        description: 'Bar de tapas en el centro con terraza'
    };

    try {
        const strategies = await generateStrategies(testBrand);
        console.log('\n=== TEST RESULT ===');
        strategies.forEach((s, i) => {
            console.log(`\n${i + 1}. ${s.emoji} ${s.title}`);
            console.log(`   ${s.description}`);
            console.log(`   Config fields: ${s.ui_config_schema.map(f => f.key).join(', ')}`);
            console.log(`   Code length: ${s.code_template.length} chars`);
        });
        return strategies;
    } catch (error) {
        console.error('Test failed:', error);
        throw error;
    }
}
