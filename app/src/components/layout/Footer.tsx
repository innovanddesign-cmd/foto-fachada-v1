import { Github, Twitter, Linkedin, Sparkles } from 'lucide-react';
import './Footer.css';

export function Footer() {
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
                        Convierte fotos de fachadas en landing pages profesionales en segundos con IA.
                    </p>
                    <div className="footer-social">
                        <a href="#" className="social-link" aria-label="Twitter"><Twitter size={20} /></a>
                        <a href="#" className="social-link" aria-label="GitHub"><Github size={20} /></a>
                        <a href="#" className="social-link" aria-label="LinkedIn"><Linkedin size={20} /></a>
                    </div>
                </div>

                <div className="footer-links-grid">
                    <div className="footer-column">
                        <h4>Producto</h4>
                        <a href="#">Características</a>
                        <a href="#">Precios</a>
                        <a href="#">Casos de uso</a>
                        <a href="#">Roadmap</a>
                    </div>
                    <div className="footer-column">
                        <h4>Recursos</h4>
                        <a href="#">Blog</a>
                        <a href="#">Documentación</a>
                        <a href="#">Guías</a>
                        <a href="#">Soporte</a>
                    </div>
                    <div className="footer-column">
                        <h4>Compañía</h4>
                        <a href="#">Sobre nosotros</a>
                        <a href="#">Empleo</a>
                        <a href="#">Contacto</a>
                        <a href="#">Prensa</a>
                    </div>
                    <div className="footer-column">
                        <h4>Legal</h4>
                        <a href="#">Privacidad</a>
                        <a href="#">Términos</a>
                        <a href="#">Cookies</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-bottom-container">
                    <p>&copy; {currentYear} FotoFachada. Todos los derechos reservados.</p>
                    <div className="footer-bottom-links">
                        <a href="#">Política de Privacidad</a>
                        <span className="separator">•</span>
                        <a href="#">Términos de Servicio</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
