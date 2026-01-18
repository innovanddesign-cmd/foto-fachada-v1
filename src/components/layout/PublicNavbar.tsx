import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import './PublicNavbar.css';

interface PublicNavbarProps {
    onLogin: () => void;
    onGetStarted: () => void;
}

export function PublicNavbar({ onLogin, onGetStarted }: PublicNavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    return (
        <header className={`public-navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="logo-icon">
                        <Sparkles size={20} strokeWidth={2.5} />
                    </div>
                    <span className="logo-text">FotoFachada</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="desktop-nav">
                    <Link to="/ejemplos" className={`nav-link ${location.pathname === '/ejemplos' ? 'active' : ''}`}>Ejemplos</Link>
                    <Link to="/como-funciona" className={`nav-link ${location.pathname === '/como-funciona' ? 'active' : ''}`}>Cómo funciona</Link>
                    <Link to="/precios" className={`nav-link ${location.pathname === '/precios' ? 'active' : ''}`}>Precios</Link>
                </nav>

                {/* Desktop Actions */}
                <div className="desktop-actions">
                    <Button variant="ghost" onClick={onLogin} className="login-btn">
                        Entrar
                    </Button>
                    <Button variant="primary" onClick={onGetStarted} className="get-started-btn">
                        Empezar gratis
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Menú"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <nav className="mobile-nav">
                    <Link to="/ejemplos" className="mobile-nav-link">Ejemplos</Link>
                    <Link to="/como-funciona" className="mobile-nav-link">Cómo funciona</Link>
                    <Link to="/precios" className="mobile-nav-link">Precios</Link>
                    <Link to="/ayuda" className="mobile-nav-link">Ayuda</Link>
                    <div className="mobile-menu-divider" />
                    <Button variant="ghost" fullWidth onClick={onLogin}>
                        Entrar
                    </Button>
                    <Button variant="primary" fullWidth onClick={onGetStarted}>
                        Empezar gratis
                    </Button>
                </nav>
            </div>
        </header>
    );
}
