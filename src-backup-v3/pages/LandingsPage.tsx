import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import LandingPagePreview from '../components/ui/LandingPagePreview';
import type { AIAnalysisResult } from '../data/mockAI';
import { useToast } from '../components/ui/Toast';

export default function LandingsPage() {
    const { campaigns } = useAppStore();
    const { showToast } = useToast();
    const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysisResult | null>(null);

    const handlePreview = (analysis: AIAnalysisResult) => {
        setSelectedAnalysis(analysis);
    };

    const copyLink = (name: string) => {
        navigator.clipboard.writeText(`https://fachada-app.com/${name.toLowerCase().replace(/\s/g, '-')}`);
        showToast('Enlace copiado al portapapeles', 'success');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Páginas Web Generadas</h1>

            {campaigns.length === 0 ? (
                <div className="text-white/40">Aún no has generado ninguna página.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign, idx) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => handlePreview(campaign.analysisData)}
                            className="bg-white group overflow-hidden rounded-2xl relative aspect-[4/3] flex flex-col justify-end p-6 cursor-pointer hover:shadow-2xl transition-all"
                        >
                            {/* Simulated Screenshot Background */}
                            <div className="absolute inset-0 bg-gray-200">
                                {campaign.imageUrl ? (
                                    <img src={campaign.imageUrl} alt={campaign.name} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            </div>

                            <div className="relative z-10 text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-green-500 text-black text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" /> Live
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold leading-tight mb-1">{campaign.name}</h3>
                                <p
                                    className="text-white/70 text-sm mb-4 line-clamp-1 hover:underline z-20"
                                    onClick={(e) => { e.stopPropagation(); copyLink(campaign.name); }}
                                >
                                    fachada-app.com/{campaign.name.toLowerCase().replace(/\s/g, '-')}
                                </p>

                                <button className="w-full py-3 bg-white/20 backdrop-blur-md rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-colors">
                                    <ExternalLink className="w-4 h-4" /> Ver Online
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {selectedAnalysis && (
                <LandingPagePreview
                    isOpen={!!selectedAnalysis}
                    onClose={() => setSelectedAnalysis(null)}
                    data={selectedAnalysis}
                />
            )}
        </div>
    );
}
