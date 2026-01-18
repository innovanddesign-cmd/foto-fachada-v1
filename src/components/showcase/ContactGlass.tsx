import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import type { BrandIdentity2026 } from '../../types';

interface ComponentProps {
    content: Record<string, string>;
    brandIdentity: BrandIdentity2026;
    variants: any;
}

export function ContactGlass({ content, brandIdentity, variants }: ComponentProps) {
    return (
        <motion.div
            variants={variants}
            className="w-full p-6 rounded-[32px] bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg"
        >
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Contáctanos</h3>

            <div className="flex justify-around items-center">
                {content.whatsapp && (
                    <motion.a
                        whileTap={{ scale: 0.9 }}
                        href={`https://wa.me/${content.whatsapp.replace(/\D/g, '')}`}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-opacity shadow-sm"
                            style={{ backgroundColor: brandIdentity.palette.color_acento }}
                        >
                            <MessageCircle size={24} />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">WhatsApp</span>
                    </motion.a>
                )}

                {content.telefono && (
                    <motion.a
                        whileTap={{ scale: 0.9 }}
                        href={`tel:${content.telefono}`}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-opacity shadow-sm"
                            style={{ backgroundColor: brandIdentity.palette.color_principal }}
                        >
                            <Phone size={24} />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">Llamar</span>
                    </motion.a>
                )}

                {content.email && (
                    <motion.a
                        whileTap={{ scale: 0.9 }}
                        href={`mailto:${content.email}`}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-gray-200 transition-colors">
                            <Mail size={24} />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">Email</span>
                    </motion.a>
                )}
            </div>
        </motion.div>
    );
}
