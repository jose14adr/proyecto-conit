import { Link, useParams } from "react-router-dom";
import { cursosWebContent } from "../../data/cursosWebContent";
import { addToCart } from "../../utils/cart";

function DetalleCursoWeb() {
  const { id } = useParams();

  const curso = cursosWebContent.cursos.find(
    (item) => String(item.id) === String(id)
  );

  if (!curso) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 shadow-sm">
          <h1 className="mb-4 text-3xl font-bold">Curso no encontrado</h1>
          <p className="mb-6 text-slate-600">
            El curso que buscas no existe o no está disponible.
          </p>

          <Link
            to="/web/cursos"
            className="inline-flex rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-600"
          >
            Volver a cursos
          </Link>
        </div>
      </main>
    );
  }

  const nivel = (curso.nivel || "").toLowerCase();

  const nivelClasses = nivel.includes("avanz")
    ? "bg-rose-100 text-rose-700"
    : nivel.includes("inter")
    ? "bg-amber-100 text-amber-700"
    : "bg-emerald-100 text-emerald-700";

  return (
    <main className="min-h-screen bg-slate-50 py-14 text-slate-900">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-6">
          <Link
            to="/web/cursos"
            className="text-sm font-semibold text-sky-600 hover:underline"
          >
            ← Volver al catálogo
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                Curso
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${nivelClasses}`}
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

            <h1 className="mb-4 text-4xl font-bold">{curso.titulo}</h1>

            <p className="mb-8 text-lg leading-8 text-slate-600">
              {curso.descripcion || "Sin descripción disponible."}
            </p>

            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">Duración</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {curso.duracion} horas
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">
                  Tiempo por semana
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {curso.tiempoSemana || "No especificado"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">Créditos</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {curso.creditos ?? 0}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">Precio</p>
                <p className="mt-1 text-lg font-semibold text-sky-700">
                  S/ {curso.precio}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-3 text-2xl font-bold">¿A quién va dirigido?</h2>
              <p className="leading-7 text-slate-600">
                {curso.publicoObjetivo || "No especificado"}
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-2xl font-bold">Contenido del curso</h2>
              <p className="leading-7 text-slate-600">
                {curso.contenidoMultimedia || "Contenido no especificado"}
              </p>
            </div>
          </section>

          <aside className="h-fit rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">Inscripción</h2>

            <p className="mb-2 text-sm text-slate-500">Precio del curso</p>
            <p className="mb-6 text-4xl font-bold text-sky-700">
              S/ {curso.precio}
            </p>

            <div className="mb-6 space-y-3">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500">Nivel</span>
                <span className="font-semibold text-slate-800">
                  {curso.nivel || "No definido"}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500">Duración</span>
                <span className="font-semibold text-slate-800">
                  {curso.duracion} horas
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500">Estado</span>
                <span className="font-semibold text-slate-800">
                  {curso.estado ? "Disponible" : "Próximamente"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => addToCart(curso)}
                className="w-full rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-600"
              >
                Agregar al carrito
              </button>

              <Link
                to="/web/cursos"
                className="w-full rounded-xl bg-slate-200 px-5 py-3 text-center font-semibold text-slate-800 transition hover:bg-slate-300"
              >
                Seguir explorando
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default DetalleCursoWeb;