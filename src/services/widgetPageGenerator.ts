/**
 * Widget Page Generator Service (Frontend)
 * Generates functional HTML pages for each widget using Gemini AI
 * 100% automatic - no manual intervention required
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BrandData, LandingLink } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface GeneratedWidgetPage {
    id: string;
    linkId: string;
    title: string;
    slug: string;
    htmlContent: string;
    generatedAt: Date;
}

export interface WidgetGenerationProgress {
    current: number;
    total: number;
    currentWidget: string;
    status: 'idle' | 'generating' | 'complete' | 'error';
    message: string;
}

/**
 * Generate functional HTML pages for all links
 * Returns array of complete HTML pages ready to be served
 */
export async function generateWidgetPages(
    links: LandingLink[],
    brandData: BrandData,
    onProgress?: (progress: WidgetGenerationProgress) => void
): Promise<GeneratedWidgetPage[]> {
    const widgetLinks = links.slice(0, 3); // Only first 3 links
    const generatedPages: GeneratedWidgetPage[] = [];

    if (!genAI) {
        console.warn('[WidgetGenerator] No API key, using mock widgets');
        return widgetLinks.map((link, index) => createMockWidgetPage(link, brandData, index));
    }

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 8000
        }
    });

    for (let i = 0; i < widgetLinks.length; i++) {
        const link = widgetLinks[i];

        // Update progress
        onProgress?.({
            current: i + 1,
            total: widgetLinks.length,
            currentWidget: link.name,
            status: 'generating',
            message: `Generando ${link.name}...`
        });

        try {
            const html = await generateSingleWidgetPage(model, link, brandData);
            const slug = slugify(`${brandData.name}-${link.name}`);

            generatedPages.push({
                id: `widget-${Date.now()}-${i}`,
                linkId: link.id,
                title: link.name,
                slug,
                htmlContent: html,
                generatedAt: new Date()
            });

            console.log(`[WidgetGenerator] ✅ Generated: ${link.name}`);
        } catch (error) {
            console.error(`[WidgetGenerator] Error generating ${link.name}:`, error);
            // Use mock as fallback
            generatedPages.push(createMockWidgetPage(link, brandData, i));
        }
    }

    onProgress?.({
        current: widgetLinks.length,
        total: widgetLinks.length,
        currentWidget: '',
        status: 'complete',
        message: '¡Widgets generados!'
    });

    // Save to localStorage for persistence
    saveWidgetPages(generatedPages);

    return generatedPages;
}

/**
 * Generate a single widget page HTML
 */
async function generateSingleWidgetPage(
    model: any,
    link: LandingLink,
    brandData: BrandData
): Promise<string> {
    const prompt = `Generate a COMPLETE, FUNCTIONAL HTML page for this interactive widget.

WIDGET TYPE: ${link.type}
WIDGET NAME: ${link.name}
WIDGET DESCRIPTION: ${link.description}
BUSINESS NAME: ${brandData.name}
BUSINESS TYPE: ${brandData.businessType}
PRIMARY COLOR: ${brandData.colors?.primary || '#6366f1'}
SECONDARY COLOR: ${brandData.colors?.secondary || '#8b5cf6'}

REQUIREMENTS:
1. Complete HTML5 document with <!DOCTYPE html>
2. Use TailwindCSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Mobile-first responsive design
4. Fully functional JavaScript (no placeholders)
5. Smooth animations and transitions
6. Use localStorage to save user interactions
7. Modern gradient background matching brand colors
8. Include business name in header
9. Add a "Powered by ${brandData.name}" footer

WIDGET-SPECIFIC REQUIREMENTS:
${getWidgetSpecificRequirements(link.type)}

IMPORTANT:
- The widget MUST be fully functional and interactive
- Use the business name: "${brandData.name}"
- Apply brand colors: primary=${brandData.colors?.primary || '#6366f1'}, secondary=${brandData.colors?.secondary || '#8b5cf6'}
- NO placeholder text or Lorem Ipsum
- Include all necessary JavaScript for interactivity

Return ONLY the complete HTML code, no explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let html = response.text();

    // Clean up any markdown artifacts
    html = html.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

    // Ensure it starts with DOCTYPE
    if (!html.startsWith('<!DOCTYPE')) {
        html = '<!DOCTYPE html>\n' + html;
    }

    return html;
}

/**
 * Get widget-specific requirements based on type
 */
function getWidgetSpecificRequirements(type: string): string {
    const requirements: Record<string, string> = {
        gamification: `
- Create a WORKING prize wheel (roulette) that spins when clicked
- Use CSS transforms for smooth rotation animation
- Define 6-8 prizes in a JavaScript array
- Show winning prize in a modal/popup
- Save win history to localStorage
- Prevent multiple spins (once per day)
- Include confetti animation on win (use canvas)`,

        promo: `
- Create a WORKING countdown timer
- Show days, hours, minutes, seconds
- Use setInterval for real-time updates
- Display special offer details
- CTA button to claim offer
- Store claim status in localStorage
- Flash/pulse animation on timer`,

        reservation: `
- Create a reservation form
- Date picker (HTML5 date input)
- Time slots selection
- Party size selector
- Name and phone fields
- Form validation
- Submit confirmation animation
- Save to localStorage`,

        menu: `
- Create a beautiful menu/catalog display
- Category tabs/filters
- Item cards with images (use placeholder images)
- Prices displayed
- Add to favorites functionality
- Smooth scroll between sections
- Search/filter capability`,

        contact: `
- WhatsApp direct link button
- Phone call button
- Contact form
- Social media links
- Map placeholder
- Business hours display
- Animated contact icons`,

        social: `
- Photo gallery/wall display
- Instagram-style grid
- Lightbox on click
- Like/heart animation
- Share buttons
- Masonry layout
- Infinite scroll effect`,

        info: `
- Business hours display
- Location with map placeholder
- About section
- FAQs accordion
- Team/staff section
- Services list
- Smooth scroll navigation`
    };

    return requirements[type] || requirements.info;
}

/**
 * Create mock widget page when API fails
 */
function createMockWidgetPage(link: LandingLink, brandData: BrandData, index: number): GeneratedWidgetPage {
    const slug = slugify(`${brandData.name}-${link.name}`);
    const html = createMockHtml(link, brandData);

    return {
        id: `widget-mock-${Date.now()}-${index}`,
        linkId: link.id,
        title: link.name,
        slug,
        htmlContent: html,
        generatedAt: new Date()
    };
}

/**
 * Create mock HTML for testing
 */
function createMockHtml(link: LandingLink, brandData: BrandData): string {
    const primary = brandData.colors?.primary || '#6366f1';
    const secondary = brandData.colors?.secondary || '#8b5cf6';

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${link.name} - ${brandData.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%);
        }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center text-white">
        <div class="text-6xl mb-6">${link.emoji}</div>
        <h1 class="text-3xl font-bold mb-4">${link.name}</h1>
        <p class="text-lg opacity-90 mb-8">${link.description}</p>
        
        <div class="bg-white/20 rounded-xl p-6 mb-6">
            <p class="text-sm opacity-75">Widget interactivo de</p>
            <p class="text-xl font-bold">${brandData.name}</p>
        </div>
        
        <button onclick="alert('¡Funcionalidad próximamente!')" 
                class="w-full py-4 bg-white text-gray-900 rounded-xl font-bold text-lg 
                       hover:scale-105 transition-transform duration-300">
            Interactuar
        </button>
        
        <p class="mt-8 text-sm opacity-50">Powered by ${brandData.name}</p>
    </div>
</body>
</html>`;
}

/**
 * Slugify text for URLs
 */
function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Save widget pages to localStorage
 */
function saveWidgetPages(pages: GeneratedWidgetPage[]): void {
    try {
        localStorage.setItem('generated-widget-pages', JSON.stringify(pages));
        console.log(`[WidgetGenerator] Saved ${pages.length} widget pages to localStorage`);
    } catch (error) {
        console.error('[WidgetGenerator] Error saving to localStorage:', error);
    }
}

/**
 * Get widget pages from localStorage
 */
export function getWidgetPages(): GeneratedWidgetPage[] {
    try {
        const data = localStorage.getItem('generated-widget-pages');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * Get a single widget page by slug
 */
export function getWidgetPageBySlug(slug: string): GeneratedWidgetPage | null {
    const pages = getWidgetPages();
    return pages.find(p => p.slug === slug) || null;
}

/**
 * Clear all widget pages
 */
export function clearWidgetPages(): void {
    localStorage.removeItem('generated-widget-pages');
}
