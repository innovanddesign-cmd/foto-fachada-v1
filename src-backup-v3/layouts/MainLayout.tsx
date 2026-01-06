import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Zap,
    Globe,
    FileImage,
    Settings,
    Menu,
    X,
    User,
    Crown,
    Lightbulb
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

export default function MainLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { userPlan } = useAppStore();
    const navigate = useNavigate();
    const location = useLocation();

    // v1 Navigation Structure (Restored v3 Links)
    const navItems = [
        { name: 'Panel', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Campañas', path: '/campaigns', icon: Zap },
        { name: 'Landings', path: '/landings', icon: Globe },
        { name: 'Estrategias', path: '/strategies', icon: Lightbulb },
        { name: 'Carteles', path: '/posters', icon: FileImage },
    ];

    return (
        <div className="min-h-screen w-full bg-[#0a0f1d] text-white font-sans flex flex-col">

            {/* BACKGROUND GRADIENT ACCENTS (v1 Style) */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

            {/* HEADER */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0f1d]/80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Left: Logo & Nav */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <span className="font-bold text-white text-lg">F</span>
                            </div>
                            <span className="font-bold text-lg tracking-tight">FotoFachada</span>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        text-sm font-medium transition-colors hover:text-white
                                        ${isActive ? 'text-white' : 'text-white/60'}
                                    `}
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        {/* Plan Badge */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            <span className="text-xs font-semibold text-white/80">Plan {userPlan}</span>
                        </div>

                        {/* User Profile */}
                        <button
                            onClick={() => navigate('/settings')}
                            className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-colors shadow-lg shadow-indigo-600/20"
                        >
                            <User className="w-4 h-4 text-white" />
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden text-white/60 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT (Centered Container) */}
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/80 z-50 md:hidden backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed right-0 top-0 h-full w-72 bg-[#0d1226] z-50 p-6 flex flex-col md:hidden border-l border-white/10"
                        >
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                <span className="font-bold text-lg">Menú</span>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>
                            <nav className="flex flex-col gap-4">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                            ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/60 hover:bg-white/5'}
                                        `}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.name}
                                    </NavLink>
                                ))}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
