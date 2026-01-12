/**
 * Scratch Card (Rasca y Gana) Simple Page Template
 * =================================================
 * Interactive scratch card experience with:
 * - Canvas API for scratch-to-reveal interaction
 * - Confetti animation on prize reveal
 * - Unique prize code generation
 * - Save to Wallet/WhatsApp buttons
 * - Corporate color branding for scratch layer
 */

import type { BrandData } from '../types';

interface ScratchCardConfig {
    premio: string;
    codigo_premio: string;
    mensaje_inicial: string;
    mensaje_ganador: string;
    validez: string;
}

/**
 * Generates the complete Scratch Card Simple Page HTML
 */
export function generateScratchCardPage(
    config: ScratchCardConfig,
    brandData: BrandData
): string {
    const {
        premio,
        codigo_premio,
        mensaje_inicial,
        mensaje_ganador,
        validez
    } = config;

    const brandName = brandData?.name || 'Tu Negocio';
    const primaryColor = brandData?.colors?.primary || '#6366f1';
    const accentColor = brandData?.colors?.accent || '#f59e0b';

    // Generate unique code if not provided
    const uniqueCode = codigo_premio || `PREMIO-${Date.now().toString(36).toUpperCase()}`;

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>🎰 ${mensaje_inicial} - ${brandName}</title>
    <meta name="description" content="Rasca y descubre tu premio exclusivo de ${brandName}">
    <meta name="theme-color" content="#0a0a0a">
    
    <!-- Preconnect for speed -->
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
            --border: rgba(255, 255, 255, 0.08);
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
        }
        
        html {
            scroll-behavior: smooth;
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
            overflow: hidden;
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
           HEADER
           ══════════════════════════════════════════════════════════════ */
        
        .header {
            margin-bottom: 1.5rem;
        }
        
        .header-emoji {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            animation: bounce 2s ease-in-out infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .header h1 {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }
        
        .header p {
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
        
        /* ══════════════════════════════════════════════════════════════
           SCRATCH CARD CONTAINER
           ══════════════════════════════════════════════════════════════ */
        
        .scratch-card-wrapper {
            position: relative;
            width: 100%;
            max-width: 320px;
            margin: 0 auto 2rem;
        }
        
        .scratch-card {
            position: relative;
            width: 100%;
            aspect-ratio: 1.5;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 
                0 20px 60px rgba(0, 0, 0, 0.5),
                0 0 0 1px var(--border);
            cursor: pointer;
        }
        
        /* Prize layer (underneath) */
        .prize-layer {
            position: absolute;
            inset: 0;
            background: linear-gradient(145deg, #1a1a1a, #0f0f0f);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }
        
        .prize-emoji {
            font-size: 3.5rem;
            margin-bottom: 0.75rem;
        }
        
        .prize-text {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--brand-accent);
            text-align: center;
            line-height: 1.2;
            margin-bottom: 0.5rem;
        }
        
        .prize-code {
            font-family: 'Courier New', monospace;
            font-size: 1rem;
            font-weight: 700;
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.1);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            border: 1px dashed var(--brand-primary);
        }
        
        /* Scratch canvas (on top) */
        .scratch-canvas {
            position: absolute;
            inset: 0;
            cursor: grab;
            touch-action: none;
        }
        
        .scratch-canvas:active {
            cursor: grabbing;
        }
        
        /* Scratch instruction */
        .scratch-instruction {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 100px;
            font-size: 0.8rem;
            color: white;
            pointer-events: none;
            opacity: 1;
            transition: opacity 0.3s;
            z-index: 10;
        }
        
        .scratch-instruction.hidden {
            opacity: 0;
        }
        
        .scratch-icon {
            width: 20px;
            height: 20px;
            animation: swipe 1.5s ease-in-out infinite;
        }
        
        @keyframes swipe {
            0%, 100% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
        }
        
        /* ══════════════════════════════════════════════════════════════
           WINNER SECTION (Hidden initially)
           ══════════════════════════════════════════════════════════════ */
        
        .winner-section {
            display: none;
            animation: fadeInUp 0.5s ease-out;
        }
        
        .winner-section.visible {
            display: block;
        }
        
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
        
        .winner-message {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--success);
            margin-bottom: 1rem;
        }
        
        .code-display {
            background: var(--bg-card);
            border: 2px dashed var(--brand-primary);
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        
        .code-label {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.5rem;
        }
        
        .code-value {
            font-family: 'Courier New', monospace;
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--brand-accent);
            letter-spacing: 0.1em;
        }
        
        .validity {
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-bottom: 1.5rem;
        }
        
        /* Action buttons */
        .action-buttons {
            display: flex;
            gap: 0.75rem;
        }
        
        .action-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 1rem;
            font-size: 0.9rem;
            font-weight: 600;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
        }
        
        .btn-whatsapp {
            background: #25D366;
            color: white;
        }
        
        .btn-whatsapp:hover {
            background: #20bd5a;
            transform: scale(1.02);
        }
        
        .btn-save {
            background: var(--brand-primary);
            color: white;
        }
        
        .btn-save:hover {
            opacity: 0.9;
            transform: scale(1.02);
        }
        
        /* ══════════════════════════════════════════════════════════════
           CONFETTI CANVAS
           ══════════════════════════════════════════════════════════════ */
        
        #confetti-canvas {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 1000;
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
    </style>
</head>
<body>
    <!-- Confetti Canvas -->
    <canvas id="confetti-canvas"></canvas>
    
    <main class="main-container">
        <!-- Header -->
        <header class="header" id="header">
            <div class="header-emoji">🎰</div>
            <h1>${mensaje_inicial || '¡Rasca y gana!'}</h1>
            <p>Desliza para descubrir tu premio</p>
        </header>
        
        <!-- Scratch Card -->
        <div class="scratch-card-wrapper">
            <div class="scratch-card" id="scratch-card">
                <!-- Prize Layer (underneath) -->
                <div class="prize-layer">
                    <div class="prize-emoji">🎁</div>
                    <div class="prize-text">${premio || 'Premio Sorpresa'}</div>
                    <div class="prize-code">${uniqueCode}</div>
                </div>
                
                <!-- Scratch Canvas (on top) -->
                <canvas class="scratch-canvas" id="scratch-canvas"></canvas>
                
                <!-- Instruction overlay -->
                <div class="scratch-instruction" id="instruction">
                    <svg class="scratch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8L22 12L18 16"></path>
                        <path d="M6 8L2 12L6 16"></path>
                    </svg>
                    <span>Rasca aquí</span>
                </div>
            </div>
        </div>
        
        <!-- Winner Section (Hidden initially) -->
        <section class="winner-section" id="winner-section">
            <p class="winner-message">${mensaje_ganador || '¡Enhorabuena!'} 🎉</p>
            
            <div class="code-display">
                <p class="code-label">Tu código de premio</p>
                <p class="code-value">${uniqueCode}</p>
            </div>
            
            ${validez ? `<p class="validity">⏰ ${validez}</p>` : ''}
            
            <div class="action-buttons">
                <a href="https://wa.me/?text=${encodeURIComponent(`🎁 ¡He ganado en ${brandName}!\\n\\nMi premio: ${premio}\\nCódigo: ${uniqueCode}`)}" 
                   class="action-btn btn-whatsapp" target="_blank">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                </a>
                <button class="action-btn btn-save" onclick="savePrize()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Guardar
                </button>
            </div>
        </section>
        
        <!-- Footer -->
        <footer class="footer">
            <p>Powered by <a href="#">${brandName}</a></p>
        </footer>
    </main>
    
    <script>
        // ══════════════════════════════════════════════════════════════
        // SCRATCH CARD FUNCTIONALITY
        // ══════════════════════════════════════════════════════════════
        
        (function() {
            const canvas = document.getElementById('scratch-canvas');
            const ctx = canvas.getContext('2d');
            const instruction = document.getElementById('instruction');
            const winnerSection = document.getElementById('winner-section');
            const header = document.getElementById('header');
            
            let isDrawing = false;
            let scratchedPercentage = 0;
            let revealed = false;
            
            // Set canvas size
            function resizeCanvas() {
                const rect = canvas.parentElement.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
                
                // Fill with brand color
                ctx.fillStyle = '${primaryColor}';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Add shimmer pattern
                ctx.globalAlpha = 0.1;
                for (let i = 0; i < 20; i++) {
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(
                        Math.random() * canvas.width,
                        Math.random() * canvas.height,
                        Math.random() * 30 + 10,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
                
                // Add text on scratch layer
                ctx.font = 'bold 18px Inter, sans-serif';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.textAlign = 'center';
                ctx.fillText('RASCA AQUÍ', canvas.width / 2, canvas.height / 2 - 10);
                ctx.font = '14px Inter, sans-serif';
                ctx.fillText('👆', canvas.width / 2, canvas.height / 2 + 20);
            }
            
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            
            // Scratch function
            function scratch(x, y) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(x, y, 30, 0, Math.PI * 2);
                ctx.fill();
                
                // Hide instruction after first scratch
                instruction.classList.add('hidden');
            }
            
            // Calculate scratched percentage
            function calculateScratchedPercentage() {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                let transparentPixels = 0;
                
                for (let i = 3; i < pixels.length; i += 4) {
                    if (pixels[i] === 0) transparentPixels++;
                }
                
                return (transparentPixels / (pixels.length / 4)) * 100;
            }
            
            // Check if prize is revealed
            function checkReveal() {
                scratchedPercentage = calculateScratchedPercentage();
                
                if (scratchedPercentage > 50 && !revealed) {
                    revealed = true;
                    revealPrize();
                }
            }
            
            // Reveal prize with confetti
            function revealPrize() {
                // Clear remaining scratch layer
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Show winner section
                winnerSection.classList.add('visible');
                header.style.display = 'none';
                
                // Launch confetti
                launchConfetti();
                
                // Vibrate if supported
                if (navigator.vibrate) {
                    navigator.vibrate([100, 50, 100, 50, 200]);
                }
            }
            
            // Event handlers
            function getPosition(e) {
                const rect = canvas.getBoundingClientRect();
                const clientX = e.clientX || (e.touches && e.touches[0].clientX);
                const clientY = e.clientY || (e.touches && e.touches[0].clientY);
                return {
                    x: clientX - rect.left,
                    y: clientY - rect.top
                };
            }
            
            function startDrawing(e) {
                isDrawing = true;
                const pos = getPosition(e);
                scratch(pos.x, pos.y);
            }
            
            function draw(e) {
                if (!isDrawing) return;
                e.preventDefault();
                const pos = getPosition(e);
                scratch(pos.x, pos.y);
            }
            
            function stopDrawing() {
                isDrawing = false;
                checkReveal();
            }
            
            // Mouse events
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseleave', stopDrawing);
            
            // Touch events
            canvas.addEventListener('touchstart', startDrawing);
            canvas.addEventListener('touchmove', draw);
            canvas.addEventListener('touchend', stopDrawing);
        })();
        
        // ══════════════════════════════════════════════════════════════
        // CONFETTI ANIMATION
        // ══════════════════════════════════════════════════════════════
        
        function launchConfetti() {
            const canvas = document.getElementById('confetti-canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const particles = [];
            const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'];
            
            // Create particles
            for (let i = 0; i < 150; i++) {
                particles.push({
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    vx: (Math.random() - 0.5) * 20,
                    vy: (Math.random() - 0.5) * 20 - 10,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: Math.random() * 8 + 4,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 10,
                    gravity: 0.3
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
        
        // ══════════════════════════════════════════════════════════════
        // SAVE PRIZE FUNCTION
        // ══════════════════════════════════════════════════════════════
        
        function savePrize() {
            const prizeData = {
                premio: '${premio}',
                codigo: '${uniqueCode}',
                validez: '${validez}',
                negocio: '${brandName}',
                fecha: new Date().toISOString()
            };
            
            // Save to localStorage
            const savedPrizes = JSON.parse(localStorage.getItem('mis_premios') || '[]');
            savedPrizes.push(prizeData);
            localStorage.setItem('mis_premios', JSON.stringify(savedPrizes));
            
            // Show confirmation
            alert('🎉 ¡Premio guardado!\\n\\nCódigo: ${uniqueCode}\\n\\nMuestra este código en ${brandName} para canjear tu premio.');
        }
    </script>
</body>
</html>`;
}
