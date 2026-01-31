import { Check, X, Crown, Zap, Rocket, Star, ArrowRight, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import type { UserTier } from '../../types';
import './PricingPageV2.css';

interface PricingPageV2Props {
    onSelectPlan: (tier: UserTier) => void;
}

interface PlanFeature {
    name: string;
    free: boolean | string;
    plus: boolean | string;
    pro: boolean | string;
    premium: boolean | string;
}

const FEATURES: PlanFeature[] = [
    { name: 'Proyectos', free: '1', plus: '5', pro: '20', premium: 'Ilimitados' },
    { name: 'Landings por proyecto', free: '1', plus: '3', pro: '10', premium: 'Ilimitadas' },
    { name: 'Regeneraciones de enlace', free: '3', plus: '10', pro: '∞', premium: '∞' },
    { name: 'Plantillas de diseño', free: '2', plus: '4', pro: '4', premium: 'Todas + Custom' },
    { name: 'Cartel sin marca de agua', free: false, plus: true, pro: true, premium: true },
    { name: 'Subdominio personalizado', free: false, plus: true, pro: true, premium: true },
    { name: 'Analytics básicos', free: false, plus: true, pro: true, premium: true },
    { name: 'Analytics avanzados', free: false, plus: false, pro: true, premium: true },
    { name: 'Gamificación (Ruletas)', free: false, plus: false, pro: true, premium: true },
    { name: 'Reservas online', free: false, plus: false, pro: true, premium: true },
    { name: 'CRM integrado', free: false, plus: false, pro: false, premium: true },
    { name: 'Tienda online', free: false, plus: false, pro: false, premium: true },
    { name: 'Soporte prioritario', free: false, plus: false, pro: true, premium: true },
    { name: 'API access', free: false, plus: false, pro: false, premium: true },
];

const PLANS = [
    {
        id: 'free' as UserTier,
        name: 'Gratis',
        price: 0,
        period: 'para siempre',
        description: 'Perfecto para probar la plataforma',
        icon: Zap,
        color: 'var(--gray-500)',
        gradient: 'linear-gradient(135deg, var(--gray-400), var(--gray-500))',
        popular: false,
        cta: 'Empezar gratis'
    },
    {
        id: 'plus' as UserTier,
        name: 'Plus',
        price: 9,
        period: '/mes',
        description: 'Para negocios en crecimiento',
        icon: Star,
        color: 'var(--info-500)',
        gradient: 'linear-gradient(135deg, var(--info-400), var(--info-600))',
        popular: false,
        cta: 'Empezar con Plus'
    },
    {
        id: 'pro' as UserTier,
        name: 'Pro',
        price: 29,
        period: '/mes',
        description: 'La opción más popular',
        icon: Rocket,
        color: 'var(--primary-500)',
        gradient: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
        popular: true,
        cta: 'Empezar con Pro'
    },
    {
        id: 'premium' as UserTier,
        name: 'Premium',
        price: 99,
        period: '/mes',
        description: 'Para agencias y profesionales',
        icon: Crown,
        color: 'var(--warning-500)',
        gradient: 'linear-gradient(135deg, var(--warning-400), var(--warning-600))',
        popular: false,
        cta: 'Contactar ventas'
    }
];

export function PricingPageV2({ onSelectPlan }: PricingPageV2Props) {
    const { userTier } = useAppStore();

    const renderFeatureValue = (value: boolean | string) => {
        if (typeof value === 'string') {
            return <span className="feature-value">{value}</span>;
        }
        return value ? (
            <Check className="feature-check" size={18} />
        ) : (
            <X className="feature-x" size={18} />
        );
    };

    return (
        <div className="pricing-v2">
            {/* Hero Section */}
            <div className="pricing-hero">
                <Badge variant="primary" className="hero-badge">
                    <Sparkles size={12} />
                    Planes y precios
                </Badge>
                <h1 className="hero-title">Elige el plan perfecto para tu negocio</h1>
                <p className="hero-description">
                    Sin compromisos. Cancela cuando quieras. Todos los planes incluyen 14 días de prueba.
                </p>
            </div>

            {/* Plans Grid */}
            <div className="plans-grid">
                {PLANS.map(plan => {
                    const Icon = plan.icon;
                    const isCurrentPlan = userTier === plan.id;

                    return (
                        <Card
                            key={plan.id}
                            className={`plan-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}
                            padding="none"
                        >
                            {plan.popular && (
                                <div className="popular-ribbon">
                                    <Sparkles size={14} />
                                    Más popular
                                </div>
                            )}

                            <div className="plan-header" style={{ background: plan.gradient }}>
                                <div className="plan-icon-wrapper">
                                    <Icon size={24} />
                                </div>
                                <h3 className="plan-name">{plan.name}</h3>
                            </div>

                            <div className="plan-body">
                                <div className="plan-price-wrapper">
                                    <span className="plan-currency">€</span>
                                    <span className="plan-price">{plan.price}</span>
                                    <span className="plan-period">{plan.period}</span>
                                </div>

                                <p className="plan-description">{plan.description}</p>

                                {isCurrentPlan ? (
                                    <Button variant="secondary" fullWidth disabled>
                                        Plan actual
                                    </Button>
                                ) : (
                                    <Button
                                        variant={plan.popular ? 'primary' : 'secondary'}
                                        fullWidth
                                        onClick={() => onSelectPlan(plan.id)}
                                        rightIcon={<ArrowRight size={16} />}
                                    >
                                        {plan.cta}
                                    </Button>
                                )}

                                <ul className="plan-features-list">
                                    <li>
                                        <Check size={16} />
                                        <span>{FEATURES[0][plan.id]} proyectos</span>
                                    </li>
                                    <li>
                                        <Check size={16} />
                                        <span>{FEATURES[1][plan.id]} landings/proyecto</span>
                                    </li>
                                    <li>
                                        <Check size={16} />
                                        <span>{FEATURES[2][plan.id]} regeneraciones</span>
                                    </li>
                                    {plan.id !== 'free' && (
                                        <li>
                                            <Check size={16} />
                                            <span>Sin marca de agua</span>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Comparison Table */}
            <div className="comparison-section">
                <h2 className="comparison-title">Comparación detallada</h2>

                <div className="comparison-table-container">
                    <table className="comparison-table">
                        <thead>
                            <tr>
                                <th>Funcionalidad</th>
                                <th>Gratis</th>
                                <th>Plus</th>
                                <th className="highlight">Pro</th>
                                <th>Premium</th>
                            </tr>
                        </thead>
                        <tbody>
                            {FEATURES.map((feature, idx) => (
                                <tr key={idx}>
                                    <td className="feature-name">{feature.name}</td>
                                    <td>{renderFeatureValue(feature.free)}</td>
                                    <td>{renderFeatureValue(feature.plus)}</td>
                                    <td className="highlight">{renderFeatureValue(feature.pro)}</td>
                                    <td>{renderFeatureValue(feature.premium)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Trust Section */}
            <div className="trust-section">
                <div className="trust-card">
                    <div className="trust-icon">💳</div>
                    <h4>Pago seguro</h4>
                    <p>Procesado por Stripe con cifrado SSL de 256 bits</p>
                </div>
                <div className="trust-card">
                    <div className="trust-icon">🔄</div>
                    <h4>Cancela cuando quieras</h4>
                    <p>Sin compromisos ni permanencia mínima</p>
                </div>
                <div className="trust-card">
                    <div className="trust-icon">💬</div>
                    <h4>Soporte incluido</h4>
                    <p>Respuesta en menos de 24 horas</p>
                </div>
                <div className="trust-card">
                    <div className="trust-icon">🔒</div>
                    <h4>Garantía de 30 días</h4>
                    <p>Te devolvemos el dinero sin preguntas</p>
                </div>
            </div>

            {/* FAQ Preview */}
            <div className="faq-preview">
                <h3>¿Tienes preguntas?</h3>
                <p>Escríbenos a <a href="mailto:hola@fotofachada.com">hola@fotofachada.com</a> y te responderemos en menos de 24h.</p>
            </div>
        </div>
    );
}
