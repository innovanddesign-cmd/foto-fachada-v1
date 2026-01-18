import { motion } from 'framer-motion';
import type { UISchema, UIComponent, BrandIdentity2026 } from '../../types';

// Component Imports (Placeholders for now, will implement next)
import { HeroVideoBackground } from './HeroVideoBackground';
import { HeroGradient } from './HeroGradient';
import { FlashCardOffer } from './FlashCardOffer';
import { MenuCategories } from './MenuCategories';
import { ContactGlass } from './ContactGlass';
import { GenericComponent } from './GenericComponent';
import { GalleryMasonry } from './GalleryMasonry';
import { LayoutSpacer } from './LayoutSpacer';

interface ShowcaseEngineProps {
    schema: UISchema;
    brandIdentity: BrandIdentity2026;
}

// Staggered Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 260, damping: 20 }
    }
};

export function ShowcaseEngine({ schema, brandIdentity }: ShowcaseEngineProps) {

    // Mapeo de componentes basado en type
    const renderComponent = (component: UIComponent) => {
        const props = {
            key: component.id,
            content: component.content,
            brandIdentity,
            variants: itemVariants
        };

        switch (component.type) {
            case 'HeroVideoBackground':
                return <HeroVideoBackground {...props} />;
            case 'HeroGradient':
                return <HeroGradient {...props} />;
            case 'FlashCard_Offer':
                return <FlashCardOffer {...props} />;
            case 'Menu_Categories':
                return <MenuCategories {...props} />;
            case 'Contact_Glass':
                return <ContactGlass {...props} />;
            case 'Gallery_Masonry':
            case 'Instagram_Feed_Style': // Reutilizamos masonry para feed
                return <GalleryMasonry {...props} />;
            case 'Spacer':
                return <LayoutSpacer {...props} />;
            // Añadir más mapeos aquí...
            default:
                return <GenericComponent {...props} type={component.type} />;
        }
    };

    return (
        <motion.div
            className="w-full min-h-full pb-20 px-4 pt-12 flex flex-col gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{
                fontFamily: `'${brandIdentity.fonts.body}', sans-serif`
            }}
        >
            {/* Global Styles Injection for Fonts */}
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=${brandIdentity.fonts.headline.replace(' ', '+')}:wght@400;700&family=${brandIdentity.fonts.body.replace(' ', '+')}:wght@300;400;600&display=swap');
                    h1, h2, h3, h4, .font-headline { font-family: '${brandIdentity.fonts.headline}', sans-serif; }
                `}
            </style>

            {schema.escaparate_structure.map(renderComponent)}
        </motion.div>
    );
}
