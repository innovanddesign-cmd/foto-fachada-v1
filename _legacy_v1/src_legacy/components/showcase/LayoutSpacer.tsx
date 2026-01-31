import { motion } from 'framer-motion';

export function LayoutSpacer({ content, variants }: { content: Record<string, string>, variants: any }) {
    const height = content.altura === 'grande' ? 'h-12' : 'h-6';
    return <motion.div variants={variants} className={`w-full ${height}`} />;
}
