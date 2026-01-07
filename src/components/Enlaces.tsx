import { useState, useEffect } from 'react';
import {
    Link as LinkIcon,
    Copy,
    Eye,
    Edit2,
    ExternalLink,
    MoreVertical,
    Sparkles
} from 'lucide-react';
import { QRCodeGenerator } from './QRCodeGenerator';
import { StrategySelector } from './StrategySelector';
import './Enlaces.css';

interface Landing {
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    views: number;
    conversions: number;
    created_at: string;
    updated_at: string;
}

export function Enlaces() {
    const [landings, setLandings] = useState<Landing[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLanding, setSelectedLanding] = useState<Landing | null>(null);
    const [strategyModalOpen, setStrategyModalOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    useEffect(() => {
        fetchLandings();
    }, []);

    const fetchLandings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token'); // Adjust based on your auth implementation

            const response = await fetch('http://localhost:3000/api/campaigns', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch campaigns');
            }

            const data = await response.json();

            // Extract landings from campaigns
            const allLandings: Landing[] = [];
            if (data.campaigns) {
                for (const campaign of data.campaigns) {
                    // Fetch landings for each campaign
                    const landingsResponse = await fetch(`http://localhost:3000/api/landings/campaign/${campaign.id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    });

                    if (landingsResponse.ok) {
                        const landingsData = await landingsResponse.json();
                        if (landingsData.landings) {
                            allLandings.push(...landingsData.landings);
                        }
                    }
                }
            }

            setLandings(allLandings);
        } catch (error) {
            console.error('Error fetching landings:', error);
            // Fallback to empty for now
            setLandings([]);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            // Show success feedback
            const button = event?.target as HTMLElement;
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '✓';
                setTimeout(() => {
                    button.innerHTML = originalText;
                }, 1500);
            }
        }).catch(err => {
            console.error('Error copying to clipboard:', err);
        });
    };

    const getPublicUrl = (slug: string) => {
        // Use Vercel URL in production, localhost in development
        const isDev = import.meta.env.DEV;
        const protocol = isDev ? 'http:' : 'https:';
        const host = isDev ? 'localhost:3000' : 'foto-fachada-v1.vercel.app';

        return `${protocol}//${host}/l/${slug}`;
    };

    const handleChangeStrategy = (landing: Landing) => {
        setSelectedLanding(landing);
        setStrategyModalOpen(true);
    };

    const handleStrategySelect = async (strategyId: string) => {
        if (!selectedLanding) return;

        try {
            const token = localStorage.getItem('auth_token');

            // First, get the proposal ID for this strategy
            // This would need to be stored or fetched from campaigns
            const response = await fetch(`http://localhost:3000/api/landings/${selectedLanding.id}/strategy`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    proposalId: strategyId // This needs to be mapped to actual proposal ID
                })
            });

            if (!response.ok) {
                throw new Error('Failed to change strategy');
            }

            // Show success message
            console.log('Strategy changed successfully');
            fetchLandings(); // Refresh
        } catch (error) {
            console.error('Error changing strategy:', error);
            alert('Error al cambiar la estrategia. Por favor intenta de nuevo.');
        }
    };

    const handlePublish = async (landingId: string) => {
        try {
            const token = localStorage.getItem('auth_token');

            const response = await fetch(`http://localhost:3000/api/landings/${landingId}/publish`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    status: 'published'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to publish landing');
            }

            console.log('Landing published successfully');
            fetchLandings(); // Refresh
        } catch (error) {
            console.error('Error publishing landing:', error);
            alert('Error al publicar el enlace. Por favor intenta de nuevo.');
        }
    };

    if (loading) {
        return (
            <div className="enlaces-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Cargando enlaces...</p>
                </div>
            </div>
        );
    }

    if (landings.length === 0) {
        return (
            <div className="enlaces-container">
                <div className="empty-state">
                    <div className="empty-icon">
                        <LinkIcon size={64} />
                    </div>
                    <h2>No hay enlaces creados</h2>
                    <p className="text-muted">
                        Crea tu primer proyecto para generar un enlace público con acción interactiva
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
            </div>

            <div className="enlaces-grid">
                {landings.map(landing => {
                    const publicUrl = getPublicUrl(landing.slug);

                    return (
                        <div key={landing.id} className="enlace-card glass-card">
                            <div className="enlace-header">
                                <div className="enlace-status">
                                    <span className={`status-badge ${landing.status}`}>
                                        {landing.status === 'published' ? 'Publicado' :
                                            landing.status === 'draft' ? 'Borrador' : 'Archivado'}
                                    </span>
                                </div>
                                <button
                                    className="btn-icon"
                                    onClick={() => setActiveMenu(activeMenu === landing.id ? null : landing.id)}
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {activeMenu === landing.id && (
                                    <div className="enlace-menu">
                                        <button onClick={() => window.open(publicUrl, '_blank')}>
                                            <ExternalLink size={14} />
                                            Abrir
                                        </button>
                                        <button onClick={() => handleChangeStrategy(landing)}>
                                            <Sparkles size={14} />
                                            Cambiar Acción
                                        </button>
                                    </div>
                                )}
                            </div>

                            <h3 className="enlace-title">{landing.title}</h3>

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
                                        className="btn-icon"
                                        onClick={() => copyToClipboard(publicUrl)}
                                        title="Copiar enlace"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="enlace-stats">
                                <div className="stat">
                                    <Eye size={16} />
                                    <span>{landing.views} vistas</span>
                                </div>
                                <div className="stat">
                                    <Edit2 size={16} />
                                    <span>{landing.conversions} conversiones</span>
                                </div>
                            </div>

                            {/* Actions */}
                            {landing.status === 'draft' && (
                                <button
                                    className="btn btn-primary w-full"
                                    onClick={() => handlePublish(landing.id)}
                                >
                                    Publicar
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Strategy Selector Modal */}
            <StrategySelector
                isOpen={strategyModalOpen}
                onClose={() => {
                    setStrategyModalOpen(false);
                    setSelectedLanding(null);
                }}
                onSelect={handleStrategySelect}
                currentStrategy={undefined} // TODO: Get from landing
            />
        </div>
    );
}
