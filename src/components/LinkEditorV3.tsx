import { useState } from 'react';
import { Link, RefreshCw, Check, Zap, Crown, Loader, AlertCircle, ExternalLink, QrCode } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { regenerateSingleLink } from '../services/marketingAgent';
import type { LandingLink } from '../types';
import './LinkEditorV3.css';

const ENGAGEMENT_COLORS: Record<string, string> = {
    'low': 'var(--text-tertiary)',
    'medium': 'var(--warning-400)',
    'high': 'var(--success-400)',
    'very-high': 'var(--primary-300)'
};

const TYPE_LABELS: Record<string, string> = {
    gamification: '🎮 Gamificación',
    reservation: '📅 Reservas',
    menu: '📋 Menú/Catálogo',
    contact: '📞 Contacto',
    social: '📱 Social',
    promo: '🎁 Promociones',
    info: 'ℹ️ Información'
};

// Get generated Simple Page from localStorage
function getGeneratedSimplePage(): { url: string; slug: string; actionId: number; title: string } | null {
    try {
        // Read from simple_pages_index (where strategicActionsService stores pages)
        const index = localStorage.getItem('simple_pages_index');
        if (index) {
            const parsed = JSON.parse(index);
            if (parsed.length > 0) {
                const latest = parsed[parsed.length - 1];
                // Get the full page data
                const pageData = localStorage.getItem(`simple_page_${latest.slug}`);
                if (pageData) {
                    const page = JSON.parse(pageData);
                    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
                    const baseUrl = isDev ? 'http://localhost:5173' : `https://${window.location.host}`;

                    return {
                        url: `${baseUrl}/p/${latest.slug}`,
                        slug: latest.slug,
                        actionId: page.actionId || 0,
                        title: page.title || latest.title || 'Simple Page'
                    };
                }
            }
        }
    } catch (e) {
        console.error('[LinkEditorV3] Error reading Simple Page:', e);
    }
    return null;
}

