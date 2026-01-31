/**
 * Expert Guide (Guía del Experto) Simple Page Template
 * =====================================================
 * Luxury editorial content page with:
 * - Authority design with Serif typography
 * - Generous negative space for exclusivity
 * - Expert profile block with digital signature
 * - Structured "3 secrets" content layout
 * - Premium CTA at the end
 */

import type { BrandData } from '../types';

interface ExpertGuideConfig {
    titulo_guia: string;
    nombre_experto: string;
    cargo_experto: string;
    secreto_1: string;
    secreto_2: string;
    secreto_3: string;
    producto_cta: string;
}

/**
 * Generates the complete Expert Guide Simple Page HTML
 */
export function generateExpertGuidePage(
    config: ExpertGuideConfig,
    brandData: BrandData
): string {
    const {
        titulo_guia,
        nombre_experto,
        cargo_experto,
        secreto_1,
        secreto_2,
        secreto_3,
        producto_cta
    } = config;

    const brandName = brandData?.name || 'Tu Negocio';
    const primaryColor = brandData?.colors?.primary || '#8b5cf6';
    const accentColor = brandData?.colors?.accent || '#f59e0b';

    // Get initials for signature
    const initials = (nombre_experto || 'Experto')
        .split(' ')
        .map(n => n.charAt(0).toUpperCase())
        .join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📚 ${titulo_guia || 'Guía del Experto'} - ${brandName}</title>
    <meta name="description" content="${titulo_guia} - Por ${nombre_experto || 'nuestro experto'} de ${brandName}">
    <meta name="theme-color" content="#fafafa">
    
    <!-- Luxury Serif + Sans fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    
    <style>
        /* ══════════════════════════════════════════════════════════════
           DESIGN SYSTEM - Editorial Luxury
           ══════════════════════════════════════════════════════════════ */
        
        :root {
            --bg-cream: #faf9f7;
            --bg-white: #ffffff;
            --text-dark: #1a1a1a;
            --text-body: #3d3d3d;
            --text-muted: #6b6b6b;
            --accent: ${primaryColor};
            --gold: ${accentColor};
            --border: rgba(0, 0, 0, 0.08);
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        html {
            scroll-behavior: smooth;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-cream);
            color: var(--text-body);
            line-height: 1.7;
            -webkit-font-smoothing: antialiased;
        }
        
        /* ══════════════════════════════════════════════════════════════
           ARTICLE CONTAINER
           ══════════════════════════════════════════════════════════════ */
        
        .article {
            max-width: 680px;
            margin: 0 auto;
            padding: 4rem 2rem 6rem;
        }
        
        /* ══════════════════════════════════════════════════════════════
           HEADER - Editorial Style
           ══════════════════════════════════════════════════════════════ */
        
        .article-header {
            text-align: center;
            margin-bottom: 4rem;
            padding-bottom: 3rem;
            border-bottom: 1px solid var(--border);
        }
        
        .category-label {
            font-family: 'Inter', sans-serif;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: var(--accent);
            margin-bottom: 1.5rem;
        }
        
        .article-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: clamp(2rem, 6vw, 3rem);
            font-weight: 700;
            color: var(--text-dark);
            line-height: 1.2;
            margin-bottom: 1.5rem;
        }
        
        .article-subtitle {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 1.25rem;
            font-weight: 400;
            font-style: italic;
            color: var(--text-muted);
        }
        
        /* ══════════════════════════════════════════════════════════════
           AUTHOR / EXPERT BLOCK
           ══════════════════════════════════════════════════════════════ */
        
        .author-block {
            display: flex;
            align-items: center;
            gap: 1.25rem;
            padding: 2rem 0;
            margin-bottom: 3rem;
        }
        
        .author-avatar {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: linear-gradient(145deg, var(--accent), var(--gold));
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Playfair Display', serif;
            font-size: 1.5rem;
            font-weight: 600;
            color: white;
            flex-shrink: 0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .author-info {
            flex: 1;
        }
        
        .author-name {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 0.25rem;
        }
        
        .author-title {
            font-size: 0.85rem;
            color: var(--text-muted);
        }
        
        .author-signature {
            margin-top: 0.5rem;
        }
        
        /* Digital Signature SVG */
        .signature-svg {
            width: 100px;
            height: 40px;
            opacity: 0.7;
        }
        
        /* ══════════════════════════════════════════════════════════════
           CONTENT - Editorial Typography
           ══════════════════════════════════════════════════════════════ */
        
        .article-content {
            margin-bottom: 4rem;
        }
        
        .intro-paragraph {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 1.25rem;
            font-style: italic;
            color: var(--text-muted);
            text-align: center;
            padding: 2rem 1rem;
            margin-bottom: 3rem;
            border-left: 3px solid var(--accent);
            background: var(--bg-white);
        }
        
        /* Secret Sections */
        .secret-section {
            margin-bottom: 3.5rem;
            animation: fadeInUp 0.6s ease-out backwards;
        }
        
        .secret-section:nth-child(1) { animation-delay: 0.1s; }
        .secret-section:nth-child(2) { animation-delay: 0.2s; }
        .secret-section:nth-child(3) { animation-delay: 0.3s; }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .secret-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            background: var(--text-dark);
            color: white;
            font-family: 'Playfair Display', serif;
            font-size: 1.25rem;
            font-weight: 600;
            border-radius: 50%;
            margin-bottom: 1rem;
        }
        
        .secret-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 1rem;
            line-height: 1.3;
        }
        
        .secret-content {
            font-size: 1.05rem;
            line-height: 1.8;
            color: var(--text-body);
        }
        
        .secret-content p {
            margin-bottom: 1rem;
        }
        
        /* Divider */
        .section-divider {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            margin: 3rem 0;
            color: var(--text-muted);
        }
        
        .divider-line {
            flex: 1;
            height: 1px;
            background: var(--border);
        }
        
        .divider-icon {
            font-size: 1.25rem;
            opacity: 0.5;
        }
        
        /* ══════════════════════════════════════════════════════════════
           CLOSING CTA
           ══════════════════════════════════════════════════════════════ */
        
        .cta-section {
            background: var(--bg-white);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 3rem 2rem;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
        }
        
        .cta-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 0.75rem;
        }
        
        .cta-subtitle {
            font-size: 1rem;
            color: var(--text-muted);
            margin-bottom: 2rem;
        }
        
        .cta-button {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2.5rem;
            font-family: 'Inter', sans-serif;
            font-size: 0.95rem;
            font-weight: 600;
            color: white;
            background: var(--text-dark);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s;
            letter-spacing: 0.02em;
        }
        
        .cta-button:hover {
            background: var(--accent);
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }
        
        .cta-button svg {
            transition: transform 0.3s;
        }
        
        .cta-button:hover svg {
            transform: translateX(4px);
        }
        
        /* ══════════════════════════════════════════════════════════════
           FOOTER
           ══════════════════════════════════════════════════════════════ */
        
        .article-footer {
            text-align: center;
            padding-top: 3rem;
            margin-top: 3rem;
            border-top: 1px solid var(--border);
        }
        
        .footer-brand {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 0.5rem;
        }
        
        .footer-tagline {
            font-size: 0.85rem;
            color: var(--text-muted);
        }
        
        /* ══════════════════════════════════════════════════════════════
           RESPONSIVE
           ══════════════════════════════════════════════════════════════ */
        
        @media (max-width: 600px) {
            .article {
                padding: 2.5rem 1.5rem 4rem;
            }
            
            .article-title {
                font-size: 1.75rem;
            }
            
            .author-block {
                flex-direction: column;
                text-align: center;
            }
            
            .intro-paragraph {
                font-size: 1.1rem;
                padding: 1.5rem 1rem;
            }
            
            .secret-title {
                font-size: 1.25rem;
            }
            
            .cta-section {
                padding: 2rem 1.5rem;
            }
        }
    </style>
