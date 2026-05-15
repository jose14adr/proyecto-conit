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
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <section
        className="py-16 text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
        }}
      >
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-4 inline-block rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur">
            {hero.tag}
          </p>

          <h1 className="mb-4 text-4xl font-black md:text-5xl">
            {hero.title}
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-white/80 md:text-lg">
            {hero.description}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--color-primary)]">
                  Categorías
                </p>
                <h2 className="text-2xl font-bold text-[var(--color-text)]">
                  Filtra los cursos
                </h2>
              </div>

              <p className="text-sm text-[var(--color-muted-text)]">
                {cursos.length} curso(s) encontrado(s)
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={cargarCursosTodos}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  categoriaActiva === "todos"
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-background)] text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
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
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-background)] text-[var(--color-text)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
                  }`}
                >
                  {categoria.nombre}
                </button>
              ))}
            </div>
          </div>

          {cargando && (
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center shadow-sm">
              <p className="font-semibold text-[var(--color-muted-text)]">
                Cargando cursos...
              </p>
            </div>
          )}

          {!cargando && error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-semibold text-red-700">{error}</p>
            </div>
          )}

          {!cargando && !error && cursos.length === 0 && (
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center shadow-sm">
              <h3 className="mb-2 text-2xl font-bold text-[var(--color-text)]">
                No hay cursos disponibles
              </h3>
              <p className="text-[var(--color-muted-text)]">
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
                    className="flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {curso.imagenUrl ? (
                      <div className="h-48 w-full overflow-hidden bg-[var(--color-background)]">
                        <img
                          src={curso.imagenUrl}
                          alt={curso.titulo}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex h-48 w-full items-center justify-center px-6 text-center text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
                        }}
                      >
                        <p className="text-xl font-bold">{curso.titulo}</p>
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
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
                              : "bg-[var(--color-background)] text-[var(--color-muted-text)]"
                          }`}
                        >
                          {curso.estado ? "Disponible" : "Próximamente"}
                        </span>
                      </div>

                      <h2 className="mb-3 text-2xl font-bold text-[var(--color-text)]">
                        {curso.titulo}
                      </h2>

                      <p className="mb-5 line-clamp-3 text-sm leading-6 text-[var(--color-muted-text)]">
                        {curso.descripcion || "Sin descripción"}
                      </p>

                      <div className="mb-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                        <InfoRow label="Duración" value={`${curso.duracion ?? 0} horas`} />
                        <InfoRow
                          label="Tiempo/semana"
                          value={curso.tiempoSemana || "No especificado"}
                        />
                        <InfoRow label="Créditos" value={curso.creditos ?? 0} />

                        <div className="flex items-start justify-between gap-3">
                          <span className="text-sm font-medium text-[var(--color-muted-text)]">
                            Precio
                          </span>
                          <span className="text-right text-base font-black text-[var(--color-primary)]">
                            S/ {Number(precio).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleAgregarCarrito(curso)}
                          className="w-full rounded-xl bg-[var(--color-button-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-button-primary-text)] transition hover:brightness-95"
                        >
                          Agregar al carrito
                        </button>

                        <Link
                          to={`/web/cursos/${curso.slug || curso.id}`}
                          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-center text-sm font-semibold text-[var(--color-text)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
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

function InfoRow({ label, value }) {
  return (
    <div className="mb-2 flex items-start justify-between gap-3">
      <span className="text-sm font-medium text-[var(--color-muted-text)]">
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-[var(--color-text)]">
        {value}
      </span>
    </div>
  );
}

export default CursosWeb;