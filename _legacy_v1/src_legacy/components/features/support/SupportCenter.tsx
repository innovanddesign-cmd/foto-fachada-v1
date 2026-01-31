/**
 * Support Center
 * ===============
 * Enhanced support widget with tabs for Contact, FAQs, and Tickets
 */
import { useState } from 'react';
import { MessageCircle, X, Send, HelpCircle, Mail, Book, FileText, ChevronDown, ChevronUp } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../../store/NotificationContext';

interface SupportCenterProps {
    whatsappNumber?: string;
    email?: string;
    userName?: string;
}

const FAQS = [
    {
        q: "¿Cómo cambio mi plan de suscripción?",
        a: "Puedes gestionar tu plan desde la sección de Configuración > Suscripción. Allí encontrarás un enlace directo al portal de clientes."
    },
    {
        q: "¿Puedo usar mi propio dominio?",
        a: "Sí, en la configuración de la Landing Page puedes establecer un subdominio o contactar con soporte para conectar un dominio personalizado (Plan Pro)."
    },
    {
        q: "¿Cómo imprimo los carteles?",
        a: "El sistema genera un PDF A4 estándar a 300 DPI. Puedes descargarlo e imprimirlo en cualquier impresora de oficina o imprenta profesional."
    }
];

export function SupportCenter({
    whatsappNumber = '34600000000',
    email = 'soporte@fotofachada.com',
    userName = 'Usuario'
}: SupportCenterProps) {
    // const { t } = useTranslation();
    const { addNotification } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'contact' | 'faq' | 'ticket'>('contact');
    const [faqOpen, setFaqOpen] = useState<number | null>(null);

    // Ticket Form State
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketMsg, setTicketMsg] = useState('');

    const handleWhatsAppClick = () => {
        const message = encodeURIComponent(
            `¡Hola! Soy ${userName}. Necesito ayuda con Foto Fachada.`
        );
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    };

    const handleEmailClick = () => {
        const subject = encodeURIComponent('Soporte Foto Fachada');
        const body = encodeURIComponent(
            `Hola,\n\nNecesito ayuda con:\n\n\n---\nUsuario: ${userName}`
        );
        window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    };

    const submitTicket = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            addNotification({
                title: 'Ticket Enviado',
                message: `Hemos recibido tu ticket: "${ticketSubject}". Te responderemos pronto.`,
                type: 'success'
            });
            setTicketSubject('');
            setTicketMsg('');
            setActiveTab('contact'); // Return to home
        }, 1000);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    fixed bottom-6 right-6 z-50
                    w-14 h-14 rounded-full
                    bg-gradient-to-r from-blue-600 to-indigo-600
                    text-white shadow-xl shadow-blue-900/30
                    flex items-center justify-center
                    hover:scale-110 active:scale-95
                    transition-all duration-300
                    ${isOpen ? 'rotate-90' : ''}
                `}
                aria-label="Abrir centro de ayuda"
            >
                {isOpen ? <X size={24} /> : <HelpCircle size={24} />}
            </button>

            {/* Support Panel */}
            {isOpen && (
                <div className="
                    fixed bottom-24 right-6 z-50
                    w-[360px] max-w-[calc(100vw-2rem)]
                    bg-slate-900 border border-slate-700
                    rounded-2xl shadow-2xl
                    overflow-hidden
                    flex flex-col
                    animate-in slide-in-from-bottom-5 duration-300
                ">
                    {/* Header */}
                    <div className="bg-slate-800 p-4 border-b border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                                <HelpCircle size={22} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Centro de Ayuda</h3>
                                <p className="text-xs text-slate-400">Soporte y Recursos</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-1 bg-slate-900/50 rounded-lg">
                            <button
                                onClick={() => setActiveTab('contact')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'contact' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                Contacto
                            </button>
                            <button
                                onClick={() => setActiveTab('faq')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'faq' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                FAQs
                            </button>
                            <button
                                onClick={() => setActiveTab('ticket')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'ticket' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                Ticket
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 min-h-[300px] max-h-[500px] overflow-y-auto bg-slate-900 text-white">

                        {/* Tab: CONTACT */}
                        {activeTab === 'contact' && (
                            <div className="space-y-3 animate-in fade-in zoom-in-95">
                                <p className="text-sm text-slate-400 mb-4">
                                    Elige tu canal preferido para hablar con un agente:
                                </p>
                                <button
                                    onClick={handleWhatsAppClick}
                                    className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-all hover:border-green-500/50 group"
                                >
                                    <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                                        <MessageCircle size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-medium text-white">Chat WhatsApp</h4>
                                        <p className="text-xs text-slate-400">Respuesta media: 5 min</p>
                                    </div>
                                </button>

                                <button
                                    onClick={handleEmailClick}
                                    className="w-full flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-all hover:border-indigo-500/50 group"
                                >
                                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                        <Mail size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-medium text-white">Email Soporte</h4>
                                        <p className="text-xs text-slate-400">Respuesta media: 24h</p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Tab: FAQ */}
                        {activeTab === 'faq' && (
                            <div className="space-y-2 animate-in fade-in zoom-in-95">
                                {FAQS.map((faq, idx) => (
                                    <div key={idx} className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-800/50">
                                        <button
                                            onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                                            className="w-full flex justify-between items-center p-3 text-left text-sm font-medium hover:bg-slate-800 transition-colors"
                                        >
                                            {faq.q}
                                            {faqOpen === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        {faqOpen === idx && (
                                            <div className="p-3 pt-0 text-xs text-slate-400 bg-slate-800/30">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tab: TICKET */}
                        {activeTab === 'ticket' && (
                            <form onSubmit={submitTicket} className="space-y-4 animate-in fade-in zoom-in-95">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Asunto</label>
                                    <input
                                        type="text"
                                        value={ticketSubject}
                                        onChange={e => setTicketSubject(e.target.value)}
                                        placeholder="Ej: Problema con la facturación"
                                        required
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Descripción</label>
                                    <textarea
                                        value={ticketMsg}
                                        onChange={e => setTicketMsg(e.target.value)}
                                        placeholder="Describe tu problema..."
                                        rows={4}
                                        required
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Send size={16} /> Enviar Ticket
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500">v2.1.0 • Stable</span>
                        <div className="flex gap-2 text-slate-500">
                            <Book size={12} className="cursor-pointer hover:text-white" />
                            <FileText size={12} className="cursor-pointer hover:text-white" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
