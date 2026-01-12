/**
 * Enlaces Component
 * =================
 * Displays and manages landing page links from Zustand store.
 * Uses local storage data instead of backend API calls.
 */

import { useState } from 'react';
import {
    Link as LinkIcon,
    Copy,
    Eye,
    Edit2,
    ExternalLink,
    MoreVertical,
    Sparkles,
    Check
} from 'lucide-react';
import { QRCodeGenerator } from './QRCodeGenerator';
import { StrategySelector } from './StrategySelector';
import { useAppStore } from '../store/appStore';
import './Enlaces.css';

interface EnlaceItem {
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    views: number;
    conversions: number;
    projectName?: string;
}

export function Enlaces() {
    const { projects, brandData } = useAppStore();
    const [strategyModalOpen, setStrategyModalOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedEnlace, setSelectedEnlace] = useState<EnlaceItem | null>(null);

    // Extract all landings from all projects
    const enlaces: EnlaceItem[] = projects.flatMap(project =>
        project.landings.map(landing => ({
            id: landing.id,
            title: landing.name || project.name || 'Landing sin título',
            slug: landing.id.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            status: project.status === 'active' ? 'published' : 'draft',
            views: Math.floor(Math.random() * 100), // Mock data - would come from analytics
            conversions: Math.floor(Math.random() * 20), // Mock data
            projectName: project.name
        }))
    );

    // Also add current brandData if exists and not in projects
    if (brandData && !enlaces.some(e => e.title === brandData.name)) {
        enlaces.unshift({
            id: 'current-' + Date.now(),
            title: brandData.name || 'Negocio actual',
            slug: (brandData.name || 'landing').toLowerCase().replace(/[^a-z0-9]/g, '-'),
            status: 'draft',
            views: 0,
            conversions: 0,
            projectName: 'Proyecto actual'
        });
    }

    const copyToClipboard = async (url: string, id: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Error copying to clipboard:', err);
        }
    };

    const getPublicUrl = (slug: string) => {
        const isDev = import.meta.env.DEV;
        const host = isDev ? 'localhost:5173' : 'foto-fachada-v1.vercel.app';
        return `https://${host}/p/${slug}`;
    };

    const handleChangeStrategy = (enlace: EnlaceItem) => {
        setSelectedEnlace(enlace);
        setStrategyModalOpen(true);
    };

    const handleStrategySelect = async (strategyId: string) => {
        console.log('Strategy selected:', strategyId, 'for landing:', selectedEnlace?.id);
        setStrategyModalOpen(false);
        setSelectedEnlace(null);
        // TODO: Update landing with new strategy
    };

    if (enlaces.length === 0) {
        return (
            <div className="enlaces-container">
                <div className="empty-state">
                    <div className="empty-icon">
                        <LinkIcon size={64} />
                    </div>
                    <h2>No hay enlaces creados</h2>
                    <p className="text-muted">
                        Sube una foto de fachada y genera tu primer enlace con acción interactiva
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="enlaces-container">
            <div className="enlaces-header">
                <div className="header-title">
                    <LinkIcon className="header-icon" />
                    <div>
                        <h1>Enlaces Públicos</h1>
                        <p className="text-muted">Gestiona tus landing pages con QR y estrategias interactivas</p>
                    </div>
                </div>
                <div className="enlaces-count">
                    <span className="count-badge">{enlaces.length}</span>
                    <span className="count-label">enlaces</span>
                </div>
            </div>

            <div className="enlaces-grid">
                {enlaces.map(enlace => {
                    const publicUrl = getPublicUrl(enlace.slug);
                    const isCopied = copiedId === enlace.id;

                    return (
                        <div key={enlace.id} className="enlace-card glass-card">
                            <div className="enlace-header">
                                <div className="enlace-status">
                                    <span className={`status-badge ${enlace.status}`}>
                                        {enlace.status === 'published' ? '✓ Publicado' :
                                            enlace.status === 'draft' ? '📝 Borrador' : '📦 Archivado'}
                                    </span>
                                </div>
                                <button
                                    className="btn-icon"
                                    onClick={() => setActiveMenu(activeMenu === enlace.id ? null : enlace.id)}
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {activeMenu === enlace.id && (
                                    <div className="enlace-menu">
                                        <button onClick={() => {
                                            window.open(publicUrl, '_blank');
                                            setActiveMenu(null);
                                        }}>
                                            <ExternalLink size={14} />
                                            Abrir enlace
                                        </button>
                                        <button onClick={() => {
                                            handleChangeStrategy(enlace);
                                            setActiveMenu(null);
                                        }}>
                                            <Sparkles size={14} />
                                            Cambiar Acción
                                        </button>
                                    </div>
                                )}
                            </div>

                            <h3 className="enlace-title">{enlace.title}</h3>
                            {enlace.projectName && (
                                <p className="enlace-project">{enlace.projectName}</p>
                            )}

                            {/* QR Code */}
                            <div className="qr-section">
                                <QRCodeGenerator
                                    url={publicUrl}
                                    size={150}
                                    downloadable={true}
                                />
                            </div>

                            {/* Public URL */}
                            <div className="url-section">
                                <div className="url-display">
                                    <input
                                        type="text"
                                        value={publicUrl}
                                        readOnly
                                        className="url-input"
                                    />
                                    <button
                                        className={`btn-icon ${isCopied ? 'copied' : ''}`}
                                        onClick={() => copyToClipboard(publicUrl, enlace.id)}
                                        title="Copiar enlace"
                                    >
                                        {isCopied ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="enlace-stats">
                                <div className="stat">
                                    <Eye size={16} />
                                    <span>{enlace.views} vistas</span>
                                </div>
                                <div className="stat">
                                    <Edit2 size={16} />
                                    <span>{enlace.conversions} conversiones</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="enlace-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleChangeStrategy(enlace)}
                                >
                                    <Sparkles size={16} />
                                    Cambiar Acción
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => window.open(publicUrl, '_blank')}
                                >
                                    <ExternalLink size={16} />
                                    Ver
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Strategy Selector Modal */}
            <StrategySelector
                isOpen={strategyModalOpen}
                onClose={() => {
                    setStrategyModalOpen(false);
                    setSelectedEnlace(null);
                }}
                onSelect={handleStrategySelect}
                currentStrategy={undefined}
            />
        </div>
    );
}
