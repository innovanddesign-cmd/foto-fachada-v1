import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CapaDeMovimiento } from "@/components/layout/CapaDeMovimiento";
import { NavbarGlobal } from "@/components/layout/NavbarGlobal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "INNOVA — Escaparates digitales para inmobiliarias",
    description: "Conecta el escaparate de tu inmobiliaria con el móvil: web de tu agencia, servicios, propiedades, cartelería y QR de contacto.",
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
                <div className="relative z-10 min-h-screen flex flex-col">
                    <CapaDeMovimiento>
                        {children}
                    </CapaDeMovimiento>
                </div>
            </body>
        </html>
    );
}
