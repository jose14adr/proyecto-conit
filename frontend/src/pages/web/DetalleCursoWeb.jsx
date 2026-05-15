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
      <main className="min-h-screen bg-[var(--color-background)] px-5 py-16 text-[var(--color-text)]">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-10 text-center shadow-sm">
          <p className="font-semibold text-[var(--color-muted-text)]">
            Cargando información del curso...
          </p>
        </div>
      </main>
    );
  }

  if (error || !curso) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] px-5 py-16 text-[var(--color-text)]">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-10 shadow-sm">
          <h1 className="mb-4 text-3xl font-bold text-[var(--color-text)]">
            Curso no encontrado
          </h1>

          <p className="mb-6 text-[var(--color-muted-text)]">
            {error || "El curso que buscas no existe o no está disponible."}
          </p>

          <Link
            to="/web/cursos"
            className="inline-flex rounded-xl bg-[var(--color-button-primary)] px-5 py-3 font-semibold text-[var(--color-button-primary-text)] transition hover:brightness-95"
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
    <main className="min-h-screen bg-[var(--color-background)] py-14 text-[var(--color-text)]">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-6">
          <Link
            to="/web/cursos"
            className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            ← Volver al catálogo
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
            {curso.imagenUrl ? (
              <div className="h-72 w-full overflow-hidden bg-[var(--color-background)]">
                <img
                  src={curso.imagenUrl}
                  alt={curso.titulo}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div
                className="flex h-72 w-full items-center justify-center px-8 text-center text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
                }}
              >
                <h1 className="max-w-3xl text-4xl font-bold">
                  {curso.titulo}
                </h1>
              </div>
            )}

            <div className="p-8">
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
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
                      : "bg-[var(--color-background)] text-[var(--color-muted-text)]"
                  }`}
                >
                  {curso.estado ? "Disponible" : "Próximamente"}
                </span>
              </div>

              <h1 className="mb-4 text-4xl font-black text-[var(--color-text)]">
                {curso.titulo}
              </h1>

              <p className="mb-8 text-lg leading-8 text-[var(--color-muted-text)]">
                {curso.descripcionCompleta ||
                  curso.descripcion ||
                  "Sin descripción disponible."}
              </p>

              <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <DatoCurso label="Duración" value={`${curso.duracion ?? 0} horas`} />
                <DatoCurso
                  label="Tiempo por semana"
                  value={curso.tiempoSemana || "No especificado"}
                />
                <DatoCurso label="Créditos" value={curso.creditos ?? 0} />
                <DatoCurso
                  label="Precio"
                  value={`S/ ${Number(precio).toFixed(2)}`}
                  destacado
                />
              </div>

              <SeccionTexto
                titulo="¿A quién va dirigido?"
                texto={curso.publicoObjetivo || "No especificado"}
              />

              <SeccionTexto
                titulo="Contenido del curso"
                texto={curso.contenidoMultimedia || "Contenido no especificado"}
              />

              {curso.requisitos && (
                <SeccionTexto titulo="Requisitos" texto={curso.requisitos} />
              )}

              {beneficios.length > 0 && (
                <div>
                  <h2 className="mb-3 text-2xl font-bold text-[var(--color-text)]">
                    Beneficios del curso
                  </h2>

                  <ul className="grid gap-3 sm:grid-cols-2">
                    {beneficios.map((beneficio, index) => (
                      <li
                        key={index}
                        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-muted-text)]"
                      >
                        {beneficio}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-[var(--color-text)]">
              Inscripción
            </h2>

            <p className="mb-2 text-sm text-[var(--color-muted-text)]">
              Precio del curso
            </p>

            <p className="mb-6 text-4xl font-black text-[var(--color-primary)]">
              S/ {Number(precio).toFixed(2)}
            </p>

            <div className="mb-6 space-y-3">
              <ResumenRow label="Nivel" value={curso.nivel || "No definido"} />
              <ResumenRow label="Duración" value={`${curso.duracion ?? 0} horas`} />
              <ResumenRow
                label="Estado"
                value={curso.estado ? "Disponible" : "Próximamente"}
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleAgregarCarrito}
                className="w-full rounded-xl bg-[var(--color-button-primary)] px-5 py-3 font-semibold text-[var(--color-button-primary-text)] transition hover:brightness-95"
              >
                Agregar al carrito
              </button>

              <Link
                to="/web/cursos"
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 text-center font-semibold text-[var(--color-text)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
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

function DatoCurso({ label, value, destacado = false }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
      <p className="text-sm font-medium text-[var(--color-muted-text)]">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-bold ${
          destacado ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SeccionTexto({ titulo, texto }) {
  return (
    <div className="mb-8">
      <h2 className="mb-3 text-2xl font-bold text-[var(--color-text)]">
        {titulo}
      </h2>
      <p className="leading-7 text-[var(--color-muted-text)]">{texto}</p>
    </div>
  );
}

function ResumenRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-[var(--color-muted-text)]">{label}</span>
      <span className="font-semibold text-[var(--color-text)]">{value}</span>
    </div>
  );
}

export default DetalleCursoWeb;