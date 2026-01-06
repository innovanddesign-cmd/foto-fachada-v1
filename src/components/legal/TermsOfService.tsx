/**
 * Terms of Service Page
 * =====================
 * GDPR-compliant terms and conditions (Spanish)
 */
import { ArrowLeft, FileText, AlertTriangle, CreditCard, Scale, Shield } from 'lucide-react';
// import { useTranslation } from 'react-i18next';

interface TermsOfServiceProps {
    onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
    // const { t } = useTranslation(); // Unused
    const lastUpdated = '4 de Enero de 2026';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Volver</span>
                </button>

                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 shadow-xl">
                    {/* Title */}
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-700/50">
                        <div className="p-3 bg-indigo-600/20 rounded-xl">
                            <FileText size={32} className="text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Términos y Condiciones</h1>
                            <p className="text-slate-400 mt-1">Última actualización: {lastUpdated}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="prose prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Scale size={20} className="text-indigo-400" />
                                1. Aceptación de los Términos
                            </h2>
                            <p className="text-slate-300 leading-relaxed">
                                Al acceder y utilizar Foto Fachada ("el Servicio"), usted acepta estar vinculado
                                por estos Términos y Condiciones, nuestra Política de Privacidad y todas las leyes
                                y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos,
                                no utilice el Servicio.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white">2. Descripción del Servicio</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Foto Fachada es una plataforma de marketing digital que utiliza inteligencia
                                artificial para:
                            </p>
                            <ul className="list-disc pl-6 text-slate-300 space-y-2">
                                <li>Analizar imágenes de fachadas de negocios</li>
                                <li>Generar estrategias de marketing personalizadas</li>
                                <li>Crear widgets interactivos y landing pages</li>
                                <li>Producir carteles con códigos QR</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white">3. Registro y Cuenta</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Para utilizar ciertas funciones del Servicio, debe crear una cuenta. Usted es
                                responsable de:
                            </p>
                            <ul className="list-disc pl-6 text-slate-300 space-y-2">
                                <li>Proporcionar información precisa y actualizada</li>
                                <li>Mantener la confidencialidad de sus credenciales</li>
                                <li>Todas las actividades realizadas desde su cuenta</li>
                                <li>Notificarnos inmediatamente cualquier uso no autorizado</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <CreditCard size={20} className="text-indigo-400" />
                                4. Planes y Pagos
                            </h2>
                            <div className="bg-slate-700/30 p-4 rounded-lg mb-4">
                                <h4 className="font-medium text-white mb-2">Planes de Suscripción</h4>
                                <ul className="list-disc pl-6 text-slate-300 space-y-1 text-sm">
                                    <li><strong>Free:</strong> Funcionalidad limitada, sin coste</li>
                                    <li><strong>Plus:</strong> €9.99/mes - Funciones ampliadas</li>
                                    <li><strong>Pro:</strong> €29.99/mes - Acceso completo</li>
                                    <li><strong>Premium:</strong> €79.99/mes - Uso empresarial ilimitado</li>
                                </ul>
                            </div>
                            <p className="text-slate-300 leading-relaxed">
                                Los pagos se procesan a través de Stripe. Las suscripciones se renuevan
                                automáticamente. Puede cancelar en cualquier momento desde su panel de facturación.
                            </p>
                            <p className="text-slate-300 leading-relaxed mt-2">
                                <strong>Política de reembolso:</strong> Ofrecemos reembolso total dentro de los
                                primeros 14 días de cualquier nueva suscripción. Pasado este período, no se
                                realizan reembolsos por meses parciales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white">5. Propiedad Intelectual</h2>
                            <p className="text-slate-300 leading-relaxed">
                                <strong>Contenido del Usuario:</strong> Usted mantiene todos los derechos sobre
                                las imágenes y contenido que sube. Al subirlo, nos otorga licencia limitada
                                para procesarlo con IA y generar los materiales de marketing.
                            </p>
                            <p className="text-slate-300 leading-relaxed mt-2">
                                <strong>Contenido Generado:</strong> El código, widgets y materiales generados
                                por nuestra IA son de su propiedad para uso comercial dentro de los límites
                                de su plan.
                            </p>
                            <p className="text-slate-300 leading-relaxed mt-2">
                                <strong>Plataforma:</strong> La tecnología, marca, código fuente y diseño de
                                Foto Fachada son propiedad exclusiva de la Empresa.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <AlertTriangle size={20} className="text-amber-400" />
                                6. Uso Prohibido
                            </h2>
                            <p className="text-slate-300 leading-relaxed">Queda prohibido usar el Servicio para:</p>
                            <ul className="list-disc pl-6 text-slate-300 space-y-2">
                                <li>Actividades ilegales o fraudulentas</li>
                                <li>Subir contenido que infrinja derechos de terceros</li>
                                <li>Intentar acceder a sistemas sin autorización</li>
                                <li>Abusar de los límites de la API o realizar scraping</li>
                                <li>Compartir credenciales o revender el servicio sin autorización</li>
                                <li>Generar contenido difamatorio, discriminatorio u ofensivo</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white">7. Limitación de Responsabilidad</h2>
                            <p className="text-slate-300 leading-relaxed">
                                El Servicio se proporciona "tal cual". En la máxima medida permitida por la ley:
                            </p>
                            <ul className="list-disc pl-6 text-slate-300 space-y-2">
                                <li>No garantizamos resultados comerciales específicos</li>
                                <li>No somos responsables de pérdidas indirectas o consecuenciales</li>
                                <li>Nuestra responsabilidad máxima se limita al importe pagado en los últimos 12 meses</li>
                                <li>Las interrupciones del servicio no dan derecho a compensación más allá del prorrateo</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Shield size={20} className="text-indigo-400" />
                                8. Protección de Datos
                            </h2>
                            <p className="text-slate-300 leading-relaxed">
                                Tratamos sus datos personales conforme a nuestra
                                <a href="#" className="text-indigo-400 hover:underline ml-1">Política de Privacidad</a>,
                                cumpliendo con el Reglamento General de Protección de Datos (RGPD) de la Unión Europea.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white">9. Modificaciones</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Nos reservamos el derecho de modificar estos Términos. Notificaremos cambios
                                significativos por email con al menos 30 días de antelación. El uso continuado
                                del Servicio tras la notificación constituye aceptación de los nuevos términos.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white">10. Ley Aplicable y Jurisdicción</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Estos Términos se rigen por la legislación española. Para cualquier controversia,
                                las partes se someten a los Juzgados y Tribunales de Madrid, renunciando a cualquier
                                otro fuero que pudiera corresponderles, sin perjuicio de los derechos que como
                                consumidor le reconozca la normativa aplicable.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white">11. Contacto</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Para cualquier consulta sobre estos Términos, contacte con nosotros en:
                            </p>
                            <ul className="list-none text-slate-300 space-y-1 mt-2">
                                <li>📧 <a href="mailto:legal@fotofachada.com" className="text-indigo-400 hover:underline">legal@fotofachada.com</a></li>
                                <li>📍 Madrid, España</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
