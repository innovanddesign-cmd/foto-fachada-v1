/**
 * Live Preview Component
 * =======================
 * Renders the AI-generated code in a sandboxed iframe
 */
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import './LivePreview.css';

interface LivePreviewProps {
    codeTemplate: string;
    values: Record<string, any>;
    title?: string;
}

export function LivePreview({ codeTemplate, values, title }: LivePreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [loading, setLoading] = useState(true);

    // Function to inject values into template
    const injectValues = (template: string, data: Record<string, any>) => {
        let code = template;
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            // Escape HTML characters to prevent XSS if we were not in a sandbox
            // But since we are rendering user config into a template, basic replacement is fine for now
            // For production, maybe sanitize inputs.
            const value = data[key] || '';
            code = code.replace(regex, value);
        });

        // Remove unused variables
        code = code.replace(/{{.*?}}/g, '');

        return code;
    };

    useEffect(() => {
        if (iframeRef.current && codeTemplate) {
            setLoading(true);
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                const finalCode = injectValues(codeTemplate, values);

                // Add Tailwind via CDN for styling
                const html = `
                    <!DOCTYPE html>
                    <html lang="es">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <script src="https://cdn.tailwindcss.com"></script>
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
                        <style>
                            body { font-family: 'Inter', sans-serif; margin: 0; padding: 1rem; background: transparent; }
                            /* Hide scrollbar */
                            ::-webkit-scrollbar { width: 0px; background: transparent; }
                        </style>
                    </head>
                    <body>
                        ${finalCode}
                    </body>
                    </html>
                `;

                doc.open();
                doc.write(html);
                doc.close();
                setLoading(false);
            }
        }
    }, [codeTemplate, values]);

    return (
        <div className="live-preview-container">
            <div className="preview-header">
                <h3>{title || 'Vista Previa'}</h3>
                {loading && <Loader2 size={16} className="animate-spin text-indigo-400" />}
            </div>
            <div className="iframe-wrapper">
                <iframe
                    ref={iframeRef}
                    title="Widget Live Preview"
                    sandbox="allow-scripts allow-popups allow-same-origin"
                    className="preview-iframe"
                />
            </div>
            <div className="preview-footer">
                <p>Este es una simulación de cómo se verá el widget en el móvil del cliente.</p>
            </div>
        </div>
    );
}
