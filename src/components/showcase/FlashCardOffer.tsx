import { motion } from 'framer-motion';
import { Tag, Clock } from 'lucide-react';
import type { BrandIdentity2026 } from '../../types';

interface ComponentProps {
    content: Record<string, string>;
    brandIdentity: BrandIdentity2026;
    variants: any;
}

export function FlashCardOffer({ content, brandIdentity, variants }: ComponentProps) {
    return (
        <motion.div
            className="relative w-full p-6 rounded-[32px] border border-white/50 backdrop-blur-xl shadow-xl overflow-hidden"
            variants={variants}
            style={{ backgroundColor: brandIdentity.palette.color_superficie }}
        >
            <div className="flex justify-between items-start mb-4">
                <div
                    className="px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1"
                    style={{ backgroundColor: brandIdentity.palette.color_acento }}
                >
                    <Tag size={12} /> FLASH OFFER
                </div>
                {content.tiempo_limite && (
                    <div className="text-xs font-medium text-gray-500 flex items-center gap-1 opacity-70">
                        <Clock size={12} /> {content.tiempo_limite}
                    </div>
                )}
            </div>

            <div className="flex gap-4 items-center">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                        {content.nombre_oferta || 'Oferta Especial'}
                    </h3>
                    <div
                        className="text-2xl font-black"
                        style={{ color: brandIdentity.palette.color_principal }}
                    >
                        {content.descuento || '-20%'}
                    </div>
                </div>
                {content.imagen_oferta && (
                    <div className="w-20 h-20 rounded-2xl bg-gray-200 bg-cover bg-center shrink-0 shadow-inner" style={{ backgroundImage: `url(${content.imagen_oferta})` }} />
                )}
            </div>
        </motion.div>
    );
}
