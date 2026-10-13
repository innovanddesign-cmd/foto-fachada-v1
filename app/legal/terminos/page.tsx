import Link from "next/link";

export const metadata = {
    title: "Condiciones — Foto Fachada · Escaparates virtuales",
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
                <p>Foto Fachada · Escaparates virtuales es un servicio de INNOVANDESIGN para negocios. Consultar esta página o crear una campaña de prueba no acredita un contrato firmado ni un pago.</p>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">1. El servicio</h2>
                    <p>El servicio prepara propuestas de campaña, webs, carteles imprimibles y QR con los datos y materiales del negocio. Los resultados son borradores que puedes editar y publicar desde tu panel. La IA puede cometer errores: debes revisar servicios, precios, disponibilidad y condiciones antes de publicar. No se incluyen búsquedas automáticas del negocio en internet ni generación de nuevas imágenes o logos mientras esas funciones no estén disponibles.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">2. Planes y pagos</h2>
                    <p>Free permite una campaña activa; Pro, cinco; Business, diez. Los créditos para regeneraciones son un límite separado. La generación inicial incluida y la edición manual no descuentan créditos. Antes de una regeneración se muestra su coste para que puedas aceptarlo.</p>
                    <p>La contratación actual es asistida: registras una solicitud, revisas el pedido y el contrato y recibes las instrucciones de pago. La activación requiere aceptación y verificación del pago por INNOVA. Las pasarelas identificadas como pruebas no cobran ni activan planes reales. No introduzcas datos de tarjeta reales en ellas.</p>
                    <p>El pedido detalla precio e impuestos, periodo, promoción aplicable, créditos, prestaciones, entrega y dominio. No hay permanencia adicional al periodo abonado; la baja se solicita para el final de ese periodo. Los cambios de plan y sus importes se confirman antes de aplicarlos. Las condiciones particulares deben estar completas y aceptadas antes de cobrar.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">3. Uso aceptable</h2>
                    <p>Te comprometes a subir solo imágenes propias o con derechos de uso, y a no generar contenidos ilícitos o que infrinjan derechos de terceros.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">4. Propiedad intelectual</h2>
                    <p>Conservas los derechos que tengas sobre tus materiales y autorizas su tratamiento y publicación para prestar el servicio. Debes disponer de permiso para usar fotografías, logos y textos de terceros. El uso de IA no garantiza exclusividad ni ausencia de derechos de terceros sobre una propuesta. La tecnología y los recursos de la plataforma mantienen sus respectivas licencias.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">5. Limitación de responsabilidad</h2>
                    <p>No se garantizan ventas, citas o posiciones en buscadores. Los proveedores gratuitos de IA tienen límites de disponibilidad y frecuencia; no se cambia automáticamente a un proveedor de pago. Un resultado válido de regeneración puede consumir los créditos confirmados aunque decidas no aplicarlo; los fallos técnicos no deben consumirlos. Puedes comunicar incidencias al contacto del servicio. Estas condiciones no excluyen responsabilidades que legalmente correspondan.</p>
                </section>
                <section>
                    <h2 className="text-white font-bold text-base mb-2">6. Contacto</h2>
                    <p>Para contratación, incidencias y consultas: <a href="mailto:conta@innovandesign.com" className="underline">conta@innovandesign.com</a>. Consulta también la <Link href="/legal/privacidad" className="underline">información de privacidad</Link>.</p>
                </section>
            </div>
        </main>
    );
}
