/**
 * Landing Preview Modal
 * ======================
 * Quick preview of landing without leaving dashboard
 */
import { useState } from 'react';
import { X, ExternalLink, Monitor, Smartphone, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { getLandingPreviewUrl } from '../../services/campaignActionsService';
import type { Project } from '../../types';

interface LandingPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
}

export function LandingPreviewModal({ isOpen, onClose, project }: LandingPreviewModalProps) {
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');
    const [isLoading, setIsLoading] = useState(true);

    if (!isOpen || !project) return null;

    const previewUrl = getLandingPreviewUrl(project.id);

    const handleOpenExternal = () => {
        window.open(previewUrl, '_blank');
    };

    const handleRefresh = () => {
        setIsLoading(true);
        // Force iframe refresh
        const iframe = document.querySelector('.preview-iframe') as HTMLIFrameElement;
        if (iframe) {
            iframe.src = iframe.src;
        }
    };

    return (
        <div className="preview-modal-overlay" onClick={onClose}>
            <div className="preview-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="preview-header">
                    <div className="preview-title">
                        <h2>Vista previa: {project.name}</h2>
                    </div>

                    <div className="preview-controls">
                        <div className="view-toggle">
                            <button
                                className={viewMode === 'mobile' ? 'active' : ''}
                                onClick={() => setViewMode('mobile')}
                                title="Vista móvil"
                            >
                                <Smartphone size={18} />
                            </button>
                            <button
                                className={viewMode === 'desktop' ? 'active' : ''}
                                onClick={() => setViewMode('desktop')}
                                title="Vista escritorio"
                            >
                                <Monitor size={18} />
                            </button>
                        </div>

                        <button className="control-btn" onClick={handleRefresh} title="Recargar">
                            <RefreshCw size={18} />
                        </button>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleOpenExternal}
                            rightIcon={<ExternalLink size={14} />}
                        >
                            Abrir
                        </Button>

                        <button className="close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Preview Frame */}
                <div className={`preview-container ${viewMode}`}>
                    {viewMode === 'mobile' && (
                        <div className="phone-frame">
                            <div className="phone-notch"></div>
                            <div className="phone-screen">
                                {isLoading && (
                                    <div className="preview-loading">
                                        <div className="spinner"></div>
                                        <p>Cargando vista previa...</p>
                                    </div>
                                )}
                                <iframe
                                    className="preview-iframe"
                                    src={previewUrl}
                                    title="Landing Preview"
                                    onLoad={() => setIsLoading(false)}
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            </div>
                        </div>
                    )}

                    {viewMode === 'desktop' && (
                        <div className="desktop-frame">
                            {isLoading && (
                                <div className="preview-loading">
                                    <div className="spinner"></div>
                                    <p>Cargando vista previa...</p>
                                </div>
                            )}
                            <iframe
                                className="preview-iframe"
                                src={previewUrl}
                                title="Landing Preview"
                                onLoad={() => setIsLoading(false)}
                                sandbox="allow-scripts allow-same-origin"
                            />
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .preview-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                    animation: fadeIn 0.2s ease;
                }
                
                .preview-modal {
                    background: var(--bg-primary, #1a1a1a);
                    border-radius: 16px;
                    width: 100%;
                    max-width: 900px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: scaleIn 0.2s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                
                .preview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                
                .preview-title h2 {
                    font-size: 1rem;
                    margin: 0;
                }
                
                .preview-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .view-toggle {
                    display: flex;
                    background: rgba(255,255,255,0.05);
                    border-radius: 8px;
                    padding: 4px;
                }
                
                .view-toggle button {
                    padding: 0.5rem;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .view-toggle button.active {
                    background: var(--primary);
                    color: #fff;
                }
                
                .control-btn {
                    padding: 0.5rem;
                    background: rgba(255,255,255,0.05);
                    border: none;
                    color: var(--text-secondary);
                    border-radius: 8px;
                    cursor: pointer;
                }
                
                .control-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: var(--text-primary);
                }
                
                .close-btn {
                    padding: 0.5rem;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                }
                
                .close-btn:hover {
                    color: var(--text-primary);
                }
                
                .preview-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: rgba(0,0,0,0.3);
                    overflow: auto;
                }
                
                .phone-frame {
                    width: 320px;
                    height: 650px;
                    background: #000;
                    border-radius: 40px;
                    padding: 12px;
                    position: relative;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                }
                
                .phone-notch {
                    position: absolute;
                    top: 12px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100px;
                    height: 24px;
                    background: #000;
                    border-radius: 0 0 16px 16px;
                    z-index: 10;
                }
                
                .phone-screen {
                    width: 100%;
                    height: 100%;
                    background: #fff;
                    border-radius: 30px;
                    overflow: hidden;
                    position: relative;
                }
                
                .desktop-frame {
                    width: 100%;
                    max-width: 800px;
                    height: 500px;
                    background: #fff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    position: relative;
                }
                
                .preview-iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                
                .preview-loading {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.9);
                    z-index: 5;
                }
                
                .spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid rgba(0,0,0,0.1);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .preview-loading p {
                    color: #333;
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
}
