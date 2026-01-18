import { ArrowRight, Sparkles, Play, Star, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import './PublicHome.css';

interface PublicHomeProps {
    onGetStarted: () => void;
    onViewDemo: () => void;
}

export function PublicHome({ onGetStarted, onViewDemo }: PublicHomeProps) {
    return (
        <div className="public-home">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg">
                    <div className="orb orb-1" />
                    <div className="orb orb-2" />
                    <div className="grid-overlay" />
                </div>

                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-badges">
                            <Badge variant="primary" className="hero-badge">
                                <Sparkles size={14} />
                                <span>IA Generativa para Comercio Local</span>
                            </Badge>
                            <div className="location-badge">
                                <MapPin size={14} className="text-red-500" />
                                <span>Benidorm, ES</span>
                            </div>
                        </div>

                        <h1 className="hero-title">
                            Tu Fachada es tu mejor <span className="text-gradient">Vendedor</span>.<br />
                            Dale el poder de la <span className="text-gradient">IA</span>.
                        </h1>

                        <p className="hero-subtitle">
                            Diseñamos tu Escaparate Digital y tu Cartel QR profesional en segundos.
                            <br className="hidden sm:block" />
                            Sin códigos, sin esperas, solo resultados.
                        </p>

                        <div className="hero-actions">
                            <Button
                                size="lg"
                                variant="primary"
                                onClick={onGetStarted}
                                rightIcon={<ArrowRight size={20} />}
                                className="cta-primary"
                            >
                                Probar Gratis - Haz una Foto
                            </Button>
                            <Button
                                size="lg"
                                variant="ghost"
                                onClick={onViewDemo}
                                leftIcon={<Play size={18} />}
                                className="cta-secondary"
                            >
                                Ver Demo
                            </Button>
                        </div>

                        <div className="social-proof">
                            <div className="avatars">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="avatar" style={{ backgroundImage: `linear-gradient(135deg, hsl(${i * 60}, 70%, 60%), hsl(${i * 60 + 30}, 70%, 50%))` }} />
                                ))}
                            </div>
                            <div className="proof-text">
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                                </div>
                                <p><strong>52 comercios</strong> en Benidorm han activado su escaparate hoy</p>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="phone-mockup">
                            <div className="phone-notch" />
                            <div className="phone-screen">
                                <div className="screen-header" />
                                <div className="screen-content">
                                    <div className="skeleton-hero" />
                                    <div className="skeleton-grid">
                                        <div className="skeleton-card" />
                                        <div className="skeleton-card" />
                                        <div className="skeleton-card" />
                                    </div>
                                    <div className="floating-card ai-card">
                                        <Sparkles size={16} />
                                        <span>Analizando...</span>
                                    </div>
                                    <div className="floating-card qr-card">
                                        Scan Me
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
