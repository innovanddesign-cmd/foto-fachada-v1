import { useState } from 'react';
import { Link, RefreshCw, Check, Zap, TrendingUp, Crown, Loader } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { regenerateSingleLink } from '../services/marketingAgent';
import type { LandingLink } from '../types';
import './LinkEditor.css';

const ENGAGEMENT_COLORS: Record<string, string> = {
    'low': 'var(--color-text-dim)',
    'medium': 'var(--color-warning)',
    'high': 'var(--color-success)',
    'very-high': 'var(--color-primary-light)'
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

export function LinkEditor() {
    const { links, isGeneratingLinks, brandData, regenerateLink, userTier } = useAppStore();
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const [approvedLinks, setApprovedLinks] = useState<Set<string>>(new Set());

    const maxRegenerations = userTier === 'free' ? 3 : userTier === 'plus' ? 10 : -1;

    const handleRegenerate = async (link: LandingLink) => {
        if (maxRegenerations !== -1 && link.regenerateCount >= maxRegenerations) {
            return; // Limit reached
        }

        setRegeneratingId(link.id);

        // If no API key, use mock regeneration
        if (!import.meta.env.VITE_GEMINI_API_KEY && brandData) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockNewLink: LandingLink = {
                ...link,
                name: `${link.name} v${link.regenerateCount + 2}`,
                description: `Nueva versión: ${link.description}`,
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

        setRegeneratingId(null);
        setApprovedLinks(prev => {
            const next = new Set(prev);
            next.delete(link.id);
            return next;
        });
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
            <div className="link-editor loading">
                <div className="loading-content">
                    <div className="loading-spinner">
                        <Link className="animate-spin" size={32} />
                    </div>
                    <h3>Generando enlaces personalizados...</h3>
                    <p className="text-muted">Creando funcionalidades adaptadas a tu negocio</p>
                </div>
            </div>
        );
    }

    if (links.length === 0) return null;

    return (
        <div className="link-editor animate-fadeIn">
            <div className="section-header">
                <Link className="section-icon text-primary" />
                <h2>Enlaces de tu Landing</h2>
                <p className="text-muted">Regenera individualmente los que no te gusten</p>
            </div>

            <div className="links-grid">
                {links.map((link) => {
                    const isRegenerating = regeneratingId === link.id;
                    const isApproved = approvedLinks.has(link.id);
                    const canRegenerate = maxRegenerations === -1 || link.regenerateCount < maxRegenerations;

                    return (
                        <div
                            key={link.id}
                            className={`link-card ${isApproved ? 'approved' : ''} ${isRegenerating ? 'regenerating' : ''}`}
                        >
                            {link.isPremium && (
                                <div className="premium-badge">
                                    <Crown size={12} />
                                    Premium
                                </div>
                            )}

                            <div className="link-emoji">{link.emoji}</div>

                            <h3 className="link-name">{link.name}</h3>
                            <p className="link-description">{link.description}</p>

                            <div className="link-meta">
                                <span className="link-type">{TYPE_LABELS[link.type] || link.type}</span>
                                <div className="link-stats">
                                    <span style={{ color: ENGAGEMENT_COLORS[link.engagement] }}>
                                        <Zap size={12} />
                                        {link.engagement}
                                    </span>
                                    <span style={{ color: ENGAGEMENT_COLORS[link.conversion] }}>
                                        <TrendingUp size={12} />
                                        {link.conversion}
                                    </span>
                                </div>
                            </div>

                            <div className="link-actions">
                                <button
                                    className={`btn btn-approve ${isApproved ? 'approved' : ''}`}
                                    onClick={() => handleApprove(link.id)}
                                >
                                    <Check size={16} />
                                    {isApproved ? 'Aprobado' : 'Aprobar'}
                                </button>

                                <button
                                    className="btn btn-regenerate"
                                    onClick={() => handleRegenerate(link)}
                                    disabled={isRegenerating || !canRegenerate}
                                    title={!canRegenerate ? `Límite alcanzado (${maxRegenerations} regeneraciones)` : ''}
                                >
                                    {isRegenerating ? (
                                        <Loader size={16} className="animate-spin" />
                                    ) : (
                                        <RefreshCw size={16} />
                                    )}
                                    Regenerar
                                </button>
                            </div>

                            {maxRegenerations !== -1 && (
                                <div className="regenerate-counter">
                                    {link.regenerateCount}/{maxRegenerations} regeneraciones
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="links-summary">
                <div className="summary-stat">
                    <span className="stat-value">{approvedLinks.size}</span>
                    <span className="stat-label">Aprobados</span>
                </div>
                <div className="summary-stat">
                    <span className="stat-value">{links.length - approvedLinks.size}</span>
                    <span className="stat-label">Pendientes</span>
                </div>
            </div>
        </div>
    );
}
