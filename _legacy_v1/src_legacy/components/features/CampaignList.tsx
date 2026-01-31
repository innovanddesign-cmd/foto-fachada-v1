/**
 * Campaign List Component
 * ========================
 * Grid display of user campaigns with CRUD actions
 */
import { useEffect, useState } from 'react';
import { Plus, Search, Loader2, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CampaignCard, type CampaignCardData } from './CampaignCard';
import { DeleteConfirmModal } from '../ui/DeleteConfirmModal';
import { Button } from '../ui/Button';
import { fetchCampaignsFromBackend, deleteCampaignFromBackend, duplicateCampaignFromBackend } from '../../services/campaignService';
import './CampaignCard.css';
import './CampaignList.css';

// Type assertion helper
function mapToCampaignCardData(data: unknown[]): CampaignCardData[] {
    return (data as CampaignCardData[]).map(c => ({
        ...c,
        status: c.status as CampaignCardData['status'],
        deploy_status: c.deploy_status as CampaignCardData['deploy_status']
    }));
}

export function CampaignList() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Delete modal state
    const [deleteModal, setDeleteModal] = useState<{
        open: boolean;
        id: string;
        name: string;
    }>({ open: false, id: '', name: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    // Load campaigns
    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const data = await fetchCampaignsFromBackend();
            setCampaigns(mapToCampaignCardData(data));
        } catch (error) {
            console.error('Error loading campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleView = (id: string) => {
        navigate(`/campaigns/${id}`);
    };

    const handleDuplicate = async (id: string) => {
        try {
            const newCampaign = await duplicateCampaignFromBackend(id);
            if (newCampaign) {
                setCampaigns(prev => [newCampaign, ...prev]);
            }
        } catch (error) {
            console.error('Error duplicating:', error);
        }
    };

    const handleDeleteClick = (id: string, name: string) => {
        setDeleteModal({ open: true, id, name });
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            const success = await deleteCampaignFromBackend(deleteModal.id);
            if (success) {
                setCampaigns(prev => prev.filter(c => c.id !== deleteModal.id));
                setDeleteModal({ open: false, id: '', name: '' });
            }
        } catch (error) {
            console.error('Error deleting:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreateNew = () => {
        navigate('/new-campaign');
    };

    // Filter campaigns
    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campaign.business_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="campaigns-loading">
                <Loader2 className="animate-spin" size={32} />
                <p>{t('common.loading', 'Cargando...')}</p>
            </div>
        );
    }

    return (
        <div className="campaign-list-container">
            {/* Header */}
            <div className="campaign-list-header">
                <div className="header-left">
                    <h2>{t('dashboard.campaigns', 'Mis Campañas')}</h2>
                    <span className="campaign-count">{campaigns.length} campaña{campaigns.length !== 1 ? 's' : ''}</span>
                </div>
                <Button onClick={handleCreateNew} variant="primary">
                    <Plus size={18} />
                    {t('campaign.create', 'Nueva Campaña')}
                </Button>
            </div>

            {/* Filters */}
            <div className="campaign-filters">
                <div className="search-input-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder={t('common.search', 'Buscar...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        {t('filter.all', 'Todas')}
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'draft' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('draft')}
                    >
                        {t('filter.drafts', 'Borradores')}
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('active')}
                    >
                        {t('filter.active', 'Activas')}
                    </button>
                </div>
            </div>

            {/* Grid or Empty State */}
            {filteredCampaigns.length > 0 ? (
                <div className="campaigns-grid">
                    {filteredCampaigns.map(campaign => (
                        <CampaignCard
                            key={campaign.id}
                            campaign={campaign}
                            onView={handleView}
                            onDuplicate={handleDuplicate}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="campaigns-empty">
                    <FolderOpen size={48} />
                    <h3>{searchQuery ? t('campaign.noResults', 'Sin resultados') : t('campaign.empty', 'No tienes campañas')}</h3>
                    <p>
                        {searchQuery
                            ? t('campaign.tryDifferentSearch', 'Intenta con otros términos')
                            : t('campaign.createFirst', 'Crea tu primera campaña para empezar')}
                    </p>
                    {!searchQuery && (
                        <Button onClick={handleCreateNew} variant="primary">
                            <Plus size={18} />
                            {t('campaign.create', 'Nueva Campaña')}
                        </Button>
                    )}
                </div>
            )}

            {/* Delete Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, id: '', name: '' })}
                onConfirm={handleDeleteConfirm}
                itemName={deleteModal.name}
                isDeleting={isDeleting}
            />
        </div>
    );
}
