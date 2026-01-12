/**
 * Referral (Trae a un Amigo) Simple Page Template
 * ================================================
 * Viral referral program page with:
 * - Double benefit proposition (referrer + friend)
 * - Unique link generator with WhatsApp share
 * - Social proof widget (dynamic counter)
 * - Referral dashboard with status tracking
 * - LocalStorage persistence
 */

import type { BrandData } from '../types';

interface ReferralConfig {
    premio_referidor: string;
    premio_invitado: string;
    mensaje_whatsapp: string;
}

/**
 * Generates the complete Referral Simple Page HTML
 */
export function generateReferralPage(
    config: ReferralConfig,
    brandData: BrandData,
    pageSlug?: string
): string {
    const {
        premio_referidor,
        premio_invitado,
        mensaje_whatsapp
    } = config;

    const brandName = brandData?.name || 'Tu Negocio';
    const primaryColor = brandData?.colors?.primary || '#10b981';
    const accentColor = brandData?.colors?.accent || '#f59e0b';

    // Generate unique referral code
    const referralCode = `REF-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const storageKey = pageSlug || `referrals_${brandName.toLowerCase().replace(/\s+/g, '_')}`;

    // Generate random social proof number (34-89 for MVP)
    const socialProofBase = 34 + Math.floor(Math.random() * 55);

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>👫 Trae a un Amigo - ${brandName}</title>
    <meta name="description" content="Invita a un amigo y ambos ganáis en ${brandName}">
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
            --bg-card-alt: #1a1a1a;
            --text-primary: #fafafa;
            --text-secondary: #888888;
            --text-muted: #555555;
            --brand-primary: ${primaryColor};
            --brand-accent: ${accentColor};
            --success: #34d399;
            --whatsapp: #25D366;
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
            padding: 1.5rem;
            -webkit-font-smoothing: antialiased;
        }
        
        /* ══════════════════════════════════════════════════════════════
           MAIN CONTAINER
           ══════════════════════════════════════════════════════════════ */
        
        .main-container {
            width: 100%;
            max-width: 420px;
            margin: 0 auto;
        }
        
        /* ══════════════════════════════════════════════════════════════
           HEADER - DOUBLE BENEFIT PROPOSITION
           ══════════════════════════════════════════════════════════════ */
        
        .hero-section {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .hero-emoji {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: handshake 2s ease-in-out infinite;
        }
        
        @keyframes handshake {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
        }
        
        .hero-title {
            font-size: 1.75rem;
            font-weight: 900;
            line-height: 1.2;
            margin-bottom: 1rem;
        }
        
        .hero-title .highlight {
            background: linear-gradient(135deg, var(--brand-accent), var(--brand-primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hero-subtitle {
            font-size: 1rem;
            color: var(--text-secondary);
        }
        
        /* ══════════════════════════════════════════════════════════════
           DOUBLE PRIZE VISUALIZATION
           ══════════════════════════════════════════════════════════════ */
        
        .prizes-container {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .prize-card {
            flex: 1;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 1.25rem 1rem;
            text-align: center;
            transition: all 0.3s;
        }
        
        .prize-card:hover {
            border-color: var(--brand-primary);
            transform: translateY(-2px);
        }
        
        .prize-for {
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
        }
        
        .prize-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .prize-name {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--text-primary);
        }
        
        .prize-card.you {
            background: linear-gradient(145deg, rgba(16, 185, 129, 0.1), transparent);
            border-color: rgba(16, 185, 129, 0.3);
        }
        
        .prize-card.you .prize-for {
            color: var(--success);
        }
        
        .prize-card.friend {
            background: linear-gradient(145deg, rgba(245, 158, 11, 0.1), transparent);
            border-color: rgba(245, 158, 11, 0.3);
        }
        
        .prize-card.friend .prize-for {
            color: var(--brand-accent);
        }
        
        /* ══════════════════════════════════════════════════════════════
           REFERRAL CODE SECTION
           ══════════════════════════════════════════════════════════════ */
        
        .code-section {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }
        
        .code-label {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-muted);
            margin-bottom: 0.75rem;
            text-align: center;
        }
        
        .code-display {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: var(--bg-dark);
            border: 2px dashed var(--brand-primary);
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        
        .code-value {
            flex: 1;
            font-family: 'Courier New', monospace;
            font-size: 1.25rem;
            font-weight: 800;
            color: var(--brand-accent);
            letter-spacing: 0.1em;
            text-align: center;
        }
        
        .copy-btn {
            background: transparent;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 0.5rem;
            cursor: pointer;
            color: var(--text-muted);
            transition: all 0.2s;
        }
        
        .copy-btn:hover {
            background: var(--bg-card);
            color: var(--text-primary);
        }
        
        .copy-btn.copied {
            color: var(--success);
            border-color: var(--success);
        }
        
        /* Share Button */
        .share-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            width: 100%;
            padding: 1.1rem;
            font-size: 1rem;
            font-weight: 700;
            color: white;
            background: var(--whatsapp);
            border: none;
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3);
            text-decoration: none;
        }
        
        .share-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 30px rgba(37, 211, 102, 0.4);
        }
        
        /* ══════════════════════════════════════════════════════════════
           SOCIAL PROOF WIDGET
           ══════════════════════════════════════════════════════════════ */
        
        .social-proof {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 100px;
            margin-bottom: 2rem;
        }
        
        .social-proof-icon {
            font-size: 1.25rem;
        }
        
        .social-proof-text {
            font-size: 0.85rem;
            color: var(--text-secondary);
        }
        
        .social-proof-count {
            font-weight: 700;
            color: var(--brand-primary);
        }
        
        /* ══════════════════════════════════════════════════════════════
           REFERRAL DASHBOARD
           ══════════════════════════════════════════════════════════════ */
        
        .dashboard-section {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }
        
        .dashboard-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
        }
        
        .dashboard-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-primary);
        }
        
        .dashboard-count {
            background: var(--brand-primary);
            color: white;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 0.25rem 0.75rem;
            border-radius: 100px;
        }
        
        .referral-list {
            list-style: none;
        }
        
        .referral-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--border);
        }
        
        .referral-item:last-child {
            border-bottom: none;
        }
        
        .referral-avatar {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
        }
        
        .referral-info {
            flex: 1;
        }
        
        .referral-name {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-primary);
        }
        
        .referral-date {
            font-size: 0.75rem;
            color: var(--text-muted);
        }
        
        .referral-status {
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
        }
        
        .referral-status.pending {
            background: rgba(245, 158, 11, 0.2);
            color: var(--brand-accent);
        }
        
        .referral-status.used {
            background: rgba(16, 185, 129, 0.2);
            color: var(--success);
        }
        
        .empty-state {
            text-align: center;
            padding: 1.5rem 0;
            color: var(--text-muted);
        }
        
        .empty-state-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            opacity: 0.5;
        }
        
        .empty-state-text {
            font-size: 0.85rem;
        }
        
        /* ══════════════════════════════════════════════════════════════
           HOW IT WORKS
           ══════════════════════════════════════════════════════════════ */
        
        .how-it-works {
            margin-bottom: 1.5rem;
        }
        
        .how-title {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-muted);
            margin-bottom: 1rem;
            text-align: center;
        }
        
        .steps {
            display: flex;
            gap: 0.5rem;
        }
        
        .step {
            flex: 1;
            text-align: center;
            padding: 1rem 0.5rem;
            background: var(--bg-card);
            border-radius: 12px;
            border: 1px solid var(--border);
        }
        
        .step-number {
            width: 24px;
            height: 24px;
            background: var(--brand-primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: 700;
            color: white;
            margin: 0 auto 0.5rem;
        }
        
        .step-text {
            font-size: 0.75rem;
            color: var(--text-secondary);
            line-height: 1.3;
        }
        
        /* ══════════════════════════════════════════════════════════════
           FOOTER
           ══════════════════════════════════════════════════════════════ */
        
        .footer {
            text-align: center;
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
        <!-- Hero Section -->
        <section class="hero-section">
            <div class="hero-emoji">👫</div>
            <h1 class="hero-title">
                Gana un <span class="highlight">${premio_referidor || 'regalo'}</span> para ti<br>
                y otro para un amigo
            </h1>
            <p class="hero-subtitle">Invita, comparte y ambos ganáis</p>
        </section>
        
        <!-- Double Prize Visualization -->
        <div class="prizes-container">
            <div class="prize-card you">
                <p class="prize-for">Para ti</p>
                <div class="prize-icon">🎁</div>
                <p class="prize-name">${premio_referidor || 'Tu premio'}</p>
            </div>
            <div class="prize-card friend">
                <p class="prize-for">Para tu amigo</p>
                <div class="prize-icon">🎁</div>
                <p class="prize-name">${premio_invitado || 'Su premio'}</p>
            </div>
        </div>
        
        <!-- Social Proof -->
        <div class="social-proof">
            <span class="social-proof-icon">👥</span>
            <span class="social-proof-text">
                <span class="social-proof-count" id="social-count">${socialProofBase}</span> 
                personas ya han invitado a sus amigos hoy en ${brandName}
            </span>
        </div>
        
        <!-- Referral Code Section -->
        <section class="code-section">
            <p class="code-label">Tu código de invitación</p>
            <div class="code-display">
                <span class="code-value" id="referral-code">${referralCode}</span>
                <button class="copy-btn" id="copy-btn" onclick="copyCode()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            </div>
            
            <a href="#" class="share-btn" id="share-btn" onclick="shareOnWhatsApp(event)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Compartir en WhatsApp
            </a>
        </section>
        
        <!-- Referral Dashboard -->
        <section class="dashboard-section">
            <div class="dashboard-header">
                <span class="dashboard-title">📊 Mis invitados</span>
                <span class="dashboard-count" id="referral-count">0</span>
            </div>
            <ul class="referral-list" id="referral-list">
                <li class="empty-state">
                    <div class="empty-state-icon">👋</div>
                    <p class="empty-state-text">Comparte tu código para ver tus invitados aquí</p>
                </li>
            </ul>
        </section>
        
        <!-- How it Works -->
        <section class="how-it-works">
            <p class="how-title">¿Cómo funciona?</p>
            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <p class="step-text">Comparte tu código</p>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <p class="step-text">Tu amigo lo usa</p>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <p class="step-text">¡Ambos ganáis!</p>
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
        // CONSTANTS
        // ══════════════════════════════════════════════════════════════
        
        const STORAGE_KEY = '${storageKey}';
        const REFERRAL_CODE = '${referralCode}';
        const BRAND_NAME = '${brandName}';
        const DEFAULT_MESSAGE = \`${mensaje_whatsapp || '¡Hola! Te invito a ' + brandName + '. Usa mi código ' + referralCode + ' y ambos ganamos un regalo. 🎁'}\`;
        
        // ══════════════════════════════════════════════════════════════
        // REFERRAL DATA MANAGEMENT
        // ══════════════════════════════════════════════════════════════
        
        function getReferralData() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    return JSON.parse(stored);
                }
            } catch (e) {}
            return { code: REFERRAL_CODE, invites: [], shares: 0 };
        }
        
        function saveReferralData(data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        
        // ══════════════════════════════════════════════════════════════
        // COPY CODE
        // ══════════════════════════════════════════════════════════════
        
        function copyCode() {
            const code = document.getElementById('referral-code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.getElementById('copy-btn');
                btn.classList.add('copied');
                btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                }, 2000);
            });
            
            // Vibrate
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
        
        // ══════════════════════════════════════════════════════════════
        // SHARE ON WHATSAPP
        // ══════════════════════════════════════════════════════════════
        
        function shareOnWhatsApp(e) {
            e.preventDefault();
            
            const data = getReferralData();
            data.shares++;
            saveReferralData(data);
            
            // Build share URL
            const shareUrl = window.location.href + '?ref=' + REFERRAL_CODE;
            const message = DEFAULT_MESSAGE + '\\n\\n' + shareUrl;
            const whatsappUrl = 'https://wa.me/?text=' + encodeURIComponent(message);
            
            // Update social proof
            updateSocialProof();
            
            // Open WhatsApp
            window.open(whatsappUrl, '_blank');
            
            // Simulate referral after 5 seconds (MVP demo)
            setTimeout(() => {
                addDemoReferral();
            }, 5000);
        }
        
        // ══════════════════════════════════════════════════════════════
        // SOCIAL PROOF
        // ══════════════════════════════════════════════════════════════
        
        function updateSocialProof() {
            const countEl = document.getElementById('social-count');
            let count = parseInt(countEl.textContent);
            count++;
            countEl.textContent = count;
        }
        
        // ══════════════════════════════════════════════════════════════
        // REFERRAL LIST
        // ══════════════════════════════════════════════════════════════
        
        function renderReferralList() {
            const data = getReferralData();
            const listEl = document.getElementById('referral-list');
            const countEl = document.getElementById('referral-count');
            
            countEl.textContent = data.invites.length;
            
            if (data.invites.length === 0) {
                listEl.innerHTML = \`
                    <li class="empty-state">
                        <div class="empty-state-icon">👋</div>
                        <p class="empty-state-text">Comparte tu código para ver tus invitados aquí</p>
                    </li>
                \`;
                return;
            }
            
            listEl.innerHTML = data.invites.map(invite => \`
                <li class="referral-item">
                    <div class="referral-avatar">\${invite.name.charAt(0).toUpperCase()}</div>
                    <div class="referral-info">
                        <p class="referral-name">\${invite.name}</p>
                        <p class="referral-date">\${formatDate(invite.date)}</p>
                    </div>
                    <span class="referral-status \${invite.used ? 'used' : 'pending'}">
                        \${invite.used ? '✓ Canjeado' : '⏳ Pendiente'}
                    </span>
                </li>
            \`).join('');
        }
        
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            
            if (diffMins < 1) return 'Hace un momento';
            if (diffMins < 60) return \`Hace \${diffMins} min\`;
            
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return \`Hace \${diffHours}h\`;
            
            return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        }
        
        // ══════════════════════════════════════════════════════════════
        // DEMO REFERRAL (For MVP testing)
        // ══════════════════════════════════════════════════════════════
        
        function addDemoReferral() {
            const names = ['María', 'Carlos', 'Laura', 'Pedro', 'Ana', 'Juan'];
            const randomName = names[Math.floor(Math.random() * names.length)];
            
            const data = getReferralData();
            data.invites.push({
                name: randomName,
                date: new Date().toISOString(),
                used: false
            });
            saveReferralData(data);
            renderReferralList();
            
            // Mark as used after some time (demo)
            setTimeout(() => {
                const data = getReferralData();
                if (data.invites.length > 0) {
                    data.invites[data.invites.length - 1].used = true;
                    saveReferralData(data);
                    renderReferralList();
                }
            }, 10000);
        }
        
        // ══════════════════════════════════════════════════════════════
        // CHECK FOR INCOMING REFERRAL
        // ══════════════════════════════════════════════════════════════
        
        function checkIncomingReferral() {
            const urlParams = new URLSearchParams(window.location.search);
            const refCode = urlParams.get('ref');
            
            if (refCode && refCode !== REFERRAL_CODE) {
                // This is a friend visiting from a referral link
                console.log('Referral from:', refCode);
                // In production, this would validate and track the referral
            }
        }
        
        // ══════════════════════════════════════════════════════════════
        // INITIALIZATION
        // ══════════════════════════════════════════════════════════════
        
        function init() {
            renderReferralList();
            checkIncomingReferral();
        }
        
        init();
    </script>
</body>
</html>`;
}
