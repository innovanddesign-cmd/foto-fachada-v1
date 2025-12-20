import { ArrowRight, Sparkles, Zap, Smartphone, Check, LayoutGrid, QrCode, Target, TrendingUp, Users, Play, ChevronRight, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import './HomePageV3.css';

interface HomePageV3Props {
    onGetStarted: () => void;
}

export function HomePageV3({ onGetStarted }: HomePageV3Props) {
    return (
        <div className="home-v3">
            {/* Hero Section */}
            <section className="hero-v3">
                <div className="hero-bg-effects">
                    <div className="gradient-orb orb-1" />
                    <div className="gradient-orb orb-2" />
                    <div className="gradient-orb orb-3" />
                    <div className="grid-overlay" />
                </div>

                <div className="hero-content">
                    <div className="hero-badge-row">
                        <Badge variant="primary" className="hero-announcement">
                            <Sparkles size={14} />
                            <span>Nuevo: IA Generativa para Marketing Local</span>
                            <ChevronRight size={14} />
                        </Badge>
                    </div>

                    <h1 className="hero-headline">
                        Convierte tu <span className="text-gradient-animated">fachada</span> en una <span className="text-gradient-animated">máquina</span> de captar clientes
                    </h1>

                    <p className="hero-subheadline">
                        La primera plataforma que usa Vision AI para analizar tu negocio físico y generar automáticamente landing pages, carteles QR y estrategias de marketing personalizadas.
                    </p>

                    <div className="hero-cta-group">
                        <Button size="lg" variant="primary" onClick={onGetStarted} rightIcon={<ArrowRight size={20} />} className="cta-primary-glow">
                            Empezar gratis
                        </Button>
                        <Button size="lg" variant="ghost" className="cta-demo" leftIcon={<Play size={18} />}>
                            Ver demo en vivo
                        </Button>
                    </div>

                    <div className="hero-social-proof">
                        <div className="avatar-stack">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="avatar-item" style={{ backgroundImage: `linear-gradient(135deg, hsl(${i * 50}, 70%, 60%), hsl(${i * 50 + 30}, 70%, 50%))` }} />
                            ))}
                        </div>
                        <div className="proof-text">
                            <div className="proof-stars">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                            </div>
                            <span>Usado por <strong>500+</strong> negocios locales</span>
                        </div>
                    </div>
                </div>

                {/* Hero Visual - Browser Mockup */}
                <div className="hero-visual">
                    <div className="browser-frame">
                        <div className="browser-header">
                            <div className="browser-dots">
                                <span className="dot red" />
                                <span className="dot yellow" />
                                <span className="dot green" />
                            </div>
                            <div className="browser-url">
                                <span className="url-lock">🔒</span>
                                fotofachada.app/dashboard
                            </div>
                        </div>
                        <div className="browser-content">
                            <div className="mock-sidebar">
                                <div className="mock-logo" />
                                <div className="mock-nav-items">
                                    <div className="mock-nav-item active" />
                                    <div className="mock-nav-item" />
                                    <div className="mock-nav-item" />
                                </div>
                            </div>
                            <div className="mock-main">
                                <div className="mock-header-bar" />
                                <div className="mock-cards-grid">
                                    <div className="mock-card pulse" />
                                    <div className="mock-card" />
                                    <div className="mock-card glow" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Cards */}
                    <div className="floating-element el-ai">
                        <Zap size={20} />
                        <div className="float-content">
                            <span className="float-title">Análisis IA</span>
                            <span className="float-value">Completado ✓</span>
                        </div>
                    </div>
                    <div className="floating-element el-qr">
                        <QrCode size={20} />
                        <div className="float-content">
                            <span className="float-title">QR Generado</span>
                            <span className="float-value">Listo para imprimir</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Logos Section */}
            <section className="logos-section">
                <p className="logos-label">Empresas que confían en nosotros</p>
                <div className="logos-marquee">
                    <div className="logos-track">
                        {['Peluquería Ana', 'Café Central', 'Gym Power', 'Restaurante Sol', 'Boutique Moda', 'Clínica Dental', 'Auto Lavado Pro', 'Farmacia Plus'].map((name, i) => (
                            <div key={i} className="logo-item">{name}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Problem/Solution Section */}
            <section className="problem-section">
                <div className="section-container">
                    <div className="problem-grid">
                        <div className="problem-content">
                            <Badge variant="neutral" className="section-badge">El problema</Badge>
                            <h2>El marketing tradicional ya no funciona para negocios locales</h2>
                            <ul className="problem-list">
                                <li><span className="problem-icon">❌</span> Contratar diseñadores es caro y lento</li>
                                <li><span className="problem-icon">❌</span> Las redes sociales requieren tiempo constante</li>
                                <li><span className="problem-icon">❌</span> Los clientes pasan por tu puerta sin entrar</li>
                                <li><span className="problem-icon">❌</span> No sabes qué funciona y qué no</li>
                            </ul>
                        </div>
                        <div className="solution-content">
                            <Badge variant="primary" className="section-badge">La solución</Badge>
                            <h2>FotoFachada automatiza tu marketing con IA</h2>
                            <ul className="solution-list">
                                <li><span className="solution-icon">✓</span> Sube una foto, obtén una landing en segundos</li>
                                <li><span className="solution-icon">✓</span> Carteles QR listos para imprimir</li>
                                <li><span className="solution-icon">✓</span> Estrategias personalizadas por IA</li>
                                <li><span className="solution-icon">✓</span> Analytics en tiempo real</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Bento Grid */}
            <section id="features" className="features-v3">
                <div className="section-container">
                    <div className="section-header">
                        <Badge variant="primary">Características</Badge>
                        <h2>Todo lo que necesitas para dominar tu zona</h2>
                        <p>Herramientas de nivel enterprise, diseñadas para negocios locales</p>
                    </div>

                    <div className="bento-v3">
                        {/* Main Feature - AI Analysis */}
                        <div className="bento-card bento-large spotlight-card">
                            <div className="bento-card-content">
                                <div className="feature-icon-wrap">
                                    <Zap size={24} />
                                </div>
                                <h3>Vision AI Analysis</h3>
                                <p>Nuestra IA analiza tu fachada, identifica colores de marca, tipografía y estilo para crear materiales perfectamente alineados con tu imagen.</p>
                                <div className="feature-tags">
                                    <span className="tag">Gemini Pro</span>
                                    <span className="tag">Brand Detection</span>
                                    <span className="tag">Auto-styling</span>
                                </div>
                            </div>
                            <div className="bento-visual ai-visual">
                                <div className="ai-scan-effect">
                                    <div className="scan-target" />
                                    <div className="scan-line" />
                                    <div className="scan-data">
                                        <div className="data-row"><span>Color primario</span><span className="color-chip" /></div>
                                        <div className="data-row"><span>Tipo de negocio</span><span>Detectado ✓</span></div>
                                        <div className="data-row"><span>Estilo sugerido</span><span>Moderno</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Landing Pages */}
                        <div className="bento-card spotlight-card">
                            <div className="bento-card-content">
                                <div className="feature-icon-wrap purple">
                                    <LayoutGrid size={24} />
                                </div>
                                <h3>Landing Pages</h3>
                                <p>Páginas de alta conversión generadas automáticamente para cada campaña.</p>
                            </div>
                        </div>

                        {/* QR Posters */}
                        <div className="bento-card spotlight-card">
                            <div className="bento-card-content">
                                <div className="feature-icon-wrap cyan">
                                    <QrCode size={24} />
                                </div>
                                <h3>Carteles QR</h3>
                                <p>PDFs listos para imprimir que conectan tu escaparate con el mundo digital.</p>
                            </div>
                        </div>

                        {/* Marketing Strategy */}
                        <div className="bento-card bento-wide spotlight-card">
                            <div className="bento-card-content">
                                <div className="feature-icon-wrap green">
                                    <Target size={24} />
                                </div>
                                <h3>Marketing Agent</h3>
                                <p>Un agente de IA que genera estrategias personalizadas basadas en tu ubicación, competencia y tipo de negocio.</p>
                                <div className="strategy-chips">
                                    <span className="chip"><Check size={12} /> Campaña Instagram</span>
                                    <span className="chip"><Check size={12} /> Programa referidos</span>
                                    <span className="chip"><Check size={12} /> Ofertas flash</span>
                                </div>
                            </div>
                        </div>

                        {/* Analytics */}
                        <div className="bento-card spotlight-card">
                            <div className="bento-card-content">
                                <div className="feature-icon-wrap orange">
                                    <TrendingUp size={24} />
                                </div>
                                <h3>Analytics</h3>
                                <p>Métricas en tiempo real de visitas, escaneos QR y conversiones.</p>
                            </div>
                            <div className="mini-chart">
                                <div className="chart-bar" style={{ height: '40%' }} />
                                <div className="chart-bar" style={{ height: '65%' }} />
                                <div className="chart-bar" style={{ height: '55%' }} />
                                <div className="chart-bar active" style={{ height: '90%' }} />
                                <div className="chart-bar" style={{ height: '75%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="steps-v3">
                <div className="section-container">
                    <div className="section-header">
                        <Badge variant="neutral">Cómo funciona</Badge>
                        <h2>De foto a clientes en 3 pasos</h2>
                        <p>Sin conocimientos técnicos. Sin diseñadores. Sin esperas.</p>
                    </div>

                    <div className="steps-timeline">
                        <div className="timeline-line" />

                        <div className="step-item">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Sube una foto</h3>
                                <p>Haz una foto a tu fachada desde tu móvil y súbela a la plataforma.</p>
                            </div>
                            <div className="step-visual">
                                <Smartphone size={32} />
                            </div>
                        </div>

                        <div className="step-item">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>La IA hace su magia</h3>
                                <p>En segundos, analizamos tu marca y generamos landing pages, carteles y estrategias.</p>
                            </div>
                            <div className="step-visual">
                                <Sparkles size={32} />
                            </div>
                        </div>

                        <div className="step-item">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Capta clientes</h3>
                                <p>Imprime tu cartel QR, comparte tu landing y empieza a convertir transeúntes en clientes.</p>
                            </div>
                            <div className="step-visual">
                                <Users size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials-v3">
                <div className="section-container">
                    <div className="section-header">
                        <Badge variant="primary">Testimonios</Badge>
                        <h2>Lo que dicen nuestros usuarios</h2>
                    </div>

                    <div className="testimonials-grid">
                        <div className="testimonial-card featured">
                            <div className="testimonial-stars">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <blockquote>"En una semana captamos más clientes con el cartel QR que en un mes con Instagram. Increíble."</blockquote>
                            <div className="testimonial-author">
                                <div className="author-avatar">MA</div>
                                <div className="author-info">
                                    <strong>María Andrés</strong>
                                    <span>Peluquería Estilo, Madrid</span>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="testimonial-stars">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <blockquote>"La IA supo exactamente qué colores y estilo usar. Mi landing parece hecha por un profesional."</blockquote>
                            <div className="testimonial-author">
                                <div className="author-avatar">JL</div>
                                <div className="author-info">
                                    <strong>Jorge López</strong>
                                    <span>Café El Rincón, Barcelona</span>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="testimonial-stars">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <blockquote>"Ahora tengo una landing diferente para cada promoción. Mis clientes están encantados."</blockquote>
                            <div className="testimonial-author">
                                <div className="author-avatar">CS</div>
                                <div className="author-info">
                                    <strong>Carmen Sánchez</strong>
                                    <span>Boutique Moda, Valencia</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="cta-v3">
                <div className="cta-container">
                    <div className="cta-glow" />
                    <h2>¿Listo para transformar tu negocio?</h2>
                    <p>Únete a cientos de negocios locales que ya están captando clientes con FotoFachada.</p>
                    <div className="cta-actions">
                        <Button size="lg" variant="primary" onClick={onGetStarted} rightIcon={<ArrowRight size={20} />} className="cta-primary-glow">
                            Empezar gratis ahora
                        </Button>
                    </div>
                    <p className="cta-note">✓ Sin tarjeta de crédito &nbsp;&nbsp; ✓ 14 días de prueba Premium &nbsp;&nbsp; ✓ Cancela cuando quieras</p>
                </div>
            </section>
        </div>
    );
}
