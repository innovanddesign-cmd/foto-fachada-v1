/**
 * Lead Magnet (Producto Gancho) Simple Page Template
 * ===================================================
 * High-conversion lead capture page with:
 * - Central spotlight visual for the free product
 * - Single-field form (email or WhatsApp)
 * - Digital ticket with unique code after registration
 * - Clear redemption instructions
 * - Scarcity timer (15 min countdown)
 */

import type { BrandData } from '../types';

interface LeadMagnetConfig {
    producto_gratis: string;
    descripcion: string;
    tiempo_validez: string;
    instrucciones: string;
}

/**
 * Generates the complete Lead Magnet Simple Page HTML
 */
export function generateLeadMagnetPage(
    config: LeadMagnetConfig,
    brandData: BrandData
): string {
    const {
        producto_gratis,
        descripcion,
        tiempo_validez,
        instrucciones
    } = config;

    const brandName = brandData?.name || 'Tu Negocio';
    const primaryColor = brandData?.colors?.primary || '#10b981';
    const accentColor = brandData?.colors?.accent || '#f59e0b';
    const validezMinutos = parseInt(tiempo_validez) || 15;

    // Generate unique code
    const uniqueCode = `GIFT-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>🎁 ${producto_gratis || 'Regalo Gratis'} - ${brandName}</title>
    <meta name="description" content="${descripcion || 'Consigue tu regalo gratis en ' + brandName}">
    <meta name="theme-color" content="#0a0a0a">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <style>
        /* ══════════════════════════════════════════════════════════════
           DESIGN SYSTEM
           ══════════════════════════════════════════════════════════════ */
        
        :root {
            --bg-dark: #0a0a0a;
            --bg-card: #141414;
            --text-primary: #fafafa;
            --text-secondary: #888888;
            --text-muted: #555555;
            --brand-primary: ${primaryColor};
            --brand-accent: ${accentColor};
            --success: #34d399;
            --danger: #ef4444;
            --border: rgba(255, 255, 255, 0.08);
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            -webkit-font-smoothing: antialiased;
        }
        
        /* ══════════════════════════════════════════════════════════════
           MAIN CONTAINER
           ══════════════════════════════════════════════════════════════ */
        
        .main-container {
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        
        /* ══════════════════════════════════════════════════════════════
           SPOTLIGHT VISUAL
           ══════════════════════════════════════════════════════════════ */
        
        .spotlight-container {
            position: relative;
            margin-bottom: 2rem;
        }
        
        .spotlight {
            position: relative;
            width: 160px;
            height: 160px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .spotlight-bg {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle, var(--brand-accent) 0%, transparent 70%);
            border-radius: 50%;
            opacity: 0.3;
            filter: blur(30px);
            animation: spotlightPulse 3s ease-in-out infinite;
        }
        
        @keyframes spotlightPulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.5; }
        }
        
        .spotlight-ring {
            position: absolute;
            inset: 0;
            border: 3px solid var(--brand-accent);
            border-radius: 50%;
            opacity: 0.3;
            animation: ringPulse 2s ease-in-out infinite;
        }
        
        @keyframes ringPulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.1); opacity: 0.1; }
        }
        
        .spotlight-icon {
            font-size: 5rem;
            position: relative;
            z-index: 1;
            animation: iconFloat 3s ease-in-out infinite;
        }
        
        @keyframes iconFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .free-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: var(--success);
            color: var(--bg-dark);
            font-size: 0.7rem;
            font-weight: 800;
            text-transform: uppercase;
            padding: 0.3rem 0.75rem;
            border-radius: 100px;
            letter-spacing: 0.05em;
        }
        
        /* ══════════════════════════════════════════════════════════════
           HEADER TEXT
           ══════════════════════════════════════════════════════════════ */
        
        .product-name {
            font-size: 2rem;
            font-weight: 900;
            background: linear-gradient(135deg, var(--brand-accent), var(--brand-primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }
        
        .product-description {
            font-size: 1rem;
            color: var(--text-secondary);
            margin-bottom: 2rem;
        }
        
        /* ══════════════════════════════════════════════════════════════
           LEAD FORM (Step 1)
           ══════════════════════════════════════════════════════════════ */
        
        .lead-form-section {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 2rem 1.5rem;
            margin-bottom: 1rem;
        }
        
        .lead-form-section.hidden {
            display: none;
        }
        
        .form-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1.5rem;
        }
        
        .input-group {
            position: relative;
            margin-bottom: 1rem;
        }
        
        .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
        }
        
        .lead-input {
            width: 100%;
            padding: 1rem 1rem 1rem 3rem;
            font-size: 1rem;
            font-family: inherit;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid var(--border);
            border-radius: 12px;
            color: var(--text-primary);
            outline: none;
            transition: all 0.3s;
        }
        
        .lead-input::placeholder {
            color: var(--text-muted);
        }
        
        .lead-input:focus {
            border-color: var(--brand-primary);
            background: rgba(255, 255, 255, 0.08);
        }
        
        .input-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .input-tab {
            flex: 1;
            padding: 0.75rem;
            font-size: 0.85rem;
            font-weight: 600;
            background: transparent;
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text-muted);
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .input-tab.active {
            background: var(--brand-primary);
            border-color: var(--brand-primary);
            color: white;
        }
        
        .submit-btn {
            width: 100%;
            padding: 1.1rem;
            font-size: 1rem;
            font-weight: 700;
            color: white;
            background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }
        
        .submit-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
        }
        
        .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .privacy-note {
            font-size: 0.7rem;
            color: var(--text-muted);
            margin-top: 1rem;
        }
        
        /* ══════════════════════════════════════════════════════════════
           DIGITAL TICKET (Step 2)
           ══════════════════════════════════════════════════════════════ */
        
        .ticket-section {
            display: none;
            animation: ticketReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .ticket-section.visible {
            display: block;
        }
        
        @keyframes ticketReveal {
            0% { transform: scale(0.8) rotateX(20deg); opacity: 0; }
            100% { transform: scale(1) rotateX(0); opacity: 1; }
        }
        
        .ticket {
            background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
            border: 2px solid var(--border);
            border-radius: 20px;
            overflow: hidden;
            position: relative;
        }
        
        /* Ticket perforation effect */
        .ticket::before,
        .ticket::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            height: 20px;
            background-image: radial-gradient(circle, var(--bg-dark) 10px, transparent 10px);
            background-size: 30px 20px;
            background-position: 15px 0;
        }
        
        .ticket::before {
            top: -10px;
        }
        
        .ticket::after {
            bottom: -10px;
        }
        
        .ticket-header {
            background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
            padding: 1.5rem;
            text-align: center;
        }
        
        .ticket-brand {
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            opacity: 0.8;
            margin-bottom: 0.25rem;
        }
        
        .ticket-product {
            font-size: 1.5rem;
            font-weight: 800;
        }
        
        .ticket-body {
            padding: 2rem 1.5rem;
            text-align: center;
        }
        
        .ticket-code-label {
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
        }
        
        .ticket-code {
            font-family: 'Courier New', monospace;
            font-size: 2rem;
            font-weight: 900;
            color: var(--brand-accent);
            letter-spacing: 0.15em;
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            border: 2px dashed var(--brand-accent);
        }
        
        /* Scarcity Timer */
        .scarcity-timer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 10px;
            margin-bottom: 1.5rem;
        }
        
        .timer-icon {
            font-size: 1.25rem;
            animation: timerPulse 1s ease-in-out infinite;
        }
        
        @keyframes timerPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .timer-text {
            font-size: 0.9rem;
            color: var(--danger);
            font-weight: 600;
        }
        
        .timer-countdown {
            font-family: monospace;
            font-size: 1.1rem;
            font-weight: 800;
            color: var(--danger);
        }
        
        .timer-expired {
            color: var(--text-muted);
        }
        
        /* Instructions */
        .ticket-instructions {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 12px;
            padding: 1rem;
        }
        
        .instructions-icon {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }
        
        .instructions-text {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--success);
        }
        
        .instructions-detail {
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }
        
        /* ══════════════════════════════════════════════════════════════
           FOOTER
           ══════════════════════════════════════════════════════════════ */
        
        .footer {
            margin-top: 2rem;
            font-size: 0.75rem;
            color: var(--text-muted);
        }
        
        .footer a {
            color: var(--brand-primary);
            text-decoration: none;
        }
        
        /* ══════════════════════════════════════════════════════════════
           CONFETTI
           ══════════════════════════════════════════════════════════════ */
        
        #confetti-canvas {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <canvas id="confetti-canvas"></canvas>
    
    <main class="main-container">
        <!-- STEP 1: Lead Form -->
        <section id="step-form">
            <!-- Spotlight Visual -->
            <div class="spotlight-container">
                <div class="spotlight">
                    <div class="spotlight-bg"></div>
                    <div class="spotlight-ring"></div>
                    <span class="spotlight-icon">☕</span>
                    <span class="free-badge">GRATIS</span>
                </div>
            </div>
            
            <!-- Header -->
            <h1 class="product-name">${producto_gratis || 'Regalo Gratis'}</h1>
            <p class="product-description">${descripcion || 'Tu regalo te está esperando'}</p>
            
            <!-- Form -->
            <div class="lead-form-section">
                <p class="form-title">¿Dónde te enviamos tu regalo?</p>
                
                <!-- Input Type Tabs -->
                <div class="input-tabs">
                    <button class="input-tab active" data-type="whatsapp" onclick="switchInputType('whatsapp')">
                        📱 WhatsApp
                    </button>
                    <button class="input-tab" data-type="email" onclick="switchInputType('email')">
                        ✉️ Email
                    </button>
                </div>
                
                <!-- Input Field -->
                <div class="input-group">
                    <span class="input-icon" id="input-icon">📱</span>
                    <input 
                        type="tel" 
                        id="lead-input"
                        class="lead-input" 
                        placeholder="Tu número de WhatsApp"
                        autocomplete="tel"
                    >
                </div>
                
                <button class="submit-btn" id="submit-btn" onclick="submitLead()">
                    🎁 Reclamar mi regalo
                </button>
                
                <p class="privacy-note">🔒 No compartiremos tus datos con terceros</p>
            </div>
        </section>
        
        <!-- STEP 2: Digital Ticket -->
        <section class="ticket-section" id="step-ticket">
            <div class="ticket">
                <div class="ticket-header">
                    <p class="ticket-brand">${brandName}</p>
                    <p class="ticket-product">🎁 ${producto_gratis || 'Regalo Gratis'}</p>
                </div>
                
                <div class="ticket-body">
                    <p class="ticket-code-label">Tu código de canje</p>
                    <div class="ticket-code">${uniqueCode}</div>
                    
                    <!-- Scarcity Timer -->
                    <div class="scarcity-timer" id="scarcity-timer">
                        <span class="timer-icon">⏰</span>
                        <span class="timer-text">Válido solo por</span>
                        <span class="timer-countdown" id="countdown">${validezMinutos}:00</span>
                    </div>
                    
                    <!-- Instructions -->
                    <div class="ticket-instructions">
                        <div class="instructions-icon">📲</div>
                        <p class="instructions-text">${instrucciones || 'Muestra esta pantalla en barra'}</p>
                        <p class="instructions-detail">para disfrutar tu regalo</p>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Footer -->
        <footer class="footer">
            <p>Powered by <a href="#">${brandName}</a></p>
        </footer>
    </main>
    
    <script>
        // ══════════════════════════════════════════════════════════════
        // INPUT TYPE SWITCHING
        // ══════════════════════════════════════════════════════════════
        
        let currentInputType = 'whatsapp';
        
        function switchInputType(type) {
            currentInputType = type;
            const input = document.getElementById('lead-input');
            const icon = document.getElementById('input-icon');
            const tabs = document.querySelectorAll('.input-tab');
            
            tabs.forEach(tab => {
                tab.classList.toggle('active', tab.dataset.type === type);
            });
            
            if (type === 'whatsapp') {
                input.type = 'tel';
                input.placeholder = 'Tu número de WhatsApp';
                input.autocomplete = 'tel';
                icon.textContent = '📱';
            } else {
                input.type = 'email';
                input.placeholder = 'Tu email';
                input.autocomplete = 'email';
                icon.textContent = '✉️';
            }
            
            input.value = '';
            input.focus();
        }
        
        // ══════════════════════════════════════════════════════════════
        // FORM SUBMISSION
        // ══════════════════════════════════════════════════════════════
        
        function submitLead() {
            const input = document.getElementById('lead-input');
            const value = input.value.trim();
            const btn = document.getElementById('submit-btn');
            
            // Basic validation
            if (!value) {
                input.style.borderColor = 'var(--danger)';
                input.focus();
                return;
            }
            
            if (currentInputType === 'email' && !value.includes('@')) {
                input.style.borderColor = 'var(--danger)';
                input.focus();
                return;
            }
            
            if (currentInputType === 'whatsapp' && value.length < 9) {
                input.style.borderColor = 'var(--danger)';
                input.focus();
                return;
            }
            
            // Disable button
            btn.disabled = true;
            btn.textContent = '⏳ Generando tu ticket...';
            
            // Save lead to localStorage
            const lead = {
                type: currentInputType,
                value: value,
                code: '${uniqueCode}',
                timestamp: new Date().toISOString(),
                brand: '${brandName}'
            };
            
            const leads = JSON.parse(localStorage.getItem('leads_${brandName.toLowerCase().replace(/\s+/g, '_')}') || '[]');
            leads.push(lead);
            localStorage.setItem('leads_${brandName.toLowerCase().replace(/\s+/g, '_')}', JSON.stringify(leads));
            
            // Show ticket after delay
            setTimeout(() => {
                showTicket();
            }, 1000);
        }
        
        // ══════════════════════════════════════════════════════════════
        // SHOW TICKET
        // ══════════════════════════════════════════════════════════════
        
        function showTicket() {
            const formSection = document.getElementById('step-form');
            const ticketSection = document.getElementById('step-ticket');
            
            formSection.style.display = 'none';
            ticketSection.classList.add('visible');
            
            // Launch confetti
            launchConfetti();
            
            // Start countdown
            startCountdown(${validezMinutos});
            
            // Vibrate
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
        }
        
        // ══════════════════════════════════════════════════════════════
        // COUNTDOWN TIMER
        // ══════════════════════════════════════════════════════════════
        
        function startCountdown(minutes) {
            let totalSeconds = minutes * 60;
            const countdownEl = document.getElementById('countdown');
            const timerContainer = document.getElementById('scarcity-timer');
            
            const interval = setInterval(() => {
                totalSeconds--;
                
                if (totalSeconds <= 0) {
                    clearInterval(interval);
                    countdownEl.textContent = 'EXPIRADO';
                    countdownEl.classList.add('timer-expired');
                    timerContainer.style.borderColor = 'var(--text-muted)';
                    timerContainer.style.background = 'transparent';
                    return;
                }
                
                const mins = Math.floor(totalSeconds / 60);
                const secs = totalSeconds % 60;
                countdownEl.textContent = \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
                
                // Urgency animation when under 5 minutes
                if (totalSeconds < 300) {
                    countdownEl.style.animation = 'timerPulse 0.5s ease-in-out infinite';
                }
            }, 1000);
        }
        
        // ══════════════════════════════════════════════════════════════
        // CONFETTI
        // ══════════════════════════════════════════════════════════════
        
        function launchConfetti() {
            const canvas = document.getElementById('confetti-canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const particles = [];
            const colors = ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#34d399'];
            
            for (let i = 0; i < 100; i++) {
                particles.push({
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    vx: (Math.random() - 0.5) * 15,
                    vy: (Math.random() - 0.5) * 15 - 5,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: Math.random() * 8 + 4,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 10,
                    gravity: 0.25
                });
            }
            
            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                let stillActive = false;
                
                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += p.gravity;
                    p.rotation += p.rotationSpeed;
                    p.vx *= 0.99;
                    
                    if (p.y < canvas.height + 50) {
                        stillActive = true;
                        
                        ctx.save();
                        ctx.translate(p.x, p.y);
                        ctx.rotate(p.rotation * Math.PI / 180);
                        ctx.fillStyle = p.color;
                        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                        ctx.restore();
                    }
                });
                
                if (stillActive) {
                    requestAnimationFrame(animate);
                } else {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }
            
            animate();
        }
        
        // Add input validation styling
        document.getElementById('lead-input').addEventListener('input', function() {
            this.style.borderColor = 'var(--border)';
        });
    </script>
</body>
</html>`;
}
