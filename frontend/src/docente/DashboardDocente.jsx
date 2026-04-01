import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  CheckCircle2,
  Clock3,
  CalendarDays,
  AlertTriangle,
  GraduationCap,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getCursosDocente,
  getHorarioDocente,
  getAlumnosByCurso,
  getTareasByCurso,
  getEntregasByTarea,
  getRegistroNotasByGrupo,
} from "../services/docenteService";

function SkeletonCard() {
  return <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />;
}

function StatCard({ title, value, subtitle, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600 to-indigo-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-500",
    violet: "from-violet-500 to-fuchsia-600",
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-slate-100" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow ${tones[tone]}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, right, children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div className="flex items-start gap-3">
          {Icon ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Icon size={20} />
            </div>
          ) : null}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
        </div>

        {right ? <div>{right}</div> : null}
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

const ordenarDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const hoyMap = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  0: "Domingo",
};

function parseHoraInicio(horario = "") {
  const match = horario.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 9999;
  const hh = Number(match[1]);
  const mm = Number(match[2]);
  return hh * 60 + mm;
}

export default function DashboardDocente() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cursos, setCursos] = useState([]);
  const [horario, setHorario] = useState([]);

  const [stats, setStats] = useState({
    totalCursos: 0,
    totalAlumnos: 0,
    totalAprobados: 0,
    pendientesRevision: 0,
  });

  const [chartCursos, setChartCursos] = useState([]);
  const [chartEstados, setChartEstados] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [resumenCursos, setResumenCursos] = useState([]);

  useEffect(() => {
    let activo = true;

    const cargarDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [cursosData, horarioData] = await Promise.all([
          getCursosDocente(),
          getHorarioDocente(),
        ]);

        if (!activo) return;

        setCursos(cursosData || []);
        setHorario(horarioData || []);

        const cursosConGrupo = (cursosData || []).filter((c) => c.idgrupo);

        const detalleCursos = await Promise.all(
          cursosConGrupo.map(async (curso) => {
            const [alumnos, registro, tareas] = await Promise.all([
                getAlumnosByCurso(curso.idgrupo).catch(() => []),
                getRegistroNotasByGrupo(curso.idgrupo).catch(() => ({ evaluaciones: [], alumnos: [] })),
                getTareasByCurso(curso.idcurso).catch(() => []),
                ]);

            let pendientes = 0;

            for (const tarea of tareas || []) {
              const entregas = await getEntregasByTarea(tarea.id).catch(() => ({ entregas: [] }));
              pendientes += (entregas?.entregas || []).filter((e) => e.entrego && !e.revisado).length;
            }

            const alumnosRegistro = registro?.alumnos || [];

            const aprobadosCount = alumnosRegistro.filter(
            (a) => Number(a.faltantes || 0) === 0 && Number(a.promedio || 0) >= 12
            ).length;

            const recuperacionCount = alumnosRegistro.filter(
            (a) => Number(a.faltantes || 0) === 0 &&
                    Number(a.promedio || 0) >= 9 &&
                    Number(a.promedio || 0) < 12
            ).length;

            const desaprobadosCount = alumnosRegistro.filter(
            (a) => Number(a.faltantes || 0) === 0 && Number(a.promedio || 0) < 9
            ).length;

            const sinNotasCount = alumnosRegistro.filter(
            (a) => Number(a.faltantes || 0) > 0
            ).length;

            const promedioCurso =
                alumnosRegistro.length > 0
                    ? (
                        alumnosRegistro
                        .filter((a) => Number(a.faltantes || 0) === 0 && a.promedio !== null && a.promedio !== undefined)
                        .reduce((acc, a) => acc + Number(a.promedio || 0), 0) /
                        Math.max(
                        alumnosRegistro.filter(
                            (a) => Number(a.faltantes || 0) === 0 && a.promedio !== null && a.promedio !== undefined
                        ).length,
                        1
                        )
                    ).toFixed(1)
                    : null;

                const faltantes = alumnosRegistro.reduce(
                (acc, alumno) => acc + Number(alumno.faltantes || 0),
                0
                );

            return {
              ...curso,
              totalAlumnos: alumnos.length,
              aprobadosCount,
              recuperacionCount,
              desaprobadosCount,
              sinNotasCount,
              pendientes,
              promedioCurso,
              faltantes,
            };
          })
        );

        if (!activo) return;

        const totalAlumnos = detalleCursos.reduce((acc, c) => acc + c.totalAlumnos, 0);
        const totalAprobados = detalleCursos.reduce((acc, c) => acc + c.aprobadosCount, 0);
        const pendientesRevision = detalleCursos.reduce((acc, c) => acc + c.pendientes, 0);

        setStats({
          totalCursos: detalleCursos.length,
          totalAlumnos,
          totalAprobados,
          pendientesRevision,
        });

        setChartCursos(
          detalleCursos.map((c) => ({
            nombre: c.nombre?.length > 16 ? `${c.nombre.slice(0, 16)}…` : c.nombre,
            alumnos: c.totalAlumnos,
            aprobados: c.aprobadosCount,
          }))
        );

        const totalRecuperacion = detalleCursos.reduce((acc, c) => acc + c.recuperacionCount, 0);
        const totalDesaprobados = detalleCursos.reduce((acc, c) => acc + c.desaprobadosCount, 0);
        const totalSinNotas = detalleCursos.reduce((acc, c) => acc + c.sinNotasCount, 0);

        setChartEstados([
          { name: "Aprobados", value: totalAprobados },
          { name: "Recuperación", value: totalRecuperacion },
          { name: "Desaprobados", value: totalDesaprobados },
          { name: "Sin notas", value: totalSinNotas },
        ]);

        const nuevasAlertas = [];

        detalleCursos.forEach((c) => {
          if (c.pendientes > 0) {
            nuevasAlertas.push({
              tipo: "pendientes",
              titulo: `${c.pendientes} entrega(s) pendientes`,
              detalle: `${c.nombre} - ${c.grupo}`,
            });
          }

          if ((c.faltantes || 0) > 0) {
            nuevasAlertas.push({
              tipo: "faltantes",
              titulo: `${c.faltantes} nota(s) faltante(s)`,
              detalle: `${c.nombre} - ${c.grupo}`,
            });
          }

          if (c.promedioCurso !== null && Number(c.promedioCurso) < 12) {
            nuevasAlertas.push({
              tipo: "promedio",
              titulo: `Promedio bajo: ${c.promedioCurso}`,
              detalle: `${c.nombre} - ${c.grupo}`,
            });
          }
        });

        setAlertas(nuevasAlertas.slice(0, 8));

        setResumenCursos(
          detalleCursos
            .sort((a, b) => b.totalAlumnos - a.totalAlumnos)
            .map((c) => ({
              idgrupo: c.idgrupo,
              nombre: c.nombre,
              grupo: c.grupo,
              modalidad: c.modalidad,
              horario: c.horario,
              totalAlumnos: c.totalAlumnos,
              promedioCurso: c.promedioCurso,
              pendientes: c.pendientes,
            }))
        );
      } catch (err) {
        console.error(err);
        if (activo) setError(err?.message || "No se pudo cargar el dashboard.");
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarDashboard();

    return () => {
      activo = false;
    };
  }, []);

  const clasesHoy = useMemo(() => {
    const hoy = hoyMap[new Date().getDay()];
    return (horario || [])
      .filter((item) => item.dia === hoy)
      .sort((a, b) => parseHoraInicio(a.hora) - parseHoraInicio(b.hora));
  }, [horario]);

  const horarioOrdenado = useMemo(() => {
    return [...(horario || [])].sort((a, b) => {
      const diaA = ordenarDias.indexOf(a.dia);
      const diaB = ordenarDias.indexOf(b.dia);
      if (diaA !== diaB) return diaA - diaB;
      return parseHoraInicio(a.hora) - parseHoraInicio(b.hora);
    });
  }, [horario]);

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 px-6 py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 h-[380px] animate-pulse rounded-3xl bg-slate-200" />
            <div className="h-[380px] animate-pulse rounded-3xl bg-slate-200" />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="h-[360px] animate-pulse rounded-3xl bg-slate-200" />
            <div className="h-[360px] animate-pulse rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 px-6 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-6 py-7 text-white shadow-lg">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">Resumen general</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard Docente</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Visualiza el estado de tus cursos, alumnos, clases programadas y seguimiento académico en un solo lugar.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-slate-300">Cursos</p>
                <p className="mt-1 text-2xl font-bold">{stats.totalCursos}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-slate-300">Alumnos</p>
                <p className="mt-1 text-2xl font-bold">{stats.totalAlumnos}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-slate-300">Aprobados</p>
                <p className="mt-1 text-2xl font-bold">{stats.totalAprobados}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-slate-300">Pendientes</p>
                <p className="mt-1 text-2xl font-bold">{stats.pendientesRevision}</p>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Cursos activos"
            value={stats.totalCursos}
            subtitle="Grupos asignados al docente"
            icon={BookOpen}
            tone="blue"
          />
          <StatCard
            title="Total alumnos"
            value={stats.totalAlumnos}
            subtitle="Alumnos registrados en tus grupos"
            icon={Users}
            tone="violet"
          />
          <StatCard
            title="Aprobados"
            value={stats.totalAprobados}
            subtitle="Alumnos con promedio aprobatorio"
            icon={CheckCircle2}
            tone="emerald"
          />
          <StatCard
            title="Pendientes por revisar"
            value={stats.pendientesRevision}
            subtitle="Entregas realizadas aún no revisadas"
            icon={Clock3}
            tone="amber"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="Rendimiento general"
            subtitle="Vista comparativa por curso"
            icon={BarChart3}
            className="xl:col-span-2"
          >
            {chartCursos.length === 0 ? (
              <EmptyState text="Aún no hay datos suficientes para mostrar el gráfico." />
            ) : (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartCursos}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="alumnos" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Estado académico"
            subtitle="Distribución general"
            icon={GraduationCap}
          >
            {chartEstados.every((item) => !item.value) ? (
              <EmptyState text="Aún no hay estados académicos para mostrar." />
            ) : (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartEstados}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#94a3b8" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              {chartEstados.map((item) => (
                <div key={item.name} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">{item.name}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="Clases de hoy"
            subtitle="Agenda rápida del día actual"
            icon={CalendarDays}
            className="xl:col-span-1"
          >
            {clasesHoy.length === 0 ? (
              <EmptyState text="No tienes clases programadas para hoy." />
            ) : (
              <div className="space-y-3">
                {clasesHoy.map((item, index) => (
                  <div
                    key={`${item.curso}-${item.grupo}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{item.curso}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Grupo: {item.grupo || "-"}
                        </p>
                      </div>
                      <span className="rounded-xl bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        {item.hora || "-"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                        {item.modalidad || "Sin modalidad"}
                      </span>
                      {item.dia ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                          {item.dia}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Cursos y grupos"
            subtitle="Resumen rápido de tus cursos"
            icon={BookOpen}
            className="xl:col-span-1"
          >
            {resumenCursos.length === 0 ? (
              <EmptyState text="No tienes cursos asignados por el momento." />
            ) : (
              <div className="space-y-3">
                {resumenCursos.slice(0, 6).map((curso) => (
                  <div
                    key={curso.idgrupo}
                    className="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{curso.nombre}</h3>
                        <p className="mt-1 text-sm text-slate-500">Grupo: {curso.grupo || "-"}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {curso.modalidad || "Curso"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-slate-50 px-2 py-3">
                        <p className="text-xs text-slate-500">Alumnos</p>
                        <p className="mt-1 text-lg font-bold text-slate-900">{curso.totalAlumnos}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-2 py-3">
                        <p className="text-xs text-slate-500">Promedio</p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {curso.promedioCurso ?? "-"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-2 py-3">
                        <p className="text-xs text-slate-500">Pendientes</p>
                        <p className="mt-1 text-lg font-bold text-slate-900">{curso.pendientes}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link
                        to={`/docente/cursos/${curso.idgrupo}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                      >
                        Ir al curso
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Alertas y seguimiento"
            subtitle="Aspectos que requieren atención"
            icon={AlertTriangle}
            className="xl:col-span-1"
          >
            {alertas.length === 0 ? (
              <EmptyState text="Todo en orden. No hay alertas importantes por ahora." />
            ) : (
              <div className="space-y-3">
                {alertas.map((alerta, index) => (
                  <div
                    key={`${alerta.tipo}-${index}`}
                    className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-amber-900">{alerta.titulo}</h3>
                        <p className="mt-1 text-sm text-amber-800">{alerta.detalle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Horario semanal"
          subtitle="Vista resumida de tus clases programadas"
          icon={CalendarDays}
        >
          {horarioOrdenado.length === 0 ? (
            <EmptyState text="No hay horario registrado para este docente." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-3 py-2 font-medium">Día</th>
                    <th className="px-3 py-2 font-medium">Hora</th>
                    <th className="px-3 py-2 font-medium">Curso</th>
                    <th className="px-3 py-2 font-medium">Grupo</th>
                    <th className="px-3 py-2 font-medium">Modalidad</th>
                  </tr>
                </thead>
                <tbody>
                  {horarioOrdenado.map((item, index) => (
                    <tr key={`${item.curso}-${item.grupo}-${index}`} className="rounded-2xl bg-slate-50">
                      <td className="px-3 py-3 font-medium text-slate-800">{item.dia || "-"}</td>
                      <td className="px-3 py-3 text-slate-600">{item.hora || "-"}</td>
                      <td className="px-3 py-3 text-slate-900">{item.curso || "-"}</td>
                      <td className="px-3 py-3 text-slate-600">{item.grupo || "-"}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                          {item.modalidad || "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}   