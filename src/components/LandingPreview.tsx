import { Smartphone, ExternalLink } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import './LandingPreview.css';

export function LandingPreview() {
    const { brandData, links, landingConfig } = useAppStore();

    if (!brandData) return null;

    // Use config or fallbacks
    const config = landingConfig || {
        background: { type: 'gradient', value: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' },
        header: { logoSize: 80, titleColor: '#333', subtitleColor: '#666', layout: 'centered' },
        buttons: { style: 'rounded', background: '#fff', textColor: '#333' },
        separators: { top: 'none', bottom: 'none', color: 'transparent' },
        font: 'Inter, sans-serif'
    };

    const getBackgroundStyle = () => {
        const { type, value, overlay } = config.background;

        if (type === 'texture' && value === 'noise') {
            return {
                backgroundImage: `
                    ${overlay ? `linear-gradient(${overlay}, ${overlay}),` : ''}
                    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")
                `,
                backgroundColor: '#1a1a1a'
            };
        }

        if (type === 'image') {
            return {
                backgroundImage: `
                    ${overlay ? `linear-gradient(${overlay}, ${overlay}),` : ''}
                    url(${value.includes('http') ? value : 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'})
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            };
        }

        return { background: value };
    };

    const WaveSeparator = ({ color, position }: { color: string, position: 'top' | 'bottom' }) => (
        <div
            style={{
                position: 'absolute',
                [position]: 0,
                left: 0,
                width: '100%',
                height: '40px',
                zIndex: 1,
                transform: position === 'bottom' ? 'rotate(180deg)' : 'none'
            }}
        >
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <path fill={color} fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
            </svg>
        </div>
    );

    return (
        <div className="landing-preview-container">
            <div className="section-header">
                <Smartphone className="section-icon text-primary" />
                <h2>Vista previa de tu Landing</h2>
                <p className="text-muted">Así se verá en el móvil de tus clientes</p>
            </div>

            <div className="phone-frame">
                <div className="phone-notch" />

                <div className="landing-content" style={{ ...getBackgroundStyle(), fontFamily: config.font }}>

                    {/* Top Separator */}
                    {config.separators?.top === 'wave' && (
                        <WaveSeparator color="#ffffff" position="top" />
                    )}

                    {/* Header */}
                    <div className="landing-header" style={{
                        textAlign: config.header.layout === 'centered' ? 'center' : 'left',
                        paddingTop: config.separators?.top !== 'none' ? '60px' : '40px',
                        position: 'relative',
                        zIndex: 2
                    }}>
                        <div className="landing-logo" style={{
                            margin: config.header.layout === 'centered' ? '0 auto 1rem' : '0 0 1rem 0'
                        }}>
                            <span className="logo-initial" style={{
                                borderColor: brandData.colors.accent,
                                width: `${config.header.logoSize}px`,
                                height: `${config.header.logoSize}px`,
                                fontSize: `${config.header.logoSize * 0.4}px`
                            }}>
                                {brandData.name.charAt(0)}
                            </span>
                        </div>
                        <h1 className="landing-title" style={{ color: config.header.titleColor }}>
                            {brandData.name}
                        </h1>
                        <p className="landing-subtitle" style={{ color: config.header.subtitleColor }}>
                            {brandData.businessType}
                        </p>
                    </div>

                    {/* Links */}
                    <div className="landing-links" style={{ position: 'relative', zIndex: 2 }}>
                        {links.map((link, index) => (
                            <a
                                key={link.id}
                                href={link.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`landing-link-card btn-${config.buttons.style}`}
                                style={{
                                    background: config.buttons.background,
                                    color: config.buttons.textColor,
                                    border: config.buttons.border || 'none',
                                    boxShadow: config.buttons.shadow || 'none',
                                    animationDelay: `${index * 0.1}s`,
                                    backdropFilter: config.buttons.style === 'glass' ? 'blur(10px)' : 'none',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                onClick={(e) => {
                                    if (!link.url || link.url === '#') {
                                        e.preventDefault();
                                        alert('Este enlace aún no tiene una URL asignada');
                                    }
                                }}
                            >
                                <span className="link-emoji">{link.emoji}</span>
                                <div className="link-text">
                                    <span className="link-name">{link.name}</span>
                                    {config.buttons.style !== 'pill' && (
                                        <span className="link-desc" style={{
                                            color: config.buttons.textColor,
                                            opacity: 0.8
                                        }}>
                                            {link.description.slice(0, 50)}...
                                        </span>
                                    )}
                                </div>
                                <ExternalLink size={16} style={{ color: config.buttons.textColor }} />
                            </a>
                        ))}
                    </div>

                    {/* Bottom Separator */}
                    {config.separators?.bottom === 'wave' && (
                        <WaveSeparator color="#ffffff" position="bottom" />
                    )}

                    {/* Footer */}
                    <div className="landing-footer" style={{
                        position: 'relative',
                        zIndex: 2,
                        color: config.header.subtitleColor
                    }}>
                        <p>Powered by Foto Fachada</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
