import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://escaparates.innovandesign.com';

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...['inmobiliarias','estetica','peluquerias','barberias'].map(sector=>({url:baseUrl+'/'+sector,changeFrequency:'weekly' as const,priority:0.9})),
    ];
}
