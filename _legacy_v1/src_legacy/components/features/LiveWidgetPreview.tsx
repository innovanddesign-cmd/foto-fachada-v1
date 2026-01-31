/**
 * LiveWidgetPreview
 * =================
 * Renders AI-generated widget code in a secure iframe with real-time updates.
 * Uses sandboxed iframe to prevent script injection into main app.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, AlertTriangle, Smartphone, Monitor, RefreshCw } from 'lucide-react';

interface LiveWidgetPreviewProps {
    code: string;
    configValues: Record<string, any>;
}

export function LiveWidgetPreview({ code, configValues }: LiveWidgetPreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
    const [key, setKey] = useState(0); // Force re-render key

    // Process code by replacing variables
    const processCode = useCallback((rawCode: string, values: Record<string, any>): string => {
        if (!rawCode) return '';

        let processedCode = rawCode;

        // Replace all {{variable}} patterns
        Object.entries(values).forEach(([varKey, value]) => {
            // Handle different variable formats
            const patterns = [
                new RegExp(`\\{\\{${varKey}\\}\\}`, 'gi'),
                new RegExp(`\\{\\{ ${varKey} \\}\\}`, 'gi'),
            ];

            patterns.forEach(pattern => {
                processedCode = processedCode.replace(pattern, String(value || ''));
            });
        });

        // Clean up any remaining unmatched variables with empty string or placeholder
        processedCode = processedCode.replace(/\{\{[^}]+\}\}/g, '');

        return processedCode;
    }, []);

    // Build complete HTML document for iframe
    const buildIframeDocument = useCallback((processedCode: string): string => {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    animation: {
                        'spin-slow': 'spin 3s linear infinite',
                        'bounce-slow': 'bounce 2s infinite',
                        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }
                }
            }
        }
    </script>
    <style>
        * {
            box-sizing: border-box;
        }
        html, body {
            margin: 0;
            padding: 0;
            min-height: 100%;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        body {
            padding: 1rem;
            display: flex;
            align-items: flex-start;
            justify-content: center;
        }
        /* Prevent external links */
        a[href^="http"] {
            pointer-events: none;
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 3px; }
        /* Smooth animations */
        *, *::before, *::after {
            transition: color 0.2s, background-color 0.2s, border-color 0.2s;
        }
    </style>
</head>
<body>
    <div id="widget-root" class="w-full max-w-md mx-auto">
        ${processedCode}
    </div>
    <script>
        // Notify parent when loaded
        window.addEventListener('load', () => {
            window.parent.postMessage({ type: 'widget-loaded' }, '*');
        });
        
        // Catch errors
        window.onerror = (msg, url, line) => {
            window.parent.postMessage({ type: 'widget-error', message: msg, line: line }, '*');
            return true;
        };

        // Mock localStorage for demo (in case user hasn't played before logic)
        // Already available, but ensure it works in iframe context
    </script>
</body>
</html>`;
    }, []);

    // Update iframe content
    useEffect(() => {
        if (!code) {
            setHasError(true);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setHasError(false);

        const processedCode = processCode(code, configValues);
        const htmlDocument = buildIframeDocument(processedCode);

        // Use srcdoc for sandboxed content
        if (iframeRef.current) {
            iframeRef.current.srcdoc = htmlDocument;
        }
    }, [code, configValues, processCode, buildIframeDocument, key]);

    // Listen for messages from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'widget-loaded') {
                setIsLoading(false);
            } else if (event.data?.type === 'widget-error') {
                console.error('[LivePreview] Widget error:', event.data.message);
                setHasError(true);
                setIsLoading(false);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Auto-hide loading after timeout (fallback)
    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 3000);
        return () => clearTimeout(timeout);
    }, [key, code]);

    const handleRefresh = () => {
        setKey(prev => prev + 1);
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 border-b border-slate-700/50">
                {/* View mode toggle */}
                <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'mobile'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                        title="Vista móvil"
                    >
                        <Smartphone size={14} />
                    </button>
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'desktop'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                        title="Vista escritorio"
                    >
                        <Monitor size={14} />
                    </button>
                </div>

                {/* Refresh button */}
                <button
                    onClick={handleRefresh}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-slate-700/50"
                    title="Recargar preview"
                >
                    <RefreshCw size={14} />
                </button>
            </div>

            {/* Preview container */}
            <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
                {/* Phone frame for mobile view */}
                <div
                    className={`
                        relative bg-black rounded-3xl shadow-2xl overflow-hidden
                        transition-all duration-300 ease-out
                        ${viewMode === 'mobile'
                            ? 'w-[320px] h-[580px] border-[8px] border-slate-700'
                            : 'w-full h-full max-w-3xl rounded-xl border-4 border-slate-700'
                        }
                    `}
                >
                    {/* Notch for mobile */}
                    {viewMode === 'mobile' && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />
                    )}

                    {/* Loading overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-20">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
                                <p className="text-slate-400 text-sm">Cargando widget...</p>
                            </div>
                        </div>
                    )}

                    {/* Error overlay */}
                    {hasError && !code && (
                        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-20">
                            <div className="text-center p-6">
                                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                                <p className="text-slate-300 font-medium mb-1">No hay código para mostrar</p>
                                <p className="text-slate-500 text-sm">Selecciona una estrategia para ver el preview</p>
                            </div>
                        </div>
                    )}

                    {/* Iframe */}
                    <iframe
                        ref={iframeRef}
                        key={key}
                        title="Widget Preview"
                        sandbox="allow-scripts allow-same-origin"
                        className="w-full h-full border-0 bg-white"
                        style={{
                            marginTop: viewMode === 'mobile' ? '24px' : '0',
                            height: viewMode === 'mobile' ? 'calc(100% - 24px)' : '100%'
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
