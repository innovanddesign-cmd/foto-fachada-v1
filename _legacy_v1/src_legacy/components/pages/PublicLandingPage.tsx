import { useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import '../LandingPreviewV3.css'; // Reuse V3 styles

export function PublicLandingPage() {
    const { id } = useParams<{ id: string }>();
    const { projects } = useAppStore();

    // Find the landing in all projects
    // In a real DB scenario, we would fetchByLandingId(id)
    let landing = null;

    for (const project of projects) {
        const found = project.landings.find(l => l.id === id);
        if (found) {
            landing = found;
            break;
        }
    }

    if (!landing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-gray-400">Landing Page no encontrada</p>
                </div>
            </div>
        );
    }

    const { brand, links, config } = landing;

    // Default config if missing
    const safeConfig = config || {
        background: { type: 'gradient', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
        header: { logoSize: 80, titleColor: '#ffffff', subtitleColor: '#94a3b8', layout: 'centered' },
        buttons: { style: 'glass', background: 'rgba(255,255,255,0.1)', textColor: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' },
        separators: { top: 'none', bottom: 'none', color: 'transparent' },
        font: 'Inter, sans-serif'
    };

    const getBackgroundStyle = () => {
        const { type, value, overlay } = safeConfig.background;

        if (type === 'texture') {
            return {
                backgroundImage: `
                    ${overlay ? `linear-gradient(${overlay}, ${overlay}),` : ''}
                    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E"), 
                    linear-gradient(to bottom, #111, #222)
                `,
                backgroundSize: 'cover',
                minHeight: '100vh'
            };
        }

        if (type === 'image') {
            return {
                backgroundImage: `
                    ${overlay ? `linear-gradient(${overlay}, ${overlay}),` : ''}
                    url(${value.includes('http') ? value : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'})
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh'
            };
        }

        return { background: value, minHeight: '100vh' };
    };

    const WaveSeparator = ({ color, position }: { color: string, position: 'top' | 'bottom' }) => (
        <div
            className={`wave-separator ${position}`}
            style={{
                color: color,
                transform: position === 'bottom' ? 'rotate(180deg)' : 'none',
                position: 'absolute',
                width: '100%',
                left: 0,
                [position]: 0,
                zIndex: 10
            }}
        >
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '100px' }}>
                <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
            </svg>
        </div>
    );

    return (
        <div className="public-landing-page min-h-screen w-full relative overflow-x-hidden" style={{ ...getBackgroundStyle(), fontFamily: safeConfig.font }}>

            {/* Top Separator */}
            {safeConfig.separators?.top === 'wave' && (
                <WaveSeparator color={safeConfig.separators.color || '#ffffff'} position="top" />
            )}

            {/* Container */}
            <div className="max-w-md mx-auto px-6 py-12 relative z-20 min-h-screen flex flex-col">

                {/* Header Section */}
                <div className="landing-header-v3 mb-10" style={{
                    textAlign: safeConfig.header.layout === 'centered' ? 'center' : 'left',
                    paddingTop: safeConfig.separators?.top !== 'none' ? '60px' : '30px'
                }}>
                    <div className="landing-logo-v3 hover-float" style={{
                        margin: safeConfig.header.layout === 'centered' ? '0 auto 1rem' : '0 0 1rem 0',
                        width: `${safeConfig.header.logoSize}px`,
                        height: `${safeConfig.header.logoSize}px`,
                        fontSize: `${safeConfig.header.logoSize * 0.4}px`,
                        borderColor: brand.colors.accent,
                        boxShadow: `0 0 20px ${brand.colors.accent}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid'
                    }}>
                        {brand.name.charAt(0)}
                    </div>
                    <h1 className="text-3xl font-bold mb-2 leading-tight" style={{ color: safeConfig.header.titleColor }}>
                        {brand.name}
                    </h1>
                    <p className="text-lg opacity-90" style={{ color: safeConfig.header.subtitleColor }}>
                        {brand.businessType}
                    </p>
                </div>

                {/* Links Section */}
                <div className="flex-1 flex flex-col gap-4">
                    {links.map((link, index) => (
                        <a
                            key={link.id}
                            href="#" // In real app this would be link.url or similar
                            onClick={(e) => e.preventDefault()} // Demo only
                            className={`landing-link-btn btn-${safeConfig.buttons.style} group`}
                            style={{
                                background: safeConfig.buttons.background,
                                color: safeConfig.buttons.textColor,
                                border: safeConfig.buttons.border || 'none',
                                boxShadow: safeConfig.buttons.shadow || 'none',
                                animationDelay: `${index * 0.1}s`,
                                padding: '1.25rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                borderRadius: safeConfig.buttons.style === 'pill' ? '9999px' : '1rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                textDecoration: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <div className="text-2xl">{link.emoji}</div>
                            <div className="flex-1 min-w-0">
                                <span className="font-semibold text-lg block">{link.name}</span>
                                {safeConfig.buttons.style !== 'pill' && (
                                    <span className="text-sm opacity-80 block truncate mt-0.5" style={{ color: safeConfig.buttons.textColor }}>
                                        {link.description}
                                    </span>
                                )}
                            </div>
                            <ExternalLink size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm pb-6">
                    <p style={{ color: safeConfig.header.subtitleColor, opacity: 0.6 }}>
                        Powered by <span className="font-bold">FotoFachada</span>
                    </p>
                </div>
            </div>

            {/* Bottom Separator */}
            {safeConfig.separators?.bottom === 'wave' && (
                <WaveSeparator color={safeConfig.separators.color || '#ffffff'} position="bottom" />
            )}
        </div>
    );
}
