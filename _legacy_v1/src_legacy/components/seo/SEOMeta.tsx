/**
 * SEO Meta Tags Component
 * ========================
 * Dynamic OpenGraph and meta tags for landings
 */
import { useEffect } from 'react';

interface SEOMetaProps {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    siteName?: string;
    locale?: string;
    twitterCard?: 'summary' | 'summary_large_image';

    // Business-specific
    businessName?: string;
    businessType?: string;
    phone?: string;
    address?: string;
}

/**
 * Hook to set document meta tags dynamically
 */
export function useSEOMeta(props: SEOMetaProps) {
    useEffect(() => {
        const {
            title,
            description,
            image,
            url = window.location.href,
            type = 'website',
            siteName = 'Foto Fachada',
            locale = 'es_ES',
            twitterCard = 'summary_large_image',
            businessName,
            businessType,
            phone,
            address
        } = props;

        // Update document title
        document.title = title;

        // Helper to set/update meta tag
        const setMeta = (name: string, content: string, isProperty = false) => {
            const attr = isProperty ? 'property' : 'name';
            let meta = document.querySelector(`meta[${attr}="${name}"]`);

            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attr, name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        // Basic meta tags
        setMeta('description', description);
        setMeta('robots', 'index, follow');

        // Open Graph
        setMeta('og:title', title, true);
        setMeta('og:description', description, true);
        setMeta('og:type', type, true);
        setMeta('og:url', url, true);
        setMeta('og:site_name', siteName, true);
        setMeta('og:locale', locale, true);

        if (image) {
            setMeta('og:image', image, true);
            setMeta('og:image:width', '1200', true);
            setMeta('og:image:height', '630', true);
            setMeta('og:image:alt', title, true);
        }

        // Twitter Card
        setMeta('twitter:card', twitterCard);
        setMeta('twitter:title', title);
        setMeta('twitter:description', description);
        if (image) {
            setMeta('twitter:image', image);
        }

        // Business Schema (JSON-LD)
        if (businessName) {
            const existingSchema = document.querySelector('script[type="application/ld+json"]');
            if (existingSchema) {
                existingSchema.remove();
            }

            const schemaScript = document.createElement('script');
            schemaScript.type = 'application/ld+json';

            const schema = {
                '@context': 'https://schema.org',
                '@type': 'LocalBusiness',
                name: businessName,
                description: description,
                url: url,
                ...(businessType && { '@type': businessType }),
                ...(image && { image: image }),
                ...(phone && { telephone: phone }),
                ...(address && {
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: address
                    }
                })
            };

            schemaScript.textContent = JSON.stringify(schema);
            document.head.appendChild(schemaScript);
        }

        // Cleanup function
        return () => {
            // Reset title if needed
            document.title = 'Foto Fachada';
        };
    }, [props]);
}

/**
 * SEO Meta Component (for declarative usage)
 */
export function SEOMeta(props: SEOMetaProps) {
    useSEOMeta(props);
    return null;
}

/**
 * Pre-built landing page SEO configuration
 */
export function generateLandingSEO(config: {
    businessName: string;
    businessType: string;
    description?: string;
    landingUrl: string;
    imageUrl?: string;
    phone?: string;
    address?: string;
}): SEOMetaProps {
    const {
        businessName,
        businessType,
        description,
        landingUrl,
        imageUrl,
        phone,
        address
    } = config;

    return {
        title: `${businessName} | ${businessType}`,
        description: description || `Descubre ${businessName}, tu ${businessType.toLowerCase()} de confianza. Ofertas exclusivas y promociones especiales.`,
        url: landingUrl,
        image: imageUrl,
        type: 'website',
        siteName: businessName,
        locale: 'es_ES',
        twitterCard: 'summary_large_image',
        businessName,
        businessType,
        phone,
        address
    };
}
