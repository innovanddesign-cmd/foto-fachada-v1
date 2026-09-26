"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, HelpCircle } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { guardarCampañaEnStore } from '@/lib/campañas/GestionCampañas';
export function NavbarGlobal() {
 const path = usePathname();
 if (path?.startsWith('/v/') || path?.startsWith('/t/') || path === '/test-mockup') return null;
 return <><a href="#app-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-slate-900 focus:p-3">Saltar al contenido</a><nav aria-label="Navegación principal" className="fixed inset-x-0 top-0 z-50 bg-black text-white border-b border-emerald-950"><div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3"><Link href="/" aria-label="INNOVA · Inicio" className="flex items-center gap-2 min-h-11"><img src="/brand/innova-logo.png" alt="INNOVA AND DESIGN" width={72} height={72} className="shrink-0"/><span className="hidden sm:block text-sm text-emerald-300 tracking-wide">Escaparates</span></Link><div className="flex items-center gap-2 sm:gap-4"><Link href="/dashboard" aria-label="Mis escaparates" onClick={() => { if(path === '/create') guardarCampañaEnStore(); }} aria-current={path === '/dashboard' ? 'page' : undefined} className="flex items-center gap-2 min-h-11 px-3 text-sm rounded-xl hover:bg-emerald-950"><LayoutDashboard size={18}/><span className="hidden sm:inline">Mis escaparates</span></Link><Link href="/dashboard?seccion=ayuda" aria-label="Ayuda" className="flex items-center justify-center min-h-11 min-w-11 rounded-xl hover:bg-emerald-950"><HelpCircle size={20}/></Link><UserMenu /></div></div></nav><div id="app-content" className="h-20" /></>;
}
