/**
 * Sidebar Navigation Component
 * =============================
 * Pro navigation with active state highlighting
 */
import {
    LayoutDashboard,
    Megaphone,
    Globe,
    Lightbulb,
    FileImage,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
    isCollapsed?: boolean;
    onToggle?: () => void;
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
}

export function Sidebar({ currentView, onNavigate, isCollapsed = false, onToggle }: SidebarProps) {
    const { t } = useTranslation();
    const [collapsed, setCollapsed] = useState(isCollapsed);

    const navItems: NavItem[] = [
        { id: 'dashboard', label: t('nav.dashboard', 'Dashboard'), icon: <LayoutDashboard size={20} /> },
        { id: 'campaigns', label: t('nav.campaigns', 'Campañas'), icon: <Megaphone size={20} /> },
        { id: 'landings', label: t('nav.landings', 'Landings'), icon: <Globe size={20} /> },
        { id: 'strategies', label: t('nav.strategies', 'Estrategias'), icon: <Lightbulb size={20} /> },
        { id: 'posters', label: t('nav.posters', 'Carteles'), icon: <FileImage size={20} /> },
    ];

    const handleToggle = () => {
        setCollapsed(!collapsed);
        onToggle?.();
    };

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="sidebar-header">
                {!collapsed && <span className="sidebar-logo">Foto Fachada</span>}
                <button className="sidebar-toggle" onClick={handleToggle}>
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        className={`sidebar-item ${currentView === item.id ? 'active' : ''}`}
                        onClick={() => onNavigate(item.id)}
                        title={collapsed ? item.label : undefined}
                    >
                        <span className="sidebar-item-icon">{item.icon}</span>
                        {!collapsed && (
                            <>
                                <span className="sidebar-item-label">{item.label}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="sidebar-item-badge">{item.badge}</span>
                                )}
                            </>
                        )}
                    </button>
                ))}
            </nav>

            <style>{`
                .sidebar {
                    width: 240px;
                    background: var(--bg-surface, rgba(0,0,0,0.3));
                    border-right: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    flex-direction: column;
                    transition: width 0.2s ease;
                    height: 100vh;
                    position: fixed;
                    left: 0;
                    top: 0;
                    z-index: 40;
                }
                
                .sidebar-collapsed {
                    width: 64px;
                }
                
                .sidebar-header {
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    min-height: 64px;
                }
                
                .sidebar-logo {
                    font-weight: 700;
                    font-size: 1.1rem;
                    background: linear-gradient(135deg, var(--primary, #6366f1), #8b5cf6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .sidebar-toggle {
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 6px;
                    padding: 0.5rem;
                    cursor: pointer;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                }
                
                .sidebar-toggle:hover {
                    background: rgba(255,255,255,0.15);
                    color: var(--text-primary);
                }
                
                .sidebar-nav {
                    flex: 1;
                    padding: 1rem 0.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                
                .sidebar-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary, rgba(255,255,255,0.7));
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    width: 100%;
                    text-align: left;
                }
                
                .sidebar-collapsed .sidebar-item {
                    justify-content: center;
                    padding: 0.75rem;
                }
                
                .sidebar-item:hover {
                    background: rgba(255,255,255,0.08);
                    color: var(--text-primary, #fff);
                }
                
                .sidebar-item.active {
                    background: var(--primary, #6366f1);
                    color: #fff;
                    font-weight: 500;
                }
                
                .sidebar-item-icon {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .sidebar-item-label {
                    flex: 1;
                    font-size: 0.9rem;
                }
                
                .sidebar-item-badge {
                    background: var(--accent, #f472b6);
                    color: #fff;
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 0.15rem 0.5rem;
                    border-radius: 10px;
                }
                
                @media (max-width: 768px) {
                    .sidebar {
                        width: 64px;
                    }
                    .sidebar-logo,
                    .sidebar-item-label,
                    .sidebar-item-badge {
                        display: none;
                    }
                    .sidebar-toggle {
                        display: none;
                    }
                    .sidebar-item {
                        justify-content: center;
                    }
                }
            `}</style>
        </aside>
    );
}
