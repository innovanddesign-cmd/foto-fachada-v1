import { motion } from 'framer-motion';
import { QrCode, ArrowRight, BarChart2 } from 'lucide-react';
import type { Project } from '../../types';

interface DashboardV3Props {
    onCreateNew: () => void;
    onOpenProject: (project: Project) => void;
}

// Simulamos proyectos si no hay (para demo visual) o usamos estado real
const MOCK_PROJECTS: any[] = []; // Inicialmente vacío para probar Empty State

export function DashboardV3({ onCreateNew, onOpenProject }: DashboardV3Props) {
    // Aquí conectaríamos con useAppStore para obtener proyectos reales
    // const { projects } = useAppStore();
    const projects = MOCK_PROJECTS;
    const hasProjects = projects.length > 0;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-32">
            {/* Header Area */}
            <div className="px-6 pt-8 pb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Mis Escaparates
                </h1>
                <p className="text-gray-500 mt-1">
                    Gestiona tu presencia digital
                </p>

                {/* AI Notification Center (Micro-Interaction) */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-[32px] bg-indigo-50 border border-indigo-100 flex items-start gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xl shrink-0">
                        ✨
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-indigo-900">Consejo IA</h3>
                        <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                            Los viernes aumentan las búsquedas de "Cena romántica". ¿Por qué no actualizas tu oferta de fin de semana?
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Gallery Grid */}
            <div className="px-4 space-y-4">
                {!hasProjects ? (
                    <EmptyState onCreate={onCreateNew} />
                ) : (
                    projects.map((p, i) => (
                        <ProjectCard key={i} project={p} onClick={() => onOpenProject(p)} />
                    ))
                )}
            </div>
        </div>
    );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-8 text-center mt-10"
        >
            <div className="w-24 h-24 bg-gray-100 rounded-[32px] flex items-center justify-center mb-6">
                <CameraIcon className="text-gray-300 w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Tu fachada es el límite</h3>
            <p className="text-gray-500 mt-2 mb-8 max-w-xs mx-auto">
                No tienes escaparates activos. Sube tu primera foto para empezar a atraer clientes.
            </p>
            <button
                onClick={onCreate}
                className="w-full py-4 rounded-[32px] bg-indigo-600 text-white font-bold text-lg shadow-xl shadow-indigo-200 active:scale-95 transition-transform"
            >
                Crear Nuevo Escaparate
            </button>
        </motion.div>
    );
}

function ProjectCard({ project, onClick }: { project: any, onClick: () => void }) {
    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="glass-card active:bg-white/90 transition-colors p-4 relative overflow-hidden group"
        >
            <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-24 h-24 rounded-[20px] bg-gray-200 overflow-hidden shrink-0">
                    <img src={project.thumbnail || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400"} className="w-full h-full object-cover" alt="" />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-transparent group-hover:border-gray-200 inline-block transition-colors">
                        {project.name || 'Sin título'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Actualizado hace 2h
                    </p>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-3">
                        <button className="px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600 flex items-center gap-1">
                            <QrCode size={12} />
                            QR
                        </button>
                        <button className="px-3 py-1.5 rounded-full bg-indigo-50 text-xs font-medium text-indigo-600 flex items-center gap-1">
                            <BarChart2 size={12} />
                            Stats
                        </button>
                    </div>
                </div>

                <div className="flex items-center text-gray-300">
                    <ArrowRight size={20} />
                </div>
            </div>
        </motion.div>
    );
}

// Icons
function CameraIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
        </svg>
    )
}
