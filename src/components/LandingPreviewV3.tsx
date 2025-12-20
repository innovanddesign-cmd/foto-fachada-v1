import { Smartphone, ExternalLink, RefreshCw, SmartphoneCharging } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import './LandingPreviewV3.css';

export function LandingPreviewV3() {
    const { brandData, links, landingConfig } = useAppStore();

    if (!brandData) return null;

    // Use config or defaults
    const config = landingConfig || {
        background: { type: 'gradient', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
        header: { logoSize: 80, titleColor: '#ffffff', subtitleColor: '#94a3b8', layout: 'centered' },
        buttons: { style: 'glass', background: 'rgba(255,255,255,0.1)', textColor: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' },
        separators: { top: 'none', bottom: 'none', color: 'transparent' },
        font: 'Inter, sans-serif'
    };

    const getBackgroundStyle = () => {
        const { type, value, overlay } = config.background;

        if (type === 'texture') {
            return {
                backgroundImage: `
                    ${overlay ? `linear-gradient(${overlay}, ${overlay}),` : ''}
                    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E"), 
                    linear-gradient(to bottom, #111, #222)
                `,
                backgroundSize: 'cover'
            };
        }

        if (type === 'image') {
            return {
                backgroundImage: `
                    ${overlay ? `linear-gradient(${overlay}, ${overlay}),` : ''}
                    url(${value.includes('http') ? value : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'})
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            };
        }

        return { background: value };
    };

    const WaveSeparator = ({ color, position }: { color: string, position: 'top' | 'bottom' }) => (
        <div
            className={`wave-separator ${position}`}
            style={{
                color: color,
                transform: position === 'bottom' ? 'rotate(180deg)' : 'none'
            }}
        >
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
            </svg>
        </div>
    );

    return (
        <div className="landing-preview-v3-container animate-fade-in-up">
            <div className="preview-header-v3">
                <div className="icon-badge">
                    <Smartphone size={20} className="text-white" />
                </div>
                <div>
                    <h2 className="preview-title-v3">Vista Previa</h2>
                    <p className="preview-subtitle-v3">Previsualización en tiempo real</p>
                </div>
                <button className="refresh-btn" title="Recargar vista">
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="phone-mockup-v3">
                <div className="phone-case">
                    <div className="phone-buttons-right" />
                    <div className="phone-buttons-left" />
                    <div className="phone-camera-island">
                        <div className="camera-lens" />
                    </div>

                    <div className="phone-screen">
                        {/* Status Bar */}
                        <div className="status-bar">
                            <span className="time">9:41</span>
                            <div className="status-icons">
                                <SmartphoneCharging size={14} />
                            </div>
                        </div>

                        {/* Landing Content */}
                        <div className="landing-content-v3" style={{ ...getBackgroundStyle(), fontFamily: config.font }}>

                            {/* Top Separator */}
                            {config.separators?.top === 'wave' && (
                                <WaveSeparator color={config.separators.color || '#ffffff'} position="top" />
                            )}

                            {/* Header Section */}
                            <div className="landing-header-v3" style={{
                                textAlign: config.header.layout === 'centered' ? 'center' : 'left',
                                paddingTop: config.separators?.top !== 'none' ? '60px' : '30px'
                            }}>
                                <div className="landing-logo-v3 hover-float" style={{
                                    margin: config.header.layout === 'centered' ? '0 auto 1rem' : '0 0 1rem 0',
                                    width: `${config.header.logoSize}px`,
                                    height: `${config.header.logoSize}px`,
                                    fontSize: `${config.header.logoSize * 0.4}px`,
                                    borderColor: brandData.colors.accent,
                                    boxShadow: `0 0 20px ${brandData.colors.accent}40`
                                }}>
                                    {brandData.name.charAt(0)}
                                </div>
                                <h1 className="landing-business-name" style={{ color: config.header.titleColor }}>
                                    {brandData.name}
                                </h1>
                                <p className="landing-business-type" style={{ color: config.header.subtitleColor }}>
                                    {brandData.businessType}
                                </p>
                            </div>

                            {/* Links Section */}
                            <div className="landing-links-v3">
                                {links.map((link, index) => (
                                    <div
                                        key={link.id}
                                        className={`landing-link-btn btn-${config.buttons.style}`}
                                        style={{
                                            background: config.buttons.background,
                                            color: config.buttons.textColor,
                                            border: config.buttons.border || 'none',
                                            boxShadow: config.buttons.shadow || 'none',
                                            animationDelay: `${index * 0.1}s`
                                        }}
                                    >
                                        <div className="link-icon-circle">{link.emoji}</div>
                                        <div className="link-content-text">
                                            <span className="link-label">{link.name}</span>
                                            {config.buttons.style !== 'pill' && (
                                                <span className="link-sublabel" style={{ color: config.buttons.textColor, opacity: 0.7 }}>
                                                    {link.description.slice(0, 40)}...
                                                </span>
                                            )}
                                        </div>
                                        <ExternalLink size={16} className="link-arrow" />
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Separator */}
                            {config.separators?.bottom === 'wave' && (
                                <WaveSeparator color={config.separators.color || '#ffffff'} position="bottom" />
                            )}

                            {/* Footer */}
                            <div className="landing-footer-v3">
                                <p style={{ color: config.header.subtitleColor, opacity: 0.7 }}>Powered by FotoFachada</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