export function LinkEditorV3() {
    const { links, isGeneratingLinks, brandData, regenerateLink, userTier } = useAppStore();
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const [approvedLinks, setApprovedLinks] = useState<Set<string>>(new Set());

    const generatedPage = getGeneratedSimplePage();

    const maxRegenerations = userTier === 'free' ? 3 : userTier === 'plus' ? 10 : -1;

    const handleRegenerate = async (link: LandingLink) => {
        if (maxRegenerations !== -1 && link.regenerateCount >= maxRegenerations) {
            return; // Limit reached
        }

        setRegeneratingId(link.id);

        try {
            // Simplified regeneration logic for demo
            if (!import.meta.env.VITE_GEMINI_API_KEY && brandData) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                const mockNewLink: LandingLink = {
                    ...link,
                    name: `${link.name} (V${link.regenerateCount + 2})`,
                    description: `Versión mejorada: ${link.description}`,
                    regenerateCount: link.regenerateCount + 1
                };
                regenerateLink(link.id, mockNewLink);
            } else if (brandData) {
                const otherLinks = links.filter(l => l.id !== link.id);
                const newLink = await regenerateSingleLink(brandData, link, otherLinks);
                if (newLink) {
                    regenerateLink(link.id, newLink);
                }
            }
        } catch (error) {
            console.error("Error regenerating link:", error);
        } finally {
            setRegeneratingId(null);
            setApprovedLinks(prev => {
                const next = new Set(prev);
                next.delete(link.id);
                return next;
            });
        }
    };

    const handleApprove = (linkId: string) => {
        setApprovedLinks(prev => {
            const next = new Set(prev);
            if (next.has(linkId)) {
                next.delete(linkId);
            } else {
                next.add(linkId);
            }
            return next;
        });
    };

    if (isGeneratingLinks) {
        return (
            <div className="link-editor-v3 loading-state glass-panel">
                <div className="loader-container">
                    <div className="glow-loader"></div>
                    <Link className="loader-icon text-white animate-pulse" size={48} />
                </div>
                <h3>Creando enlaces inteligentes...</h3>
                <p className="loading-subtitle">Transformando las estrategias en acciones concretas para tus clientes</p>
            </div>
        );
    }

    // Show generated Simple Page if available
    if (links.length === 0 && generatedPage) {
        return (
            <div className="link-editor-v3 animate-fadeIn">
                <div className="section-header-v3">
                    <div className="icon-badge success">
                        <Check size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="section-title">¡Simple Page Generada!</h2>
                        <p className="section-subtitle">Tu página interactiva está lista para compartir</p>
                    </div>
                </div>

                <div className="simple-page-card glass-panel">
                    <div className="simple-page-preview">
                        <div className="preview-icon">🎯</div>
                        <div className="preview-info">
                            <h3>{generatedPage.title}</h3>
                            <p className="preview-url">{generatedPage.url}</p>
                        </div>
                    </div>

                    <div className="simple-page-actions">
                        <a
                            href={generatedPage.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn primary-btn"
                        >
                            <ExternalLink size={18} />
                            <span>Ver página</span>
                        </a>
                        <button
                            className="action-btn secondary-btn"
                            onClick={() => {
                                navigator.clipboard.writeText(generatedPage.url);
                            }}
                        >
                            <QrCode size={18} />
                            <span>Copiar enlace</span>
                        </button>
                    </div>
                </div>

                <div className="links-summary-bar glass-panel">
                    <div className="completion-badge">
                        <Check size={14} />
                        <span>¡Listo para continuar al diseño!</span>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state when no links and no generated page
    if (links.length === 0) {
        return (
            <div className="link-editor-v3 empty-state glass-panel">
                <div className="empty-icon">
                    <Link size={48} />
                </div>
                <h3>Generando tu enlace...</h3>
                <p className="empty-subtitle">
                    Selecciona una acción estratégica para generar tu Simple Page interactiva
                </p>
            </div>
        );
    }

    return (
        <div className="link-editor-v3 animate-fadeIn">
            <div className="section-header-v3">
                <div className="icon-badge">
                    <Link size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="section-title">Enlaces Generados</h2>
                    <p className="section-subtitle">Revisa y personaliza las acciones principales de tu landing</p>
                </div>
            </div>

            <div className="links-grid-v3">
                {links.map((link, index) => {
                    const isRegenerating = regeneratingId === link.id;
                    const isApproved = approvedLinks.has(link.id);
                    const canRegenerate = maxRegenerations === -1 || link.regenerateCount < maxRegenerations;

                    return (
                        <div
                            key={link.id}
                            className={`link-card-v3 glass-panel ${isApproved ? 'approved' : ''} ${isRegenerating ? 'regenerating' : ''}`}
                            style={{ '--delay': `${index * 0.1}s` } as any}
                        >
                            {link.isPremium && (
                                <div className="premium-ribbon">
                                    <Crown size={10} fill="currentColor" />
                                    <span>PRO</span>
                                </div>
                            )}

                            <div className="card-content">
                                <div className="link-emoji-circle">{link.emoji}</div>

                                <div className="link-info-main">
                                    <h3 className="link-name">{link.name}</h3>
                                    <p className="link-desc">{link.description}</p>

                                    <div className="link-tags">
                                        <span className="tag-type">{TYPE_LABELS[link.type] || link.type}</span>
                                        <div className="metrics-row">
                                            <span className="metric" style={{ color: ENGAGEMENT_COLORS[link.engagement] }}>
                                                <Zap size={10} /> {link.engagement}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card-actions-footer">
                                <button
                                    className={`action-btn approve-btn ${isApproved ? 'active' : ''}`}
                                    onClick={() => handleApprove(link.id)}
                                >
                                    <Check size={16} />
                                    <span>{isApproved ? 'Aprobado' : 'Aprobar'}</span>
                                </button>

                                <div className="divider-vertical"></div>

                                <button
                                    className="action-btn regenerate-btn"
                                    onClick={() => handleRegenerate(link)}
                                    disabled={isRegenerating || !canRegenerate}
                                >
                                    {isRegenerating ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                    <span>Regenerar</span>
                                </button>
                            </div>

                            {!canRegenerate && (
                                <div className="limit-warning">
                                    <AlertCircle size={12} />
                                    <span>Límite de cambios</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="links-summary-bar glass-panel">
                <div className="summary-info">
                    <span className="highlight">{approvedLinks.size}</span>
                    <span className="label">enlaces aprobados</span>
                </div>
                {approvedLinks.size === links.length && (
                    <div className="completion-badge">
                        <Check size={14} />
                        <span>¡Todo listo para diseñar!</span>
                    </div>
                )}
            </div>
        </div>
    );
}
