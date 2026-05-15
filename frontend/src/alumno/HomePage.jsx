import { BookOpen, Video, Award, ArrowRight, Clock3, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GraficoProgreso from "../components/GraficoProgreso";
import api from "../api";

export default function HomePage() {
  const [ahora, setAhora] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [misCursos, setMisCursos] = useState([]);
  const [misSesiones, setMisSesiones] = useState([]);
  const [ultimoCertificado, setUltimoCertificado] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setAhora(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    cargarDashboardAlumno();
  }, []);

  const cursosActivos = useMemo(() => {
    return misCursos.filter((c) => (c.estadoCurso || "activo") === "activo");
  }, [misCursos]);

  const proximaSesion = useMemo(() => {
    const futuras = misSesiones
      .filter((s) => new Date(s.fecha).getTime() > ahora.getTime())
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    return futuras[0] || null;
  }, [misSesiones, ahora]);

  function contador(fecha) {
    const diff = new Date(fecha).getTime() - ahora.getTime();

    if (diff <= 0) return "🔴 En vivo";

    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    return `${horas}h ${minutos}m ${segundos}s`;
  }

  async function cargarDashboardAlumno() {
    try {
      setLoading(true);

      const idalumno = localStorage.getItem("idalumno");
      if (!idalumno) {
        setMisCursos([]);
        setMisSesiones([]);
        setUltimoCertificado(null);
        return;
      }

      let cursosNormalizados = [];

      try {
        const res = await api.get(`/matricula/alumno/${idalumno}`);
        const lista = Array.isArray(res.data) ? res.data : [];
        cursosNormalizados = normalizarCursosDesdeMatriculas(lista);
      } catch (error) {
        cursosNormalizados = [];
      }

      if (!cursosNormalizados.length) {
        try {
          const resCursos = await api.get("/curso");
          const listaCursos = Array.isArray(resCursos.data) ? resCursos.data : [];

          cursosNormalizados = listaCursos.map((curso) => ({
            id: curso.id,
            nombrecurso: curso.nombrecurso || curso.nombre || "Curso sin nombre",
            descripcion: curso.descripcion || "Sin descripción disponible",
            progreso: Number(curso.progreso || 0),
            estadoCurso: "activo",
            docenteNombre: extraerDocenteDesdeCurso(curso),
          }));
        } catch (error) {
          cursosNormalizados = [];
        }
      }

      setMisCursos(cursosNormalizados);

      try {
        const resSesiones = await api.get("/sesion-vivo");
        const listaSesiones = Array.isArray(resSesiones.data) ? resSesiones.data : [];

        const idsCursos = new Set(cursosNormalizados.map((c) => Number(c.id)));

        const sesionesFiltradas = listaSesiones.filter((s) => {
          const cursoId = Number(s?.curso?.id || s?.idcurso || 0);
          return idsCursos.has(cursoId);
        });

        setMisSesiones(sesionesFiltradas);
      } catch (error) {
        setMisSesiones([]);
      }

      try {
        const resCert = await api.get(`/certificado/alumno/${idalumno}`);
        const listaCert = Array.isArray(resCert.data) ? resCert.data : [];

        const ordenados = [...listaCert].sort(
          (a, b) =>
            new Date(b.fechaEmision || b.fechaemision || b.fecha).getTime() -
            new Date(a.fechaEmision || a.fechaemision || a.fecha).getTime()
        );

        setUltimoCertificado(ordenados[0] || null);
      } catch (error) {
        setUltimoCertificado(null);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 bg-[var(--color-background)] text-[var(--color-text)]">
      {/* BIENVENIDA */}
      <section
        className="relative overflow-hidden rounded-3xl px-8 py-8 text-white shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
        }}
      >
        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur">
            <Sparkles size={16} />
            Aula virtual
          </div>

          <h2 className="text-2xl font-black tracking-tight md:text-3xl">
            👋 Bienvenido a tu Aula Virtual
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Sigue aprendiendo, revisa tus cursos, próximas sesiones y certificados obtenidos.
          </p>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      </section>

      {/* TARJETAS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card
          title="Cursos Activos"
          value={loading ? "..." : cursosActivos.length}
          icon={BookOpen}
          tone="primary"
        />

        <Card
          title="Sesiones"
          value={loading ? "..." : misSesiones.length}
          icon={Video}
          tone="secondary"
        />

        <Card
          title="Certificados"
          value={loading ? "..." : ultimoCertificado ? 1 : 0}
          icon={Award}
          tone="sidenav"
        />
      </div>

      {/* PROXIMA SESION */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text)]">
              📅 Próxima sesión en vivo
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted-text)]">
              Revisa tu clase programada más cercana.
            </p>
          </div>

          <div className="hidden rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] p-3 text-[var(--color-primary)] md:block">
            <Clock3 size={22} />
          </div>
        </div>

        {proximaSesion ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-[var(--color-text)]">
                {proximaSesion.titulo || proximaSesion.curso?.nombrecurso || "Sesión"}
              </p>

              <p className="mt-1 text-sm text-[var(--color-muted-text)]">
                {formatearFechaHora(proximaSesion.fecha)}
              </p>

              <p className="mt-3 inline-flex rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-3 py-1 text-sm font-bold text-[var(--color-primary)]">
                ⏳ Inicia en {contador(proximaSesion.fecha)}
              </p>
            </div>

            <button
              onClick={() =>
                proximaSesion.link_reunion &&
                window.open(proximaSesion.link_reunion, "_blank", "noopener,noreferrer")
              }
              className="rounded-2xl bg-[var(--color-button-primary)] px-5 py-2.5 text-sm font-bold text-[var(--color-button-primary-text)] shadow-sm transition hover:brightness-95"
            >
              Entrar a la sesión
            </button>
          </div>
        ) : (
          <EmptyBox text="No hay sesiones próximas por ahora." />
        )}
      </section>

      {/* PROGRESO DE CURSOS */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text)]">
              📈 Progreso de tus cursos
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted-text)]">
              Mira rápidamente cómo vas avanzando.
            </p>
          </div>

          <button
            onClick={() => navigate("/alumno/mis-cursos")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
          >
            Ver todos
            <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--color-muted-text) 18%, transparent)",
                }}
              />
            ))}
          </div>
        ) : misCursos.length === 0 ? (
          <EmptyBox text="Aún no tienes cursos matriculados." />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {misCursos.slice(0, 3).map((curso) => (
              <div
                key={curso.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
              >
                <GraficoProgreso
                  nombre={curso.nombrecurso}
                  progreso={Number(curso.progreso || 0)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CERTIFICADO */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[var(--color-text)]">
          🏆 Último certificado obtenido
        </h3>

        {ultimoCertificado ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
            <p className="font-semibold text-[var(--color-text)]">
              {ultimoCertificado.curso ||
                ultimoCertificado.nombreCurso ||
                ultimoCertificado.curso?.nombrecurso ||
                "Certificado"}
            </p>

            <p className="mt-1 text-sm text-[var(--color-muted-text)]">
              Emitido el{" "}
              {formatearFecha(
                ultimoCertificado.fechaEmision ||
                  ultimoCertificado.fechaemision ||
                  ultimoCertificado.fecha
              )}
            </p>

            <button
              onClick={() => navigate("/alumno/mis-certificados")}
              className="mt-4 rounded-2xl bg-[var(--color-button-primary)] px-5 py-2.5 text-sm font-bold text-[var(--color-button-primary-text)] shadow-sm transition hover:brightness-95"
            >
              Ver certificado
            </button>
          </div>
        ) : (
          <EmptyBox text="Aún no tienes certificados emitidos." />
        )}
      </section>
    </div>
  );
}

function Card({ title, value, icon: Icon, tone = "primary" }) {
  const tonos = {
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

  const selected = tonos[tone] || tonos.primary;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm transition hover:shadow-md">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-70 transition-transform group-hover:scale-110"
        style={{ backgroundColor: selected.bg }}
      />

      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-muted-text)]">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black text-[var(--color-text)]">
            {value}
          </p>
        </div>

        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
          style={{
            backgroundColor: selected.bg,
            color: selected.accent,
          }}
        >
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)] p-6 text-center text-sm text-[var(--color-muted-text)]">
      {text}
    </div>
  );
}

