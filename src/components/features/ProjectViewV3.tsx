import { useState } from 'react';
import {
    Plus,
    ArrowLeft,
    ExternalLink,
    Copy,
    QrCode,
    Trash2,
    MoreHorizontal,
    Calendar,
    Eye,
    LayoutGrid,
    Sparkles,
    BarChart3
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import type { Project, LandingConfig } from '../../types';
import './ProjectViewV3.css';

interface ProjectViewV3Props {
    project: Project;
    onBack: () => void;
    onCreateLanding: () => void;
}

// Imports updated above
import { StrategiesTab } from './strategies/StrategiesTab';
import { downloadPrintPoster } from '../../services/pdfPosterGenerator';

export function ProjectViewV3({ project, onBack, onCreateLanding }: ProjectViewV3Props) {
    const { userTier } = useAppStore();
    const { addToast } = useToast();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'landings' | 'strategies' | 'posters'>('landings');
    const [generatingPosterId, setGeneratingPosterId] = useState<string | null>(null);

    const maxLandings = userTier === 'free' ? 1 : userTier === 'plus' ? 3 : userTier === 'pro' ? 10 : -1;
    const canCreateMore = maxLandings === -1 || project.landings.length < maxLandings;

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleCopyLink = (landing: LandingConfig) => {
        const url = `${window.location.origin}/p/${landing.id}`;
        navigator.clipboard.writeText(url);
        addToast('Enlace copiado al portapapeles', 'success');
        setActiveMenu(null);
    };

    const handleDownloadQR = async (landing: LandingConfig) => {
        setGeneratingPosterId(landing.id);
        setActiveMenu(null);
        try {
            await downloadPrintPoster({
                businessName: landing.name,
                businessType: landing.brand.businessType,
                tagline: 'Escanea para ver más', // TODO: Get from strategy
                landingUrl: `${window.location.origin}/p/${landing.id}`,
                primaryColor: landing.brand.colors.primary,
                phone: landing.brand.whatsapp || '',
                address: landing.brand.address || ''
            });
            addToast('Cartel descargado correctamente', 'success');
        } catch (error) {
            console.error('Error downloading poster:', error);
            addToast('Error generando cartel', 'error');
        } finally {
            setGeneratingPosterId(null);
        }
    };

    // Calculate dynamic stats
    const primaryColor = project.landings[0]?.brand?.colors?.primary || 'var(--primary-500)';

    return (
        <div className="project-view-v3 animate-fadeIn">
            {/* Header / Nav */}
            <div className="project-nav-v3">
                <button onClick={onBack} className="back-btn-v3">
                    <ArrowLeft size={18} />
                    <span>Volver al Dashboard</span>
                </button>
            </div>

            {/* Project Hero */}
            <div className="project-hero-v3 glass-panel relative overflow-hidden">
                <div
                    className="hero-glow-bg"
                    style={{ background: `radial-gradient(circle at top right, ${primaryColor}40, transparent 70%)` }}
                />

                <div className="project-hero-content relative z-10">
                    <div className="project-avatar-v3">
                        {project.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="project-title-v3">{project.name}</h1>
                            {project.campaign && (
                                <Badge variant="warning" className="glass-badge">
                                    <Sparkles size={12} className="mr-1" />
                                    {project.campaign}
                                </Badge>
                            )}
                        </div>
                        <p className="project-desc-v3">
                            {project.description || 'Sin descripción'}
                        </p>

                        <div className="project-meta-v3">
                            <div className="meta-item-v3">
                                <Calendar size={14} />
                                Creado el {formatDate(project.createdAt)}
                            </div>
                            <div className="meta-item-v3">
                                <LayoutGrid size={14} />
                                {project.landings.length} Landings
                            </div>
                        </div>
                    </div>

                    <div className="project-actions-v3">
                        <div className="project-tabs-v3">
                            <button
                                className={`tab-btn-v3 ${activeTab === 'landings' ? 'active' : ''}`}
                                onClick={() => setActiveTab('landings')}
                            >
                                Landings
                            </button>
                            <button
                                className={`tab-btn-v3 ${activeTab === 'strategies' ? 'active' : ''}`}
                                onClick={() => setActiveTab('strategies')}
                            >
                                Estrategias
                            </button>
                            <button
                                className={`tab-btn-v3 ${activeTab === 'posters' ? 'active' : ''}`}
                                onClick={() => setActiveTab('posters')}
                            >
                                Carteles
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABS CONTENT */}

            {/* LANDINGS TAB */}
            {activeTab === 'landings' && (
                <div className="landings-section-v3 animate-in fade-in slide-in-from-bottom-4">
                    <div className="section-title-v3">
                        <h2>Landing Pages</h2>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onCreateLanding}
                            disabled={!canCreateMore}
                            leftIcon={<Plus size={16} />}
                        >
                            Nueva Landing
                        </Button>
                    </div>

                    {project.landings.length > 0 ? (
                        <div className="landings-grid-v3">
                            {project.landings.map((landing) => (
                                <div key={landing.id} className="landing-card-v3 glass-panel">
                                    {/* Preview Top */}
                                    <div
                                        className="landing-card-preview"
                                        style={{
                                            background: `linear-gradient(135deg, ${landing.brand.colors.primary}20, ${landing.brand.colors.secondary}20)`
                                        }}
                                    >
                                        <div className="mini-phone-mockup">
                                            <div
                                                className="mini-screen"
                                                style={{
                                                    background: `linear-gradient(to bottom, ${landing.brand.colors.primary}, ${landing.brand.colors.secondary})`
                                                }}
                                            />
                                        </div>

                                        <div className="card-actions-overlay">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="glass-btn-sm"
                                                onClick={() => window.open(`/p/${landing.id}`, '_blank')}
                                            >
                                                <ExternalLink size={14} className="mr-2" />
                                                Ver
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="landing-card-content">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="landing-name-v3">{landing.name}</h3>
                                                <span className="landing-type-v3">{landing.brand.businessType}</span>
                                            </div>
                                            <button
                                                className="menu-trigger-v3"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenu(activeMenu === landing.id ? null : landing.id);
                                                }}
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>

                                        {/* Context Menu */}
                                        {activeMenu === landing.id && (
                                            <div className="context-menu-v3 animate-in fade-in zoom-in-95">
                                                <button onClick={() => handleCopyLink(landing)}>
                                                    <Copy size={14} /> Copiar enlace
                                                </button>
                                                <button onClick={() => handleDownloadQR(landing)}>
                                                    {generatingPosterId === landing.id ? (
                                                        <span className="animate-pulse">Generando...</span>
                                                    ) : (
                                                        <>
                                                            <QrCode size={14} /> Descargar QR
                                                        </>
                                                    )}
                                                </button>
                                                <div className="menu-divider" />
                                                <button className="danger">
                                                    <Trash2 size={14} /> Eliminar
                                                </button>
                                            </div>
                                        )}

                                        <div className="landing-card-footer">
                                            <div className="footer-stat">
                                                <Eye size={14} /> 0
                                            </div>
                                            <div className="footer-stat">
                                                <BarChart3 size={14} /> 0%
                                            </div>
                                            <div className="footer-date">
                                                {formatDate(landing.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-v3 glass-panel">
                            <div className="empty-icon-v3">
                                <LayoutGrid size={48} />
                            </div>
                            <h3>No hay landings creadas</h3>
                            <p>Comienza creando tu primera landing page para este proyecto</p>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={onCreateLanding}
                                leftIcon={<Plus size={20} />}
                            >
                                Crear Landing
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* STRATEGIES TAB */}
            {activeTab === 'strategies' && (
                <div className="strategies-section-v3 animate-in fade-in slide-in-from-bottom-4">
                    {project.landings.length > 0 ? (
                        <div className="max-w-6xl mx-auto">
                            <StrategiesTab brandData={project.landings[0].brand} />
                        </div>
                    ) : (
                        <div className="empty-state-v3 glass-panel">
                            <div className="empty-icon-v3">
                                <Sparkles size={48} />
                            </div>
                            <h3>No hay datos de marca suficientes</h3>
                            <p>Crea tu primera landing para generar estrategias de marketing personalizadas</p>
                            <Button
                                variant="primary"
                                onClick={onCreateLanding}
                            >
                                Configurar Marca
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* POSTERS TAB */}
            {activeTab === 'posters' && (
                <div className="posters-section-v3 animate-in fade-in slide-in-from-bottom-4">
                    <div className="section-title-v3">
                        <h2>Carteles Promocionales</h2>
                        <p className="text-gray-400 text-sm">Carteles A4 listos para imprimir con QR integrado</p>
                    </div>

                    {project.landings.length > 0 ? (
                        <div className="landings-grid-v3">
                            {project.landings.map((landing) => (
                                <div key={landing.id} className="landing-card-v3 glass-panel">
                                    <div className="h-48 bg-gradient-to-br from-gray-900 to-gray-800 relative flex items-center justify-center p-6 overflow-hidden">
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://source.unsplash.com/random/800x600/?texture')]" />
                                        <div className="bg-white p-3 rounded shadow-xl transform rotate-[-2deg] scale-90">
                                            <QrCode size={48} color={landing.brand.colors.primary} />
                                        </div>
                                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs font-mono text-white/80 border border-white/10">
                                            A4 • 300 DPI
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-bold text-white mb-1">{landing.name}</h3>
                                        <p className="text-xs text-gray-400 mb-4">{landing.brand.businessType}</p>
                                        <Button
                                            variant="secondary"
                                            fullWidth
                                            className="glass-btn-sm"
                                            onClick={() => handleDownloadQR(landing)}
                                            disabled={generatingPosterId === landing.id}
                                        >
                                            {generatingPosterId === landing.id ? (
                                                <span className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-primary-500 rounded-full animate-spin border-t-transparent" /> Generando...</span>
                                            ) : (
                                                <>
                                                    <QrCode size={16} className="mr-2" />
                                                    Descargar Cartel PDF
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-v3 glass-panel">
                            <div className="empty-icon-v3">
                                <QrCode size={48} />
                            </div>
                            <h3>No hay carteles disponibles</h3>
                            <p>Los carteles se generan automáticamente a partir de tus landings</p>
                        </div>
                    )}
                </div>
            )}

            {/* Pro Analytics Banner */}
            {(userTier === 'free' || userTier === 'plus') && activeTab === 'landings' && (
                <div className="pro-banner-v3 glass-panel mt-6">
                    <div className="glow-effect" />
                    <div className="banner-content relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="banner-icon">
                                <BarChart3 size={24} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Analytics Avanzados</h4>
                                <p className="text-sm text-gray-400">Obtén métricas detalladas con el plan Pro</p>
                            </div>
                        </div>
                        <Button variant="secondary" className="glass-btn">
                            Ver características
                        </Button>
                    </div>
                </div>
            )}

            <style>{`
                .project-tabs-v3 {
                    display: flex;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 999px;
                    padding: 4px;
                    gap: 4px;
                }
                .tab-btn-v3 {
                    padding: 8px 16px;
                    border-radius: 999px;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                }
                .tab-btn-v3.active {
                    background: var(--primary-500);
                    color: white;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                .tab-btn-v3:hover:not(.active) {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
            `}</style>
        </div>
    );
}
