/**
 * Comparador Pro Simple Page Template
 * ====================================
 * Premium comparison table landing page with:
 * - Elegant pricing comparison table (Standard vs Exclusive Offer)
 * - Visual relief/glow effect on the discounted price
 * - Minimalist benefits checklist (Apple-style: Less is more)
 * - Sticky CTA button on scroll
 * - Ultra-light design (<1s load)
 */

import type { BrandData } from '../types';

interface ComparadorProConfig {
    servicio_estandar: string;
    precio_estandar: string;
    servicio_oferta: string;
    precio_oferta: string;
    beneficios: string;
    cta: string;
}

/**
 * Generates the complete Comparador Pro Simple Page HTML
 */
export function generateComparadorProPage(
    config: ComparadorProConfig,
    brandData: BrandData
): string {
    const {
        servicio_estandar,
        precio_estandar,
        servicio_oferta,
        precio_oferta,
        beneficios,
        cta
    } = config;

    const brandName = brandData?.name || 'Tu Negocio';
    const primaryColor = brandData?.colors?.primary || '#6366f1';

    // Parse benefits list
    const benefitsList = (beneficios || '')
        .split('\n')
        .filter(Boolean)
        .map((b: string) => b.trim());

    // Calculate savings
    const precioEst = parseFloat(precio_estandar) || 0;
    const precioOfer = parseFloat(precio_oferta) || 0;
    const ahorro = precioEst - precioOfer;
    const descuento = precioEst > 0 ? Math.round((ahorro / precioEst) * 100) : 0;

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>⚖️ ${servicio_oferta} vs ${servicio_estandar} - ${brandName}</title>
    <meta name="description" content="Compara y ahorra: ${servicio_oferta} a solo ${precio_oferta}€ vs ${precio_estandar}€">
    <meta name="theme-color" content="#0a0a0a">
    
    <!-- Preconnect for speed -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <style>
        /* ══════════════════════════════════════════════════════════════
           DESIGN SYSTEM - Apple-inspired minimalism
           ══════════════════════════════════════════════════════════════ */
        
        :root {
            --bg-dark: #0a0a0a;
            --bg-card: #141414;
            --bg-card-alt: #1a1a1a;
            --text-primary: #fafafa;
            --text-secondary: #888888;
            --text-muted: #555555;
            --accent: ${primaryColor};
            --accent-glow: ${primaryColor}66;
            --success: #34d399;
            --danger: #ef4444;
            --border: rgba(255, 255, 255, 0.08);
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
            background: var(--bg-dark);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            padding-bottom: 100px; /* Space for sticky button */
        }
        
        /* ══════════════════════════════════════════════════════════════
           HEADER
           ══════════════════════════════════════════════════════════════ */
        
        .header {
            text-align: center;
            padding: 3rem 1.5rem 2rem;
        }
        
        .savings-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--success), #10b981);
            color: var(--bg-dark);
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding: 0.4rem 1rem;
            border-radius: 100px;
            margin-bottom: 1rem;
            animation: badgePulse 2s ease-in-out infinite;
        }
        
        @keyframes badgePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .header h1 {
            font-size: 1.75rem;
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
            line-height: 1.2;
        }
        
        .header p {
            font-size: 1rem;
            color: var(--text-secondary);
        }
        
        /* ══════════════════════════════════════════════════════════════
           COMPARISON TABLE
           ══════════════════════════════════════════════════════════════ */
        
        .comparison-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        
        .comparison-table {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 2.5rem;
        }
        
        .comparison-column {
            background: var(--bg-card);
            border-radius: 20px;
            padding: 1.5rem;
            border: 1px solid var(--border);
            transition: all 0.3s ease;
        }
        
        /* Standard column - muted */
        .column-standard {
            opacity: 0.7;
        }
        
        .column-standard .column-header {
            color: var(--text-secondary);
        }
        
        .column-standard .column-price {
            color: var(--text-muted);
            text-decoration: line-through;
            text-decoration-color: var(--danger);
            text-decoration-thickness: 2px;
        }
        
        /* Offer column - highlighted with glow */
        .column-offer {
            background: linear-gradient(145deg, var(--bg-card), var(--bg-card-alt));
            border-color: var(--accent);
            box-shadow: 
                0 0 0 1px var(--accent),
                0 0 40px var(--accent-glow),
                0 20px 50px rgba(0, 0, 0, 0.5);
            transform: scale(1.02);
            animation: glowPulse 3s ease-in-out infinite;
        }
        
        @keyframes glowPulse {
            0%, 100% { 
                box-shadow: 
                    0 0 0 1px var(--accent),
                    0 0 40px var(--accent-glow),
                    0 20px 50px rgba(0, 0, 0, 0.5);
            }
            50% { 
                box-shadow: 
                    0 0 0 2px var(--accent),
                    0 0 60px var(--accent-glow),
                    0 25px 60px rgba(0, 0, 0, 0.6);
            }
        }
        
        .column-offer .recommended-tag {
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent);
            color: white;
            font-size: 0.65rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 0.3rem 0.8rem;
            border-radius: 100px;
        }
        
        .column-offer {
            position: relative;
        }
        
        .column-header {
            font-size: 0.9rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1rem;
        }
        
        .column-offer .column-header {
            color: var(--accent);
        }
        
        .column-price {
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 0.25rem;
            line-height: 1;
        }
        
        .column-offer .column-price {
            color: var(--text-primary);
            text-shadow: 0 0 30px var(--accent-glow);
        }
        
        .price-currency {
            font-size: 1.25rem;
            font-weight: 700;
        }
        
        .column-subtitle {
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        
        .column-offer .column-subtitle {
            color: var(--success);
        }
        
        /* ══════════════════════════════════════════════════════════════
           BENEFITS LIST - Apple Style Minimalism
           ══════════════════════════════════════════════════════════════ */
        
        .benefits-section {
            background: var(--bg-card);
            border-radius: 20px;
            padding: 2rem 1.5rem;
            margin-bottom: 2rem;
            border: 1px solid var(--border);
        }
        
        .benefits-title {
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-muted);
            margin-bottom: 1.5rem;
            text-align: center;
        }
        
        .benefits-list {
            list-style: none;
        }
        
        .benefit-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 0;
            border-bottom: 1px solid var(--border);
            animation: fadeInUp 0.5s ease-out backwards;
        }
        
        .benefit-item:last-child {
            border-bottom: none;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .benefit-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, var(--accent), #8b5cf6);
            border-radius: 8px;
            flex-shrink: 0;
        }
        
        .benefit-icon svg {
            width: 16px;
            height: 16px;
            stroke: white;
            stroke-width: 2.5;
            fill: none;
        }
        
        .benefit-text {
            font-size: 0.95rem;
            font-weight: 500;
            color: var(--text-primary);
        }
        
        /* ══════════════════════════════════════════════════════════════
           TRUST SIGNALS
           ══════════════════════════════════════════════════════════════ */
        
        .trust-section {
            display: flex;
            justify-content: center;
            gap: 2rem;
            padding: 1.5rem 0;
            margin-bottom: 1rem;
        }
        
        .trust-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
        }
        
        .trust-icon {
            font-size: 1.25rem;
        }
        
        .trust-text {
            font-size: 0.7rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        /* ══════════════════════════════════════════════════════════════
           STICKY CTA BUTTON
           ══════════════════════════════════════════════════════════════ */
        
        .sticky-cta-container {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, var(--bg-dark) 80%, transparent);
            padding: 1rem 1rem 1.5rem;
            z-index: 100;
            transform: translateY(100%);
            animation: slideUp 0.5s ease-out 0.5s forwards;
        }
        
        @keyframes slideUp {
            to { transform: translateY(0); }
        }
        
        .cta-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            padding: 1.1rem 2rem;
            font-size: 1rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: white;
            background: linear-gradient(135deg, var(--accent), #8b5cf6);
            border: none;
            border-radius: 14px;
            cursor: pointer;
            text-decoration: none;
            box-shadow: 
                0 4px 20px rgba(99, 102, 241, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.1) inset;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .cta-button:hover {
            transform: scale(1.02);
            box-shadow: 
                0 8px 30px rgba(99, 102, 241, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.15) inset;
        }
        
        .cta-button:active {
            transform: scale(0.98);
        }
        
        .cta-arrow {
            transition: transform 0.3s ease;
        }
        
        .cta-button:hover .cta-arrow {
            transform: translateX(4px);
        }
        
        /* ══════════════════════════════════════════════════════════════
           FOOTER
           ══════════════════════════════════════════════════════════════ */
        
        .footer {
            text-align: center;
            padding: 1.5rem;
            font-size: 0.75rem;
            color: var(--text-muted);
        }
        
        .footer a {
            color: var(--accent);
            text-decoration: none;
        }
        
        /* ══════════════════════════════════════════════════════════════
           RESPONSIVE
           ══════════════════════════════════════════════════════════════ */
        
        @media (max-width: 420px) {
            .comparison-table {
                gap: 0.75rem;
            }
            
            .comparison-column {
                padding: 1.25rem 1rem;
            }
            
            .column-price {
                font-size: 2rem;
            }
            
            .header h1 {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <!-- HEADER -->
    <header class="header">
        <div class="savings-badge">Ahorras ${ahorro.toFixed(0)}€ (${descuento}%)</div>
        <h1>¿Por qué pagar más?</h1>
        <p>Compara y decide</p>
    </header>
    
    <!-- COMPARISON TABLE -->
    <main class="comparison-container">
        <div class="comparison-table">
            <!-- Standard Column -->
            <div class="comparison-column column-standard">
                <p class="column-header">${servicio_estandar}</p>
                <p class="column-price">
                    <span class="price-currency">€</span>${precio_estandar}
                </p>
                <p class="column-subtitle">Precio habitual</p>
            </div>
            
            <!-- Offer Column - Highlighted -->
            <div class="comparison-column column-offer">
                <span class="recommended-tag">✓ Recomendado</span>
                <p class="column-header">${servicio_oferta}</p>
                <p class="column-price">
                    <span class="price-currency">€</span>${precio_oferta}
                </p>
                <p class="column-subtitle">¡Ahorra ${ahorro.toFixed(0)}€!</p>
            </div>
        </div>
        
        <!-- Benefits List -->
        <section class="benefits-section">
            <p class="benefits-title">Incluido en tu oferta</p>
            <ul class="benefits-list">
                ${benefitsList.length > 0
            ? benefitsList.map((benefit: string, index: number) => `
                        <li class="benefit-item" style="animation-delay: ${index * 100}ms">
                            <span class="benefit-icon">
                                <svg viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </span>
                            <span class="benefit-text">${benefit}</span>
                        </li>
                    `).join('')
            : `
                        <li class="benefit-item">
                            <span class="benefit-icon">
                                <svg viewBox="0 0 24 24">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </span>
                            <span class="benefit-text">Todos los beneficios incluidos</span>
                        </li>
                    `
        }
            </ul>
        </section>
        
        <!-- Trust Signals -->
        <div class="trust-section">
            <div class="trust-item">
                <span class="trust-icon">🔒</span>
                <span class="trust-text">Pago seguro</span>
            </div>
            <div class="trust-item">
                <span class="trust-icon">✓</span>
                <span class="trust-text">Garantía</span>
            </div>
            <div class="trust-item">
                <span class="trust-icon">⚡</span>
                <span class="trust-text">Inmediato</span>
            </div>
        </div>
        
        <!-- Footer -->
        <footer class="footer">
            <p>Powered by <a href="#">${brandName}</a></p>
        </footer>
    </main>
    
    <!-- STICKY CTA BUTTON -->
    <div class="sticky-cta-container">
        <a href="#" class="cta-button">
            ${cta || 'Aprovechar ahora'}
            <svg class="cta-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
        </a>
    </div>
    
    <script>
        // Animate benefits on scroll
        (function() {
            const benefits = document.querySelectorAll('.benefit-item');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, { threshold: 0.1 });
            
            benefits.forEach(benefit => {
                benefit.style.opacity = '0';
                benefit.style.transform = 'translateY(10px)';
                observer.observe(benefit);
            });
        })();
    </script>
</body>
</html>`;
}
