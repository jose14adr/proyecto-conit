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
    <main className="bg-slate-50 text-slate-900">
      {/* HERO */}
      <section
        className="relative flex min-h-[85vh] items-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.72), rgba(15,23,42,0.72)), url('${
            hero.backgroundImage ||
            "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80"
          }')`,
        }}
      >
        <div className="w-full">
          <div className="mx-auto max-w-6xl px-5 py-20 text-white">
            <p className="mb-4 inline-block rounded-full bg-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-400">
              {hero.tag}
            </p>

            <h1 className="mb-5 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
              {hero.title}
            </h1>

            <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-200">
              {hero.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to={hero.primaryButton?.to || "/web/cursos"}
                className="rounded-lg bg-sky-400 px-6 py-3 font-semibold text-white transition hover:bg-sky-500"
              >
                {hero.primaryButton?.text || "Ver cursos"}
              </Link>

              <Link
                to={hero.secondaryButton?.to || "/web/nosotros"}
                className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-gray-200"
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
            <div key={index} className="rounded-2xl bg-white p-7 shadow-lg">
              <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
              <p className="leading-relaxed text-slate-600">
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
            <p className="mb-3 inline-block rounded-full bg-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-400">
              {featured.tag || "Cursos destacados"}
            </p>

            <h2 className="text-3xl font-bold">
              {featured.title || "Programas recomendados"}
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              {featured.description ||
                "Explora los cursos seleccionados para mostrar en la página principal."}
            </p>
          </div>

          {cargandoDestacados ? (
            <div className="rounded-2xl bg-white p-8 text-center font-semibold text-slate-600 shadow-sm">
              Cargando cursos destacados...
            </div>
          ) : cursosDestacados.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                Aún no hay cursos destacados
              </h3>
              <p className="text-slate-600">
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
                    className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {curso.imagenUrl ? (
                      <div className="h-44 w-full overflow-hidden bg-slate-100">
                        <img
                          src={curso.imagenUrl}
                          alt={curso.titulo}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-44 items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 px-5 text-center text-white">
                        <h3 className="text-xl font-bold">{curso.titulo}</h3>
                      </div>
                    )}

                    <div className="p-7">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                          {curso.etiqueta || "Curso"}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {curso.nivel || "Sin nivel"}
                        </span>
                      </div>

                      <h3 className="mb-3 text-xl font-semibold text-slate-900">
                        {curso.titulo}
                      </h3>

                      <p className="mb-5 line-clamp-3 leading-relaxed text-slate-600">
                        {curso.descripcion || "Sin descripción disponible."}
                      </p>

                      <div className="mb-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                        <span className="text-sm text-slate-500">Precio</span>
                        <span className="font-bold text-sky-700">
                          S/ {Number(precio).toFixed(2)}
                        </span>
                      </div>

                      <Link
                        to={`/web/cursos/${curso.slug || curso.id}`}
                        className="font-semibold text-sky-500 hover:underline"
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
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-blue-900 p-12 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">{cta.title}</h2>

            <p className="mx-auto mb-6 max-w-2xl text-gray-200">
              {cta.description}
            </p>

            <Link
              to={cta.buttonTo || "/web/cursos"}
              className="rounded-lg bg-sky-400 px-6 py-3 font-semibold text-white transition hover:bg-sky-500"
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