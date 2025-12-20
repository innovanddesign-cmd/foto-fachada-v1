import { Check, X, Crown, Zap, Rocket, Star, ArrowRight, Sparkles, ShieldCheck, HeartHandshake, CreditCard, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { UserTier } from '../../types';
import './PricingPageV3.css';

interface PricingPageV3Props {
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
        popular: false,
        cta: 'Plan actual',
        border: 'var(--color-border)',
        shadow: 'none'
    },
    {
        id: 'plus' as UserTier,
        name: 'Plus',
        price: 9,
        period: '/mes',
        description: 'Para negocios en crecimiento',
        icon: Star,
        popular: false,
        cta: 'Empezar con Plus',
        border: 'var(--neon-cyan)',
        shadow: '0 0 20px rgba(6, 182, 212, 0.2)'
    },
    {
        id: 'pro' as UserTier,
        name: 'Pro',
        price: 29,
        period: '/mes',
        description: 'La opción más popular',
        icon: Rocket,
        popular: true,
        cta: 'Empezar con Pro',
        border: 'var(--primary-500)',
        shadow: '0 0 30px rgba(99, 102, 241, 0.3)'
    },
    {
        id: 'premium' as UserTier,
        name: 'Premium',
        price: 99,
        period: '/mes',
        description: 'Para agencias y profesionales',
        icon: Crown,
        popular: false,
        cta: 'Contactar ventas',
        border: 'var(--neon-purple)',
        shadow: '0 0 20px rgba(168, 85, 247, 0.2)'
    }
];

export function PricingPageV3({ onSelectPlan }: PricingPageV3Props) {
    const { userTier } = useAppStore();

    const renderFeatureValue = (value: boolean | string) => {
        if (typeof value === 'string') {
            return <span className="feature-value">{value}</span>;
        }
        return value ? (
            <Check className="feature-check text-green-400" size={18} />
        ) : (
            <X className="feature-x text-gray-600" size={18} />
        );
    };

    return (
        <div className="pricing-v3 fade-in">
            {/* Background Effects */}
            <div className="pricing-bg-effects">
                <div className="pricing-orb orb-1" />
                <div className="pricing-orb orb-2" />
            </div>

            {/* Hero Section */}
            <div className="pricing-hero-v3">
                <Badge variant="primary" className="hero-badge mb-4">
                    <Sparkles size={12} className="mr-1" />
                    Planes y precios
                </Badge>
                <h1 className="hero-title-v3">Elige el plan perfecto para tu negocio</h1>
                <p className="hero-description-v3">
                    Sin compromisos. Cancela cuando quieras. Todos los planes incluyen 14 días de prueba.
                </p>

                <div className="pricing-toggle-v3">
                    <button className="toggle-option active">Mensual</button>
                    <button className="toggle-option">Anual <span className="save-badge">-20%</span></button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="plans-grid-v3">
                {PLANS.map(plan => {
                    const Icon = plan.icon;
                    const isCurrentPlan = userTier === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={`plan-card-v3 glass-panel ${plan.popular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}
                            style={{
                                borderColor: plan.popular ? plan.border : undefined,
                                boxShadow: plan.popular ? plan.shadow : undefined
                            }}
                        >
                            {plan.popular && (
                                <div className="popular-ribbon-v3">
                                    <Sparkles size={12} /> Más popular
                                </div>
                            )}

                            <div className="plan-header-v3">
                                <div className="plan-icon-wrapper-v3">
                                    <Icon size={24} />
                                </div>
                                <h3 className="plan-name-v3">{plan.name}</h3>
                                <p className="plan-desc-v3">{plan.description}</p>
                            </div>

                            <div className="plan-price-v3">
                                <div className="amount-wrapper">
                                    <span className="currency">€</span>
                                    <span className="amount">{plan.price}</span>
                                </div>
                                <span className="period">{plan.period}</span>
                            </div>

                            <div className="plan-actions-v3">
                                <Button
                                    variant={plan.popular ? 'primary' : 'ghost'}
                                    fullWidth
                                    onClick={() => onSelectPlan(plan.id)}
                                    disabled={isCurrentPlan}
                                    rightIcon={!isCurrentPlan ? <ArrowRight size={16} /> : undefined}
                                    className={plan.popular ? 'btn-glow' : 'btn-outline-glass'}
                                >
                                    {isCurrentPlan ? 'Plan Actual' : plan.cta}
                                </Button>
                            </div>

                            <div className="plan-divider-v3" />

                            <ul className="plan-features-v3">
                                <li>
                                    <Check size={16} className="text-primary-400" />
                                    <span>{FEATURES[0][plan.id]} proyectos</span>
                                </li>
                                <li>
                                    <Check size={16} className="text-primary-400" />
                                    <span>{FEATURES[1][plan.id]} landings/proyecto</span>
                                </li>
                                {plan.id !== 'free' && (
                                    <li>
                                        <Check size={16} className="text-primary-400" />
                                        <span>Sin marca de agua</span>
                                    </li>
                                )}
                                {plan.id === 'pro' && (
                                    <li>
                                        <Check size={16} className="text-primary-400" />
                                        <span>Analytics avanzados</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Comparison Table */}
            <div className="comparison-section-v3 glass-panel">
                <h2 className="text-2xl font-bold mb-6 text-center">Comparación detallada</h2>

                <div className="table-wrapper">
                    <table className="comparison-table-v3">
                        <thead>
                            <tr>
                                <th className="text-left pl-4">Funcionalidad</th>
                                <th>Gratis</th>
                                <th>Plus</th>
                                <th className="highlight-col">Pro</th>
                                <th>Premium</th>
                            </tr>
                        </thead>
                        <tbody>
                            {FEATURES.map((feature, idx) => (
                                <tr key={idx}>
                                    <td className="feature-name-col">{feature.name}</td>
                                    <td>{renderFeatureValue(feature.free)}</td>
                                    <td>{renderFeatureValue(feature.plus)}</td>
                                    <td className="highlight-col">{renderFeatureValue(feature.pro)}</td>
                                    <td>{renderFeatureValue(feature.premium)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Trust Section */}
            <div className="trust-grid-v3">
                <div className="trust-item-v3">
                    <ShieldCheck size={24} className="text-primary-400" />
                    <div>
                        <h4>Pago seguro</h4>
                        <p>Cifrado SSL de 256 bits</p>
                    </div>
                </div>
                <div className="trust-item-v3">
                    <RotateCcw size={24} className="text-primary-400" />
                    <div>
                        <h4>Cancela cuando quieras</h4>
                        <p>Sin permanencia</p>
                    </div>
                </div>
                <div className="trust-item-v3">
                    <HeartHandshake size={24} className="text-primary-400" />
                    <div>
                        <h4>Soporte incluido</h4>
                        <p>Ayuda garantizada</p>
                    </div>
                </div>
                <div className="trust-item-v3">
                    <CreditCard size={24} className="text-primary-400" />
                    <div>
                        <h4>Garantía 30 días</h4>
                        <p>Devolución asegurada</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
