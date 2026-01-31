import { motion } from 'framer-motion';
import type { BrandIdentity2026 } from '../../types';

interface ComponentProps {
    content: Record<string, string>;
    brandIdentity: BrandIdentity2026;
    variants: any;
}

export function HeroGradient({ content, brandIdentity, variants }: ComponentProps) {
    return (
        <motion.div
            className="relative w-full min-h-[320px] rounded-[40px] p-8 flex flex-col justify-center items-center text-center gap-6 overflow-hidden shadow-lg"
            variants={variants}
            style={{ background: brandIdentity.palette.gradiente_sugerido }}
        >
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

            <div className="relative z-10 flex flex-col gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-3xl shadow-inner border border-white/20">
                    ✨
                </div>

                <h1 className="text-3xl font-bold text-white drop-shadow-md">
                    {content.titulo_hero || 'Experiencia Única'}
                </h1>

                <p className="text-lg text-white/90 font-light max-w-[280px]">
                    {content.subtitulo || 'Descubre lo que hemos preparado para ti.'}
                </p>
            </div>
        </motion.div>
    );
}
