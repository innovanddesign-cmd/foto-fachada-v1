# RESUMEN MAESTRO — PROYECTO FOTO FACHADA
> Generado el 30/03/2026 | Consolidación de 9 conversaciones en Claude, ChatGPT y Gemini

---

## ÍNDICE
1. [Línea cronológica](#1-línea-cronológica)
2. [Qué es el proyecto](#2-qué-es-el-proyecto)
3. [Evolución del modelo de negocio](#3-evolución-del-modelo-de-negocio)
4. [Arquitectura técnica consolidada](#4-arquitectura-técnica-consolidada)
5. [El flujo de 7 fases](#5-el-flujo-de-7-fases)
6. [Pricing y métricas objetivo](#6-pricing-y-métricas-objetivo)
7. [Contradicciones y decisiones pendientes](#7-contradicciones-y-decisiones-pendientes)
8. [Estado real de implementación](#8-estado-real-de-implementación)
9. [Próximos pasos recomendados](#9-próximos-pasos-recomendados)

---

## 1. LÍNEA CRONOLÓGICA

| # | Fecha | Archivo | Plataforma | Tema |
|---|-------|---------|-----------|------|
| 1 | 29/10/2025 | `claude.md` | **Claude** | MVP inicial + Business Plan + pricing |
| 2 | 02/11/2025 | `chatgpt-2_11_2025.md` | **ChatGPT** | Personalización profunda por sector |
| 3 | 21/01/2026 | `Foto Fachada.md` | **Gemini** | Documento final de curso — visión SaaS nacional |
| 4 | s/f* | `FOTO FACHADA - Analisis Propuesta de Valor.md` | **Gemini** | Análisis del problema (3 niveles) + UVP |
| 5 | s/f* | `FOTO FACHADA_Modelos de Negocio_SaaS vs. Agencia.md` | **Gemini** | Comparativa SaaS vs. Agencia — decisión estratégica |
| 6 | s/f* | `Proyecto Foto Fachada - Flujo de Trabajo.md` | **Gemini** | Validación Lean + NotebookLM + mecánicas virales |
| 7 | s/f* | `FOTOFACHADA.md` | **Gemini** | Especificación técnica Fase 1 (Phase-Locking) |
| 8 | s/f* | `Foto Fachada V2 - Experiencia Generativa.md` | **Gemini** | UX generativa — los 6 estados, Aero-Glassmorphism |
| 9 | s/f* | `Foto Fachada v2 - Motor generativo.md` | **Gemini** | Prompts por bloque — especificación ultra-detallada |

*s/f = sin fecha explícita. Por contexto y progresión del concepto, los archivos 4–9 son posteriores al 21/01/2026.

---

## 2. QUÉ ES EL PROYECTO

**Foto Fachada** transforma la foto de la fachada de un negocio local en un ecosistema digital completo, generado automáticamente por IA en menos de 2 minutos.

### El problema que resuelve (3 niveles)
1. **Efecto Vitrina** — El cliente juzga el negocio por su presencia digital. Una foto mala o inexistente genera desconfianza antes de entrar.
2. **Dificultad de tangibilización** — Un negocio físico vende experiencia. El texto solo no la transmite.
3. **Desventaja competitiva** — Las franquicias tienen estrategia visual. El pequeño comercio, no.

### La solución en una frase
> "Sube una foto de tu local → la IA extrae tu ADN de marca → genera tu escaparate digital, cartelería y QR en 2 minutos."

### Datos de soporte
- Negocios con fotos profesionales reciben **+35% de clics**
- Tiempo actual de crear una web con agencia: **15 días** → Foto Fachada: **<2 minutos**
- Ahorro estimado: **90% en costes de diseño**

---

## 3. EVOLUCIÓN DEL MODELO DE NEGOCIO

El proyecto ha pasado por dos modelos radicalmente distintos. Esta es la evolución:

### Modelo A — Agencia presencial (origen, oct 2025)
- Vendedor va puerta a puerta con tablet
- Demuestra el producto en directo
- Entrega: landing personalizada + cartel A4 con QR
- Precio: €100/año
- Break-even: mes 2 (con 7 clientes)
- Escalabilidad: limitada a la capacidad del vendedor

### Modelo B — SaaS self-service (objetivo, ene 2026+)
- Usuario sube foto desde cualquier dispositivo
- IA genera el escaparate automáticamente
- Sin intervención humana en el proceso
- Precio: desde €100/año
- Escalabilidad: exponencial
- Margen año 2+: >80%

### Recomendación consensuada entre conversaciones
> Usar **Modelo A para validar** (3–6 meses, bajo coste), y construir **Modelo B en paralelo** como objetivo a 18 meses. Transición gradual: validar con ventas presenciales → automatizar con SaaS.

---

## 4. ARQUITECTURA TÉCNICA CONSOLIDADA

### Stack definitivo (según conversaciones más recientes)

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Framework | **Next.js 15** (App Router) | SSR + ISR para escaparates públicos |
| UI | **React 19 + TypeScript** | 100% castellano en variables y comentarios |
| Estilos | **Tailwind CSS + Glassmorphism** | Sistema "Cristal Líquido 2026" |
| Animaciones | **Framer Motion** | Spring physics: stiffness 260, damping 20 |
| Estado | **Zustand** | Store único centralizado + localStorage |
| IA principal | **Gemini 1.5/2.0 Flash** | Análisis de imágenes + generación |
| Auth | **Supabase + JWT** | JWT mínimo 32 chars |
| BD | **PostgreSQL / Supabase** | Escaparates, campañas, métricas |
| Pagos | **Stripe** | Planes Base/Plus/Pro |
| PDF/Carteles | **html2canvas + Puppeteer** | Exportación A4 300 DPI |
| Deploy | **Vercel** | Frontend. Backend con PM2 en VPS |
| CDN/DNS | **Cloudflare** | Caché + seguridad |

### Principios de diseño (no negociables según las conversaciones)
- **Mobile-first** — móvil es prioritario, escritorio secundario
- **Cero inglés en la interfaz** — todos los textos, botones y mensajes en español
- **Phase-Locking** — no pasar a siguiente fase hasta que la actual esté 100% funcional
- **Semilla de Proyecto** — mantener consistencia de datos entre iteraciones de desarrollo
- **Generative UI** — la IA decide la estructura visual, no hay plantillas fijas

---

## 5. EL FLUJO DE 7 FASES

### Máquina de estados de la aplicación

```
CAPTURA → ANALISIS → ESCAPARATE → CARTELERÍA → CONFIGURACIÓN → DASHBOARD → DESPLIEGUE
  F1         F2          F3            F4             F5             F6         F6B
```

| Fase | Nombre | Acción IA | Resultado |
|------|--------|-----------|-----------|
| **F1** | Captura | Espera activa | Foto subida + metadatos del negocio |
| **F2** | ADN de Marca | Extrae paleta, tipografía, arquetipos | Informe de identidad visual |
| **F3** | Escaparate | Genera estructura + contenido | Landing personalizada (hero, ofertas, layout) |
| **F4** | Cartelería | Adapta diseño a formato físico | Cartel A4 listo para imprimir (300 DPI) |
| **F5** | Configuración | Genera formulario según componentes | Editor conversacional + preview móvil |
| **F6** | Dashboard | Analiza métricas + genera insights | Panel tipo Apple Health + anillos de actividad |
| **F6B** | Despliegue | Publica en edge + genera QR | URL pública `/v/[slug]` + QR con tracking |

### Especificaciones Fase 1 (la más detallada en las conversaciones)
- Formatos aceptados: WebP, AVIF, PNG, JPG (fachada máx. 10MB; logo máx. 5MB)
- Compresión automática en cliente a 2000px de ancho
- Drag-and-drop con animación de pulso radial
- Campos opcionales: logo, redes sociales (Instagram, TikTok, etc.), web actual
- Persistencia: SessionStorage + Supabase
- **Bloqueante**: No avanzar a F2 hasta validación completa

---

## 6. PRICING Y MÉTRICAS OBJETIVO

### Planes (consolidado de todas las conversaciones)

| Plan | Precio/año | Funcionalidades | Target |
|------|-----------|----------------|--------|
| **Base** | €100 | 3–4 funcionalidades personalizadas, landing, QR | Pequeño comercio sin web |
| **Plus** | €180 | 5–7 funcionalidades, gamificación, analytics | Negocio activo queriendo crecer |
| **Pro** | €300 | Funcionalidades ilimitadas, dominio propio | Negocio digital-native o franquicia |
| **Extras** | - | Dominio (+€15–30), Cartel A3 (+€20–40) | Upselling |

### KPIs objetivo
| Métrica | Objetivo |
|---------|---------|
| Tiempo de generación | < 120 segundos |
| CTR físico (escaneo QR) | 12–15% |
| Churn anual | < 3% |
| CAC | €20–50 |
| LTV | €1.000+ |
| Margen bruto año 2+ | > 87% |
| Break-even (Modelo A) | Mes 2 (7 clientes) |

### Segmentos de cliente prioritarios
1. Bares y cafeterías
2. Restaurantes
3. Peluquerías y barberías
4. Tiendas minoristas
5. Gimnasios y centros deportivos
6. Servicios profesionales (clínicas, talleres, etc.)

**Perfil ideal:** Negocio local urbano, facturación €2K–€50K/mes, sin web o con web muy básica, dueño de 25–55 años.

---

## 7. CONTRADICCIONES Y DECISIONES PENDIENTES

### Contradicciones identificadas entre conversaciones

| # | Tema | Versión anterior | Versión actual | Decisión tomada |
|---|------|-----------------|---------------|-----------------|
| C1 | **Modelo de negocio** | Agencia presencial + cartel físico | SaaS self-service nacional | ⚠️ No resuelta — ambas coexisten |
| C2 | **Personalización** | Funcionalidades estándar genéricas | Funcionalidades únicas por sector | ✅ Ganó la versión personalizada |
| C3 | **Arquitectura UI** | Templates HTML rígidos | Generative UI (IA decide estructura) | ✅ Ganó Generative UI |
| C4 | **Idioma del código** | Permitía inglés en términos técnicos | Cero inglés, 100% español | ✅ Ganó cero inglés (estricto) |
| C5 | **Ritmo de desarrollo** | "Desarrollemos el MVP ya" | Phase-Locking fase por fase | ✅ Ganó Phase-Locking |

### Preguntas sin responder (críticas para continuar)
1. **¿Cuál es el MVP real?** ¿La Fase 1 funcional o un ciclo completo simplificado?
2. **¿SaaS o Agencia primero?** La recomendación es Agencia para validar, pero el código es SaaS.
3. **¿Cómo se gestiona el onboarding** de negocios sin conocimientos digitales?
4. **¿Cómo compite** contra Google My Business, Wix, Shopify?
5. **¿Qué pasa con la calidad de la foto?** ¿Qué hace la IA con una foto mala?

---

## 8. ESTADO REAL DE IMPLEMENTACIÓN

### Lo que existe hoy en el código (carpeta principal)
- ✅ Flujo de 7 fases en `/create`
- ✅ Integración real con Gemini 1.5 y 2.0 Flash
- ✅ Store Zustand con persistencia localStorage
- ✅ Dashboard con métricas (simuladas)
- ✅ Escaparate público `/v/[slug]` con ISR
- ✅ Sistema de diseño Glassmorphism
- ✅ Cartelería (preview + biblioteca)
- ✅ Editor conversacional + SmartphoneMockup

### Lo que aún no está implementado
- ❌ Base de datos real (Supabase/PostgreSQL) — métricas son mock
- ❌ Sistema de pagos (Stripe configurado pero no activo)
- ❌ Autenticación de usuarios
- ❌ Persistencia real de escaparates (actualmente solo localStorage)
- ❌ Tracking real de escaneos QR
- ❌ Dominio propio por cliente
- ❌ Testing con negocios reales

### Estimación de completitud
| Área | % implementado |
|------|---------------|
| Frontend / UX | ~75% |
| IA (Gemini) | ~60% |
| Backend / BD | ~10% |
| Pagos | ~5% |
| Auth | ~0% |
| **Total** | **~35%** |

---

## 9. PRÓXIMOS PASOS RECOMENDADOS

### Corto plazo — Validar (0–3 meses)
1. **Probar con 5–10 negocios reales** usando el flujo actual (aunque los datos sean mock)
2. **Medir** cuánto tarda realmente la generación, qué partes confunden al usuario
3. **Decidir** definitivamente: ¿arrancamos con Modelo A (presencial) o directo al SaaS?

### Medio plazo — Conectar (3–6 meses)
4. **Integrar Supabase** para persistencia real de escaparates y campañas
5. **Activar Stripe** para el Plan Base (€100/año)
6. **Implementar autenticación** básica (email + magic link via Supabase)
7. **Tracking QR real** con registro de escaneos

### Largo plazo — Escalar (6–18 meses)
8. **Panel de administración** para gestionar clientes
9. **API pública** para integradores y revendedores
10. **Expansión SaaS nacional** con marketing digital

---

*Documento generado a partir del análisis de 9 conversaciones de Claude, ChatGPT y Gemini entre octubre 2025 y marzo 2026.*
