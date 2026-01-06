import { useEffect, useState } from 'react';
import { Plus, Download, Loader, Printer } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { downloadPrintPoster } from '../../services/pdfPosterGenerator';

interface Landing {
    id: string;
    title: string;
    slug: string;
    status: 'active' | 'draft';
    createdAt: string;
}

export function PostersList({ onGenerate }: { onGenerate: () => void }) {
    const [landings, setLandings] = useState<Landing[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
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
            console.error('Error loading data for posters:', error);
            addToast('Error cargando datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (landing: Landing) => {
        setDownloadingId(landing.id);
        try {
            await downloadPrintPoster({
                businessName: landing.title, // In real app, get from landing details
                businessType: 'Comercio Local',
                tagline: 'Escanea para ofertas exclusivas',
                landingUrl: `https://fotofachada.app/p/${landing.slug}`,
                primaryColor: '#6366f1', // Default primary
                phone: '+34 600 000 000',
                address: 'Calle Principal 123'
            });
            addToast('Cartel descargado correctamente', 'success');
        } catch (error) {
            console.error('Download error:', error);
            addToast('Error al generar el cartel', 'error');
        } finally {
            setDownloadingId(null);
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
                    <Printer className="text-primary" size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">No tienes carteles disponibles</h2>
                <p className="text-secondary mb-8 max-w-md mx-auto">
                    Primero crea una campaña y genera tu landing page para obtener tu cartel QR automático.
                </p>
                <Button variant="primary" onClick={onGenerate}>
                    <Plus size={20} />
                    Crear Campaña
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Mis Carteles QR</h2>
                    <p className="text-secondary">Descarga e imprime carteles para tu punto de venta</p>
                </div>
                <Button variant="primary" onClick={onGenerate}>
                    <Plus size={20} />
                    Nueva Campaña
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {landings.map((landing) => (
                    <div key={landing.id} className="card overflow-hidden group hover:border-primary/50 transition-all">
                        {/* Preview Area (Mock) */}
                        <div className="h-48 bg-gradient-to-br from-gray-900 to-gray-800 relative flex items-center justify-center p-6">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://source.unsplash.com/random/800x600/?texture')]" />
                            <div className="bg-white p-4 rounded-lg shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                                <div className="w-24 h-24 bg-black rounded flex items-center justify-center">
                                    <Printer className="text-white opacity-50" size={32} />
                                </div>
                            </div>
                            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs font-mono text-white/80 border border-white/10">
                                A4 • 300 DPI
                            </div>
                        </div>

                        <div className="p-5">
                            <h3 className="font-bold text-lg mb-1">{landing.title}</h3>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xs text-secondary uppercase tracking-wider">PDF Listo</span>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleDownload(landing)}
                                    disabled={downloadingId === landing.id}
                                >
                                    {downloadingId === landing.id ? (
                                        <Loader className="animate-spin" size={16} />
                                    ) : (
                                        <>
                                            <Download size={16} />
                                            Descargar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
