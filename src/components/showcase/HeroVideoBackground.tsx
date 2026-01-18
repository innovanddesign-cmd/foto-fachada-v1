import { motion } from 'framer-motion';
import type { BrandIdentity2026 } from '../../types';

interface ComponentProps {
    content: Record<string, string>;
    brandIdentity: BrandIdentity2026;
    variants: any;
}

export function HeroVideoBackground({ content, brandIdentity, variants }: ComponentProps) {
    return (
        <motion.div
            className="relative w-full h-[400px] overflow-hidden rounded-[40px] shadow-lg isolate"
            variants={variants}
        >
            {/* Background Image/Video Placeholder */}
            <div
                className="absolute inset-0 bg-cover bg-center z-[-1]"
                style={{
                    backgroundImage: `url(${content.imagen_fondo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'})`,
                    filter: 'brightness(0.7)'
                }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-[-1]" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col items-start gap-4">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium text-white border border-white/10 uppercase tracking-wider">
                    {brandIdentity.vibe.replace('-', ' ')}
                </span>

                <h1 className="text-4xl font-bold text-white leading-tight drop-shadow-lg">
                    {content.titulo_hero || 'Bienvenido'}
                </h1>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="mt-2 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/30 rounded-full text-white font-semibold shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                    style={{ backgroundColor: brandIdentity.palette.color_acento }}
                >
                    {content.texto_cta || 'Descubre Más'}
                </motion.button>
            </div>
        </motion.div>
    );
}
