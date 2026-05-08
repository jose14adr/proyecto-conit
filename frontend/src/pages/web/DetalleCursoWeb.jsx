import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addToCart } from "../../utils/cart";
import { obtenerCursoWeb } from "../../services/webCatalogService";

function DetalleCursoWeb() {
  const { id } = useParams();

  const [curso, setCurso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarCurso = async () => {
    try {
      setCargando(true);
      setError("");

      const data = await obtenerCursoWeb(id);
      setCurso(data);
    } catch (err) {
      console.error("Error cargando detalle del curso:", err);
      setError("El curso que buscas no existe o no está disponible.");
    } finally {
      setCargando(false);
    }
  };

  const handleAgregarCarrito = () => {
    if (!curso) return;

    addToCart({
      ...curso,
      precio: curso.precioFinal ?? curso.precio ?? 0,
      modalidad: curso.etiqueta || "Curso",
    });
  };

  useEffect(() => {
    cargarCurso();
  }, [id]);

  if (cargando) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <p className="font-semibold text-slate-700">
            Cargando información del curso...
          </p>
        </div>
      </main>
    );
  }

  if (error || !curso) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <h1 className="mb-4 text-3xl font-bold">Curso no encontrado</h1>

          <p className="mb-6 text-slate-600">
            {error || "El curso que buscas no existe o no está disponible."}
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

  const precio = curso.precioFinal ?? curso.precio ?? 0;
  const beneficios = Array.isArray(curso.beneficios) ? curso.beneficios : [];

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
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
            {curso.imagenUrl ? (
              <div className="h-72 w-full overflow-hidden bg-slate-100">
                <img
                  src={curso.imagenUrl}
                  alt={curso.titulo}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-72 w-full items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 px-8 text-center text-white">
                <h1 className="max-w-3xl text-4xl font-bold">
                  {curso.titulo}
                </h1>
              </div>
            )}

            <div className="p-8">
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                  {curso.etiqueta || "Curso"}
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
                {curso.descripcionCompleta ||
                  curso.descripcion ||
                  "Sin descripción disponible."}
              </p>

              <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Duración
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {curso.duracion ?? 0} horas
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
                  <p className="text-sm font-medium text-slate-500">
                    Créditos
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {curso.creditos ?? 0}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Precio</p>
                  <p className="mt-1 text-lg font-semibold text-sky-700">
                    S/ {Number(precio).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">
                  ¿A quién va dirigido?
                </h2>
                <p className="leading-7 text-slate-600">
                  {curso.publicoObjetivo || "No especificado"}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="mb-3 text-2xl font-bold">
                  Contenido del curso
                </h2>
                <p className="leading-7 text-slate-600">
                  {curso.contenidoMultimedia || "Contenido no especificado"}
                </p>
              </div>

              {curso.requisitos && (
                <div className="mb-8">
                  <h2 className="mb-3 text-2xl font-bold">Requisitos</h2>
                  <p className="leading-7 text-slate-600">
                    {curso.requisitos}
                  </p>
                </div>
              )}

              {beneficios.length > 0 && (
                <div>
                  <h2 className="mb-3 text-2xl font-bold">
                    Beneficios del curso
                  </h2>

                  <ul className="grid gap-3 sm:grid-cols-2">
                    {beneficios.map((beneficio, index) => (
                      <li
                        key={index}
                        className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-700"
                      >
                        {beneficio}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <aside className="h-fit rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-2xl font-bold">Inscripción</h2>

            <p className="mb-2 text-sm text-slate-500">Precio del curso</p>
            <p className="mb-6 text-4xl font-bold text-sky-700">
              S/ {Number(precio).toFixed(2)}
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
                  {curso.duracion ?? 0} horas
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
                onClick={handleAgregarCarrito}
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