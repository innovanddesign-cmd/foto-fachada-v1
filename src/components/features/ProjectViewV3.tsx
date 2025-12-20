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

export function ProjectViewV3({ project, onBack, onCreateLanding }: ProjectViewV3Props) {
    const { userTier } = useAppStore();
    const { addToast } = useToast();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

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

    const handleDownloadQR = (landing: LandingConfig) => {
        addToast(`Descargando QR de ${landing.name}...`, 'info');
        setActiveMenu(null);
    };

    // Calculate dynamic stats
    const totalLinks = project.landings.reduce((acc, landing) => acc + landing.links.length, 0);
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
                        <Button
                            variant="primary"
                            className="create-btn-v3"
                            onClick={onCreateLanding}
                            disabled={!canCreateMore}
                            leftIcon={<Plus size={18} />}
                        >
                            Nueva Landing
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="project-stats-grid-v3">
                    <div className="stat-card-v3">
                        <div className="stat-label-v3">Total Landings</div>
                        <div className="stat-value-v3">{project.landings.length}</div>
                        <div className="stat-trend-v3 positive">Activo</div>
                    </div>
                    <div className="stat-card-v3">
                        <div className="stat-label-v3">Enlaces Totales</div>
                        <div className="stat-value-v3">{totalLinks}</div>
                        <div className="stat-trend-v3 neutral">Configurados</div>
                    </div>
                    <div className="stat-card-v3">
                        <div className="stat-label-v3">Conversiones</div>
                        <div className="stat-value-v3">0%</div>
                        <div className="stat-trend-v3 text-muted">Sin datos</div>
                    </div>
                </div>
            </div>

            {/* Landings Grid */}
            <div className="landings-section-v3">
                <div className="section-title-v3">
                    <h2>Landing Pages</h2>
                    <div className="flex items-center gap-2">
                        {maxLandings !== -1 && (
                            <span className="limit-badge-v3">
                                {project.landings.length} / {maxLandings}
                            </span>
                        )}
                    </div>
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
                                                <QrCode size={14} /> Descargar QR
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

                        {/* Create Skeleton Card */}
                        {canCreateMore && (
                            <button className="create-card-v3" onClick={onCreateLanding}>
                                <div className="create-icon-circle">
                                    <Plus size={32} />
                                </div>
                                <span>Crear Nueva Landing</span>
                            </button>
                        )}
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

            {/* Pro Analytics Banner */}
            {(userTier === 'free' || userTier === 'plus') && (
                <div className="pro-banner-v3 glass-panel">
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
        </div>
    );
}
