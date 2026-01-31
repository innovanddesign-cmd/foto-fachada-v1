import { useStorefrontStore } from "@/store/useStorefront";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRight, CheckCircle, Save, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export function ConfigStep() {
    const { storefrontData, brandDNA, setStep, regenerateStorefront } = useStorefrontStore();
    const [formData, setFormData] = useState(storefrontData);

    if (!formData || !brandDNA) return null;

    const handleChange = (field: string, value: any) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
    };

    const handleOfferChange = (index: number, field: string, value: string) => {
        const newOffers = [...formData.offers];
        newOffers[index] = { ...newOffers[index], [field]: value };
        setFormData({ ...formData, offers: newOffers });
    };

    const handleSubmit = () => {
        regenerateStorefront(formData); // Update global store
        setStep("DEPLOY");
    };

    const primaryColor = brandDNA.palette[0];

    return (
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-start">
            {/* Form Section */}
            <GlassCard className="flex-1 p-8 space-y-8" intensity="high">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <Smartphone className="w-8 h-8 text-pink-400" />
                    Configura tu Escaparate
                </h2>

                <div className="space-y-6">
                    {/* Hero Section Config */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase text-white/50 tracking-wider">Cabecera Principal</h3>
                        <div className="space-y-2">
                            <label className="text-xs text-white/70">Título Principal</label>
                            <input
                                type="text"
                                value={formData.heroHeadline}
                                onChange={(e) => handleChange("heroHeadline", e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-pink-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-white/70">Subtítulo</label>
                            <textarea
                                value={formData.heroSubline}
                                onChange={(e) => handleChange("heroSubline", e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-pink-500 transition-colors h-24 resize-none"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/10 w-full" />

                    {/* Dynamic Offers Config */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase text-white/50 tracking-wider">Ofertas Detectadas ({formData.offers.length})</h3>
                        <div className="grid gap-4">
                            {formData.offers.map((offer, idx) => (
                                <div key={idx} className="bg-white/5 rounded-xl p-4 flex gap-4 border border-white/5">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-xs text-white/70">Nombre del Producto</label>
                                        <input
                                            type="text"
                                            value={offer.title}
                                            onChange={(e) => handleOfferChange(idx, "title", e.target.value)}
                                            className="w-full bg-black/20 border-0 rounded-lg p-2 text-sm text-white"
                                        />
                                    </div>
                                    <div className="w-24 space-y-2">
                                        <label className="text-xs text-white/70">Precio</label>
                                        <input
                                            type="text"
                                            value={offer.price}
                                            onChange={(e) => handleOfferChange(idx, "price", e.target.value)}
                                            className="w-full bg-black/20 border-0 rounded-lg p-2 text-sm text-white font-mono text-center"
                                            style={{ color: primaryColor }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-2 mt-8"
                >
                    <CheckCircle className="w-5 h-5" />
                    Confirmar y Desplegar
                </button>
            </GlassCard>

            {/* Preview Section (Mini) */}
            <div className="hidden lg:block w-80 sticky top-8">
                <div className="bg-black/40 rounded-3xl p-6 border border-white/10 text-center">
                    <h3 className="text-white font-bold mb-4">Vista Previa Live</h3>
                    <p className="text-white/50 text-sm mb-4">Los cambios se reflejan en tiempo real en la versión final.</p>
                    <div className="w-full aspect-[9/16] bg-gray-900 rounded-2xl overflow-hidden relative">
                        {/* Simplified Preview Render */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                            <h1 className="font-bold text-white mb-2" style={{ fontFamily: brandDNA.typography === 'Modern' ? 'sans-serif' : 'serif' }}>
                                {formData.heroHeadline}
                            </h1>
                            <p className="text-xs text-white/60">{formData.heroSubline}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
