import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addToCart } from "../../utils/cart";
import {
  listarCategoriasWeb,
  listarCursosPorCategoria,
  listarCursosWeb,
} from "../../services/webCatalogService";

function CursosWeb() {
  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const hero = {
    tag: "Catálogo académico",
    title: "Explora nuestros cursos disponibles",
    description:
      "Encuentra programas diseñados para fortalecer tus habilidades, mejorar tu perfil profesional y avanzar en tu formación.",
  };

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

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      setError("");

      const [categoriasData, cursosData] = await Promise.all([
        listarCategoriasWeb(),
        listarCursosWeb(),
      ]);

      setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
      setCursos(Array.isArray(cursosData) ? cursosData : []);
    } catch (err) {
      console.error("Error cargando cursos web:", err);
      setError("No se pudieron cargar los cursos. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  const cargarCursosTodos = async () => {
    try {
      setCargando(true);
      setError("");
      setCategoriaActiva("todos");

      const cursosData = await listarCursosWeb();
      setCursos(Array.isArray(cursosData) ? cursosData : []);
    } catch (err) {
      console.error("Error cargando todos los cursos:", err);
      setError("No se pudieron cargar los cursos.");
    } finally {
      setCargando(false);
    }
  };

  const cargarCursosCategoria = async (categoria) => {
    if (!categoria?.slug) return;

    try {
      setCargando(true);
      setError("");
      setCategoriaActiva(categoria.slug);

      const data = await listarCursosPorCategoria(categoria.slug);
      setCursos(Array.isArray(data?.cursos) ? data.cursos : []);
    } catch (err) {
      console.error("Error cargando cursos por categoría:", err);
      setError("No se pudieron cargar los cursos de esta categoría.");
    } finally {
      setCargando(false);
    }
  };

  const handleAgregarCarrito = (curso) => {
    addToCart({
      ...curso,
      precio: curso.precioFinal ?? curso.precio ?? 0,
      modalidad: curso.etiqueta || "Curso",
    });
  };

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

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
          <div className="mb-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-sky-600">
                  Categorías
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Filtra los cursos
                </h2>
              </div>

              <p className="text-sm text-slate-500">
                {cursos.length} curso(s) encontrado(s)
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={cargarCursosTodos}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  categoriaActiva === "todos"
                    ? "bg-sky-500 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Todos
              </button>

              {categorias.map((categoria) => (
                <button
                  key={categoria.id}
                  type="button"
                  onClick={() => cargarCursosCategoria(categoria)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    categoriaActiva === categoria.slug
                      ? "bg-sky-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {categoria.nombre}
                </button>
              ))}
            </div>
          </div>

          {cargando && (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
              <p className="font-semibold text-slate-700">
                Cargando cursos...
              </p>
            </div>
          )}

          {!cargando && error && (
            <div className="rounded-3xl bg-red-50 p-8 text-center ring-1 ring-red-200">
              <p className="font-semibold text-red-700">{error}</p>
            </div>
          )}

          {!cargando && !error && cursos.length === 0 && (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
              <h3 className="mb-2 text-2xl font-bold text-slate-900">
                No hay cursos disponibles
              </h3>
              <p className="text-slate-600">
                Aún no se han publicado cursos para esta categoría.
              </p>
            </div>
          )}

          {!cargando && !error && cursos.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {cursos.map((curso) => {
                const precio = curso.precioFinal ?? curso.precio ?? 0;

                return (
                  <article
                    key={curso.id}
                    className="flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {curso.imagenUrl ? (
                      <div className="h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={curso.imagenUrl}
                          alt={curso.titulo}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-slate-800 to-blue-900 px-6 text-center text-white">
                        <p className="text-xl font-bold">{curso.titulo}</p>
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                          {curso.etiqueta || "Curso"}
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

                      <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-600">
                        {curso.descripcion || "Sin descripción"}
                      </p>

                      <div className="mb-5 rounded-2xl bg-slate-50 p-4">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <span className="text-sm font-medium text-slate-500">
                            Duración
                          </span>
                          <span className="text-right text-sm font-semibold text-slate-800">
                            {curso.duracion ?? 0} horas
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
                            S/ {Number(precio).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleAgregarCarrito(curso)}
                          className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
                        >
                          Agregar al carrito
                        </button>

                        <Link
                          to={`/web/cursos/${curso.slug || curso.id}`}
                          className="w-full rounded-xl bg-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-300"
                        >
                          Ver detalle
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default CursosWeb;