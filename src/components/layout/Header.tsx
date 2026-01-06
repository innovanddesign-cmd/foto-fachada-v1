import { Menu, X, Sparkles, Crown, ChevronDown, LogOut, Settings, HelpCircle, CreditCard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LanguageSelector } from '../ui/LanguageSelector';
import { ThemeToggle } from '../ui/ThemeToggle';
import './Header.css';

interface HeaderProps {
    onNavigate: (view: string) => void;
    onShowPricing?: () => void;
    onOpenSettings?: () => void;
    currentView: string;
    onLogin: () => void;
    user?: any;
}

export function Header({ onNavigate, onShowPricing, onOpenSettings, currentView, onLogin }: HeaderProps) {
    const { t } = useTranslation();
    const { userTier, user, signOut } = useAppStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Navigation items with translations
    const navItems = [
        { id: 'dashboard', label: t('nav.dashboard') },
        { id: 'campaigns', label: t('nav.campaigns') },
        { id: 'landings', label: t('nav.landings') },
        { id: 'strategies', label: t('nav.strategies') },
        { id: 'posters', label: t('nav.posters') },
    ];

    // Mock User for UI if not logged in (demo mode)
    const displayUser = user || { email: 'demo@usuario.com', tier: 'free' };

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
                                onClick={() => onNavigate(item.id)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right side */}
                <div className="header-right">
                    {/* Language & Theme Controls (desktop) */}
                    <div className="hidden md:flex items-center gap-2">
                        <LanguageSelector compact />
                        <ThemeToggle compact />
                    </div>

                    {/* Tier Badge */}
                    <button className="tier-button" onClick={onShowPricing}>
                        <Crown size={14} />
                        <span>{userTier.charAt(0).toUpperCase() + userTier.slice(1)}</span>
                        {userTier === 'free' && (
                            <Badge variant="primary" size="sm">{t('header.upgrade')}</Badge>
                        )}
                    </button>

                    {/* User Menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            className="user-button desktop-only"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <div className="user-avatar">
                                {displayUser.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <ChevronDown size={14} />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-scaleIn origin-top-right">
                                <div className="px-4 py-3 border-b border-[var(--color-border)]">
                                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{displayUser.email}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{t('header.plan')} {userTier}</p>
                                </div>

                                <div className="py-1">
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text)] flex items-center gap-2"
                                        onClick={() => { onShowPricing?.(); setUserMenuOpen(false); }}
                                    >
                                        <CreditCard size={16} />
                                        {t('header.pricing')}
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text)] flex items-center gap-2"
                                        onClick={() => { onOpenSettings?.(); setUserMenuOpen(false); }}
                                    >
                                        <Settings size={16} />
                                        {t('header.settings')}
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text)] flex items-center gap-2"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <HelpCircle size={16} />
                                        {t('header.help')}
                                    </button>
                                </div>

                                <div className="border-t border-[var(--color-border)] py-1">
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-error hover:bg-[var(--error-50)] flex items-center gap-2"
                                        onClick={() => {
                                            signOut();
                                            setUserMenuOpen(false);
                                            onLogin();
                                        }}
                                    >
                                        <LogOut size={16} />
                                        {t('header.logout')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

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
                                    onNavigate(item.id);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                        <hr className="my-2 border-[var(--color-border)]" />

                        {/* Mobile Language & Theme */}
                        <div className="flex items-center justify-center gap-3 py-2">
                            <LanguageSelector />
                            <ThemeToggle />
                        </div>

                        <hr className="my-2 border-[var(--color-border)]" />
                        <button
                            className="mobile-nav-link"
                            onClick={() => {
                                onShowPricing?.();
                                setMobileMenuOpen(false);
                            }}
                        >
                            {t('header.pricing')}
                        </button>
                        <button
                            className="mobile-nav-link"
                            onClick={() => {
                                onOpenSettings?.();
                                setMobileMenuOpen(false);
                            }}
                        >
                            {t('header.settings')}
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
}
