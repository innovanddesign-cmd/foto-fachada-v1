/**
 * Feedback Survey (Feedback + Incentivo) Simple Page Template
 * ============================================================
 * Ultra-fast survey with:
 * - One question per screen (micro-steps)
 * - Visual reaction system (emojis/stars)
 * - Progress bar for completion tracking
 * - Reward screen with coupon delivery
 * - Smooth transitions between steps
 */

import type { BrandData } from '../types';

interface FeedbackSurveyConfig {
    pregunta_1: string;
    pregunta_2: string;
    pregunta_3: string;
    recompensa: string;
    codigo_recompensa: string;
}

/**
 * Generates the complete Feedback Survey Simple Page HTML
 */
export function generateFeedbackSurveyPage(
    config: FeedbackSurveyConfig,
    brandData: BrandData
): string {
    const {
        pregunta_1,
        pregunta_2,
        pregunta_3,
        recompensa,
        codigo_recompensa
    } = config;

    const brandName = brandData?.name || 'Tu Negocio';
    const primaryColor = brandData?.colors?.primary || '#8b5cf6';
    const accentColor = brandData?.colors?.accent || '#f59e0b';

    // Generate unique code if not provided
    const couponCode = codigo_recompensa || `THANKS-${Date.now().toString(36).toUpperCase().slice(-5)}`;

    // Build questions array (filter empty ones)
    const questions = [pregunta_1, pregunta_2, pregunta_3].filter(q => q && q.trim());

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>📝 Tu opinión importa - ${brandName}</title>
    <meta name="description" content="Cuéntanos tu experiencia y gana una recompensa">
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
            transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            border-radius: 0 2px 2px 0;
            box-shadow: 0 0 10px var(--brand-primary);
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
            animation: slideIn 0.4s ease-out;
        }
        
        .slide.active {
            display: flex;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(-30px);
            }
        }
        
        .slide-number {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.5rem;
        }
        
        .question-text {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 2.5rem;
            line-height: 1.3;
        }
        
        /* ══════════════════════════════════════════════════════════════
           REACTION BUTTONS
           ══════════════════════════════════════════════════════════════ */
        
        .reactions {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .reaction-btn {
            width: 70px;
            height: 70px;
            background: var(--bg-card);
            border: 2px solid var(--border);
            border-radius: 50%;
            font-size: 2rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .reaction-btn:hover {
            transform: scale(1.15);
            border-color: var(--brand-primary);
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }
        
        .reaction-btn:active {
            transform: scale(0.95);
        }
        
        .reaction-btn.selected {
            border-color: var(--brand-accent);
            background: linear-gradient(145deg, rgba(245, 158, 11, 0.2), transparent);
            box-shadow: 0 0 30px rgba(245, 158, 11, 0.4);
            animation: selectedPop 0.4s ease-out;
        }
        
        @keyframes selectedPop {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1.1); }
        }
        
        .reaction-label {
            font-size: 0.7rem;
            color: var(--text-muted);
            margin-top: 0.25rem;
        }
        
        /* Star rating variant */
        .stars-container {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
        }
        
        .star-btn {
            font-size: 2.5rem;
            background: none;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            filter: grayscale(100%);
            opacity: 0.4;
        }
        
        .star-btn:hover,
        .star-btn.active {
            filter: grayscale(0%);
            opacity: 1;
            transform: scale(1.2);
        }
        
        /* Thumbs variant */
        .thumbs-container {
            display: flex;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .thumb-btn {
            width: 80px;
            height: 80px;
            background: var(--bg-card);
            border: 2px solid var(--border);
            border-radius: 20px;
            font-size: 2.5rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .thumb-btn:hover {
            transform: scale(1.1);
        }
        
        .thumb-btn.up:hover,
        .thumb-btn.up.selected {
            border-color: var(--success);
            background: rgba(52, 211, 153, 0.1);
        }
        
        .thumb-btn.down:hover,
        .thumb-btn.down.selected {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
        }
        
        /* ══════════════════════════════════════════════════════════════
           REWARD SLIDE
           ══════════════════════════════════════════════════════════════ */
        
        .reward-emoji {
            font-size: 5rem;
            margin-bottom: 1.5rem;
            animation: celebrateEmoji 1s ease-in-out infinite;
        }
        
        @keyframes celebrateEmoji {
            0%, 100% { transform: rotate(-5deg) scale(1); }
            50% { transform: rotate(5deg) scale(1.1); }
        }
        
        .reward-title {
            font-size: 1.75rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }
        
        .reward-subtitle {
            font-size: 1rem;
            color: var(--text-secondary);
            margin-bottom: 2rem;
        }
        
        .reward-card {
            width: 100%;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }
        
        .reward-name {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 1rem;
        }
        
        .coupon-code {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            background: var(--bg-dark);
            border: 2px dashed var(--brand-accent);
            border-radius: 12px;
            padding: 1rem;
        }
        
        .coupon-value {
            font-family: 'Courier New', monospace;
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--brand-accent);
            letter-spacing: 0.1em;
        }
        
        .copy-reward-btn {
            background: transparent;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 0.5rem;
            cursor: pointer;
            color: var(--text-muted);
            transition: all 0.2s;
        }
        
        .copy-reward-btn:hover {
            color: var(--text-primary);
            background: var(--bg-card);
        }
        
        .copy-reward-btn.copied {
            color: var(--success);
            border-color: var(--success);
        }
        
        .reward-validity {
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-top: 0.75rem;
        }
        
        /* ══════════════════════════════════════════════════════════════
           SKIP BUTTON
           ══════════════════════════════════════════════════════════════ */
        
        .skip-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 0.85rem;
            cursor: pointer;
            padding: 0.5rem 1rem;
            transition: color 0.2s;
        }
        
        .skip-btn:hover {
            color: var(--text-secondary);
        }
        
        /* ══════════════════════════════════════════════════════════════
           FOOTER
           ══════════════════════════════════════════════════════════════ */
        
        .footer {
            position: fixed;
            bottom: 1.5rem;
            left: 0;
            right: 0;
            text-align: center;
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
    <!-- Progress Bar -->
    <div class="progress-container">
        <div class="progress-bar" id="progress-bar"></div>
    </div>
    
    <!-- Confetti Canvas -->
    <canvas id="confetti-canvas"></canvas>
    
    <main class="main-container">
        ${questions.map((question, index) => `
        <!-- Question ${index + 1} -->
        <div class="slide ${index === 0 ? 'active' : ''}" data-step="${index + 1}">
            <p class="slide-number">Pregunta ${index + 1} de ${questions.length}</p>
            <h2 class="question-text">${question}</h2>
            
            ${index === 0 ? `
            <!-- Emoji reactions for Q1 -->
            <div class="reactions">
                <button class="reaction-btn" data-value="1" onclick="selectReaction(this, ${index + 1})">
                    😞
                    <span class="reaction-label">Mal</span>
                </button>
                <button class="reaction-btn" data-value="2" onclick="selectReaction(this, ${index + 1})">
                    😐
                    <span class="reaction-label">Regular</span>
                </button>
                <button class="reaction-btn" data-value="3" onclick="selectReaction(this, ${index + 1})">
                    😊
                    <span class="reaction-label">Bien</span>
                </button>
                <button class="reaction-btn" data-value="4" onclick="selectReaction(this, ${index + 1})">
                    🤩
                    <span class="reaction-label">Genial</span>
                </button>
            </div>
            ` : index === 1 ? `
            <!-- Thumbs for Q2 (recommendation) -->
            <div class="thumbs-container">
                <button class="thumb-btn down" data-value="no" onclick="selectThumb(this, ${index + 1})">
                    👎
                </button>
                <button class="thumb-btn up" data-value="yes" onclick="selectThumb(this, ${index + 1})">
                    👍
                </button>
            </div>
            ` : `
            <!-- Stars for Q3 -->
            <div class="stars-container">
                <button class="star-btn" data-value="1" onclick="selectStar(this, ${index + 1})">⭐</button>
                <button class="star-btn" data-value="2" onclick="selectStar(this, ${index + 1})">⭐</button>
                <button class="star-btn" data-value="3" onclick="selectStar(this, ${index + 1})">⭐</button>
                <button class="star-btn" data-value="4" onclick="selectStar(this, ${index + 1})">⭐</button>
                <button class="star-btn" data-value="5" onclick="selectStar(this, ${index + 1})">⭐</button>
            </div>
            `}
            
            ${index > 0 ? '<button class="skip-btn" onclick="skipQuestion()">Saltar</button>' : ''}
        </div>
        `).join('')}
        
        <!-- Reward Slide -->
        <div class="slide" data-step="reward">
            <div class="reward-emoji">🎉</div>
            <h2 class="reward-title">¡Gracias por ayudarnos!</h2>
            <p class="reward-subtitle">Tu opinión nos hace mejores</p>
            
            <div class="reward-card">
                <p class="reward-name">🎁 ${recompensa || 'Tu recompensa'}</p>
                <div class="coupon-code">
                    <span class="coupon-value">${couponCode}</span>
                    <button class="copy-reward-btn" onclick="copyCoupon()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
                <p class="reward-validity">Muestra este código en tu próxima visita</p>
            </div>
        </div>
    </main>
    
    <!-- Footer -->
    <footer class="footer">
        <p>Powered by <a href="#">${brandName}</a></p>
    </footer>
    
    <script>
        // ══════════════════════════════════════════════════════════════
        // SURVEY STATE
        // ══════════════════════════════════════════════════════════════
        
        const TOTAL_QUESTIONS = ${questions.length};
        const BRAND_NAME = '${brandName}';
        let currentStep = 1;
        let responses = {};
        
        // ══════════════════════════════════════════════════════════════
        // PROGRESS BAR
        // ══════════════════════════════════════════════════════════════
        
        function updateProgress() {
            const progressBar = document.getElementById('progress-bar');
            const percentage = (currentStep / (TOTAL_QUESTIONS + 1)) * 100;
            progressBar.style.width = percentage + '%';
        }
        
        // Initialize progress
        updateProgress();
        
        // ══════════════════════════════════════════════════════════════
        // SLIDE NAVIGATION
        // ══════════════════════════════════════════════════════════════
        
        function goToStep(step) {
            const slides = document.querySelectorAll('.slide');
            
            slides.forEach(slide => {
                slide.classList.remove('active');
                slide.style.animation = 'slideOut 0.3s ease-out';
            });
            
            setTimeout(() => {
                slides.forEach(slide => {
                    if (step === 'reward') {
                        if (slide.dataset.step === 'reward') {
                            slide.classList.add('active');
                            slide.style.animation = 'slideIn 0.4s ease-out';
                            launchConfetti();
                        }
                    } else if (parseInt(slide.dataset.step) === step) {
                        slide.classList.add('active');
                        slide.style.animation = 'slideIn 0.4s ease-out';
                    }
                });
                
                currentStep = step === 'reward' ? TOTAL_QUESTIONS + 1 : step;
                updateProgress();
            }, 300);
        }
        
        function nextStep() {
            if (currentStep < TOTAL_QUESTIONS) {
                goToStep(currentStep + 1);
            } else {
                goToStep('reward');
                saveResponses();
            }
        }
        
        function skipQuestion() {
            responses['q' + currentStep] = 'skipped';
            nextStep();
        }
        
        // ══════════════════════════════════════════════════════════════
        // REACTION HANDLERS
        // ══════════════════════════════════════════════════════════════
        
        function selectReaction(btn, step) {
            const reactions = btn.parentElement.querySelectorAll('.reaction-btn');
            reactions.forEach(r => r.classList.remove('selected'));
            btn.classList.add('selected');
            
            responses['q' + step] = btn.dataset.value;
            
            // Vibrate
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
            
            setTimeout(nextStep, 500);
        }
        
        function selectThumb(btn, step) {
            const thumbs = btn.parentElement.querySelectorAll('.thumb-btn');
            thumbs.forEach(t => t.classList.remove('selected'));
            btn.classList.add('selected');
            
            responses['q' + step] = btn.dataset.value;
            
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
            
            setTimeout(nextStep, 500);
        }
        
        function selectStar(btn, step) {
            const value = parseInt(btn.dataset.value);
            const stars = btn.parentElement.querySelectorAll('.star-btn');
            
            stars.forEach((star, i) => {
                if (i < value) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
            
            responses['q' + step] = value;
            
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
            
            setTimeout(nextStep, 500);
        }
        
        // ══════════════════════════════════════════════════════════════
        // SAVE RESPONSES
        // ══════════════════════════════════════════════════════════════
        
        function saveResponses() {
            const data = {
                responses: responses,
                timestamp: new Date().toISOString(),
                brand: BRAND_NAME,
                coupon: '${couponCode}'
            };
            
            // Save to localStorage
            const feedbacks = JSON.parse(localStorage.getItem('feedbacks_' + BRAND_NAME.toLowerCase().replace(/\\s+/g, '_')) || '[]');
            feedbacks.push(data);
            localStorage.setItem('feedbacks_' + BRAND_NAME.toLowerCase().replace(/\\s+/g, '_'), JSON.stringify(feedbacks));
        }
        
        // ══════════════════════════════════════════════════════════════
        // COPY COUPON
        // ══════════════════════════════════════════════════════════════
        
        function copyCoupon() {
            navigator.clipboard.writeText('${couponCode}').then(() => {
                const btn = document.querySelector('.copy-reward-btn');
                btn.classList.add('copied');
                btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                }, 2000);
            });
            
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
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
            const colors = ['#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1'];
            
            for (let i = 0; i < 80; i++) {
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
            
            // Vibrate celebration
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
        }
    </script>
</body>
</html>`;
}
