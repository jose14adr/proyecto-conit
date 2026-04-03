import { Link } from "react-router-dom";
import { addToCart } from "../../utils/cart";
import { cursosWebContent } from "../../data/cursosWebContent";

function CursosWeb() {
  const { hero, cursos } = cursosWebContent;

  const getNivelClasses = (nivel = "") => {
    const normalizado = nivel.toLowerCase();

    if (normalizado.includes("avanz")) {
      return "bg-rose-100 text-rose-700";
    }

    if (normalizado.includes("inter")) {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-emerald-100 text-emerald-700";
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-gradient-to-r from-slate-900 to-blue-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-4 inline-block rounded-full bg-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-300">
            {hero.tag}
          </p>

          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {hero.title}
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-slate-200 md:text-lg">
            {hero.description}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cursos.map((curso) => (
              <article
                key={curso.id}
                className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                      Curso
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getNivelClasses(
                        curso.nivel
                      )}`}
                    >
                      {curso.nivel || "Sin nivel"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        curso.estado
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {curso.estado ? "Disponible" : "Próximamente"}
                    </span>
                  </div>

                  <h2 className="mb-3 text-2xl font-bold text-slate-900">
                    {curso.titulo}
                  </h2>

                  <p className="mb-5 text-sm leading-6 text-slate-600">
                    {curso.descripcion || "Sin descripción"}
                  </p>

                  <div className="mb-5 rounded-2xl bg-slate-50 p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <span className="text-sm font-medium text-slate-500">
                        Duración
                      </span>
                      <span className="text-right text-sm font-semibold text-slate-800">
                        {curso.duracion} horas
                      </span>
                    </div>

                    <div className="mb-2 flex items-start justify-between gap-3">
                      <span className="text-sm font-medium text-slate-500">
                        Tiempo/semana
                      </span>
                      <span className="text-right text-sm font-semibold text-slate-800">
                        {curso.tiempoSemana || "No especificado"}
                      </span>
                    </div>

                    <div className="mb-2 flex items-start justify-between gap-3">
                      <span className="text-sm font-medium text-slate-500">
                        Créditos
                      </span>
                      <span className="text-right text-sm font-semibold text-slate-800">
                        {curso.creditos ?? 0}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-medium text-slate-500">
                        Precio
                      </span>
                      <span className="text-right text-base font-bold text-sky-700">
                        S/ {curso.precio}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => addToCart(curso)}
                    className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
                  >
                    Agregar al carrito
                  </button>

                  <Link
                    to={`/web/cursos/${curso.id}`}
                    className="w-full rounded-xl bg-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-300"
                  >
                    Ver detalle
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default CursosWeb;