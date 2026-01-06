import { X, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Button } from './ui/Button';
import './UpgradeModal.css'; // Reusing modal styles

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { theme, setTheme } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay animate-fadeIn">
            <div className="modal-content animate-scaleIn" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2 className="text-xl font-bold">Configuración</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X size={20} />
                    </Button>
                </div>

                <div className="p-6">
                    <section className="mb-6">
                        <h3 className="text-sm font-semibold text-secondary mb-4 uppercase tracking-wider">Apariencia</h3>
                        <div className="grid grid-cols-3 gap-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === 'light'
                                    ? 'border-primary-500 bg-primary-50 text-primary'
                                    : 'border-border bg-bg-tertiary text-secondary hover:border-gray-400'
                                    }`}
                                onClick={() => setTheme('light')}
                                style={{
                                    border: theme === 'light' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    background: theme === 'light' ? 'var(--color-bg-tertiary)' : 'var(--color-bg)',
                                    opacity: theme === 'light' ? 1 : 0.7
                                }}
                            >
                                <Sun size={24} />
                                <span className="font-medium">Claro</span>
                            </button>

                            <button
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === 'dark'
                                    ? 'border-primary-500 bg-primary-900 text-white'
                                    : 'border-border bg-bg-tertiary text-secondary hover:border-gray-400'
                                    }`}
                                onClick={() => setTheme('dark')}
                                style={{
                                    border: theme === 'dark' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    background: theme === 'dark' ? 'var(--color-bg-tertiary)' : 'var(--color-bg)',
                                    opacity: theme === 'dark' ? 1 : 0.7
                                }}
                            >
                                <Moon size={24} />
                                <span className="font-medium">Oscuro</span>
                            </button>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3 mt-8">
                        <Button variant="primary" onClick={onClose}>
                            Listo
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
