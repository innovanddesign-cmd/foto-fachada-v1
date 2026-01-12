/**
 * Flash Offer Simple Page Template
 * =================================
 * Ultra-optimized landing page for flash offers with:
 * - Millisecond countdown timer for psychological urgency
 * - Dynamic stock progress bar
 * - Bilingual support (ES/EN)
 * - "Vicio" design style (saturated colors, bold typography, deep shadows)
 * - Ultra-light (<1s load time)
 */

import type { BrandData } from '../types';

interface FlashOfferConfig {
    producto: string;
    precio_original: string;
    precio_oferta: string;
    tiempo_limite: string;
    mensaje_urgencia: string;
    imagen_producto?: string;
    stock_porcentaje?: number;
}

/**
 * Generates the complete Flash Offer Simple Page HTML
 */
export function generateFlashOfferPage(
    config: FlashOfferConfig,
    brandData: BrandData
): string {
    const {
        producto,
        precio_original,
        precio_oferta,
        tiempo_limite,
        mensaje_urgencia,
        imagen_producto,
        stock_porcentaje = 92
    } = config;

    const descuento = Math.round(
        ((parseFloat(precio_original) - parseFloat(precio_oferta)) / parseFloat(precio_original)) * 100
    ) || 50;

    const brandName = brandData?.name || 'Tu Negocio';
    const primaryColor = brandData?.colors?.primary || '#ff2d55';
    const accent = brandData?.colors?.accent || '#ffd60a';

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>⚡ ${producto} - ${mensaje_urgencia}</title>
    <meta name="description" content="${producto} con ${descuento}% de descuento. ${mensaje_urgencia}">
    <meta name="theme-color" content="#0a0a0a">
    
    <!-- Preconnect for speed -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@500;800;900&display=swap" rel="stylesheet">
    
    <style>
        /* ══════════════════════════════════════════════════════════════
           VICIO DESIGN SYSTEM - Saturated, Bold, Deep Shadows
           ══════════════════════════════════════════════════════════════ */
        
        :root {
            --vicio-black: #0a0a0a;
            --vicio-dark: #141414;
            --vicio-red: #ff2d55;
            --vicio-yellow: #ffd60a;
            --vicio-white: #fafafa;
            --vicio-gray: #888;
            --brand-primary: ${primaryColor};
            --brand-accent: ${accent};
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
            font-family: 'Inter', -apple-system, sans-serif;
            background: var(--vicio-black);
            color: var(--vicio-white);
            min-height: 100vh;
            overflow-x: hidden;
        }
        
        /* ══════════════════════════════════════════════════════════════
           URGENCY HEADER - Psychological Countdown
           ══════════════════════════════════════════════════════════════ */
        
        .urgency-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: linear-gradient(90deg, var(--vicio-red), #ff6b35, var(--vicio-red));
            background-size: 200% 100%;
            animation: gradientPulse 2s ease-in-out infinite;
            padding: 0.6rem 1rem;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 4px 30px rgba(255, 45, 85, 0.5);
        }
        
        @keyframes gradientPulse {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .urgency-text {
            font-size: 0.85rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: white;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .countdown {
            display: flex;
            gap: 0.25rem;
            font-family: 'Space Grotesk', monospace;
        }
        
        .countdown-segment {
            background: rgba(0,0,0,0.3);
            padding: 0.3rem 0.5rem;
            border-radius: 4px;
            min-width: 36px;
            text-align: center;
        }
        
        .countdown-value {
            font-size: 1rem;
            font-weight: 700;
            color: white;
        }
        
        .countdown-label {
            font-size: 0.55rem;
            color: rgba(255,255,255,0.7);
            text-transform: uppercase;
        }
        
        .countdown-ms {
            font-size: 0.9rem;
            opacity: 0.9;
            animation: blink 0.1s infinite;
        }
        
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        /* ══════════════════════════════════════════════════════════════
           LANGUAGE SELECTOR
           ══════════════════════════════════════════════════════════════ */
        
        .lang-selector {
            position: fixed;
            top: 50px;
            right: 1rem;
            z-index: 999;
            display: flex;
            gap: 0.25rem;
            background: rgba(20,20,20,0.9);
            padding: 0.25rem;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .lang-btn {
            padding: 0.35rem 0.6rem;
            font-size: 0.7rem;
            font-weight: 700;
            background: transparent;
            border: none;
            color: var(--vicio-gray);
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s;
        }
        
        .lang-btn.active {
            background: var(--vicio-red);
            color: white;
        }
        
        /* ══════════════════════════════════════════════════════════════
           MAIN CONTAINER
           ══════════════════════════════════════════════════════════════ */
        
        .main {
            padding: 80px 1.5rem 3rem;
            max-width: 480px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }
        
        /* ══════════════════════════════════════════════════════════════
           HERO VISUAL - Product with Discount Badge
           ══════════════════════════════════════════════════════════════ */
        
        .hero-visual {
            position: relative;
            width: 100%;
            max-width: 320px;
            margin-bottom: 1.5rem;
        }
        
        .product-image-container {
            position: relative;
            aspect-ratio: 1;
            background: linear-gradient(145deg, var(--vicio-dark), #1a1a1a);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 
                0 20px 60px rgba(0,0,0,0.8),
                0 0 0 1px rgba(255,255,255,0.05),
                inset 0 0 80px rgba(255, 45, 85, 0.1);
        }
        
        .product-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .product-image-container:hover .product-image {
            transform: scale(1.05);
        }
        
        .product-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(145deg, #1a1a1a, #0a0a0a);
            font-size: 4rem;
        }
        
        .product-placeholder span {
            font-size: 1rem;
            color: var(--vicio-gray);
            margin-top: 0.5rem;
        }
        
        /* Floating Discount Badge */
        .discount-badge {
            position: absolute;
            top: -10px;
            right: -10px;
            width: 90px;
            height: 90px;
            background: var(--vicio-yellow);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 
                0 10px 40px rgba(255, 214, 10, 0.5),
                0 0 0 4px var(--vicio-black),
                0 0 0 6px var(--vicio-yellow);
            animation: badgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, 
                       badgePulse 2s ease-in-out infinite 0.5s;
            z-index: 10;
        }
        
        @keyframes badgePop {
            0% { transform: scale(0) rotate(-20deg); }
            100% { transform: scale(1) rotate(-12deg); }
        }
        
        @keyframes badgePulse {
            0%, 100% { transform: scale(1) rotate(-12deg); }
            50% { transform: scale(1.08) rotate(-12deg); }
        }
        
        .discount-value {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 2rem;
            font-weight: 700;
            color: var(--vicio-black);
            line-height: 1;
        }
        
        .discount-label {
            font-size: 0.7rem;
            font-weight: 800;
            color: var(--vicio-black);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        /* ══════════════════════════════════════════════════════════════
           CONVERSION COPY
           ══════════════════════════════════════════════════════════════ */
        
        .copy-section {
            text-align: center;
            margin-bottom: 1.5rem;
        }
        
        .headline {
            font-size: 2rem;
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 0.75rem;
            text-shadow: 0 4px 30px rgba(255, 45, 85, 0.3);
        }
        
        .headline .highlight {
            background: linear-gradient(90deg, var(--vicio-red), var(--vicio-yellow));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .product-name {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--vicio-white);
            margin-bottom: 0.5rem;
        }
        
        .subheadline {
            font-size: 0.95rem;
            color: var(--vicio-gray);
            font-weight: 500;
        }
        
        /* ══════════════════════════════════════════════════════════════
           PRICE SECTION
           ══════════════════════════════════════════════════════════════ */
        
        .price-section {
            display: flex;
            align-items: baseline;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .price-original {
            font-size: 1.5rem;
            color: var(--vicio-gray);
            text-decoration: line-through;
            text-decoration-color: var(--vicio-red);
            text-decoration-thickness: 3px;
        }
        
        .price-offer {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 3.5rem;
            font-weight: 700;
            color: var(--vicio-yellow);
            text-shadow: 0 0 40px rgba(255, 214, 10, 0.5);
            animation: priceGlow 2s ease-in-out infinite;
        }
        
        @keyframes priceGlow {
            0%, 100% { text-shadow: 0 0 40px rgba(255, 214, 10, 0.5); }
            50% { text-shadow: 0 0 60px rgba(255, 214, 10, 0.8), 0 0 80px rgba(255, 214, 10, 0.4); }
        }
        
        .price-currency {
            font-size: 1.5rem;
        }
        
        /* ══════════════════════════════════════════════════════════════
           STOCK LIMITATION BAR
           ══════════════════════════════════════════════════════════════ */
        
        .stock-section {
            width: 100%;
            max-width: 320px;
            margin-bottom: 2rem;
        }
        
        .stock-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
        }
        
        .stock-label-text {
            color: var(--vicio-gray);
        }
        
        .stock-label-value {
            color: var(--vicio-red);
            font-weight: 800;
        }
        
        .stock-bar {
            height: 12px;
            background: var(--vicio-dark);
            border-radius: 6px;
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
        }
        
        .stock-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--vicio-red), #ff6b35);
            border-radius: 6px;
            box-shadow: 0 0 20px rgba(255, 45, 85, 0.5);
            animation: stockWarning 1.5s ease-in-out infinite;
            transition: width 1s ease-out;
        }
        
        @keyframes stockWarning {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        /* ══════════════════════════════════════════════════════════════
           CTA BUTTON
           ══════════════════════════════════════════════════════════════ */
        
        .cta-button {
            display: block;
            width: 100%;
            max-width: 320px;
            padding: 1.25rem 2rem;
            font-size: 1.2rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--vicio-black);
            background: linear-gradient(90deg, var(--vicio-yellow), #ffed4a, var(--vicio-yellow));
            background-size: 200% 100%;
            border: none;
            border-radius: 14px;
            cursor: pointer;
            box-shadow: 
                0 10px 40px rgba(255, 214, 10, 0.4),
                0 0 0 2px rgba(255, 214, 10, 0.2);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            animation: ctaShine 3s linear infinite;
            text-decoration: none;
            text-align: center;
        }
        
        @keyframes ctaShine {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
        }
        
        .cta-button:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 
                0 15px 50px rgba(255, 214, 10, 0.5),
                0 0 0 3px rgba(255, 214, 10, 0.3);
        }
        
        .cta-button:active {
            transform: translateY(0) scale(0.98);
        }
        
        /* ══════════════════════════════════════════════════════════════
           TRUST SIGNALS
           ══════════════════════════════════════════════════════════════ */
        
        .trust-signals {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255,255,255,0.05);
        }
        
        .trust-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: 0.75rem;
            color: var(--vicio-gray);
        }
        
        .trust-icon {
            font-size: 1.25rem;
            margin-bottom: 0.25rem;
        }
        
        /* ══════════════════════════════════════════════════════════════
           FOOTER
           ══════════════════════════════════════════════════════════════ */
        
        .footer {
            margin-top: auto;
            padding-top: 2rem;
            text-align: center;
            font-size: 0.75rem;
            color: var(--vicio-gray);
        }
        
        .footer a {
            color: var(--vicio-red);
            text-decoration: none;
        }
        
        /* ══════════════════════════════════════════════════════════════
           RESPONSIVE
           ══════════════════════════════════════════════════════════════ */
        
        @media (max-width: 380px) {
            .headline { font-size: 1.6rem; }
            .price-offer { font-size: 2.75rem; }
            .discount-badge { width: 75px; height: 75px; }
            .discount-value { font-size: 1.6rem; }
        }
    </style>
</head>
<body>
    <!-- URGENCY HEADER -->
    <header class="urgency-header">
        <span class="urgency-text" data-es="⚡ Oferta termina en" data-en="⚡ Offer ends in">⚡ Oferta termina en</span>
        <div class="countdown" id="countdown">
            <div class="countdown-segment">
                <div class="countdown-value" id="hours">00</div>
                <div class="countdown-label" data-es="HRS" data-en="HRS">HRS</div>
            </div>
            <div class="countdown-segment">
                <div class="countdown-value" id="minutes">00</div>
                <div class="countdown-label" data-es="MIN" data-en="MIN">MIN</div>
            </div>
            <div class="countdown-segment">
                <div class="countdown-value" id="seconds">00</div>
                <div class="countdown-label" data-es="SEG" data-en="SEC">SEG</div>
            </div>
            <div class="countdown-segment">
                <div class="countdown-value countdown-ms" id="ms">00</div>
                <div class="countdown-label">MS</div>
            </div>
        </div>
    </header>
    
    <!-- LANGUAGE SELECTOR -->
    <div class="lang-selector">
        <button class="lang-btn active" data-lang="es" onclick="setLang('es')">ES</button>
        <button class="lang-btn" data-lang="en" onclick="setLang('en')">EN</button>
    </div>
    
    <!-- MAIN CONTENT -->
    <main class="main">
        <!-- Hero Visual -->
        <div class="hero-visual">
            <div class="product-image-container">
                ${imagen_producto
            ? `<img src="${imagen_producto}" alt="${producto}" class="product-image" loading="eager">`
            : `<div class="product-placeholder">📦<span>${producto}</span></div>`
        }
            </div>
            <div class="discount-badge">
                <span class="discount-value">${descuento}%</span>
                <span class="discount-label" data-es="DTO" data-en="OFF">DTO</span>
            </div>
        </div>
        
        <!-- Conversion Copy -->
        <div class="copy-section">
            <h1 class="headline" data-es="Lo quieres. Lo tienes. <span class='highlight'>Solo ahora.</span>" data-en="You want it. You got it. <span class='highlight'>Right now.</span>">
                Lo quieres. Lo tienes. <span class="highlight">Solo ahora.</span>
            </h1>
            <h2 class="product-name">${producto}</h2>
            <p class="subheadline" data-es="${mensaje_urgencia}" data-en="Limited time offer">
                ${mensaje_urgencia}
            </p>
        </div>
        
        <!-- Price Section -->
        <div class="price-section">
            <span class="price-original">${precio_original}€</span>
            <span class="price-offer"><span class="price-currency">€</span>${precio_oferta}</span>
        </div>
        
        <!-- Stock Limitation -->
        <div class="stock-section">
            <div class="stock-label">
                <span class="stock-label-text" data-es="🔥 Unidades reservadas" data-en="🔥 Units reserved">🔥 Unidades reservadas</span>
                <span class="stock-label-value">${stock_porcentaje}%</span>
            </div>
            <div class="stock-bar">
                <div class="stock-fill" style="width: ${stock_porcentaje}%"></div>
            </div>
        </div>
        
        <!-- CTA Button -->
        <a href="#" class="cta-button" data-es="¡LO QUIERO YA!" data-en="GET IT NOW!">
            ¡LO QUIERO YA!
        </a>
        
        <!-- Trust Signals -->
        <div class="trust-signals">
            <div class="trust-item">
                <span class="trust-icon">🔒</span>
                <span data-es="Pago seguro" data-en="Secure payment">Pago seguro</span>
            </div>
            <div class="trust-item">
                <span class="trust-icon">🚚</span>
                <span data-es="Envío 24h" data-en="24h delivery">Envío 24h</span>
            </div>
            <div class="trust-item">
                <span class="trust-icon">↩️</span>
                <span data-es="30 días" data-en="30 days">30 días</span>
            </div>
        </div>
        
        <!-- Footer -->
        <footer class="footer">
            <p>Powered by <a href="#">${brandName}</a></p>
        </footer>
    </main>
    
    <script>
        // ══════════════════════════════════════════════════════════════
        // COUNTDOWN TIMER WITH MILLISECONDS
        // ══════════════════════════════════════════════════════════════
        
        (function() {
            // Set end time (parse tiempo_limite or default to 24 hours)
            const tiempoLimite = "${tiempo_limite}";
            let endTime;
            
            if (tiempoLimite.includes('hora')) {
                const hours = parseInt(tiempoLimite) || 24;
                endTime = Date.now() + (hours * 60 * 60 * 1000);
            } else {
                // Default: 24 hours from now
                endTime = Date.now() + (24 * 60 * 60 * 1000);
            }
            
            // Store in sessionStorage to persist across refreshes
            const storedEnd = sessionStorage.getItem('flashOfferEnd');
            if (storedEnd) {
                endTime = parseInt(storedEnd);
            } else {
                sessionStorage.setItem('flashOfferEnd', endTime);
            }
            
            const hoursEl = document.getElementById('hours');
            const minsEl = document.getElementById('minutes');
            const secsEl = document.getElementById('seconds');
            const msEl = document.getElementById('ms');
            
            function updateCountdown() {
                const now = Date.now();
                const diff = Math.max(0, endTime - now);
                
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                const ms = Math.floor((diff % 1000) / 10);
                
                hoursEl.textContent = String(hours).padStart(2, '0');
                minsEl.textContent = String(mins).padStart(2, '0');
                secsEl.textContent = String(secs).padStart(2, '0');
                msEl.textContent = String(ms).padStart(2, '0');
                
                if (diff === 0) {
                    // Reset for demo purposes
                    sessionStorage.removeItem('flashOfferEnd');
                    location.reload();
                }
            }
            
            // Update every 10ms for smooth milliseconds
            setInterval(updateCountdown, 10);
            updateCountdown();
        })();
        
        // ══════════════════════════════════════════════════════════════
        // BILINGUAL SUPPORT
        // ══════════════════════════════════════════════════════════════
        
        function setLang(lang) {
            document.querySelectorAll('[data-' + lang + ']').forEach(el => {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = el.getAttribute('data-' + lang);
                } else {
                    el.innerHTML = el.getAttribute('data-' + lang);
                }
            });
            
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === lang);
            });
            
            localStorage.setItem('flashOfferLang', lang);
        }
        
        // Auto-detect language
        (function() {
            const savedLang = localStorage.getItem('flashOfferLang');
            const browserLang = navigator.language.slice(0, 2);
            const lang = savedLang || (browserLang === 'en' ? 'en' : 'es');
            setLang(lang);
        })();
        
        // ══════════════════════════════════════════════════════════════
        // DYNAMIC STOCK ANIMATION
        // ══════════════════════════════════════════════════════════════
        
        (function() {
            const stockFill = document.querySelector('.stock-fill');
            const stockValue = document.querySelector('.stock-label-value');
            let currentStock = ${stock_porcentaje};
            
            // Gradually increase stock "reserved" to create urgency
            setInterval(() => {
                if (currentStock < 98 && Math.random() > 0.7) {
                    currentStock += 1;
                    stockFill.style.width = currentStock + '%';
                    stockValue.textContent = currentStock + '%';
                }
            }, 5000);
        })();
    </script>
</body>
</html>`;
}
