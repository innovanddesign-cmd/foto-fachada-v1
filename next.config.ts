import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    // Excluir carpetas legacy de la compilación
    webpack: (config, { isServer }) => {
        // Ignorar carpetas legacy
        config.module.rules.push({
            test: /\.(ts|tsx|js|jsx)$/,
            exclude: [
                path.resolve(__dirname, '_legacy_v1'),
                path.resolve(__dirname, 'src-backup-v3'),
                path.resolve(__dirname, 'foto-fachada-v2'),
                path.resolve(__dirname, 'foto-fachada-v3'),
            ],
        });
        return config;
    },
    // Excluir páginas legacy
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;
