import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CapaDeMovimiento } from "@/components/layout/CapaDeMovimiento";
import { NavbarGlobal } from "@/components/layout/NavbarGlobal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Foto Fachada AI — Escaparates digitales para tu negocio",
    description: "Sube una foto de tu fachada y obtén en segundos: escaparate digital, cartelería imprimible y QR de seguimiento. Impulsado por IA Gemini.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <div className="mesh-bg" />
                <NavbarGlobal />
                <main className="relative z-10 min-h-screen flex flex-col">
                    <CapaDeMovimiento>
                        {children}
                    </CapaDeMovimiento>
                </main>
            </body>
        </html>
    );
}
