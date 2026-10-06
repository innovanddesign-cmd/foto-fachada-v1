import type { AdnMarca, DatosEscaparate } from '@/lib/estado/tipos-estado';

export interface EstrategiaConversion {
  objetivo: 'CITAS' | 'CONSULTAS';
  publico: string;
  motivoEscaneo: string;
  textoCartel: string;
  cta: string;
  mensajeWhatsApp: string;
  telefono: string;
  confirmadaEn?: string;
}

export function sugerirEstrategia(adn: AdnMarca, telefono = ''): EstrategiaConversion {
  const citas = /est[eé]t|belleza|peluq|cl[ií]nic|salud/i.test(adn.analisisVision?.categoriaSugerida || '');
  return {
    objetivo: citas ? 'CITAS' : 'CONSULTAS',
    publico: 'Personas que pasan por el local y quieren conocer nuestros servicios antes de contactar.',
    motivoEscaneo: 'Conocer nuestros servicios y contactar directamente, sin dejar datos para consultar.',
    textoCartel: citas ? 'Descubre nuestros servicios y consulta tu cita. Escanea aquí.' : 'Descubre lo que ofrecemos y consúltanos. Escanea aquí.',
    cta: citas ? 'Consultar cita por WhatsApp' : 'Consultar por WhatsApp',
    mensajeWhatsApp: citas ? 'Hola, he visto vuestro escaparate y quisiera consultar disponibilidad para una cita.' : 'Hola, he visto vuestro escaparate y quisiera más información.',
    telefono,
  };
}

export function validarEstrategia(plan?: EstrategiaConversion): string | null {
  if (!plan || !['CITAS', 'CONSULTAS'].includes(plan.objetivo)) return 'Elige qué quieres conseguir.';
  if (![plan.publico, plan.motivoEscaneo, plan.textoCartel, plan.cta, plan.mensajeWhatsApp].every(v => typeof v === 'string' && v.trim())) return 'Completa los textos de la propuesta antes de confirmar.';
  if (plan.publico.length > 400 || plan.motivoEscaneo.length > 400 || plan.textoCartel.length > 160 || plan.cta.length > 70 || plan.mensajeWhatsApp.length > 500) return 'Acorta los textos para que se lean bien en la web y el cartel.';
  if (!/^\+?[\d\s()-]+$/.test(plan.telefono) || !/^\d{8,15}$/.test(plan.telefono.replace(/\D/g, ''))) return 'Escribe el WhatsApp del negocio con prefijo de país, por ejemplo +34 600 123 456.';
  return null;
}

export function estrategiaConfirmada(plan?: EstrategiaConversion): boolean {
  return Boolean(plan?.confirmadaEn && !validarEstrategia(plan));
}

/** Apply only strategy-owned fields; preserve offers, design and edited business content. */
export function aplicarEstrategia(datos: DatosEscaparate, plan: EstrategiaConversion): DatosEscaparate {
  const error = validarEstrategia(plan);
  if (error || !plan.confirmadaEn) throw new Error(error || 'Confirma primero la propuesta.');
  return {...datos, datosReales: {...datos.datosReales, ctaPrincipal: plan.cta.trim(), mensajeWhatsApp: plan.mensajeWhatsApp.trim(), telefono: plan.telefono.trim()}};
}
