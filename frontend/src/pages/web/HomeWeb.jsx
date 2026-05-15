import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { homeWebContent } from "../../data/homeWebContent";
import {
  listarCursosDestacadosWeb,
  obtenerContenidoWeb,
} from "../../services/webCatalogService";

function HomeWeb() {
  const [contenido, setContenido] = useState(homeWebContent);
  const [cursosDestacados, setCursosDestacados] = useState([]);
  const [cargandoDestacados, setCargandoDestacados] = useState(true);

  const hero = contenido?.hero || homeWebContent.hero;
  const benefits = contenido?.benefits || homeWebContent.benefits;
  const featured = contenido?.featured || homeWebContent.featured;
  const cta = contenido?.cta || homeWebContent.cta;

  const cargarContenidoHome = async () => {
    try {
      const data = await obtenerContenidoWeb("home");

      if (data && typeof data === "object") {
        setContenido({
          ...homeWebContent,
          ...data,
        });
      }
    } catch (error) {
      console.error("Error cargando contenido del Home:", error);
      setContenido(homeWebContent);
    }
  };

  const cargarCursosDestacados = async () => {
    try {
      setCargandoDestacados(true);

      const data = await listarCursosDestacadosWeb();
      setCursosDestacados(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando cursos destacados:", error);
      setCursosDestacados([]);
    } finally {
      setCargandoDestacados(false);
    }
  };

  useEffect(() => {
    cargarContenidoHome();
    cargarCursosDestacados();
  }, []);

  return (
    <main className="bg-[var(--color-background)] text-[var(--color-text)]">
      {/* HERO */}
      <section
        className="relative flex min-h-[85vh] items-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.74), rgba(15,23,42,0.74)), url('${
            hero.backgroundImage ||
            "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80"
          }')`,
        }}
      >
        <div className="w-full">
          <div className="mx-auto max-w-6xl px-5 py-20 text-white">
            <p className="mb-4 inline-block rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              {hero.tag}
            </p>

            <h1 className="mb-5 max-w-2xl text-4xl font-black leading-tight md:text-5xl">
              {hero.title}
            </h1>

            <p className="mb-8 max-w-xl text-lg leading-relaxed text-white/80">
              {hero.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to={hero.primaryButton?.to || "/web/cursos"}
                className="rounded-2xl bg-[var(--color-button-primary)] px-6 py-3 font-bold text-[var(--color-button-primary-text)] shadow-sm transition hover:brightness-95"
              >
                {hero.primaryButton?.text || "Ver cursos"}
              </Link>

              <Link
                to={hero.secondaryButton?.to || "/web/nosotros"}
                className="rounded-2xl bg-white px-6 py-3 font-bold text-slate-900 shadow-sm transition hover:bg-slate-100"
              >
                {hero.secondaryButton?.text || "Conócenos"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="relative z-10 -mt-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-3">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 h-1.5 w-16 rounded-full bg-[var(--color-primary)]" />

              <h3 className="mb-3 text-xl font-bold text-[var(--color-text)]">
                {item.title}
              </h3>

              <p className="leading-relaxed text-[var(--color-muted-text)]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CURSOS DESTACADOS */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 text-center">
            <p className="mb-3 inline-block rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-4 py-2 text-sm font-bold text-[var(--color-primary)]">
              {featured.tag || "Cursos destacados"}
            </p>

            <h2 className="text-3xl font-black text-[var(--color-text)]">
              {featured.title || "Programas recomendados"}
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-[var(--color-muted-text)]">
              {featured.description ||
                "Explora los cursos seleccionados para mostrar en la página principal."}
            </p>
          </div>

          {cargandoDestacados ? (
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center font-semibold text-[var(--color-muted-text)] shadow-sm">
              Cargando cursos destacados...
            </div>
          ) : cursosDestacados.length === 0 ? (
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center shadow-sm">
              <h3 className="mb-2 text-xl font-bold text-[var(--color-text)]">
                Aún no hay cursos destacados
              </h3>

              <p className="text-[var(--color-muted-text)]">
                Marca cursos como destacados desde el panel de Gestión Web.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {cursosDestacados.map((curso) => {
                const precio = curso.precioFinal ?? curso.precio ?? 0;

                return (
                  <article
                    key={curso.id}
                    className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {curso.imagenUrl ? (
                      <div className="h-44 w-full overflow-hidden bg-[var(--color-background)]">
                        <img
                          src={curso.imagenUrl}
                          alt={curso.titulo}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex h-44 items-center justify-center px-5 text-center text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
                        }}
                      >
                        <h3 className="text-xl font-bold">{curso.titulo}</h3>
                      </div>
                    )}

                    <div className="p-7">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
                          {curso.etiqueta || "Curso"}
                        </span>

                        <span className="rounded-full bg-[var(--color-background)] px-3 py-1 text-xs font-bold text-[var(--color-muted-text)] ring-1 ring-[var(--color-border)]">
                          {curso.nivel || "Sin nivel"}
                        </span>
                      </div>

                      <h3 className="mb-3 text-xl font-bold text-[var(--color-text)]">
                        {curso.titulo}
                      </h3>

                      <p className="mb-5 line-clamp-3 leading-relaxed text-[var(--color-muted-text)]">
                        {curso.descripcion || "Sin descripción disponible."}
                      </p>

                      <div className="mb-5 flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
                        <span className="text-sm text-[var(--color-muted-text)]">
                          Precio
                        </span>

                        <span className="font-black text-[var(--color-primary)]">
                          S/ {Number(precio).toFixed(2)}
                        </span>
                      </div>

                      <Link
                        to={`/web/cursos/${curso.slug || curso.id}`}
                        className="font-bold text-[var(--color-primary)] hover:underline"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-5">
          <div
            className="overflow-hidden rounded-3xl p-12 text-center text-white shadow-lg"
            style={{
              background:
                "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
            }}
          >
            <h2 className="mb-4 text-3xl font-black">{cta.title}</h2>

            <p className="mx-auto mb-6 max-w-2xl text-white/80">
              {cta.description}
            </p>

            <Link
              to={cta.buttonTo || "/web/cursos"}
              className="rounded-2xl bg-white px-6 py-3 font-bold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              {cta.buttonText || "Explorar cursos"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomeWeb;