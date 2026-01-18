import { motion } from 'framer-motion';
import type { BrandIdentity2026 } from '../../types';

interface ComponentProps {
    content: Record<string, string>;
    brandIdentity: BrandIdentity2026;
    variants: any;
}

export function GalleryMasonry({ content, brandIdentity, variants }: ComponentProps) {
    const images = content.imagenes ? content.imagenes.split(',') : [
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80',
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
        'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=400&q=80'
    ];

    return (
        <motion.div variants={variants} className="w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-3 px-1">
                {content.titulo_galeria || 'Galería'}
            </h3>
            <div className="columns-2 gap-3 space-y-3">
                {images.map((img, i) => (
                    <motion.div
                        key={i}
                        className="break-inside-avoid rounded-[20px] overflow-hidden shadow-sm border"
                        style={{ borderColor: i === 0 ? brandIdentity.palette.color_acento : 'transparent' }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <img src={img.trim()} alt="Gallery item" className="w-full h-auto object-cover block" />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
