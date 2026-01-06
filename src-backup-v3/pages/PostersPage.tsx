import { useAppStore } from '../store/appStore';
import { Download, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../components/ui/Toast';

export default function PostersPage() {
    const { campaigns } = useAppStore();
    const { showToast } = useToast();

    const handleDownload = (campaignName: string) => {
        showToast(`Descargando cartel para ${campaignName}...`, 'success');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Carteles Impresibles (A4)</h1>

            {campaigns.length === 0 ? (
                <div className="text-white/40">No hay carteles disponibles.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {campaigns.map((campaign) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-2 rounded-xl shadow-lg group hover:-translate-y-2 transition-transform duration-300"
                        >
                            {/* Poster Preview Area */}
                            <div className="aspect-[1/1.4142] bg-gray-100 rounded-lg overflow-hidden relative mb-3 border border-gray-200">
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                    <h2 className="text-2xl font-bold text-black uppercase tracking-tighter leading-none mb-2">{campaign.name}</h2>
                                    <div className="w-20 h-20 bg-black mb-2" /> {/* QR Placeholder */}
                                    <p className="text-[10px] text-gray-500 font-mono">ESCANEA PARA ACCEDER</p>
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => handleDownload(campaign.name)} className="p-3 bg-white rounded-full text-black hover:scale-110 transition-transform"><Download className="w-5 h-5" /></button>
                                    <button onClick={() => showToast('Enviando a impresora...', 'info')} className="p-3 bg-white rounded-full text-black hover:scale-110 transition-transform"><Printer className="w-5 h-5" /></button>
                                </div>
                            </div>

                            <div className="px-2 pb-2">
                                <div className="font-bold text-black truncate">{campaign.name}</div>
                                <div className="text-xs text-gray-400">PDF • A4 • 300 DPI</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
