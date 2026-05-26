"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles, LayoutDashboard, Plus, Menu, X,
    ChevronDown, Bell, Settings, LogOut, User,
    Zap, HelpCircle
} from "lucide-react";
import { accionesTienda, useTiendaEstado } from "@/store/useTiendaEstado";

const MENU_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/create", label: "Nuevo Escaparate", icon: Plus, highlight: true },
];

export const NavbarGlobal = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [perfilAbierto, setPerfilAbierto] = useState(false);

    const campañas = useTiendaEstado((s) => s.campañas);
    const adnMarca = useTiendaEstado((s) => s.adnMarca);

    // No mostrar el navbar en la ruta pública /v/ y /t/
    if (pathname?.startsWith('/v/') || pathname?.startsWith('/t/')) return null;

    const iniciarNuevo = () => {
        accionesTienda.reiniciar();
        localStorage.removeItem('foto-fachada-v2-semilla');
        router.push("/create");
        setMenuAbierto(false);
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                <span className="text-white font-black text-xs">FF</span>
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-white font-bold text-sm tracking-tight">Foto Fachada</span>
                                <span className="ml-1.5 text-[9px] font-bold uppercase tracking-widest text-purple-400/80 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-full">AI</span>
                            </div>
                        </Link>

                        {/* Nav central (desktop) */}
                        <div className="hidden md:flex items-center gap-1">
                            {MENU_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const activo = pathname === item.href;
                                if (item.highlight) {
                                    return (
                                        <button
                                            key={item.href}
                                            type="button"
                                            onClick={iniciarNuevo}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs hover:opacity-90 transition-opacity shadow-lg"
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            {item.label}
                                        </button>
                                    );
                                }
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${activo
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Derecha: notificaciones + perfil */}
                        <div className="flex items-center gap-2">
                            {/* Badge de campañas activas */}
                            {campañas.length > 0 && (
                                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-400">{campañas.length} activa{campañas.length !== 1 ? 's' : ''}</span>
                                </div>
                            )}

                            {/* Notificaciones */}
                            <button
                                type="button"
                                aria-label="Notificaciones"
                                className="hidden sm:flex w-8 h-8 rounded-xl bg-white/5 border border-white/10 items-center justify-center hover:bg-white/10 transition-colors relative"
                            >
                                <Bell className="w-3.5 h-3.5 text-white/60" />
                            </button>

                            {/* Perfil */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setPerfilAbierto(!perfilAbierto)}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                        <User className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="hidden sm:block text-xs font-medium text-white/70">
                                        {adnMarca?.analisisVision?.nombreSugerido || 'Mi Cuenta'}
                                    </span>
                                    <ChevronDown className={`hidden sm:block w-3 h-3 text-white/40 transition-transform ${perfilAbierto ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {perfilAbierto && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-52 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                                        >
                                            <div className="p-3 border-b border-white/5">
                                                <p className="text-xs font-bold text-white truncate">{adnMarca?.analisisVision?.nombreSugerido || 'Usuario'}</p>
                                                <p className="text-[10px] text-white/40">Plan Gratuito</p>
                                            </div>
                                            <div className="p-1.5">
                                                <MenuPerfil icon={Zap} label="Actualizar a Pro" onClick={() => setPerfilAbierto(false)} accent />
                                                <MenuPerfil icon={Settings} label="Configuración" onClick={() => setPerfilAbierto(false)} />
                                                <MenuPerfil icon={HelpCircle} label="Ayuda y Soporte" onClick={() => setPerfilAbierto(false)} />
                                                <div className="my-1 border-t border-white/5" />
                                                <MenuPerfil icon={LogOut} label="Cerrar Sesión" onClick={() => setPerfilAbierto(false)} danger />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Hamburger móvil */}
                            <button
                                type="button"
                                aria-label="Abrir menú"
                                onClick={() => setMenuAbierto(!menuAbierto)}
                                className="md:hidden w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                {menuAbierto ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
                            </button>
                        </div>
                    </div>

                    {/* Menú móvil desplegable */}
                    <AnimatePresence>
                        {menuAbierto && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 flex flex-col gap-1"
                            >
                                <Link href="/dashboard" onClick={() => setMenuAbierto(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                                </Link>
                                <button type="button" onClick={iniciarNuevo}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 text-white text-sm font-bold">
                                    <Plus className="w-4 h-4" /> Nuevo Escaparate
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav>

            {/* Spacer para que el contenido no quede bajo el navbar */}
            <div className="h-16" />

            {/* Overlay para cerrar dropdown de perfil */}
            {perfilAbierto && (
                <div className="fixed inset-0 z-40" onClick={() => setPerfilAbierto(false)} />
            )}
        </>
    );
};

const MenuPerfil = ({ icon: Icon, label, onClick, accent, danger }: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    accent?: boolean;
    danger?: boolean;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${accent ? 'text-purple-400 hover:bg-purple-500/10' :
            danger ? 'text-red-400 hover:bg-red-500/10' :
                'text-white/60 hover:text-white hover:bg-white/5'
            }`}
    >
        <Icon className="w-3.5 h-3.5" />
        {label}
    </button>
);
