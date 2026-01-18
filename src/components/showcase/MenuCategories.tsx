import { motion } from 'framer-motion';
import type { BrandIdentity2026 } from '../../types';

interface ComponentProps {
    content: Record<string, string>;
    brandIdentity: BrandIdentity2026;
    variants: any;
}

export function MenuCategories({ content, brandIdentity, variants }: ComponentProps) {
    // Parse list if it comes as string
    const categories = typeof content.categorias === 'string'
        ? content.categorias.split(',').map(c => c.trim())
        : ['Populares', 'Novedades', 'Ofertas'];

    return (
        <motion.div variants={variants} className="w-full">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 px-2 uppercase tracking-wider">
                Explorar Carta
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x scrollbar-hide px-1">
                {categories.map((cat, i) => (
                    <motion.button
                        key={i}
                        whileTap={{ scale: 0.9 }}
                        className="snap-start shrink-0 px-6 py-3 rounded-[20px] backdrop-blur-md border shadow-sm text-gray-800 font-medium whitespace-nowrap transition-colors"
                        style={{
                            backgroundColor: i === 0 ? brandIdentity.palette.color_acento : 'rgba(255,255,255,0.4)',
                            borderColor: 'rgba(255,255,255,0.4)',
                            color: i === 0 ? '#fff' : '#1f2937'
                        }}
                    >
                        {cat}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}
