import Link from "next/link";

export const metadata = {
    title: "Términos y Condiciones — Foto Fachada AI",
    description: "Términos de uso del servicio Foto Fachada AI.",
};

export default function Terminos() {
    return (
        <main className="min-h-screen px-6 py-24 max-w-3xl mx-auto">
            <Link href="/" className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
                ← Volver al inicio
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-6 mb-8">Términos y Condiciones</h1>
            <div className="space-y-6 text-white/60 text-sm leading-relaxed">
                <p>Al usar Foto Fachada AI aceptas las siguientes condiciones del servicio prestado por INNOVA AND DESIGN.</p>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">1. El servicio</h2>
                    <p>Foto Fachada AI genera escaparates digitales, carteles imprimibles y QR a partir de una foto de tu negocio. Los resultados son borradores que puedes editar y publicar desde tu panel.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">2. Planes y pagos</h2>
                    <p>Plan FREE gratuito con límites. Planes PRO y ESCAPARATE de pago: condiciones, precios y ofertas de lanzamiento se muestran en la sección de precios. El pago se formaliza por acuerdo directo con INNOVA AND DESIGN.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">3. Uso aceptable</h2>
                    <p>Te comprometes a subir solo imágenes propias o con derechos de uso, y a no generar contenidos ilícitos o que infrinjan derechos de terceros.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">4. Propiedad intelectual</h2>
                    <p>Los contenidos que generas sobre tu negocio son tuyos. El motor, diseño de plataforma y tecnología pertenecen a INNOVA AND DESIGN.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">5. Limitación de responsabilidad</h2>
                    <p>El servicio se presta “tal cual”. No garantizamos resultados comerciales concretos derivados del uso del escaparate digital.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">6. Contacto</h2>
                    <p>Para dudas sobre estos términos: innovandesign@gmail.com</p>
                </section>
            </div>
        </main>
    );
}
