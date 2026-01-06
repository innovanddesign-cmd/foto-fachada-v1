/**
 * Landing Generator Service
 * ==========================
 * Assembles high-fidelity landing pages by wrapping AI-generated widgets
 * with a professional, responsive structure and "Visual DNA".
 */

interface LandingGenerationOptions {
    title: string;
    description: string;
    widgetCode: string;
    brandColors: {
        primary: string;
        secondary: string;
    };
    contactInfo: {
        address?: string;
        phone?: string;
        email?: string;
        socials?: Record<string, string>;
    };
    bgKeyword?: string; // For Unsplash
    externalLibraries?: string[]; // CDN URLs for external libraries
}

export class LandingGeneratorService {

    /**
     * Generate the complete HTML for the landing page
     */
    static generateHtml(options: LandingGenerationOptions): string {
        const { title, description, widgetCode, brandColors, contactInfo, bgKeyword, externalLibraries = [] } = options;

        // Generate CSS Variables for Visual DNA
        const cssVars = this.generateCssVariables(brandColors.primary);

        // Background Image (Unsplash Source)
        const bgImage = `https://source.unsplash.com/1600x900/?${encodeURIComponent(bgKeyword || 'abstract,texture')}`;

        // Generate external library script tags
        const externalScripts = externalLibraries
            .map(url => `    <script src="${url}"></script>`)
            .join('\n');

        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    
    <!-- Meta Tags for SEO & Social Sharing -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${bgImage}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${bgImage}">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    
    <!-- TailwindCSS (Production: should use built CSS, but for standalone landing CDN is fine) -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <!-- External Libraries for Widget Strategy -->
${externalScripts}

    <style>
        :root {
            ${cssVars}
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: #0f0f15;
            color: #ffffff;
            margin: 0;
            overflow-x: hidden;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: 'Outfit', sans-serif;
        }

        /* --- Visual DNA: Backgrounds & Textures --- */
        .dna-bg-layer {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        }

        .dna-bg-image {
            background-image: url('${bgImage}');
            background-size: cover;
            background-position: center;
            opacity: 0.4;
            filter: blur(8px);
            transform: scale(1.1);
        }

        .dna-bg-overlay {
            background: linear-gradient(
                to bottom,
                rgba(15, 15, 21, 0.8) 0%,
                rgba(15, 15, 21, 0.95) 100%
            );
        }

        /* --- Visual DNA: Glassmorphism --- */
        .glass-panel {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 
                0 4px 30px rgba(0, 0, 0, 0.1),
                inset 0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        /* --- Visual DNA: 3D Buttons --- */
        .btn-3d {
            background: linear-gradient(to bottom, var(--color-primary-light), var(--color-primary));
            border: 1px solid rgba(255,255,255,0.2);
            border-bottom-width: 4px;
            border-bottom-color: var(--color-primary-dark);
            color: white;
            font-weight: 700;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            box-shadow: 
                0 4px 6px -1px rgba(var(--color-primary-rgb), 0.3),
                0 2px 4px -1px rgba(var(--color-primary-rgb), 0.1),
                inset 0 1px 0 rgba(255,255,255,0.2);
            transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            transform: translateY(0);
        }

        .btn-3d:active {
            transform: translateY(2px);
            border-bottom-width: 2px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }

        /* --- Animations --- */
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }

        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
        
        /* Widget Overrides to match DNA */
        .widget-wrapper button {
            /* Inherit 3D button styles if possible, or apply classes via JS */
        }
    </style>
</head>
<body class="min-h-screen flex flex-col">

    <!-- Backgrounds -->
    <div class="dna-bg-layer dna-bg-image"></div>
    <div class="dna-bg-layer dna-bg-overlay"></div>

    <!-- Header -->
    <header class="relative z-10 w-full py-6 px-4">
        <div class="max-w-md mx-auto flex justify-center">
            <div class="glass-panel px-6 py-2 rounded-full flex items-center gap-3">
                <span class="text-xl font-bold tracking-tight text-white">${options.title}</span>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow flex flex-col items-center justify-center p-4 relative z-10">
        
        <!-- Hero Section -->
        <div class="text-center max-w-2xl mx-auto mb-8 animate-float">
            <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-4 drop-shadow-lg">
                ${title}
            </h1>
            <p class="text-lg text-gray-300 md:text-xl font-light">
                ${description}
            </p>
        </div>

        <!-- Widget Container -->
        <div class="w-full max-w-md widget-wrapper relative group">
            <!-- Glow Effect -->
            <div class="absolute -inset-1 bg-gradient-to-r from-[var(--color-primary)] to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            <div class="glass-panel rounded-2xl p-6 relative bg-[#13131f]/80">
                ${widgetCode}
            </div>
        </div>

    </main>

    <!-- Footer -->
    <footer class="relative z-10 w-full py-8 mt-12 bg-black/40 backdrop-blur-md border-t border-white/5">
        <div class="max-w-md mx-auto px-6 text-center">
            <h3 class="text-white font-semibold mb-4">Contáctanos</h3>
            
            <div class="flex flex-col gap-3 text-sm text-gray-400 mb-6">
                ${contactInfo.address ? `<p class="flex items-center justify-center gap-2"><i data-lucide="map-pin" width="16"></i> ${contactInfo.address}</p>` : ''}
                ${contactInfo.phone ? `<p class="flex items-center justify-center gap-2"><i data-lucide="phone" width="16"></i> ${contactInfo.phone}</p>` : ''}
                ${contactInfo.email ? `<p class="flex items-center justify-center gap-2"><i data-lucide="mail" width="16"></i> ${contactInfo.email}</p>` : ''}
            </div>

            <div class="flex justify-center gap-6 mt-4 opacity-70">
                <!-- Social Placeholders -->
                <i data-lucide="instagram" class="cursor-pointer hover:text-[var(--color-primary)] transition"></i>
                <i data-lucide="facebook" class="cursor-pointer hover:text-[var(--color-primary)] transition"></i>
                <i data-lucide="twitter" class="cursor-pointer hover:text-[var(--color-primary)] transition"></i>
            </div>
            
            <p class="text-xs text-gray-600 mt-8">
                © ${new Date().getFullYear()} Generado por Foto Fachada AI
            </p>
        </div>
    </footer>

    <script>
        // Init Icons
        lucide.createIcons();

        // Inject 3D classes to buttons found in widget wrapper
        document.querySelectorAll('.widget-wrapper button').forEach(btn => {
            btn.classList.add('btn-3d', 'w-full', 'py-3', 'px-6', 'rounded-xl', 'text-lg');
            // Remove colliding standard tailwind classes if needed or rely on cascade
        });
    </script>
</body>
</html>
        `;
    }

    /**
     * Get external libraries (CDN URLs) needed for a specific strategy
     */
    static getLibrariesForStrategy(strategyId: string): string[] {
        const libraryMap: Record<string, string[]> = {
            'fortune-wheel': [
                'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
                'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
            ],
            'social-wall': [
                'https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/js/lightbox.min.js'
            ],
            'flash-offer': [
                'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js'
            ],
            'scratch-card': [
                'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
            ],
            'memory-game': [
                'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
            ]
        };

        return libraryMap[strategyId] || [];
    }

    /**
     * Generate CSS custom properties based on a hex color
     */
    private static generateCssVariables(hexColor: string): string {
        // Simple hex to rgb conversion
        let c = hexColor.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        const r = parseInt(c[0] + c[1], 16);
        const g = parseInt(c[2] + c[3], 16);
        const b = parseInt(c[4] + c[5], 16);

        // Very basic lightening/darkening (can be improved)
        return `
            --color-primary: ${hexColor};
            --color-primary-rgb: ${r}, ${g}, ${b};
            --color-primary-light: ${this.adjustColor(hexColor, 30)};
            --color-primary-dark: ${this.adjustColor(hexColor, -20)};
        `;
    }

    private static adjustColor(color: string, amount: number): string {
        return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }
}
