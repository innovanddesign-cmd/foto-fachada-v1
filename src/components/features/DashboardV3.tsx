import { useState, useEffect } from 'react';
import {
    Plus,
    FolderOpen,
    MoreHorizontal,
    Edit3,
    Trash2,
    Calendar,
    Search,
    LayoutGrid,
    List,
    ArrowUpRight,
    Eye,
    QrCode,
    MousePointerClick,
    Rocket
} from 'lucide-react';

import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Tooltip } from '../ui/Tooltip';
import { EmptyState } from '../ui/EmptyState';
import { deleteCampaign, getDashboardMetrics } from '../../services/campaignService';
import type { Project } from '../../types';
import './DashboardV3.css';

interface DashboardV3Props {
    onCreateNew: () => void;
    onOpenProject: (project: Project) => void;
    onViewLanding?: (project: Project) => void;
    onDownloadPoster?: (project: Project) => void;
}

interface DashboardMetrics {
    totalVisits: number;
    totalScans: number;
    totalClicks: number;
    activeCampaigns: number;
}

export function DashboardV3({ onCreateNew, onOpenProject, onViewLanding, onDownloadPoster }: DashboardV3Props) {
    const { projects, userTier, setProjects } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Delete confirmation
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Metrics
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalVisits: 0,
        totalScans: 0,
        totalClicks: 0,
        activeCampaigns: 0
    });

    const maxProjects = userTier === 'free' ? 1 : userTier === 'plus' ? 5 : userTier === 'pro' ? 20 : -1;
    const canCreateMore = maxProjects === -1 || projects.length < maxProjects;

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.campaign?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Load metrics on mount
    useEffect(() => {
        getDashboardMetrics().then(setMetrics);
    }, [projects]);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Handle delete
    const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation();
        setProjectToDelete(project);
        setDeleteModalOpen(true);
        setActiveMenu(null);
    };

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;

        setIsDeleting(true);

        // Optimistic UI update
        const updatedProjects = projects.filter(p => p.id !== projectToDelete.id);
        setProjects(updatedProjects);

        try {
            await deleteCampaign(projectToDelete.id);
        } catch (error) {
            // Revert on error
            setProjects(projects);
            console.error('Delete failed:', error);
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setProjectToDelete(null);
        }
    };

    // Stats
    const hasData = metrics.totalVisits > 0 || metrics.totalScans > 0;

    // Empty state for no projects at all
    if (projects.length === 0 && !searchQuery) {
        return (
            <div className="dashboard-v3">
                <EmptyState
                    icon={<Rocket size={48} />}
                    title="¡Bienvenido a Foto Fachada!"
                    description="Crea tu primera campaña de marketing y empieza a atraer clientes con landings y carteles profesionales."
                    actionLabel="Crear mi primera campaña"
                    onAction={onCreateNew}
                />
            </div>
        );
    }

    return (
        <div className="dashboard-v3">
            {/* V3 Header Section */}
            <div className="dashboard-v3-header">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Panel de Control</h1>
                    <p className="description-v3">Gestiona tus proyectos y campañas de marketing</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="primary"
                        onClick={onCreateNew}
                        disabled={!canCreateMore}
                        leftIcon={<Plus size={18} />}
                        className="btn-glow"
                    >
                        Nuevo proyecto
                    </Button>
                </div>
            </div>

            {/* Stats Cards - Glass Effect with Tooltips */}
            <div className="stats-grid-v3">
                <Tooltip content="Número de proyectos activos en tu cuenta">
                    <div className="glass-stat-card">
                        <div className="stat-icon-wrapper blue">
                            <FolderOpen size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value-v3">{projects.length}</span>
                            <span className="stat-label-v3">Proyectos Activos</span>
                        </div>
                        <div className="stat-chart-mini">
                            <div className="bar" style={{ height: '30%' }}></div>
                            <div className="bar" style={{ height: '50%' }}></div>
                            <div className="bar" style={{ height: '80%' }}></div>
                        </div>
                    </div>
                </Tooltip>

                <Tooltip content="Escaneos de QR en carteles físicos">
                    <div className="glass-stat-card">
                        <div className="stat-icon-wrapper purple">
                            <QrCode size={24} />
                        </div>
                        <div className="stat-info">
                            {hasData ? (
                                <span className="stat-value-v3">{metrics.totalScans}</span>
                            ) : (
                                <span className="stat-value-v3 text-gray-500">—</span>
                            )}
                            <span className="stat-label-v3">Escaneos QR</span>
                        </div>
                        {!hasData && (
                            <span className="stat-waiting">Esperando primer escaneo</span>
                        )}
                    </div>
                </Tooltip>

                <Tooltip content="Visitas totales a tus landings">
                    <div className="glass-stat-card">
                        <div className="stat-icon-wrapper green">
                            <Eye size={24} />
                        </div>
                        <div className="stat-info">
                            {hasData ? (
                                <>
                                    <span className="stat-value-v3">{metrics.totalVisits}</span>
                                    <Badge variant="success" size="sm" className="ml-2">+12%</Badge>
                                </>
                            ) : (
                                <span className="stat-value-v3 text-gray-500">0</span>
                            )}
                            <span className="stat-label-v3">Visitas Totales</span>
                        </div>
                    </div>
                </Tooltip>

                <Tooltip content="Clicks en botones de tus landings">
                    <div className="glass-stat-card">
                        <div className="stat-icon-wrapper amber">
                            <MousePointerClick size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value-v3">{hasData ? metrics.totalClicks : 0}</span>
                            <span className="stat-label-v3">Clicks Totales</span>
                        </div>
                    </div>
                </Tooltip>
            </div>

            {/* Toolbar V3 */}
            <div className="toolbar-v3 glass-panel">
                <div className="search-wrapper-v3">
                    <Search size={18} className="search-icon-v3" />
                    <input
                        type="text"
                        placeholder="Buscar proyectos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input-v3"
                    />
                </div>

                <div className="view-toggle-v3">
                    <button
                        className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Projects Grid V3 */}
            {filteredProjects.length > 0 ? (
                <div className={`projects-grid-v3 ${viewMode === 'list' ? 'list-view' : ''}`}>
                    {filteredProjects.map(project => (
                        <div key={project.id} className="project-card-v3 glass-panel spotlight-card" onClick={() => onOpenProject(project)}>
                            <div className="project-card-image header-gradient-blue">
                                <div className="project-avatar-v3">
                                    {project.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="project-menu-trigger-v3" onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenu(activeMenu === project.id ? null : project.id);
                                }}>
                                    <MoreHorizontal size={18} />
                                </div>

                                {activeMenu === project.id && (
                                    <div className="menu-dropdown-v3">
                                        <button className="menu-item-v3" onClick={(e) => {
                                            e.stopPropagation();
                                            onOpenProject(project);
                                        }}>
                                            <Edit3 size={14} /> Editar
                                        </button>
                                        {onViewLanding && (
                                            <button className="menu-item-v3" onClick={(e) => {
                                                e.stopPropagation();
                                                onViewLanding(project);
                                            }}>
                                                <Eye size={14} /> Ver Landing
                                            </button>
                                        )}
                                        {onDownloadPoster && (
                                            <button className="menu-item-v3" onClick={(e) => {
                                                e.stopPropagation();
                                                onDownloadPoster(project);
                                            }}>
                                                <QrCode size={14} /> Descargar Cartel
                                            </button>
                                        )}
                                        <button className="menu-item-v3 text-red-500" onClick={(e) => handleDeleteClick(e, project)}>
                                            <Trash2 size={14} /> Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="project-card-content">
                                <h3 className="project-name-v3">{project.name}</h3>
                                {project.campaign && (
                                    <Badge variant="neutral" size="sm" className="campaign-badge">
                                        {project.campaign}
                                    </Badge>
                                )}
                                <div className="project-stats-row">
                                    <div className="stat-pill">
                                        <LayoutGrid size={12} />
                                        <span>{project.landings.length} Landings</span>
                                    </div>
                                    <div className="stat-pill">
                                        <Calendar size={12} />
                                        <span>{formatDate(project.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="project-card-footer">
                                <span className="open-text">Abrir proyecto</span>
                                <ArrowUpRight size={16} />
                            </div>
                        </div>
                    ))}

                    {canCreateMore && (
                        <button className="create-card-v3" onClick={onCreateNew}>
                            <div className="create-icon-wrapper">
                                <Plus size={32} />
                            </div>
                            <span>Crear Nuevo Proyecto</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="empty-state-v3">
                    <div className="empty-icon-glow">
                        <FolderOpen size={64} />
                    </div>
                    <h2 className="text-xl font-bold mb-2">No se encontraron proyectos</h2>
                    <p className="description-v3 mb-6">Prueba con otra búsqueda o crea un nuevo proyecto</p>
                    {canCreateMore && (
                        <Button variant="primary" onClick={onCreateNew} leftIcon={<Plus size={18} />}>
                            Crear Proyecto
                        </Button>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="¿Eliminar proyecto?"
                message={`Esta acción eliminará permanentemente "${projectToDelete?.name}" y todos sus datos asociados. Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isDeleting}
            />

            <style>{`
                .stat-waiting {
                    font-size: 0.65rem;
                    color: var(--text-secondary);
                    opacity: 0.6;
                    text-align: center;
                }
                .stat-icon-wrapper.amber {
                    background: rgba(245, 158, 11, 0.15);
                    color: #f59e0b;
                }
            `}</style>
        </div>
    );
}