</head>
<body>
    <article class="article">
        <!-- Header -->
        <header class="article-header">
            <p class="category-label">Guía del Experto</p>
            <h1 class="article-title">${titulo_guia || 'Los 3 secretos que nadie te cuenta'}</h1>
            <p class="article-subtitle">Una guía exclusiva por ${nombre_experto || 'nuestro experto'}</p>
        </header>
        
        <!-- Author Block -->
        <div class="author-block">
            <div class="author-avatar">${initials}</div>
            <div class="author-info">
                <p class="author-name">${nombre_experto || 'Experto'}</p>
                <p class="author-title">${cargo_experto || 'Especialista'} en ${brandName}</p>
                <div class="author-signature">
                    <!-- Digital Signature SVG -->
                    <svg class="signature-svg" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 35 Q20 10 35 30 T60 25 Q75 20 85 35 Q95 45 110 30" 
                              stroke="${primaryColor}" 
                              stroke-width="2" 
                              stroke-linecap="round" 
                              fill="none"
                              opacity="0.7"/>
                        <path d="M15 40 Q25 38 35 42 Q45 46 55 40" 
                              stroke="${primaryColor}" 
                              stroke-width="1.5" 
                              stroke-linecap="round" 
                              fill="none"
                              opacity="0.5"/>
                    </svg>
                </div>
            </div>
        </div>
        
        <!-- Content -->
        <div class="article-content">
            <!-- Intro Quote -->
            <blockquote class="intro-paragraph">
                "Después de años de experiencia, he destilado todo lo que sé en estos tres principios fundamentales."
            </blockquote>
            
            <!-- Secret 1 -->
            ${secreto_1 ? `
            <section class="secret-section">
                <span class="secret-number">1</span>
                <h2 class="secret-title">El primer secreto</h2>
                <div class="secret-content">
                    <p>${secreto_1}</p>
                </div>
            </section>
            
            <div class="section-divider">
                <span class="divider-line"></span>
                <span class="divider-icon">✦</span>
                <span class="divider-line"></span>
            </div>
            ` : ''}
            
            <!-- Secret 2 -->
            ${secreto_2 ? `
            <section class="secret-section">
                <span class="secret-number">2</span>
                <h2 class="secret-title">El segundo aspecto clave</h2>
                <div class="secret-content">
                    <p>${secreto_2}</p>
                </div>
            </section>
            
            <div class="section-divider">
                <span class="divider-line"></span>
                <span class="divider-icon">✦</span>
                <span class="divider-line"></span>
            </div>
            ` : ''}
            
            <!-- Secret 3 -->
            ${secreto_3 ? `
            <section class="secret-section">
                <span class="secret-number">3</span>
                <h2 class="secret-title">El secreto final</h2>
                <div class="secret-content">
                    <p>${secreto_3}</p>
                </div>
            </section>
            ` : ''}
        </div>
        
        <!-- CTA Section -->
        <section class="cta-section">
            <h3 class="cta-title">¿Listo para experimentarlo?</h3>
            <p class="cta-subtitle">Pon en práctica estos secretos con nosotros</p>
            <a href="#" class="cta-button">
                Quiero probar ${producto_cta ? `el ${producto_cta}` : 'ahora'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </a>
        </section>
        
        <!-- Footer -->
        <footer class="article-footer">
            <p class="footer-brand">${brandName}</p>
            <p class="footer-tagline">Donde la excelencia es nuestro estándar</p>
        </footer>
    </article>
    
    <script>
        // Smooth reveal on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.secret-section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
    </script>
</body>
</html>`;
}
