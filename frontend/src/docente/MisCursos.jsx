import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CalendarClock, Search, ArrowRight, X } from "lucide-react";
import { getCursosDocente } from "../services/docenteService";

function MisCursos() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarCursos = async () => {
      try {
        setLoading(true);

        const data = await getCursosDocente();
        setCursos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar cursos del docente:", error);
        setCursos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarCursos();
  }, []);

  const totalCursos = cursos.length;

  const cursosConHorario = useMemo(() => {
    return cursos.filter((c) => (c.horario || "").trim() !== "").length;
  }, [cursos]);

  const cursosSinHorario = useMemo(() => {
    return cursos.filter((c) => !(c.horario || "").trim()).length;
  }, [cursos]);

  const sugerencias = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return cursos
      .filter((c) => {
        const nombre = (c.nombre || "").toLowerCase();
        const grupo = (c.grupo || "").toLowerCase();
        const horario = (c.horario || "").toLowerCase();

        return nombre.includes(q) || grupo.includes(q) || horario.includes(q);
      })
      .slice(0, 8);
  }, [cursos, query]);

  const cursosFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cursos;

    return cursos.filter((c) => {
      const nombre = (c.nombre || "").toLowerCase();
      const grupo = (c.grupo || "").toLowerCase();
      const horario = (c.horario || "").toLowerCase();

      return nombre.includes(q) || grupo.includes(q) || horario.includes(q);
    });
  }, [cursos, query]);

  const renderHighlight = (text, q) => {
    const safeText = text || "";
    const queryLower = q.trim().toLowerCase();

    if (!queryLower) return safeText;

    const textLower = safeText.toLowerCase();
    const idx = textLower.indexOf(queryLower);

    if (idx === -1) return safeText;

    const before = safeText.slice(0, idx);
    const match = safeText.slice(idx, idx + q.length);
    const after = safeText.slice(idx + q.length);

    return (
      <>
        {before}
        <span className="rounded bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] px-1 font-bold text-[var(--color-primary)]">
          {match}
        </span>
        {after}
      </>
    );
  };

  const irACurso = (grupoId) => {
    navigate(`/docente/cursos/${grupoId}`);
  };

  const seleccionarCurso = (curso) => {
    setQuery(curso.nombre || "");
    setOpen(false);
    setActiveIndex(-1);
    irACurso(curso.idgrupo);
  };

  const limpiarBusqueda = () => {
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (sugerencias.length === 0) return;
      setActiveIndex((prev) => (prev + 1) % sugerencias.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (sugerencias.length === 0) return;

      setActiveIndex(
        (prev) => (prev - 1 + sugerencias.length) % sugerencias.length
      );

      return;
    }

    if (e.key === "Enter") {
      if (!open) return;

      e.preventDefault();

      const selected =
        activeIndex >= 0 ? sugerencias[activeIndex] : sugerencias[0];

      if (selected) seleccionarCurso(selected);
    }
  };

  useEffect(() => {
    const handler = (event) => {
      if (!containerRef.current) return;

      if (!containerRef.current.contains(event.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="min-h-screen space-y-8 bg-[var(--color-background)] text-[var(--color-text)]">
      {/* HERO */}
      <section
        className="relative overflow-hidden rounded-3xl px-8 py-8 text-white shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
        }}
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur">
              <BookOpen size={16} />
              Panel docente
            </div>

            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              Mis cursos
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
              Consulta tus cursos asignados, encuéntralos rápidamente y entra al
              detalle de cada uno para gestionar contenido, tareas y
              organización.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <HeroMetric label="Cursos asignados" value={totalCursos} />
            <HeroMetric label="Con horario" value={cursosConHorario} />
          </div>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      </section>

      {/* RESUMEN */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title="Total de cursos"
          value={totalCursos}
          subtitle="Cursos actualmente asignados al docente."
          icon={BookOpen}
          tone="primary"
        />

        <MetricCard
          title="Cursos con horario"
          value={cursosConHorario}
          subtitle="Cursos que ya muestran horario registrado."
          icon={CalendarClock}
          tone="secondary"
        />

        <MetricCard
          title="Cursos sin horario"
          value={cursosSinHorario}
          subtitle="Cursos que aún no tienen horario visible."
          icon={CalendarClock}
          tone="sidenav"
        />
      </div>

      {/* BUSCADOR */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="max-w-3xl" ref={containerRef}>
          <div className="mb-4">
            <h3 className="text-xl font-black text-[var(--color-text)]">
              Buscar curso
            </h3>

            <p className="mt-1 text-sm text-[var(--color-muted-text)]">
              Busca por nombre del curso, grupo o horario.
            </p>
          </div>

          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-text)]"
            />

            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setActiveIndex(-1);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Ejemplo: React, Grupo A, Lunes 19:00-21:00..."
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4 pl-12 pr-24 text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted-text)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
            />

            {query && (
              <button
                type="button"
                onClick={limpiarBusqueda}
                className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-xl px-2 py-1 text-sm font-semibold text-[var(--color-muted-text)] transition hover:bg-[var(--color-card)] hover:text-[var(--color-primary)]"
              >
                <X size={15} />
                Limpiar
              </button>
            )}

            {open && sugerencias.length > 0 && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl">
                {sugerencias.map((c, idx) => {
                  const active = idx === activeIndex;

                  return (
                    <button
                      key={c.idgrupo}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => seleccionarCurso(c)}
                      className={`w-full px-4 py-3 text-left transition ${
                        active
                          ? "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                          : "hover:bg-[var(--color-background)]"
                      }`}
                    >
                      <div className="font-bold text-[var(--color-text)]">
                        {renderHighlight(c.nombre || "Curso sin nombre", query)}
                      </div>

                      <div className="mt-1 text-sm text-[var(--color-muted-text)]">
                        Grupo {renderHighlight(c.grupo || "Sin grupo", query)} •{" "}
                        {renderHighlight(c.horario || "Sin horario", query)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <p className="mt-3 text-xs text-[var(--color-muted-text)]">
            Tips: ↑ ↓ para moverte • Enter para elegir • Esc para cerrar
          </p>
        </div>
      </section>

      {/* LISTADO */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-black text-[var(--color-text)]">
              Listado de cursos
            </h3>

            <p className="mt-1 text-sm text-[var(--color-muted-text)]">
              {query.trim()
                ? `${cursosFiltrados.length} resultado(s) encontrados`
                : "Visualiza todos tus cursos disponibles y entra al detalle."}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm font-semibold text-[var(--color-muted-text)]">
            {query.trim() ? `Filtro actual: "${query}"` : "Sin filtros aplicados"}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <SkeletonCard key={item} />
            ))}
          </div>
        ) : cursos.length === 0 ? (
          <EmptyState
            title="No hay cursos cargados."
            description="Cuando tengas cursos asignados aparecerán aquí."
          />
        ) : cursosFiltrados.length === 0 ? (
          <EmptyState
            title="No se encontraron cursos con esa búsqueda."
            description="Intenta con otro nombre, grupo o rango horario."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {cursosFiltrados.map((c) => (
              <button
                key={c.idgrupo}
                onClick={() => irACurso(c.idgrupo)}
                className="group rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-card))] hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
                        Curso
                      </span>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        Activo
                      </span>
                    </div>

                    <h4 className="text-xl font-black leading-snug text-[var(--color-text)] transition group-hover:text-[var(--color-primary)]">
                      {c.nombre || "Curso sin nombre"}
                    </h4>

                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-[var(--color-muted-text)]">
                        <span className="font-bold text-[var(--color-text)]">
                          Grupo:
                        </span>{" "}
                        {c.grupo || "Sin grupo"}
                      </p>

                      <p className="text-sm text-[var(--color-muted-text)]">
                        <span className="font-bold text-[var(--color-text)]">
                          Horario:
                        </span>{" "}
                        {c.horario || "Sin horario"}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-xs font-bold text-[var(--color-muted-text)]">
                    #{c.id}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                  <span className="text-sm font-bold text-[var(--color-primary)] group-hover:underline">
                    Entrar al curso
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] transition group-hover:bg-[var(--color-primary)] group-hover:text-white">
                    <ArrowRight size={18} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-xs font-semibold text-white/75">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, tone = "primary" }) {
  const tones = {
    primary: {
      accent: "var(--color-primary)",
      bg: "color-mix(in srgb, var(--color-primary) 14%, transparent)",
    },
    secondary: {
      accent: "var(--color-secondary)",
      bg: "color-mix(in srgb, var(--color-secondary) 16%, transparent)",
    },
    sidenav: {
      accent: "var(--color-sidenav)",
      bg: "color-mix(in srgb, var(--color-sidenav) 12%, transparent)",
    },
  };

  const selected = tones[tone] || tones.primary;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm transition hover:shadow-md">
      <div
        className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full"
        style={{ backgroundColor: selected.bg }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--color-muted-text)]">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-black tracking-tight text-[var(--color-text)]">
            {value}
          </h3>

          <p className="mt-2 text-sm text-[var(--color-muted-text)]">
            {subtitle}
          </p>
        </div>

        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{ backgroundColor: selected.accent }}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full">
          <div className="mb-3 h-5 w-2/3 rounded bg-[color-mix(in_srgb,var(--color-muted-text)_18%,transparent)]" />
          <div className="mb-2 h-4 w-1/2 rounded bg-[color-mix(in_srgb,var(--color-muted-text)_14%,transparent)]" />
          <div className="h-4 w-1/3 rounded bg-[color-mix(in_srgb,var(--color-muted-text)_14%,transparent)]" />
        </div>

        <div className="h-8 w-16 rounded-full bg-[color-mix(in_srgb,var(--color-muted-text)_14%,transparent)]" />
      </div>

      <div className="mt-5 h-4 w-28 rounded bg-[color-mix(in_srgb,var(--color-muted-text)_14%,transparent)]" />
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)] p-10 text-center">
      <p className="font-bold text-[var(--color-text)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--color-muted-text)]">
        {description}
      </p>
    </div>
  );
}

export default MisCursos;