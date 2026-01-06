import { Trash2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { PLAN_LIMITS } from '../data/catalog';

export default function SettingsPage() {
    const { userPlan, resetFullState } = useAppStore();

    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Configuración</h1>

            <div className="space-y-6">
                {/* Account Plan */}
                <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4">Tu Plan</h2>
                    <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                        <div>
                            <div className="text-2xl font-bold">{userPlan}</div>
                            <div className="text-sm text-white/40">{PLAN_LIMITS[userPlan].price}</div>
                        </div>
                        <button className="px-4 py-2 bg-white text-black rounded-lg font-bold text-sm">Gestionar Suscripción</button>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Zona de Peligro
                    </h2>
                    <p className="text-sm text-white/60 mb-6">Esta acción borrará todas tus campañas y reseteará la aplicación al estado inicial.</p>

                    <button
                        onClick={() => {
                            if (confirm("¿Estás seguro? Esto borrará todo.")) {
                                resetFullState();
                                window.location.href = '/';
                            }
                        }}
                        className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Borrar Todo y Resetear
                    </button>
                </section>
            </div>
        </div>
    );
}
