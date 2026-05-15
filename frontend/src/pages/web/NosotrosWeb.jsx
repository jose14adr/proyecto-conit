import { useEffect, useState } from "react";
import { nosotrosWebContent } from "../../data/nosotrosWebContent";
import { obtenerContenidoWeb } from "../../services/webCatalogService";

function NosotrosWeb() {
  const [contenido, setContenido] = useState(nosotrosWebContent);

  const hero = contenido?.hero || nosotrosWebContent.hero;
  const about = Array.isArray(contenido?.about)
    ? contenido.about
    : nosotrosWebContent.about;
  const pillars = contenido?.pillars || nosotrosWebContent.pillars;
  const values = contenido?.values || nosotrosWebContent.values;

  const cargarContenidoNosotros = async () => {
    try {
      const data = await obtenerContenidoWeb("nosotros");

      if (data && typeof data === "object") {
        setContenido({
          ...nosotrosWebContent,
          ...data,
          hero: {
            ...nosotrosWebContent.hero,
            ...(data.hero || {}),
          },
          about: Array.isArray(data.about)
            ? data.about
            : nosotrosWebContent.about,
          pillars: {
            ...nosotrosWebContent.pillars,
            ...(data.pillars || {}),
            items: Array.isArray(data.pillars?.items)
              ? data.pillars.items
              : nosotrosWebContent.pillars.items,
          },
          values: {
            ...nosotrosWebContent.values,
            ...(data.values || {}),
            items: Array.isArray(data.values?.items)
              ? data.values.items
              : nosotrosWebContent.values.items,
          },
        });
      }
    } catch (error) {
      console.error("Error cargando contenido de Nosotros:", error);
      setContenido(nosotrosWebContent);
    }
  };

  useEffect(() => {
    cargarContenidoNosotros();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      {/* HERO */}
      <section
        className="py-20 text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
        }}
      >
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-4 inline-block rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur">
            {hero.tag}
          </p>

          <h1 className="mb-5 max-w-4xl text-4xl font-black leading-tight md:text-5xl">
            {hero.title}
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-white/80 md:text-lg">
            {hero.description}
          </p>
        </div>
      </section>

      {/* QUIÉNES SOMOS / PROPÓSITO */}
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-2">
          {about.map((item, index) => (
            <article
              key={index}
              className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-sm"
            >
              <div className="mb-5 h-1.5 w-16 rounded-full bg-[var(--color-primary)]" />

              <h2 className="mb-4 text-2xl font-bold text-[var(--color-text)]">
                {item.title}
              </h2>

              <div className="space-y-4">
                {(item.paragraphs || []).map((paragraph, paragraphIndex) => (
                  <p
                    key={paragraphIndex}
                    className="leading-8 text-[var(--color-muted-text)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* MISIÓN Y VISIÓN */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <p className="mb-3 inline-block rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
              {pillars.tag}
            </p>

            <h2 className="text-3xl font-black text-[var(--color-text)]">
              {pillars.title}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {(pillars.items || []).map((item, index) => (
              <article
                key={index}
                className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="mb-4 text-2xl font-bold text-[var(--color-text)]">
                  {item.title}
                </h3>

                <p className="leading-8 text-[var(--color-muted-text)]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="pb-20 pt-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <p className="mb-3 inline-block rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
              {values.tag}
            </p>

            <h2 className="text-3xl font-black text-[var(--color-text)]">
              {values.title}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(values.items || []).map((item, index) => (
              <article
                key={index}
                className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-lg font-black text-[var(--color-primary)]">
                  {index + 1}
                </div>

                <h3 className="mb-4 text-xl font-bold text-[var(--color-text)]">
                  {item.title}
                </h3>

                <p className="leading-8 text-[var(--color-muted-text)]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default NosotrosWeb;