function normalizarCursosDesdeMatriculas(matriculas) {
  const cursosNormalizados = [];

  for (const matricula of matriculas) {
    const grupo = matricula?.grupo || null;
    const curso = matricula?.curso || grupo?.curso || null;

    if (!curso || typeof curso !== "object") continue;

    cursosNormalizados.push({
      id: curso.id,
      nombrecurso: curso.nombrecurso || curso.nombre || "Curso sin nombre",
      descripcion: curso.descripcion || "Sin descripción disponible",
      progreso: Number(curso.progreso || 0),
      estadoCurso: matricula?.estado || "activo",
      docenteNombre:
        extraerDocenteDesdeGrupo(grupo) || extraerDocenteDesdeCurso(curso),
    });
  }

  return deduplicarCursos(cursosNormalizados);
}

function deduplicarCursos(cursos) {
  const mapa = new Map();

  for (const curso of cursos) {
    if (!mapa.has(curso.id)) {
      mapa.set(curso.id, curso);
    }
  }

  return Array.from(mapa.values());
}

function extraerDocenteDesdeGrupo(grupo) {
  if (!grupo?.docente) return "";

  return [grupo.docente.nombre, grupo.docente.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function extraerDocenteDesdeCurso(curso) {
  const docente = curso?.docente || curso?.grupos?.[0]?.docente || null;

  if (!docente) return "";

  return [docente.nombre, docente.apellido].filter(Boolean).join(" ").trim();
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return "-";

  const fecha = new Date(fechaISO);

  if (Number.isNaN(fecha.getTime())) return "-";

  return fecha.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatearFechaHora(fechaISO) {
  if (!fechaISO) return "-";

  const fecha = new Date(fechaISO);

  if (Number.isNaN(fecha.getTime())) return "-";

  return fecha.toLocaleString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}