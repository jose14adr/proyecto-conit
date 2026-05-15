import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Activity,
  ArrowRight,
  Clock,
} from "lucide-react";
import { obtenerAlumno } from "../services/alumno.service";
import { obtenerDocente } from "../services/docente.service";
import { obtenerCurso } from "../services/curso.service";
import { obtenerUsuario } from "../services/usuario.service";
import { obtenerSesiones } from "../services/historial-login.service";
import { Link } from "react-router-dom";
import AlumnoPerfilModal from "../components/AlumnoPerfilModal";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    alumnosActivos: 0,
    docentesActivos: 0,
    cursosActivos: 0,
    usuariosActivos: 0,
  });

  const [ultimosRegistros, setUltimosRegistros] = useState([]);
  const [ultimosIniciosSesion, setUltimosIniciosSesion] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        setIsLoading(true);

        const [alumnos, docentes, cursos, usuarios, sesiones] =
          await Promise.all([
            obtenerAlumno(),
            obtenerDocente(),
            obtenerCurso(),
            obtenerUsuario(),
            obtenerSesiones(),
          ]);

        setStats({
          alumnosActivos: alumnos.filter((a) => a.estado !== false).length,
          docentesActivos: docentes.filter((d) => d.estado !== false).length,
          cursosActivos: cursos.filter((c) => c.estado !== false).length,
          usuariosActivos: usuarios.filter((u) => u.estado !== false).length,
        });

        const topAlumnos = alumnos.slice(0, 5).map((alumno) => {
          const ultimoCurso =
            alumno.matriculas && alumno.matriculas.length > 0
              ? alumno.matriculas[0].grupo?.curso?.nombrecurso ||
                "Curso sin nombre"
              : "Sin cursos";

          return { ...alumno, ultimoCurso };
        });

        setUltimosRegistros(topAlumnos);
        setUltimosIniciosSesion(sesiones.slice(0, 5));
      } catch (error) {
        console.error("Error al cargar métricas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarMetricas();
  }, []);

  const cards = [
    {
      titulo: "Alumnos Activos",
      valor: stats.alumnosActivos,
      icono: Users,
      accent: "var(--color-primary)",
      bg: "color-mix(in srgb, var(--color-primary) 14%, transparent)",
      ruta: "/admin/alumnos",
    },
    {
      titulo: "Docentes",
      valor: stats.docentesActivos,
      icono: GraduationCap,
      accent: "var(--color-secondary)",
      bg: "color-mix(in srgb, var(--color-secondary) 16%, transparent)",
      ruta: "/admin/docentes",
    },
    {
      titulo: "Cursos Abiertos",
      valor: stats.cursosActivos,
      icono: BookOpen,
      accent: "var(--color-sidenav)",
      bg: "color-mix(in srgb, var(--color-sidenav) 12%, transparent)",
      ruta: "/admin/cursos",
    },
    {
      titulo: "Usuarios Sistema",
      valor: stats.usuariosActivos,
      icono: ShieldCheck,
      accent: "var(--color-button-primary)",
      bg: "color-mix(in srgb, var(--color-button-primary) 14%, transparent)",
      ruta: "/admin/usuarios",
    },
  ];

  return (
    <div className="min-h-screen space-y-8 bg-[var(--color-background)] text-[var(--color-text)] animate-fadeIn">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">
          Panel de Control
        </h1>

        <p className="mt-2 flex items-center gap-2 text-[var(--color-muted-text)]">
          <Activity size={18} className="text-[var(--color-primary)]" />
          Resumen de actividad y métricas del sistema
        </p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icono;

          return (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm transition-shadow hover:shadow-md group"
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: card.bg }}
                >
                  <Icon size={28} style={{ color: card.accent }} />
                </div>

                <Link
                  to={card.ruta}
                  className="text-[var(--color-muted-text)] transition-colors hover:text-[var(--color-primary)]"
                >
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[var(--color-muted-text)]">
                  {card.titulo}
                </h3>

                <div className="mt-1 text-3xl font-bold text-[var(--color-text)]">
                  {isLoading ? (
                    <div className="mt-1 h-8 w-16 animate-pulse rounded bg-[color-mix(in_srgb,var(--color-muted-text)_20%,transparent)]"></div>
                  ) : (
                    card.valor
                  )}
                </div>
              </div>

              <div className="absolute -right-6 -bottom-6 opacity-[0.04] transition-transform duration-500 group-hover:scale-110">
                <Icon size={110} style={{ color: card.accent }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sección de últimas actividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de últimos alumnos */}
        <div className="lg:col-span-2 flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-5">
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Últimos Alumnos Inscritos
            </h2>

            <Link
              to="/admin/alumnos"
              className="text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
            >
              Ver todos
            </Link>
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="flex h-full items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-primary)]"></div>
              </div>
            ) : ultimosRegistros.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-muted-text)]">
                No hay registros recientes.
              </div>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {ultimosRegistros.map((alumno) => (
                  <li
                    key={alumno.id}
                    onClick={() => setAlumnoSeleccionado(alumno)}
                    className="group flex cursor-pointer items-center justify-between px-6 py-4 transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] font-bold text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
                        {alumno.nombre?.charAt(0)}
                        {alumno.apellido?.charAt(0)}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]">
                          {alumno.nombre} {alumno.apellido}
                        </p>

                        <div className="mt-0.5 flex items-center gap-2">
                          <BookOpen
                            size={12}
                            className="text-[var(--color-muted-text)]"
                          />
                          <p className="max-w-[200px] truncate text-xs font-medium text-[var(--color-muted-text)] md:max-w-xs">
                            {alumno.ultimoCurso}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="hidden rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary)] sm:block">
                        Nuevo
                      </span>

                      <ArrowRight
                        size={16}
                        className="text-[var(--color-muted-text)] opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Tarjeta de estado del sistema */}
        <div
          className="relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 text-white shadow-sm"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary), var(--color-sidenav))",
          }}
        >
          <div className="relative z-10 flex-1">
            <div className="mb-5 flex items-center justify-between border-b border-white/20 pb-3 text-white/80">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} />
                <span className="text-sm font-medium">
                  Inicios de Sesión Recientes
                </span>
              </div>

              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-white"></div>
              </div>
            ) : ultimosIniciosSesion.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/10 p-4 text-sm text-white/80">
                No hay inicios de sesión recientes.
              </div>
            ) : (
              <div className="mb-6 space-y-3">
                {ultimosIniciosSesion.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-white/10 bg-white/10 p-3 backdrop-blur-md transition-colors hover:bg-white/20"
                  >
                    <div className="mb-1.5 flex items-start justify-between">
                      <span className="truncate pr-2 text-sm font-semibold">
                        {log.usuario?.nombre || "Usuario Sistema"}
                      </span>

                      <span className="flex shrink-0 items-center gap-1 text-[10px] text-white/70">
                        <Clock size={10} />
                        {log.fecha?.split(",")[1] || log.fecha}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-white/80 opacity-90">
                      <Activity size={12} className="text-emerald-300" />
                      <span className="truncate">
                        {log.ubicacion || log.dispositivo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative z-10 mt-auto pt-2">
            <Link
              to="/admin/sesiones"
              className="group flex w-full items-center justify-between rounded-lg bg-white/20 px-4 py-2.5 text-left text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <span>Ver historial completo</span>

              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Círculos decorativos */}
          <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 translate-x-12 -translate-y-12 rounded-full bg-white opacity-10 blur-2xl"></div>
          <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 -translate-x-12 translate-y-12 rounded-full bg-white opacity-10 blur-2xl"></div>
        </div>
      </div>

      {/* RENDERIZADO DEL MODAL */}
      {alumnoSeleccionado && (
        <AlumnoPerfilModal
          alumno={alumnoSeleccionado}
          onClose={() => setAlumnoSeleccionado(null)}
        />
      )}
    </div>
  );
}