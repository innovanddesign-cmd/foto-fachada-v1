import { useState } from 'react';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import './PublicPages.css';

const FAQS = [
    {
        question: '¿Necesito conocimientos técnicos?',
        answer: 'Absolutamente no. Si sabes hacer una foto con tu móvil, sabes usar FotoFachada. Nuestra IA se encarga de todo el diseño y la programación.'
    },
    {
        question: '¿Cómo imprimo el cartel QR?',
        answer: 'Te entregamos un archivo PDF de alta resolución listo para imprimir en cualquier copistería estándar o en tu propia impresora. Viene optimizado en tamaño A4.'
    },
    {
        question: '¿Puedo cambiar el diseño después?',
        answer: 'Sí, tantas veces como quieras. Puedes regenerar tu escaparate digital para adaptarlo a temporadas (Navidad, Verano) sin tener que cambiar el código QR de tu puerta.'
    },
    {
        question: '¿Funciona en cualquier tipo de negocio?',
        answer: 'Está diseñado específicamente para comercios con local físico: restaurantes, tiendas de ropa, inmobiliarias, gimnasios, peluquerías, hoteles y servicios profesionales.'
    }
];

export function PublicHelp() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    return (
        <div className="public-page fade-in">
            <div className="page-header">
                <Badge variant="success">Soporte 24/7</Badge>
                <h1>Estamos aquí para ayudarte</h1>
                <p>Resolvemos tus dudas para que puedas centrarte en tu negocio.</p>
            </div>

            <div className="faq-grid">
                {FAQS.map((faq, index) => (
                    <div
                        key={index}
                        className="faq-item"
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                        <div className="faq-question">
                            <span>{faq.question}</span>
                            {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                        {openFaq === index && (
                            <div className="faq-answer">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="page-cta">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <MessageCircle size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">¿Prefieres hablar con un humano?</h3>
                        <p className="text-gray-500 mb-6">Nuestro equipo de soporte está disponible en WhatsApp.</p>
                        <Button
                            size="lg"
                            variant="primary"
                            className="bg-[#25D366] hover:bg-[#128C7E] border-none shadow-lg shadow-green-200"
                            leftIcon={<MessageCircle size={20} />}
                        >
                            Chat por WhatsApp
                        </Button>
                    </div>
                    <div className="text-left w-full max-w-lg bg-indigo-50 p-6 rounded-xl mt-8">
                        <h4 className="font-bold text-indigo-900 mb-2">Recurso Rápido</h4>
                        <p className="text-indigo-700 text-sm">
                            <strong>Tip Pro:</strong> Coloca tu cartel a la altura de los ojos (aprox. 1.5m) y a la derecha de la entrada para maximizar los escaneos en un 40%.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
