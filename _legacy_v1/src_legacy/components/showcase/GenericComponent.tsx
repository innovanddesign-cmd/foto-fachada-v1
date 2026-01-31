import { motion } from 'framer-motion';
import type { BrandIdentity2026 } from '../../types';

interface ComponentProps {
    type: string;
    content: Record<string, string>;
    brandIdentity: BrandIdentity2026;
    variants: any;
}

export function GenericComponent({ type, content, brandIdentity, variants }: ComponentProps) {
    return (
        <motion.div
            variants={variants}
            className="w-full p-6 rounded-[24px] bg-white/30 backdrop-blur-md border"
            style={{ borderColor: brandIdentity.palette.color_acento }}
        >
            <div className="flex items-center gap-2 mb-2 opacity-75">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: brandIdentity.palette.color_principal }}
                />
                <span className="text-xs font-mono uppercase tracking-widest">{type}</span>
            </div>

            {Object.entries(content).map(([key, value]) => (
                <div key={key} className="mb-2 last:mb-0">
                    <span className="text-xs text-gray-500 block capitalize">{key.replace(/_/g, ' ')}</span>
                    <p className="text-gray-900 font-medium">{value}</p>
                </div>
            ))}
        </motion.div>
    );
}
