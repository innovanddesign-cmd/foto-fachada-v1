import { useEffect, useState } from 'react';
import { Plus, ExternalLink, Loader, Eye, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface Landing {
    id: string;
    title: string;
    slug: string;
    status: 'active' | 'draft';
    views: number;
    conversions: number;
    createdAt: string;
}

export function LandingsList({ onCreateNew }: { onCreateNew: () => void }) {
    const [landings, setLandings] = useState<Landing[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        loadLandings();
    }, []);

    const loadLandings = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/landings`);
            const data = await response.json();
            if (data.success && data.landings) {
                setLandings(data.landings);
            }
        } catch (error) {
            console.error('Error loading landings:', error);
            addToast('Error cargando landings', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (landings.length === 0) {
        return (
            <div className="text-center py-20 bg-surface rounded-xl border border-border/50">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Eye className="text-primary" size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">No tienes landings aún</h2>
                <p className="text-secondary mb-8 max-w-md mx-auto">
                    Genera tu primera landing page con IA y empieza a convertir visitantes en clientes.
                </p>
                <Button variant="primary" onClick={onCreateNew}>
                    <Plus size={20} />
                    Crear mi primera landing
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Mis Landings</h2>
                    <p className="text-secondary">Gestiona y analiza el rendimiento de tus páginas</p>
                </div>
                <Button variant="primary" onClick={onCreateNew}>
                    <Plus size={20} />
                    Nueva Landing
                </Button>
            </div>

            <div className="grid gap-4">
                {landings.map((landing) => (
                    <div key={landing.id} className="card p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{landing.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-secondary">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${landing.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                        }`}>
                                        {landing.status === 'active' ? 'Publicada' : 'Borrador'}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(landing.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-center">
                                <div className="text-lg font-bold">{landing.views}</div>
                                <div className="text-xs text-secondary">Visitas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-primary">{landing.conversions}</div>
                                <div className="text-xs text-secondary">Leads</div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => window.open(`/p/${landing.id}`, '_blank')}>
                                    <ExternalLink size={18} />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
