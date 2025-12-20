import { useState, useEffect } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import './PublicHeader.css';

interface PublicHeaderProps {
    onLogin: () => void;
    onGetStarted: () => void;
}

export function PublicHeader({ onLogin, onGetStarted }: PublicHeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        setMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className={`public-header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                {/* Logo */}
                <div className="header-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="logo-icon">
                        <Sparkles size={20} strokeWidth={2.5} />
                    </div>
                    <span className="logo-text">FotoFachada</span>
                </div>

                {/* Desktop Nav */}
                <nav className="desktop-nav">
                    <button onClick={() => scrollToSection('features')} className="nav-link">Características</button>
                    <button onClick={() => scrollToSection('how-it-works')} className="nav-link">Cómo funciona</button>
                    <button onClick={() => scrollToSection('pricing')} className="nav-link">Precios</button>
                </nav>

                {/* Desktop Actions */}
                <div className="desktop-actions">
                    <Button variant="ghost" onClick={onLogin}>
                        Iniciar sesión
                    </Button>
                    <Button variant="primary" onClick={onGetStarted}>
                        Empezar gratis
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <nav className="mobile-nav">
                    <button onClick={() => scrollToSection('features')} className="mobile-nav-link">Características</button>
                    <button onClick={() => scrollToSection('how-it-works')} className="mobile-nav-link">Cómo funciona</button>
                    <button onClick={() => scrollToSection('pricing')} className="mobile-nav-link">Precios</button>
                    <div className="mobile-menu-divider" />
                    <Button variant="ghost" fullWidth onClick={onLogin}>
                        Iniciar sesión
                    </Button>
                    <Button variant="primary" fullWidth onClick={onGetStarted}>
                        Empezar gratis
                    </Button>
                </nav>
            </div>
        </header>
    );
}
