export function DistritoCaseStudy() {
  const deliverables = [
    {
      title: "Presencia digital",
      text: "Definición de la identidad digital del proyecto y de cómo se presenta Distrito Homes en internet.",
    },
    {
      title: "Sitio web completo",
      text: "Diseño y desarrollo de la web del proyecto, con sus apartados y su contenido ordenados para contar la propiedad con claridad.",
    },
    {
      title: "Tarjeta de visita con QR",
      text: "Diseño de la tarjeta de visita y su landing con QR, para llevar de la tarjeta impresa a la web en un solo gesto.",
    },
    {
      title: "Backend propio de gestión",
      text: "Herramienta privada para gestionar las propiedades desde una única plataforma conectada con los portales inmobiliarios.",
    },
  ];

  return (
    <section
      id="caso-distrito-homes"
      className="relative overflow-hidden bg-[#070907] py-20 sm:py-24 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_15%_0%,rgba(0,255,157,0.14),transparent_55%)]"
      />

      <div className="studio-container relative">
        <header className="max-w-3xl">
          <span className="studio-eyebrow">Caso de éxito</span>
          <h2 className="mt-5 text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            Dos socios. Una visión.{" "}
            <span className="text-[#00ff9d]">Toda la tecnología conectada.</span>
          </h2>
          <p className="studio-muted mt-6 text-base leading-relaxed sm:text-lg">
            En INNOVA AND DESIGN, Javi acompaña a Distrito Homes como partner de
            tecnología y diseño: dos socios confiaron todo el proyecto —la
            tecnología y el diseño— a su experiencia. Lo que sigue es cómo se
            construyó esa visión, de principio a fin.
          </p>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
          <div className="relative">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
              <div className="relative aspect-[4/5] w-full sm:aspect-[16/11] lg:aspect-[4/5]">
                <img
                  src="/design-references/brands/distrito/distrito-skyline.jpg"
                  alt="Skyline de Benidorm, imagen del proyecto Distrito Homes"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#070907] via-[#070907]/45 to-transparent"
                />
              </div>

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <img
                    src="/design-references/brands/distrito/distrito-logo.png"
                    alt="Logotipo de Distrito Homes"
                    loading="lazy"
                    className="h-12 w-auto sm:h-14"
                  />
                  <div className="border-l border-white/15 pl-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/55">
                      Cliente
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      Distrito Homes
                    </p>
                  </div>
                </div>
                <span className="studio-muted hidden text-xs uppercase tracking-[0.28em] sm:block">
                  Benidorm
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a
                href="https://distritohomes.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="studio-button inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm"
              >
                Ver web del proyecto
                <span aria-hidden="true">↗</span>
              </a>
              <a
                href="https://www.distritohomes.es/landing.html"
                target="_blank"
                rel="noopener noreferrer"
                className="studio-button inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-transparent px-6 py-3 text-sm text-white/85 transition hover:border-white/35 hover:text-white"
              >
                Ver tarjeta digital
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col">
            <p className="studio-eyebrow">El encargo</p>
            <p className="mt-5 text-lg leading-relaxed text-white sm:text-xl">
              Dos socios confiaron toda la tecnología y el diseño de su proyecto
              a Javi y a su experiencia. El objetivo: que Distrito Homes tuviera
              una sola base digital sólida, de la tarjeta impresa a la gestión de
              las propiedades.
            </p>
            <p className="studio-muted mt-4 leading-relaxed">
              Todo se resolvió dentro del mismo proyecto, de modo que la marca,
              la web y la herramienta interna hablan el mismo idioma. El backend
              es una herramienta privada de gestión: no es una parte pública de
              la web, sino el panel desde el que el equipo trabaja cada día.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
              {deliverables.map((item, index) => (
                <div
                  key={item.title}
                  className="group flex flex-col gap-3 bg-[#070907] p-6 transition hover:bg-white/[0.04] sm:p-7"
                >
                  <span className="text-xs font-medium tabular-nums text-[#00ff9d]">
                    0{index + 1}
                  </span>
                  <h3 className="text-base font-semibold leading-snug text-white">
                    {item.title}
                  </h3>
                  <p className="studio-muted text-sm leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="text-base leading-relaxed text-white/90 sm:text-lg">
                La tecnología y el diseño, resueltos por la misma persona, para
                que el proyecto avance sin piezas sueltas.
              </p>
              <a
                href="mailto:innovandesign@gmail.com?subject=Quiero%20un%20proyecto%20como%20Distrito%20Homes"
                className="studio-button mt-6 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm"
              >
                Quiero un proyecto como Distrito Homes
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
