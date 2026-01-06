import { Outlet, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { X } from 'lucide-react';

export default function FocusLayout() {
    const { currentStep, resetCreationFlow } = useAppStore();
    const navigate = useNavigate();

    const handleExit = () => {
        // Confirm?? Maybe. For now fast exit.
        resetCreationFlow();
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen w-full bg-black dark:bg-black text-white relative flex flex-col font-sans">
            {/* Top Bar (Minimal) */}
            <header className="fixed top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-6 bg-transparent">
                <div className="text-sm font-bold tracking-widest opacity-50 uppercase">
                    Nueva Campaña
                </div>
                <button
                    onClick={handleExit}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/20 transition-colors"
                    title="Salir y Volver al Panel"
                >
                    <X className="w-5 h-5" />
                </button>
            </header>

            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-50">
                <div
                    className="h-full bg-white shadow-[0_0_10px_white] transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / 5) * 100}%` }}
                />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 w-full bg-black relative">
                <Outlet />
            </main>
        </div>
    );
}
