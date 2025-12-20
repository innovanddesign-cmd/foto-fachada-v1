import { useState } from 'react';
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
    Sparkles,
    Zap,
    TrendingUp
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Project } from '../../types';
import './DashboardV3.css';

interface DashboardV3Props {
    onCreateNew: () => void;
    onOpenProject: (project: Project) => void;
}

export function DashboardV3({ onCreateNew, onOpenProject }: DashboardV3Props) {
    const { projects, userTier } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const maxProjects = userTier === 'free' ? 1 : userTier === 'plus' ? 5 : userTier === 'pro' ? 20 : -1;
    const canCreateMore = maxProjects === -1 || projects.length < maxProjects;

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.campaign?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Stats
    const totalLandings = projects.reduce((acc, p) => acc + p.landings.length, 0);

    return (
        <div className="dashboard-v3">
            {/* V3 Header Section */}
            <div className="dashboard-v3-header">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Panel de Control</h1>
                    <p className="text-gray-400">Gestiona tus proyectos y campañas de marketing</p>
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

            {/* Stats Cards - Glass Effect */}
            <div className="stats-grid-v3">
                <div className="glass-stat-card">
                    <div className="stat-icon-wrapper blue">
                        <FolderOpen size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value-v3">{projects.length}</span>
                        <span className="stat-label-v3">Proyectos Activos</span>
                    </div>
                    <div className="stat-chart-mini">
                        {/* CSS-only mini chart */}
                        <div className="bar" style={{ height: '30%' }}></div>
                        <div className="bar" style={{ height: '50%' }}></div>
                        <div className="bar" style={{ height: '80%' }}></div>
                    </div>
                </div>

                <div className="glass-stat-card">
                    <div className="stat-icon-wrapper purple">
                        <Zap size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value-v3">{totalLandings}</span>
                        <span className="stat-label-v3">Landings Generadas</span>
                    </div>
                    <div className="stat-chart-mini">
                        <div className="bar" style={{ height: '40%' }}></div>
                        <div className="bar" style={{ height: '90%' }}></div>
                        <div className="bar" style={{ height: '60%' }}></div>
                    </div>
                </div>

                <div className="glass-stat-card">
                    <div className="stat-icon-wrapper green">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value-v3">1.2k</span>
                        <span className="stat-label-v3">Visitas Totales</span>
                    </div>
                    <Badge variant="success" size="sm" className="ml-auto">+12%</Badge>
                </div>

                <div className="glass-stat-card plan-card">
                    <div className="stat-info">
                        <span className="stat-label-v3">Plan Actual</span>
                        <span className="stat-value-v3 text-gradient">{userTier.toUpperCase()}</span>
                    </div>
                    {userTier === 'free' && (
                        <Button variant="ghost" size="sm" className="upgrade-btn-v3">
                            <Sparkles size={14} className="mr-2" /> Upgrade
                        </Button>
                    )}
                </div>
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
                                        <button className="menu-item-v3">
                                            <Edit3 size={14} /> Editar
                                        </button>
                                        <button className="menu-item-v3 text-red-500">
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
                    <h2 className="text-xl font-bold text-white mb-2">No se encontraron proyectos</h2>
                    <p className="text-gray-400 mb-6">Prueba con otra búsqueda o crea un nuevo proyecto</p>
                    {canCreateMore && (
                        <Button variant="primary" onClick={onCreateNew} leftIcon={<Plus size={18} />}>
                            Crear Proyecto
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
