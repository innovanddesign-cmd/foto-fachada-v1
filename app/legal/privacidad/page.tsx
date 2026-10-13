import Link from "next/link";

export const metadata = {
    title: "Privacidad — Foto Fachada · Escaparates virtuales",
    description: "Datos de cuenta, campañas, imágenes y uso de inteligencia artificial.",
};

export default function Privacidad() {
    return (
        <main className="min-h-screen px-6 py-24 max-w-3xl mx-auto">
            <Link href="/" className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
                ← Volver al inicio
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-6 mb-8">Política de Privacidad</h1>
            <div className="space-y-6 text-white/60 text-sm leading-relaxed">
                <p>Foto Fachada · Escaparates virtuales es un servicio de INNOVANDESIGN. Contacto para consultas sobre datos personales: <a href="mailto:conta@innovandesign.com" className="underline">conta@innovandesign.com</a>.</p>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">1. Datos que tratamos</h2>
                    <p>Tratamos los datos de tu cuenta, las fotografías y materiales que aportas, los datos de contacto del negocio, los contenidos de las campañas y los registros necesarios para guardar, publicar y gestionar el servicio. Registramos aperturas del QR y clics de contacto con su fecha y campaña; no equivalen a personas únicas, mensajes enviados, citas ni ventas.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">2. Finalidad</h2>
                    <p>Usamos estos datos para prestar el servicio solicitado: crear y editar campañas, mantener tu cuenta, publicar la web y resolver incidencias. Cuando solicitas una generación con IA, se envían al proveedor los materiales y las instrucciones necesarios para esa operación. Revisa las propuestas antes de publicarlas y evita incluir datos de clientes, información de salud u otros datos personales innecesarios.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">3. Almacenamiento, publicación y proveedores</h2>
                    <p>Los borradores locales se guardan en el navegador. Al guardar en tu cuenta, los datos e imágenes se almacenan en Supabase; Vercel aloja la aplicación. Publicar hace accesibles la web y los materiales incluidos en ella mediante su enlace y QR. Borrar una copia local no elimina la copia de la cuenta ni retira la publicación.</p>
                    <p>El análisis de imagen utiliza Groq. Las propuestas y reescrituras de texto pueden utilizar OpenRouter y el modelo habilitado para la operación. La generación gratuita de nuevas imágenes o logos no está disponible actualmente. Los enlaces de contacto abren el servicio elegido, por ejemplo WhatsApp, sujeto a sus propias condiciones.</p>
                    <p>Antes de contratar puedes solicitar la identificación de los proveedores aplicables y la información sobre ubicación del tratamiento y garantías de transferencias internacionales. No se presupone que todos los proveedores procesen los datos exclusivamente en la Unión Europea.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">4. Conservación y retirada</h2>
                    <p>Puedes retirar una publicación desde tu cuenta conservando su borrador. Las condiciones de contratación contemplan la conservación del contenido bloqueado durante tres años para permitir su recuperación, sin perjuicio de las solicitudes de supresión que procedan. Los justificantes contractuales y de facturación tienen su conservación propia. Para solicitar la eliminación de datos de la cuenta, escribe al contacto de privacidad.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">5. Tus derechos</h2>
                    <p>Puedes solicitar acceso, rectificación, supresión, oposición, limitación y portabilidad cuando sean aplicables, en conta@innovandesign.com. También puedes presentar una reclamación ante la <a href="https://www.aepd.es" className="underline">Agencia Española de Protección de Datos</a>. La información contractual identifica al prestador y concreta el tratamiento correspondiente al servicio contratado.</p>
                </section>
            </div>
        </main>
    );
}
