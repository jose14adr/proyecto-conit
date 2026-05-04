import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerPaginaWeb } from "../../services/webCatalogService";

function PaginaDinamicaWeb() {
  const { slug } = useParams();

  const [pagina, setPagina] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarPagina = async () => {
    try {
      setCargando(true);
      setError("");

      const data = await obtenerPaginaWeb(slug);
      setPagina(data);
    } catch (error) {
      console.error("Error cargando página:", error);
      setError("La página que buscas no existe o no está publicada.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPagina();
  }, [slug]);

  const renderSeccion = (seccion, index) => {
    const config = seccion.config || {};

    if (seccion.tipo === "texto") {
      return (
        <article
          key={seccion.id || index}
          className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
        >
          {config.titulo && (
            <h2 className="mb-4 text-3xl font-bold text-slate-900">
              {config.titulo}
            </h2>
          )}

          {config.descripcion && (
            <p className="whitespace-pre-line leading-8 text-slate-600">
              {config.descripcion}
            </p>
          )}
        </article>
      );
    }

    if (seccion.tipo === "imagen_texto") {
      const imagenDerecha = config.posicionImagen === "derecha";

      return (
        <article
          key={seccion.id || index}
          className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200"
        >
          <div
            className={`grid gap-0 lg:grid-cols-2 ${
              imagenDerecha ? "" : "lg:[&>*:first-child]:order-2"
            }`}
          >
            <div className="flex flex-col justify-center p-8 md:p-10">
              {config.titulo && (
                <h2 className="mb-4 text-3xl font-bold text-slate-900">
                  {config.titulo}
                </h2>
              )}

              {config.descripcion && (
                <p className="whitespace-pre-line leading-8 text-slate-600">
                  {config.descripcion}
                </p>
              )}
            </div>

            <div className="min-h-[280px] bg-slate-100">
              {config.imagenUrl ? (
                <img
                  src={config.imagenUrl}
                  alt={config.titulo || "Imagen de sección"}
                  className="h-full min-h-[280px] w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[280px] items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 px-6 text-center text-white">
                  <p className="text-xl font-bold">Imagen de sección</p>
                </div>
              )}
            </div>
          </div>
        </article>
      );
    }

    if (seccion.tipo === "faq") {
      const items = Array.isArray(config.items) ? config.items : [];

      return (
        <article
          key={seccion.id || index}
          className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
        >
          {config.titulo && (
            <h2 className="mb-6 text-3xl font-bold text-slate-900">
              {config.titulo}
            </h2>
          )}

          <div className="space-y-4">
            {items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200"
              >
                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  {item.pregunta}
                </h3>

                <p className="whitespace-pre-line leading-7 text-slate-600">
                  {item.respuesta}
                </p>
              </div>
            ))}
          </div>
        </article>
      );
    }

    return (
      <article
        key={seccion.id || index}
        className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
      >
        <h2 className="mb-4 text-2xl font-bold text-slate-900">
          {config.titulo || "Sección"}
        </h2>

        <p className="leading-8 text-slate-600">
          {config.descripcion || "Contenido no configurado."}
        </p>
      </article>
    );
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <p className="font-semibold text-slate-700">Cargando página...</p>
        </div>
      </main>
    );
  }

  if (error || !pagina) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <h1 className="mb-4 text-3xl font-bold">Página no encontrada</h1>
          <p className="mb-6 text-slate-600">
            {error || "La página no está disponible."}
          </p>

          <Link
            to="/web"
            className="inline-flex rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-600"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const secciones = Array.isArray(pagina.contenido?.secciones)
    ? pagina.contenido.secciones
    : [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-gradient-to-r from-slate-900 to-blue-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-4 inline-block rounded-full bg-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-300">
            {pagina.tipo === "sistema" ? "Página" : "Contenido"}
          </p>

          <h1 className="mb-5 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">
            {pagina.titulo}
          </h1>

          {pagina.descripcion && (
            <p className="max-w-3xl text-base leading-relaxed text-slate-200 md:text-lg">
              {pagina.descripcion}
            </p>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl space-y-6 px-5">
          {secciones.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                {pagina.titulo}
              </h2>

              <p className="leading-8 text-slate-600">
                {pagina.descripcion ||
                  "Esta página aún no tiene secciones configuradas."}
              </p>
            </div>
          ) : (
            secciones
              .filter((seccion) => seccion.activo !== false)
              .sort((a, b) => Number(a.orden || 1) - Number(b.orden || 1))
              .map((seccion, index) => renderSeccion(seccion, index))
          )}
        </div>
      </section>
    </main>
  );
}

export default PaginaDinamicaWeb;