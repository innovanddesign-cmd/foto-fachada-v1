/**
 * Widget Page Viewer
 * Serves generated widget pages from localStorage
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getWidgetPageBySlug, getWidgetPages } from '../../services/widgetPageGenerator';
import type { GeneratedWidgetPage } from '../../services/widgetPageGenerator';

export const WidgetPageViewer = () => {
    const { slug } = useParams<{ slug: string }>();
    const [html, setHtml] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            setError('No widget specified');
            return;
        }

        // Try to find widget by slug
        const page = getWidgetPageBySlug(slug);

        if (page) {
            setHtml(page.htmlContent);
        } else {
            // Try fuzzy match
            const allPages = getWidgetPages();
            const fuzzyMatch = allPages.find((p: GeneratedWidgetPage) =>
                p.slug.includes(slug) || slug.includes(p.slug)
            );

            if (fuzzyMatch) {
                setHtml(fuzzyMatch.htmlContent);
            } else {
                setError(`Widget "${slug}" not found. Please generate widgets first.`);
            }
        }
    }, [slug]);

    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '20px',
                textAlign: 'center'
            }}>
                <div>
                    <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Widget No Encontrado</h2>
                    <p style={{ opacity: 0.8, marginBottom: '30px' }}>{error}</p>
                    <a
                        href="/"
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            background: 'white',
                            color: '#667eea',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        Volver al inicio
                    </a>
                </div>
            </div>
        );
    }

    if (!html) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0f172a',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{
                        width: '60px',
                        height: '60px',
                        border: '4px solid rgba(255,255,255,0.1)',
                        borderTop: '4px solid #6366f1',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }} />
                    <p>Cargando widget...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Render the widget HTML in an iframe for isolation
    return (
        <iframe
            srcDoc={html}
            style={{
                width: '100vw',
                height: '100vh',
                border: 'none',
                margin: 0,
                padding: 0
            }}
            title="Widget Page"
        />
    );
};

export default WidgetPageViewer;
