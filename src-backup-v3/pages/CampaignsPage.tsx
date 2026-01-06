import { useAppStore } from '../store/appStore';
import CampaignCard from '../components/dashboard/CampaignCard';
import { Search } from 'lucide-react';

export default function CampaignsPage() {
    const { campaigns, deleteCampaign } = useAppStore();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Mis Campañas</h1>

                {/* Simple Search Mock */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 w-64 transition-colors"
                    />
                </div>
            </div>

            {campaigns.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                    <p className="text-white/40">No hay campañas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign, idx) => (
                        <CampaignCard
                            key={campaign.id}
                            campaign={campaign}
                            index={idx}
                            onDelete={deleteCampaign}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
