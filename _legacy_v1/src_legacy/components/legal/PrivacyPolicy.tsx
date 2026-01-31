/**
 * Privacy Policy Page
 * ====================
 * GDPR-compliant privacy policy (Spanish)
 */
import { ArrowLeft, Shield, Lock, Eye, Database, Globe } from 'lucide-react';
// import { useTranslation } from 'react-i18next';

interface PrivacyPolicyProps {
    onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
    // function PrivacyPolicy() {
    // const { t } = useTranslation(); // Unused
    const lastUpdated = '4 de Enero de 2026';

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 transition-colors group"
                >
                    <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:border-indigo-200 transition-colors">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-medium">Volver</span>
                </button>

                <div className="glass-card bg-white/80 backdrop-blur-xl border border-white/60 p-8 shadow-xl rounded-[32px]">
                    {/* Title */}
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                        <div className="p-4 bg-indigo-50 rounded-2xl">
                            <Shield size={32} className="text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Política de Privacidad</h1>
                            <p className="text-gray-500 mt-1">Última actualización: {lastUpdated}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg prose-indigo max-w-none space-y-8 text-gray-600">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Database size={24} className="text-indigo-500" />
                                1. Responsable del Tratamiento
                            </h2>
                            <p className="leading-relaxed">
                                El responsable del tratamiento de sus datos personales es Foto Fachada
                                (en adelante, "nosotros" o "la Empresa"), con domicilio en España.
                            </p>
                            <p className="leading-relaxed">
                                Para cualquier consulta relacionada con la protección de datos, puede
                                contactarnos en: <a href="mailto:privacidad@fotofachada.com" className="text-indigo-600 font-medium hover:underline">privacidad@fotofachada.com</a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Eye size={24} className="text-indigo-500" />
                                2. Datos que Recopilamos
                            </h2>
                            <p className="leading-relaxed">Recopilamos los siguientes tipos de datos:</p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
                                <li><strong>Datos de identificación:</strong> Nombre, email, teléfono (opcional)</li>
                                <li><strong>Imágenes:</strong> Fotos de fachadas de negocios que usted sube</li>
                                <li><strong>Datos de uso:</strong> Páginas visitadas, funciones utilizadas, tiempo de sesión</li>
                                <li><strong>Datos técnicos:</strong> Dirección IP, tipo de navegador, dispositivo</li>
                                <li><strong>Datos de pago:</strong> Procesados directamente por Stripe (no almacenamos tarjetas)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Lock size={24} className="text-indigo-500" />
                                3. Base Legal y Finalidades
                            </h2>
                            <p className="leading-relaxed">Tratamos sus datos con las siguientes bases legales:</p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
                                <li><strong>Ejecución del contrato:</strong> Para prestar nuestros servicios de marketing digital</li>
                                <li><strong>Consentimiento:</strong> Para envío de comunicaciones comerciales (revocable)</li>
                                <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y prevenir fraudes</li>
                                <li><strong>Obligación legal:</strong> Para cumplir con requisitos fiscales y legales</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Globe size={24} className="text-indigo-500" />
                                4. Transferencias Internacionales
                            </h2>
                            <p className="leading-relaxed">
                                Sus datos pueden ser transferidos a proveedores ubicados fuera del Espacio
                                Económico Europeo (EEE), específicamente:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
                                <li><strong>Google Cloud/Gemini AI:</strong> Para procesamiento de IA (EE.UU., cláusulas contractuales tipo)</li>
                                <li><strong>Stripe:</strong> Para procesamiento de pagos (EE.UU., cláusulas contractuales tipo)</li>
                                <li><strong>Supabase:</strong> Para almacenamiento de datos (EE.UU., certificado DPF)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900">5. Derechos GDPR</h2>
                            <p className="leading-relaxed">
                                Conforme al Reglamento General de Protección de Datos (RGPD), usted tiene derecho a:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {[
                                    { title: 'Acceso', desc: 'Obtener copia de sus datos' },
                                    { title: 'Rectificación', desc: 'Corregir datos inexactos' },
                                    { title: 'Supresión', desc: 'Eliminar sus datos ("derecho al olvido")' },
                                    { title: 'Oposición', desc: 'Oponerse al tratamiento' },
                                    { title: 'Portabilidad', desc: 'Recibir sus datos en formato estructurado' },
                                    { title: 'Limitación', desc: 'Restringir el tratamiento' },
                                ].map((right, i) => (
                                    <div key={i} className="bg-gray-50 border border-gray-100 p-5 rounded-2xl hover:border-indigo-200 transition-colors">
                                        <h4 className="font-bold text-gray-900 mb-1">{right.title}</h4>
                                        <p className="text-sm text-gray-500">{right.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="leading-relaxed mt-6">
                                Para ejercer estos derechos, contacte a <a href="mailto:privacidad@fotofachada.com" className="text-indigo-600 font-medium hover:underline">privacidad@fotofachada.com</a>.
                                Responderemos en un plazo máximo de 30 días.
                            </p>
                        </section>

                        {/* ... (rest of sections 6, 7, 8 with same styling) ... */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-900">6. Retención de Datos</h2>
                            <p className="leading-relaxed">
                                Conservamos sus datos durante el tiempo necesario para cumplir con las finalidades
                                descritas, y posteriormente durante los plazos legales aplicables:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
                                <li>Datos de cuenta: Mientras la cuenta esté activa + 3 años</li>
                                <li>Datos de facturación: 6 años (obligación fiscal)</li>
                                <li>Imágenes subidas: 1 año tras última actividad o cancelación</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900">7. Cookies</h2>
                            <p className="leading-relaxed">
                                Utilizamos cookies esenciales para el funcionamiento del servicio y cookies
                                analíticas (con su consentimiento). Puede configurar sus preferencias en
                                cualquier momento desde los ajustes de su navegador.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900">8. Reclamaciones</h2>
                            <p className="leading-relaxed">
                                Si considera que el tratamiento de sus datos no es adecuado, puede presentar
                                una reclamación ante la Agencia Española de Protección de Datos (AEPD):
                                <a href="https://www.aepd.es" target="_blank" rel="noopener" className="text-indigo-600 font-medium hover:underline ml-1">www.aepd.es</a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
