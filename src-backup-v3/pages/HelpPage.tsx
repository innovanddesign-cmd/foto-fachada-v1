import { MessageCircle, FileText } from 'lucide-react';

export default function HelpPage() {
    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Ayuda y Soporte</h1>

            <div className="grid gap-4">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Documentación</h3>
                        <p className="text-sm text-white/50">Guías paso a paso para configurar tu landing.</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Chat de Soporte</h3>
                        <p className="text-sm text-white/50">Habla con un agente (Lunes a Viernes 9-18h).</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
