/**
 * Recommendation Engine (Recomendado para Ti) Simple Page Template
 * =================================================================
 * Visual recommendation quiz with:
 * - 3 image-based questions
 * - "AI Thinking" loading animation
 * - Full-screen star product result
 * - Direct action button
 */

import type { BrandData } from '../types';

interface RecommendationConfig {
    pregunta_1: string;
    pregunta_2: string;
    pregunta_3: string;
    producto_estrella: string;
    descripcion_match: string;
    precio: string;
}

/**
 * Generates the complete Recommendation Quiz Simple Page HTML
 */
export function generateRecommendationPage(
    config: RecommendationConfig,
    brandData: BrandData
): string {
    const {
        pregunta_1,
        pregunta_2,
        pregunta_3,
        producto_estrella,
        descripcion_match,
        precio
    } = config;

    const brandName = brandData?.name || 'Tu Negocio';
    const primaryColor = brandData?.colors?.primary || '#8b5cf6';
    const accentColor = brandData?.colors?.accent || '#f59e0b';

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>🎯 Descubre tu recomendación - ${brandName}</title>
    <meta name="description" content="Encuentra el producto perfecto para ti en ${brandName}">
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
            -webkit-font-smoothing: antialiased;
            overflow: hidden;
        }
        
        /* ══════════════════════════════════════════════════════════════
           PROGRESS BAR
           ══════════════════════════════════════════════════════════════ */
        
        .progress-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--bg-card);
            z-index: 100;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--brand-primary), var(--brand-accent));
            width: 0%;
            transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            border-radius: 0 2px 2px 0;
        }
        
        /* ══════════════════════════════════════════════════════════════
           MAIN CONTAINER
           ══════════════════════════════════════════════════════════════ */
        
        .main-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2rem 1.5rem;
            max-width: 420px;
            margin: 0 auto;
            width: 100%;
        }
        
        /* ══════════════════════════════════════════════════════════════
           QUESTION SLIDES
           ══════════════════════════════════════════════════════════════ */
        
        .slide {
            display: none;
            flex-direction: column;
            align-items: center;
            text-align: center;
            width: 100%;
            animation: slideIn 0.5s ease-out;
        }
        
        .slide.active {
            display: flex;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: scale(0.95) translateY(20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
        
        .question-number {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--brand-primary);
            margin-bottom: 0.5rem;
        }
        
        .question-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 2rem;
            line-height: 1.3;
        }
        
        /* ══════════════════════════════════════════════════════════════
           VISUAL OPTIONS (Image-based)
           ══════════════════════════════════════════════════════════════ */
        
        .options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            width: 100%;
        }
        
        .option-card {
            background: var(--bg-card);
            border: 2px solid var(--border);
            border-radius: 20px;
            padding: 1.5rem 1rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
        }
        
        .option-card:hover {
            border-color: var(--brand-primary);
            transform: translateY(-4px);
            box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2);
        }
        
        .option-card:active {
            transform: scale(0.98);
        }
        
        .option-card.selected {
            border-color: var(--brand-accent);
            background: linear-gradient(145deg, rgba(245, 158, 11, 0.15), transparent);
            box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
        }
        
        .option-emoji {
            font-size: 3rem;
            line-height: 1;
        }
        
        .option-label {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-primary);
        }
        
        .option-desc {
            font-size: 0.75rem;
            color: var(--text-muted);
        }
        
        /* ══════════════════════════════════════════════════════════════
           THINKING/LOADING SCREEN
           ══════════════════════════════════════════════════════════════ */
        
        .thinking-screen {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2rem;
        }
        
        .thinking-screen.active {
            display: flex;
        }
        
        .ai-brain {
            width: 100px;
            height: 100px;
            position: relative;
            margin-bottom: 2rem;
        }
        
        .ai-brain-icon {
            font-size: 4rem;
            animation: brainPulse 1.5s ease-in-out infinite;
        }
        
        @keyframes brainPulse {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.1); filter: brightness(1.3); }
        }
        
        .ai-rings {
            position: absolute;
            inset: -20px;
            border: 2px solid var(--brand-primary);
            border-radius: 50%;
            opacity: 0;
            animation: ringExpand 1.5s ease-out infinite;
        }
        
        .ai-rings:nth-child(2) { animation-delay: 0.5s; }
        .ai-rings:nth-child(3) { animation-delay: 1s; }
        
        @keyframes ringExpand {
            0% { transform: scale(0.8); opacity: 0.8; }
            100% { transform: scale(1.5); opacity: 0; }
        }
        
        .thinking-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }
        
        .thinking-subtitle {
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
        
        .thinking-dots {
            display: inline-flex;
            gap: 4px;
            margin-left: 4px;
        }
        
        .thinking-dot {
            width: 6px;
            height: 6px;
            background: var(--brand-primary);
            border-radius: 50%;
            animation: dotBounce 1.4s ease-in-out infinite;
        }
        
        .thinking-dot:nth-child(1) { animation-delay: 0s; }
        .thinking-dot:nth-child(2) { animation-delay: 0.2s; }
        .thinking-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes dotBounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-8px); }
        }
        
        /* ══════════════════════════════════════════════════════════════
           RESULT SCREEN - STAR PRODUCT
           ══════════════════════════════════════════════════════════════ */
        
        .result-screen {
            display: none;
            flex-direction: column;
            align-items: center;
            text-align: center;
            width: 100%;
            animation: resultReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .result-screen.active {
            display: flex;
        }
        
        @keyframes resultReveal {
            0% { opacity: 0; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1); }
        }
        
        .match-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
            padding: 0.5rem 1rem;
            border-radius: 100px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 1.5rem;
        }
        
        .match-badge-icon {
            font-size: 1rem;
        }
        
        .product-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 2rem 1.5rem;
            width: 100%;
            margin-bottom: 1.5rem;
        }
        
        .product-emoji {
            font-size: 5rem;
            margin-bottom: 1rem;
            animation: productFloat 3s ease-in-out infinite;
        }
        
        @keyframes productFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .product-name {
            font-size: 1.75rem;
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }
        
        .product-price {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--brand-accent);
            margin-bottom: 1.5rem;
        }
        
        .match-reason {
            background: rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 12px;
            padding: 1rem;
        }
        
        .match-reason-title {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--brand-primary);
            margin-bottom: 0.5rem;
        }
        
        .match-reason-text {
            font-size: 0.9rem;
            color: var(--text-secondary);
            line-height: 1.5;
        }
        
        /* Action Buttons */
        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            width: 100%;
        }
        
        .primary-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            width: 100%;
            padding: 1.1rem;
            font-size: 1rem;
            font-weight: 700;
            color: white;
            background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
            border: none;
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
        }
        
        .primary-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
        }
        
        .secondary-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            padding: 0.9rem;
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-secondary);
            background: transparent;
            border: 1px solid var(--border);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .secondary-btn:hover {
            background: var(--bg-card);
            border-color: var(--text-muted);
        }
        
        /* ══════════════════════════════════════════════════════════════
           FOOTER
           ══════════════════════════════════════════════════════════════ */
        
        .footer {
            position: fixed;
            bottom: 1rem;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 0.7rem;
            color: var(--text-muted);
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
    <!-- Progress Bar -->
    <div class="progress-container">
        <div class="progress-bar" id="progress-bar"></div>
    </div>
    
    <!-- Confetti Canvas -->
    <canvas id="confetti-canvas"></canvas>
    
    <main class="main-container">
        <!-- Question 1: Appetite -->
        <div class="slide active" data-step="1">
            <p class="question-number">Pregunta 1 de 3</p>
            <h2 class="question-text">${pregunta_1 || '¿Cómo tienes el hambre hoy?'}</h2>
            
            <div class="options">
                <div class="option-card" onclick="selectOption(this, 1, 'little')">
                    <span class="option-emoji">🐣</span>
                    <span class="option-label">Poca</span>
                    <span class="option-desc">Algo ligero</span>
                </div>
                <div class="option-card" onclick="selectOption(this, 1, 'normal')">
                    <span class="option-emoji">😊</span>
                    <span class="option-label">Normal</span>
                    <span class="option-desc">Ración estándar</span>
                </div>
                <div class="option-card" onclick="selectOption(this, 1, 'hungry')">
                    <span class="option-emoji">🦁</span>
                    <span class="option-label">Mucha</span>
                    <span class="option-desc">Algo contundente</span>
                </div>
                <div class="option-card" onclick="selectOption(this, 1, 'starving')">
                    <span class="option-emoji">🐺</span>
                    <span class="option-label">¡Me muero!</span>
                    <span class="option-desc">Todo el menú</span>
                </div>
            </div>
        </div>
        
        <!-- Question 2: Preference -->
        <div class="slide" data-step="2">
            <p class="question-number">Pregunta 2 de 3</p>
            <h2 class="question-text">${pregunta_2 || '¿Dulce o salado?'}</h2>
            
            <div class="options">
                <div class="option-card" onclick="selectOption(this, 2, 'sweet')">
                    <span class="option-emoji">🍰</span>
                    <span class="option-label">Dulce</span>
                    <span class="option-desc">Postres y dulces</span>
                </div>
                <div class="option-card" onclick="selectOption(this, 2, 'salty')">
                    <span class="option-emoji">🥪</span>
                    <span class="option-label">Salado</span>
                    <span class="option-desc">Platos salados</span>
                </div>
                <div class="option-card" onclick="selectOption(this, 2, 'both')">
                    <span class="option-emoji">🤷</span>
                    <span class="option-label">Ambos</span>
                    <span class="option-desc">Sorpréndeme</span>
                </div>
                <div class="option-card" onclick="selectOption(this, 2, 'healthy')">
                    <span class="option-emoji">🥗</span>
                    <span class="option-label">Saludable</span>
                    <span class="option-desc">Opciones fit</span>
                </div>
            </div>
        </div>
        
        <!-- Question 3: Moment -->
        <div class="slide" data-step="3">
            <p class="question-number">Pregunta 3 de 3</p>
            <h2 class="question-text">${pregunta_3 || '¿Para comer aquí o para llevar?'}</h2>
            
            <div class="options">
                <div class="option-card" onclick="selectOption(this, 3, 'here')">
                    <span class="option-emoji">🪑</span>
                    <span class="option-label">Aquí</span>
                    <span class="option-desc">Disfrutar en local</span>
                </div>
                <div class="option-card" onclick="selectOption(this, 3, 'takeaway')">
                    <span class="option-emoji">📦</span>
                    <span class="option-label">Para llevar</span>
                    <span class="option-desc">Me lo llevo</span>
                </div>
            </div>
        </div>
        
        <!-- Thinking Screen -->
        <div class="thinking-screen" data-step="thinking">
            <div class="ai-brain">
                <span class="ai-brain-icon">🧠</span>
                <div class="ai-rings"></div>
                <div class="ai-rings"></div>
                <div class="ai-rings"></div>
            </div>
            <h2 class="thinking-title">Nuestra IA está eligiendo para ti</h2>
            <p class="thinking-subtitle">
                Analizando tus preferencias
                <span class="thinking-dots">
                    <span class="thinking-dot"></span>
                    <span class="thinking-dot"></span>
                    <span class="thinking-dot"></span>
                </span>
            </p>
        </div>
        
        <!-- Result Screen -->
        <div class="result-screen" data-step="result">
            <div class="match-badge">
                <span class="match-badge-icon">🎯</span>
                Tu Match Perfecto
            </div>
            
            <div class="product-card">
                <div class="product-emoji">✨</div>
                <h2 class="product-name">${producto_estrella || 'Producto Recomendado'}</h2>
                ${precio ? `<p class="product-price">${precio}</p>` : ''}
                
                ${descripcion_match ? `
                <div class="match-reason">
                    <p class="match-reason-title">Por qué te lo recomendamos</p>
                    <p class="match-reason-text">${descripcion_match}</p>
                </div>
                ` : ''}
            </div>
            
            <div class="action-buttons">
                <button class="primary-btn" onclick="orderNow()">
                    🛎️ Pedir este ahora
                </button>
                <button class="secondary-btn" onclick="showToWaiter()">
                    👨‍🍳 Enseñárselo al camarero
                </button>
            </div>
        </div>
    </main>
    
    <!-- Footer -->
    <footer class="footer">
        Powered by ${brandName}
    </footer>
    
    <script>
        // ══════════════════════════════════════════════════════════════
        // STATE
        // ══════════════════════════════════════════════════════════════
        
        let currentStep = 1;
        let answers = {};
        const TOTAL_QUESTIONS = 3;
        
        // ══════════════════════════════════════════════════════════════
        // PROGRESS BAR
        // ══════════════════════════════════════════════════════════════
        
        function updateProgress(step) {
            const progressBar = document.getElementById('progress-bar');
            const percentage = (step / (TOTAL_QUESTIONS + 1)) * 100;
            progressBar.style.width = percentage + '%';
        }
        
        updateProgress(0.5);
        
        // ══════════════════════════════════════════════════════════════
        // OPTION SELECTION
        // ══════════════════════════════════════════════════════════════
        
        function selectOption(element, questionNum, value) {
            // Mark as selected
            const options = element.parentElement.querySelectorAll('.option-card');
            options.forEach(opt => opt.classList.remove('selected'));
            element.classList.add('selected');
            
            // Store answer
            answers['q' + questionNum] = value;
            
            // Vibrate
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
            
            // Go to next after delay
            setTimeout(() => {
                if (questionNum < TOTAL_QUESTIONS) {
                    goToStep(questionNum + 1);
                } else {
                    showThinking();
                }
            }, 400);
        }
        
        // ══════════════════════════════════════════════════════════════
        // NAVIGATION
        // ══════════════════════════════════════════════════════════════
        
        function goToStep(step) {
            const slides = document.querySelectorAll('.slide');
            
            slides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            const targetSlide = document.querySelector(\`[data-step="\${step}"]\`);
            if (targetSlide) {
                targetSlide.classList.add('active');
                currentStep = step;
                updateProgress(step);
            }
        }
        
        // ══════════════════════════════════════════════════════════════
        // THINKING ANIMATION
        // ══════════════════════════════════════════════════════════════
        
        function showThinking() {
            const slides = document.querySelectorAll('.slide');
            const thinkingScreen = document.querySelector('.thinking-screen');
            
            slides.forEach(s => s.classList.remove('active'));
            thinkingScreen.classList.add('active');
            
            updateProgress(TOTAL_QUESTIONS + 0.5);
            
            // Show result after 2 seconds
            setTimeout(() => {
                showResult();
            }, 2000);
        }
        
        // ══════════════════════════════════════════════════════════════
        // RESULT
        // ══════════════════════════════════════════════════════════════
        
        function showResult() {
            const thinkingScreen = document.querySelector('.thinking-screen');
            const resultScreen = document.querySelector('.result-screen');
            
            thinkingScreen.classList.remove('active');
            resultScreen.classList.add('active');
            
            updateProgress(TOTAL_QUESTIONS + 1);
            
            // Launch confetti
            launchConfetti();
            
            // Vibrate celebration
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
            
            // Save interaction
            saveInteraction();
        }
        
        // ══════════════════════════════════════════════════════════════
        // ACTIONS
        // ══════════════════════════════════════════════════════════════
        
        function orderNow() {
            alert('¡Genial! Avisa al camarero para pedir tu ${producto_estrella || 'recomendación'}');
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
        
        function showToWaiter() {
            // Make screen brighter for showing
            document.body.style.background = '#111';
            alert('Muestra esta pantalla al camarero para pedir tu recomendación');
        }
        
        // ══════════════════════════════════════════════════════════════
        // SAVE INTERACTION
        // ══════════════════════════════════════════════════════════════
        
        function saveInteraction() {
            const data = {
                answers: answers,
                product: '${producto_estrella}',
                timestamp: new Date().toISOString(),
                brand: '${brandName}'
            };
            
            const key = 'recommendations_${brandName.toLowerCase().replace(/\s+/g, '_')}';
            const saved = JSON.parse(localStorage.getItem(key) || '[]');
            saved.push(data);
            localStorage.setItem(key, JSON.stringify(saved));
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
            const colors = ['${primaryColor}', '${accentColor}', '#10b981', '#ec4899', '#6366f1'];
            
            for (let i = 0; i < 60; i++) {
                particles.push({
                    x: canvas.width / 2,
                    y: canvas.height / 3,
                    vx: (Math.random() - 0.5) * 12,
                    vy: (Math.random() - 0.5) * 12 - 3,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: Math.random() * 8 + 4,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 10,
                    gravity: 0.2
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
    </script>
</body>
</html>`;
}
