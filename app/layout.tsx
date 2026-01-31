import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Foto Fachada V2",
    description: "Transforma tu negocio con IA Generativa",
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
                <main className="relative z-10 min-h-screen flex flex-col">
                    {children}
                </main>
            </body>
        </html>
    );
}
