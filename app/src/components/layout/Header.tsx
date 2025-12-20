import { Menu, X, Sparkles, Crown, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import './Header.css';

interface HeaderProps {
    onNavigate: (view: string) => void;
    onShowPricing?: () => void;
    currentView: string;
    onLogin: () => void;
    user?: any; // User from store
}

interface HeaderProps {
    onNavigate: (view: string) => void;
    onShowPricing?: () => void;
    currentView: string;
    onLogin: () => void;
    user?: any; // User from store
}

export function Header({ onNavigate, onShowPricing, currentView, onLogin }: HeaderProps) {
    const { userTier, user, signOut } = useAppStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'pricing', label: 'Planes' },
    ];

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <div className="header-left">
                    <button
                        className="header-logo"
                        onClick={() => onNavigate('dashboard')}
                    >
                        <div className="logo-icon">
                            <Sparkles size={20} />
                        </div>
                        <span className="logo-text">Foto Fachada</span>
                    </button>

                    {/* Desktop Nav */}
                    <nav className="header-nav desktop-only">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                                onClick={() => item.id === 'pricing' ? onShowPricing?.() : onNavigate(item.id)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right side */}
                <div className="header-right">
                    {/* Tier Badge */}
                    <button className="tier-button" onClick={onShowPricing}>
                        <Crown size={14} />
                        <span>{userTier.charAt(0).toUpperCase() + userTier.slice(1)}</span>
                        {userTier === 'free' && (
                            <Badge variant="primary" size="sm">Upgrade</Badge>
                        )}
                    </button>

                    {/* User Menu */}
                    {user ? (
                        <div className="relative">
                            <button
                                className="user-button desktop-only"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <div className="user-avatar">
                                    {user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <ChevronDown size={14} />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                                    <div className="px-4 py-3 border-b border-gray-800">
                                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                                    </div>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                                        onClick={() => {
                                            signOut();
                                            setUserMenuOpen(false);
                                        }}
                                    >
                                        <LogOut size={14} />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Button
                            variant="primary"
                            size="sm"
                            className="hidden md:flex"
                            onClick={onLogin}
                        >
                            Acceder
                        </Button>
                    )}

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mobile-menu-toggle mobile-only"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menu"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="mobile-menu animate-fadeInDown">
                    <nav className="mobile-nav">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                className={`mobile-nav-link ${currentView === item.id ? 'active' : ''}`}
                                onClick={() => {
                                    item.id === 'pricing' ? onShowPricing?.() : onNavigate(item.id);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
