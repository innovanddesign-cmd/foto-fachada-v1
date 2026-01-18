import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Sparkles, MapPin, Mail } from 'lucide-react';
import './PublicFooter.css';

export function PublicFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="public-footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <div className="footer-logo-icon">
                            <Sparkles size={18} />
                        </div>
                        <span className="footer-logo-text">FotoFachada</span>
                    </div>
                    <p className="footer-tagline">
                        Transforma tu fachada en tu mejor vendedor. Tecnología de IA generativa para el comercio local.
                    </p>
                    <div className="footer-contact">
                        <div className="contact-item">
                            <MapPin size={16} />
                            <span>Benidorm, Alicante, ES</span>
                        </div>
                        <div className="contact-item">
                            <Mail size={16} />
                            <span>hola@fotofachada.app</span>
                        </div>
                    </div>
                </div>

                <div className="footer-links-grid">
                    <div className="footer-column">
                        <h4>Explora</h4>
                        <Link to="/ejemplos">Casos de Éxito</Link>
                        <Link to="/como-funciona">Cómo Funciona</Link>
                        <Link to="/precios">Planes y Precios</Link>
                        <Link to="/ayuda">Centro de Ayuda</Link>
                    </div>
                    <div className="footer-column">
                        <h4>Soluciones</h4>
                        <Link to="/soluciones/restaurantes">Para Restaurantes</Link>
                        <Link to="/soluciones/tiendas">Para Tiendas</Link>
                        <Link to="/soluciones/servicios">Para Servicios</Link>
                        <Link to="/p/demo">Ver Demo</Link>
                    </div>
                    <div className="footer-column">
                        <h4>Legal</h4>
                        <Link to="/legal/privacidad">Privacidad</Link>
                        <Link to="/legal/terminos">Términos de Uso</Link>
                        <Link to="/legal/cookies">Cookies</Link>
                        <Link to="/legal/aviso">Aviso Legal</Link>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-bottom-container">
                    <p>&copy; {currentYear} FotoFachada. Hecho con ❤️ en Benidorm.</p>
                    <div className="footer-social">
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Twitter size={18} /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={18} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
