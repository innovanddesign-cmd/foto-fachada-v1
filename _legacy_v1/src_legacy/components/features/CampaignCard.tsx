/**
 * Campaign Card Component
 * ========================
 * Modern card for displaying campaign info
 */
import React from 'react';
import { Calendar, Eye, Copy, Trash2, ExternalLink, MoreVertical, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './CampaignCard.css';

export interface CampaignCardData {
    id: string;
    name: string;
    thumbnail_url?: string;
    status: 'draft' | 'active' | 'paused' | 'archived';
    deploy_status: 'pending' | 'deployed' | 'failed';
    created_at: string | Date;
    business_name?: string;
    business_type?: string;
    landing_count?: number;
}

interface CampaignCardProps {
    campaign: CampaignCardData;
    onView: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string, name: string) => void;
}

export function CampaignCard({ campaign, onView, onDuplicate, onDelete }: CampaignCardProps) {
    const { t } = useTranslation();
    const [menuOpen, setMenuOpen] = React.useState(false);

    const statusLabels: Record<string, string> = {
        draft: t('campaign.draft', 'Borrador'),
        active: t('campaign.active', 'Activa'),
        paused: t('campaign.paused', 'Pausada'),
        archived: t('campaign.archived', 'Archivada')
    };

    const deployLabels: Record<string, string> = {
        pending: t('campaign.pending', 'Pendiente'),
        deployed: t('campaign.deployed', 'Desplegada'),
        failed: t('campaign.failed', 'Error')
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="campaign-card">
            {/* Thumbnail */}
            <div className="campaign-thumbnail" onClick={() => onView(campaign.id)}>
                {campaign.thumbnail_url ? (
                    <img src={campaign.thumbnail_url} alt={campaign.name} />
                ) : (
                    <div className="thumbnail-placeholder">
                        <Zap size={32} />
                    </div>
                )}
                <div className={`status-badge status-${campaign.status}`}>
                    {statusLabels[campaign.status]}
                </div>
            </div>

            {/* Content */}
            <div className="campaign-content">
                <div className="campaign-header">
                    <h3 className="campaign-name" onClick={() => onView(campaign.id)}>
                        {campaign.name}
                    </h3>
                    <div className="campaign-menu-wrapper">
                        <button
                            className="campaign-menu-btn"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <MoreVertical size={18} />
                        </button>

                        {menuOpen && (
                            <div className="campaign-menu" onMouseLeave={() => setMenuOpen(false)}>
                                <button onClick={() => { onView(campaign.id); setMenuOpen(false); }}>
                                    <ExternalLink size={16} />
                                    {t('common.view', 'Ver')}
                                </button>
                                <button onClick={() => { onDuplicate(campaign.id); setMenuOpen(false); }}>
                                    <Copy size={16} />
                                    {t('common.duplicate', 'Duplicar')}
                                </button>
                                <button
                                    className="menu-delete"
                                    onClick={() => { onDelete(campaign.id, campaign.name); setMenuOpen(false); }}
                                >
                                    <Trash2 size={16} />
                                    {t('common.delete', 'Eliminar')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {campaign.business_name && (
                    <p className="campaign-business">
                        {campaign.business_name}
                        {campaign.business_type && ` • ${campaign.business_type}`}
                    </p>
                )}

                <div className="campaign-meta">
                    <span className="meta-item">
                        <Calendar size={14} />
                        {formatDate(campaign.created_at)}
                    </span>

                    {campaign.landing_count !== undefined && (
                        <span className="meta-item">
                            <Eye size={14} />
                            {campaign.landing_count} landing{campaign.landing_count !== 1 ? 's' : ''}
                        </span>
                    )}

                    <span className={`deploy-badge deploy-${campaign.deploy_status}`}>
                        {deployLabels[campaign.deploy_status]}
                    </span>
                </div>
            </div>
        </div>
    );
}
