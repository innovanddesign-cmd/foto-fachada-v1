import { useState } from 'react';
import {
    Plus,
    FolderOpen,
    MoreVertical,
    Edit2,
    Trash2,
    Calendar,
    LayoutGrid,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { Project } from '../types';
import './Dashboard.css';

interface DashboardProps {
    onCreateNew: () => void;
    onOpenProject: (project: Project) => void;
}

export function Dashboard({ onCreateNew, onOpenProject }: DashboardProps) {
    const { projects, userTier, deleteProject } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Unlimited for Pro
    const maxProjects = userTier === 'free' ? 1 : userTier === 'plus' ? 5 : -1;
    const canCreateMore = maxProjects === -1 || projects.length < maxProjects;

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.campaign?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto? Se eliminarán todas sus landings.')) {
            await deleteProject(projectId);
            setActiveMenu(null);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="header-title">
                    <FolderOpen className="header-icon" />
                    <div>
                        <h1>Mis Proyectos</h1>
                        <p className="text-muted">Gestiona tus landing pages y campañas</p>
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={onCreateNew}
                    disabled={!canCreateMore}
                >
                    <Plus size={20} />
                    Nueva Landing
                </button>
            </div>

            {/* Search and Filters */}
            <div className="dashboard-controls">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar proyectos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="btn btn-secondary">
                    <Filter size={16} />
                    Filtrar
                </button>
            </div>

            {/* Stats */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <span className="stat-value">{projects.length}</span>
                    <span className="stat-label">Proyectos</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">
                        {projects.reduce((acc, p) => acc + p.landings.length, 0)}
                    </span>
                    <span className="stat-label">Landings</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{userTier.toUpperCase()}</span>
                    <span className="stat-label">Plan</span>
                </div>
                {maxProjects !== -1 && (
                    <div className="stat-card">
                        <span className="stat-value">{projects.length}/{maxProjects}</span>
                        <span className="stat-label">Límite</span>
                    </div>
                )}
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
                <div className="projects-grid">
                    {filteredProjects.map(project => (
                        <div key={project.id} className="project-card glass-card">
                            <div className="project-header">
                                <div className="project-icon">
                                    <LayoutGrid size={24} />
                                </div>
                                <button
                                    className="btn-icon"
                                    onClick={() => setActiveMenu(activeMenu === project.id ? null : project.id)}
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {activeMenu === project.id && (
                                    <div className="project-menu">
                                        <button onClick={() => { /* TODO: Edit */ }}>
                                            <Edit2 size={14} />
                                            Editar
                                        </button>
                                        <button className="danger" onClick={(e) => handleDelete(e, project.id)}>
                                            <Trash2 size={14} />
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>

                            <h3 className="project-name">{project.name}</h3>

                            {project.campaign && (
                                <div className="project-campaign">
                                    <Calendar size={14} />
                                    {project.campaign}
                                </div>
                            )}

                            {project.description && (
                                <p className="project-description">{project.description}</p>
                            )}

                            <div className="project-meta">
                                <span className="landing-count">
                                    {project.landings.length} landing{project.landings.length !== 1 ? 's' : ''}
                                </span>
                                <span className="project-date">
                                    {formatDate(project.updatedAt)}
                                </span>
                            </div>

                            <button
                                className="btn btn-secondary w-full project-open-btn"
                                onClick={() => onOpenProject(project)}
                            >
                                Abrir proyecto
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    ))}

                    {/* Create New Card */}
                    {canCreateMore && (
                        <div className="project-card create-card" onClick={onCreateNew}>
                            <div className="create-icon">
                                <Plus size={32} />
                            </div>
                            <p>Crear nuevo proyecto</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">
                        <FolderOpen size={64} />
                    </div>
                    <h2>No hay proyectos</h2>
                    <p className="text-muted">
                        {searchQuery
                            ? 'No se encontraron proyectos con ese nombre'
                            : 'Crea tu primer proyecto para empezar'}
                    </p>
                    {!searchQuery && (
                        <button className="btn btn-primary btn-lg" onClick={onCreateNew}>
                            <Plus size={20} />
                            Crear primer proyecto
                        </button>
                    )}
                </div>
            )}

            {/* Upgrade prompt for free users */}
            {userTier === 'free' && projects.length >= 1 && (
                <div className="upgrade-banner">
                    <div className="banner-content">
                        <h3>🚀 Desbloquea más proyectos</h3>
                        <p>Actualiza a Plan Plus para crear hasta 5 proyectos y acceder a plantillas premium</p>
                    </div>
                    <button className="btn btn-primary">Ver planes</button>
                </div>
            )}
        </div>
    );
}
