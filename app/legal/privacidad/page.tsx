import Link from "next/link";

export const metadata = {
    title: "Política de Privacidad — Foto Fachada AI",
    description: "Cómo tratamos tus datos en Foto Fachada AI.",
};

export default function Privacidad() {
    return (
        <main className="min-h-screen px-6 py-24 max-w-3xl mx-auto">
            <Link href="/" className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
                ← Volver al inicio
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-6 mb-8">Política de Privacidad</h1>
            <div className="space-y-6 text-white/60 text-sm leading-relaxed">
                <p>En Foto Fachada AI (INNOVA AND DESIGN) respetamos tu privacidad. Esta política explica qué datos recogemos y cómo los usamos.</p>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">1. Datos que tratamos</h2>
                    <p>Fotografías de fachada que subes, datos del negocio que introduces y métricas anónimas de uso (escaneos, visitas).</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">2. Finalidad</h2>
                    <p>Analizar la imagen con IA (Google Gemini) para generar tu escaparate digital, cartel y QR. Las fotos se procesan para este fin y no se venden a terceros.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">3. Conservación</h2>
                    <p>Tus campañas y datos se guardan en tu navegador (localStorage) salvo que actives sincronización en la nube. Puedes eliminarlos en cualquier momento desde tu panel.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">4. Tus derechos</h2>
                    <p>Puedes solicitar acceso, rectificación o eliminación de tus datos escribiendo a innovandesign@gmail.com.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">5. Contacto</h2>
                    <p>INNOVA AND DESIGN — innovandesign@gmail.com</p>
                </section>
            </div>
        </main>
    );
}
