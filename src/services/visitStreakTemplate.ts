/**
 * Visit Streak (Rachas de Visita) Simple Page Template
 * =====================================================
 * Gamified visit tracking with:
 * - Fire widget that glows based on streak level
 * - 7-day timeline with circular slots
 * - Motivational copy showing progress
 * - LocalStorage persistence for cross-session tracking
 */

import type { BrandData } from '../types';

interface VisitStreakConfig {
    nombre_programa: string;
    visitas_meta: string;
    premio: string;
    mensaje_motivacional: string;
}

/**
 * Generates the complete Visit Streak Simple Page HTML
 */
export function generateVisitStreakPage(
    config: VisitStreakConfig,
    brandData: BrandData,
    pageSlug?: string
): string {
    const {
        nombre_programa,
        visitas_meta,
        premio,
        mensaje_motivacional
    } = config;

    const brandName = brandData?.name || 'Tu Negocio';
    const primaryColor = brandData?.colors?.primary || '#10b981';
    const accentColor = brandData?.colors?.accent || '#f59e0b';
    const meta = parseInt(visitas_meta) || 7;
    const storageKey = pageSlug || `streak_${brandName.toLowerCase().replace(/\s+/g, '_')}`;

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>🔥 ${nombre_programa || 'Mi Racha'} - ${brandName}</title>
    <meta name="description" content="Mantén tu racha de visitas y gana premios en ${brandName}">
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
            --fire-low: #f59e0b;
            --fire-medium: #f97316;
            --fire-high: #ef4444;
            --fire-max: #dc2626;
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
            align-items: center;
            padding: 2rem 1.5rem;
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
           FIRE WIDGET
           ══════════════════════════════════════════════════════════════ */
        
        .fire-container {
            position: relative;
            margin-bottom: 2rem;
        }
        
        .fire-widget {
            position: relative;
            width: 120px;
            height: 120px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .fire-glow {
            position: absolute;
            inset: -20px;
            border-radius: 50%;
            background: radial-gradient(circle, var(--fire-low) 0%, transparent 70%);
            opacity: 0.3;
            animation: glowPulse 2s ease-in-out infinite;
            transition: opacity 0.5s, filter 0.5s;
        }
        
        .fire-glow.level-1 { opacity: 0.2; filter: blur(15px); }
        .fire-glow.level-2 { opacity: 0.3; filter: blur(20px); background: radial-gradient(circle, var(--fire-medium) 0%, transparent 70%); }
        .fire-glow.level-3 { opacity: 0.5; filter: blur(25px); background: radial-gradient(circle, var(--fire-high) 0%, transparent 70%); }
        .fire-glow.level-4 { opacity: 0.7; filter: blur(30px); background: radial-gradient(circle, var(--fire-max) 0%, transparent 70%); }
        
        @keyframes glowPulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.1); opacity: 0.5; }
        }
        
        .fire-icon {
            position: relative;
            font-size: 4rem;
            z-index: 1;
            animation: fireShake 0.5s ease-in-out infinite;
        }
        
        @keyframes fireShake {
            0%, 100% { transform: rotate(-2deg) scale(1); }
            50% { transform: rotate(2deg) scale(1.05); }
        }
        
        .streak-count {
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-card);
            border: 2px solid var(--fire-low);
            border-radius: 100px;
            padding: 0.25rem 1rem;
            font-size: 1rem;
            font-weight: 800;
            color: var(--fire-low);
            z-index: 2;
        }
        
        .streak-count.active {
            border-color: var(--fire-high);
            color: var(--fire-high);
        }
        
        /* ══════════════════════════════════════════════════════════════
           HEADER TEXT
           ══════════════════════════════════════════════════════════════ */
        
        .program-name {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }
        
        .motivational-text {
            font-size: 1.1rem;
            color: var(--brand-accent);
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .progress-text {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-bottom: 2rem;
        }
        
        .progress-text strong {
            color: var(--success);
        }
        
        /* ══════════════════════════════════════════════════════════════
           7-DAY TIMELINE
           ══════════════════════════════════════════════════════════════ */
        
        .timeline-section {
            background: var(--bg-card);
            border-radius: 20px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid var(--border);
        }
        
        .timeline-title {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-muted);
            margin-bottom: 1rem;
        }
        
        .timeline {
            display: flex;
            justify-content: space-between;
            gap: 0.5rem;
        }
        
        .day-slot {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }
        
        .day-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-muted);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .day-circle.visited {
            background: linear-gradient(135deg, var(--fire-low), var(--fire-medium));
            border-color: var(--fire-medium);
            color: white;
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.4);
            animation: dayPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        @keyframes dayPop {
            0% { transform: scale(0.8); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        .day-circle.today {
            border-color: var(--success);
            box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.2);
        }
        
        .day-circle.today.visited {
            background: linear-gradient(135deg, var(--success), #10b981);
            border-color: var(--success);
        }
        
        .day-label {
            font-size: 0.65rem;
            font-weight: 500;
            color: var(--text-muted);
            text-transform: uppercase;
        }
        
        .day-label.today {
            color: var(--success);
        }
        
        /* ══════════════════════════════════════════════════════════════
           PRIZE SECTION
           ══════════════════════════════════════════════════════════════ */
        
        .prize-section {
            background: linear-gradient(145deg, rgba(16, 185, 129, 0.1), transparent);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 16px;
            padding: 1.25rem;
            margin-bottom: 1.5rem;
        }
        
        .prize-label {
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--success);
            margin-bottom: 0.5rem;
        }
        
        .prize-name {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary);
        }
        
        /* ══════════════════════════════════════════════════════════════
           CHECK-IN BUTTON
           ══════════════════════════════════════════════════════════════ */
        
        .checkin-btn {
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
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }
        
        .checkin-btn:hover:not(:disabled) {
            transform: scale(1.02);
            box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
        }
        
        .checkin-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .checkin-btn.checked {
            background: linear-gradient(135deg, var(--success), #10b981);
        }
        
        /* ══════════════════════════════════════════════════════════════
           CELEBRATION OVERLAY
           ══════════════════════════════════════════════════════════════ */
        
        .celebration-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
        }
        
        .celebration-overlay.visible {
            display: flex;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .celebration-content {
            text-align: center;
            padding: 2rem;
            animation: celebrationPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        @keyframes celebrationPop {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .celebration-emoji {
            font-size: 5rem;
            margin-bottom: 1rem;
            animation: trophy 1s ease-in-out infinite;
        }
        
        @keyframes trophy {
            0%, 100% { transform: rotate(-5deg) scale(1); }
            50% { transform: rotate(5deg) scale(1.1); }
        }
        
        .celebration-title {
            font-size: 2rem;
            font-weight: 900;
            background: linear-gradient(135deg, var(--fire-low), var(--fire-high));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }
        
        .celebration-text {
            font-size: 1.1rem;
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
        }
        
        .celebration-prize {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--success);
        }
        
        /* ══════════════════════════════════════════════════════════════
           FOOTER
           ══════════════════════════════════════════════════════════════ */
        
        .footer {
            margin-top: auto;
            padding-top: 2rem;
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
    <main class="main-container">
        <!-- Fire Widget -->
        <div class="fire-container">
            <div class="fire-widget">
                <div class="fire-glow level-1" id="fire-glow"></div>
                <span class="fire-icon">🔥</span>
                <span class="streak-count" id="streak-count">0</span>
            </div>
        </div>
        
        <!-- Header Text -->
        <h1 class="program-name">${nombre_programa || 'Mi Racha'}</h1>
        <p class="motivational-text" id="motivational-text">${mensaje_motivacional || '¡Sigue así!'}</p>
        <p class="progress-text" id="progress-text">
            Estás a <strong id="remaining">${meta}</strong> visitas de tu regalo
        </p>
        
        <!-- 7-Day Timeline -->
        <section class="timeline-section">
            <p class="timeline-title">Tu semana</p>
            <div class="timeline" id="timeline">
                <!-- Days will be rendered by JS -->
            </div>
        </section>
        
        <!-- Prize Section -->
        <section class="prize-section">
            <p class="prize-label">🎁 Premio al completar</p>
            <p class="prize-name">${premio || 'Premio sorpresa'}</p>
        </section>
        
        <!-- Check-in Button -->
        <button class="checkin-btn" id="checkin-btn" onclick="checkIn()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 6L9 17l-5-5"></path>
            </svg>
            <span id="btn-text">Registrar visita de hoy</span>
        </button>
    </main>
    
    <!-- Celebration Overlay -->
    <div class="celebration-overlay" id="celebration">
        <div class="celebration-content">
            <div class="celebration-emoji">🏆</div>
            <h2 class="celebration-title">¡RACHA COMPLETADA!</h2>
            <p class="celebration-text">Has completado ${meta} visitas seguidas</p>
            <p class="celebration-prize">🎁 ${premio || 'Premio sorpresa'}</p>
        </div>
    </div>
    
    <!-- Footer -->
    <footer class="footer">
        <p>Powered by <a href="#">${brandName}</a></p>
    </footer>
    
    <script>
        // ══════════════════════════════════════════════════════════════
        // STREAK PERSISTENCE & LOGIC
        // ══════════════════════════════════════════════════════════════
        
        const STORAGE_KEY = '${storageKey}';
        const META = ${meta};
        const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
        
        // Get or initialize streak data
        function getStreakData() {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    return createFreshData();
                }
            }
            return createFreshData();
        }
        
        function createFreshData() {
            return {
                visits: [],
                streak: 0,
                lastVisit: null,
                completed: false
            };
        }
        
        function saveStreakData(data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        
        // Get today's date string (YYYY-MM-DD)
        function getToday() {
            return new Date().toISOString().split('T')[0];
        }
        
        // Get day of week (0 = Monday)
        function getDayOfWeek(dateStr) {
            const date = new Date(dateStr);
            const day = date.getDay();
            return day === 0 ? 6 : day - 1; // Convert to Monday-based
        }
        
        // Check if visited today
        function hasVisitedToday(data) {
            return data.lastVisit === getToday();
        }
        
        // Calculate streak (consecutive days)
        function calculateStreak(visits) {
            if (visits.length === 0) return 0;
            
            const sortedVisits = [...visits].sort().reverse();
            let streak = 0;
            const today = new Date();
            
            for (let i = 0; i < sortedVisits.length; i++) {
                const expectedDate = new Date(today);
                expectedDate.setDate(today.getDate() - i);
                const expectedStr = expectedDate.toISOString().split('T')[0];
                
                if (sortedVisits[i] === expectedStr) {
                    streak++;
                } else if (i === 0 && streak === 0) {
                    // Allow yesterday as starting point
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    if (sortedVisits[i] === yesterday.toISOString().split('T')[0]) {
                        streak++;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            
            return Math.min(streak, META);
        }
        
        // Get visits for current week
        function getWeekVisits(visits) {
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - getDayOfWeek(getToday()));
            
            return DAYS.map((_, i) => {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                return visits.includes(dateStr);
            });
        }
        
        // ══════════════════════════════════════════════════════════════
        // UI RENDERING
        // ══════════════════════════════════════════════════════════════
        
        function renderTimeline(weekVisits) {
            const timeline = document.getElementById('timeline');
            const todayIndex = getDayOfWeek(getToday());
            
            timeline.innerHTML = DAYS.map((day, i) => {
                const isToday = i === todayIndex;
                const isVisited = weekVisits[i];
                
                return \`
                    <div class="day-slot">
                        <div class="day-circle \${isVisited ? 'visited' : ''} \${isToday ? 'today' : ''}">
                            \${isVisited ? '✓' : day}
                        </div>
                        <span class="day-label \${isToday ? 'today' : ''}">\${day}</span>
                    </div>
                \`;
            }).join('');
        }
        
        function updateFireWidget(streak) {
            const glow = document.getElementById('fire-glow');
            const count = document.getElementById('streak-count');
            
            count.textContent = streak;
            count.classList.toggle('active', streak >= 3);
            
            // Set glow level based on streak
            glow.className = 'fire-glow';
            if (streak >= 6) glow.classList.add('level-4');
            else if (streak >= 4) glow.classList.add('level-3');
            else if (streak >= 2) glow.classList.add('level-2');
            else glow.classList.add('level-1');
        }
        
        function updateTexts(streak, completed) {
            const remaining = Math.max(0, META - streak);
            const remainingEl = document.getElementById('remaining');
            const progressText = document.getElementById('progress-text');
            const motivationalText = document.getElementById('motivational-text');
            
            remainingEl.textContent = remaining;
            
            if (completed) {
                progressText.innerHTML = '🎉 <strong>¡Premio desbloqueado!</strong>';
                motivationalText.textContent = '¡Récord conseguido!';
            } else if (remaining === 1) {
                progressText.innerHTML = 'Estás a <strong>1</strong> visita de tu regalo';
                motivationalText.textContent = '¡Ya casi lo tienes!';
            } else if (remaining === 0) {
                progressText.innerHTML = '🎉 <strong>¡Premio desbloqueado!</strong>';
            }
        }
        
        function updateButton(data) {
            const btn = document.getElementById('checkin-btn');
            const btnText = document.getElementById('btn-text');
            
            if (hasVisitedToday(data)) {
                btn.disabled = true;
                btn.classList.add('checked');
                btnText.textContent = '✓ Visita registrada hoy';
            } else {
                btn.disabled = false;
                btn.classList.remove('checked');
                btnText.textContent = 'Registrar visita de hoy';
            }
        }
        
        // ══════════════════════════════════════════════════════════════
        // CHECK-IN ACTION
        // ══════════════════════════════════════════════════════════════
        
        function checkIn() {
            const data = getStreakData();
            const today = getToday();
            
            if (hasVisitedToday(data)) return;
            
            // Add today's visit
            if (!data.visits.includes(today)) {
                data.visits.push(today);
            }
            data.lastVisit = today;
            data.streak = calculateStreak(data.visits);
            
            // Check if completed
            if (data.streak >= META && !data.completed) {
                data.completed = true;
                saveStreakData(data);
                showCelebration();
            } else {
                saveStreakData(data);
            }
            
            // Vibrate
            if (navigator.vibrate) {
                navigator.vibrate([50, 50, 100]);
            }
            
            // Re-render
            initApp();
        }
        
        function showCelebration() {
            const celebration = document.getElementById('celebration');
            celebration.classList.add('visible');
            
            setTimeout(() => {
                celebration.classList.remove('visible');
            }, 4000);
        }
        
        // ══════════════════════════════════════════════════════════════
        // INITIALIZATION
        // ══════════════════════════════════════════════════════════════
        
        function initApp() {
            const data = getStreakData();
            const weekVisits = getWeekVisits(data.visits);
            const streak = calculateStreak(data.visits);
            
            renderTimeline(weekVisits);
            updateFireWidget(streak);
            updateTexts(streak, data.completed);
            updateButton(data);
        }
        
        // Start app
        initApp();
    </script>
</body>
</html>`;
}
