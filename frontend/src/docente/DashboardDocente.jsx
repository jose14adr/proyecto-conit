import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Users,
  CheckCircle2,
  Clock3,
  CalendarDays,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import {
  getCursosDocente,
  getHorarioDocente,
  getRegistroNotasByGrupo,
  getPendientesRevisionByGrupo,
} from "../services/docenteService";

function SkeletonCard() {
  return <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />;
}

function SkeletonCursoCard() {
  return (
    <div className="space-y-4">
      <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-9 h-[250px] animate-pulse rounded-2xl bg-slate-200" />
        <div className="xl:col-span-3 h-[250px] animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
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
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
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

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  right,
  children,
  className = "",
}) {
  return (
    <section
      className={`h-full w-full rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          {Icon ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Icon size={20} />
            </div>
          ) : null}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>
        </div>

        {right ? <div className="w-full md:w-auto">{right}</div> : null}
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

function calcularDetalleCurso(cursoBase, registro, pendientes) {
  const alumnosRegistro = registro?.alumnos || [];
  const totalAlumnos = alumnosRegistro.length;

  const aprobadosCount = alumnosRegistro.filter(
    (a) => Number(a.faltantes || 0) === 0 && Number(a.promedio || 0) >= 12
  ).length;

  const recuperacionCount = alumnosRegistro.filter(
    (a) =>
      Number(a.faltantes || 0) === 0 &&
      Number(a.promedio || 0) >= 9 &&
      Number(a.promedio || 0) < 12
  ).length;

  const desaprobadosCount = alumnosRegistro.filter(
    (a) => Number(a.faltantes || 0) === 0 && Number(a.promedio || 0) < 9
  ).length;

  const sinNotasCount = alumnosRegistro.filter(
    (a) => Number(a.faltantes || 0) > 0
  ).length;

  const alumnosConPromedio = alumnosRegistro.filter(
    (a) =>
      Number(a.faltantes || 0) === 0 &&
      a.promedio !== null &&
      a.promedio !== undefined
  );

  const promedioCurso =
    alumnosConPromedio.length > 0
      ? (
          alumnosConPromedio.reduce(
            (acc, a) => acc + Number(a.promedio || 0),
            0
          ) / alumnosConPromedio.length
        ).toFixed(1)
      : null;

  const faltantes = alumnosRegistro.reduce(
    (acc, alumno) => acc + Number(alumno.faltantes || 0),
    0
  );

  return {
    ...cursoBase,
    totalAlumnos,
    aprobadosCount,
    recuperacionCount,
    desaprobadosCount,
    sinNotasCount,
    pendientes: Number(pendientes || 0),
    promedioCurso,
    faltantes,
  };
}

export default function DashboardDocente() {
  const [loadingGeneral, setLoadingGeneral] = useState(true);
  const [loadingCurso, setLoadingCurso] = useState(false);
  const [error, setError] = useState("");

  const [horario, setHorario] = useState([]);
  const [cursosBase, setCursosBase] = useState([]);
  const [detalleCursosMap, setDetalleCursosMap] = useState({});
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarBase = async () => {
      try {
        setLoadingGeneral(true);
        setError("");

        const [cursosData, horarioData] = await Promise.all([
          getCursosDocente(),
          getHorarioDocente(),
        ]);

        if (!activo) return;

        const cursosConGrupo = (cursosData || []).filter((c) => c.idgrupo);

        setCursosBase(cursosConGrupo);
        setHorario(horarioData || []);

        if (cursosConGrupo.length > 0) {
          setCursoSeleccionado(String(cursosConGrupo[0].idgrupo));
        }
      } catch (err) {
        console.error(err);
        if (activo) {
          setError(err?.message || "No se pudo cargar el dashboard.");
        }
      } finally {
        if (activo) setLoadingGeneral(false);
      }
    };

    cargarBase();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;

    const cargarDetalleCurso = async () => {
      if (!cursoSeleccionado) return;
      if (detalleCursosMap[cursoSeleccionado]) return;

      const cursoBase = cursosBase.find(
        (c) => String(c.idgrupo) === String(cursoSeleccionado)
      );

      if (!cursoBase) return;

      try {
        setLoadingCurso(true);

        const [registro, pendientes] = await Promise.all([
          getRegistroNotasByGrupo(cursoBase.idgrupo).catch(() => ({
            evaluaciones: [],
            alumnos: [],
          })),
          getPendientesRevisionByGrupo(cursoBase.idgrupo).catch(() => 0),
        ]);

        if (!activo) return;

        const detalle = calcularDetalleCurso(cursoBase, registro, pendientes);

        setDetalleCursosMap((prev) => ({
          ...prev,
          [cursoSeleccionado]: detalle,
        }));
      } catch (err) {
        console.error(err);
      } finally {
        if (activo) setLoadingCurso(false);
      }
    };

    cargarDetalleCurso();

    return () => {
      activo = false;
    };
  }, [cursoSeleccionado, cursosBase, detalleCursosMap]);

  useEffect(() => {
    if (!cursosBase.length) return;

    const cursosSinCache = cursosBase.filter(
      (curso) => !detalleCursosMap[String(curso.idgrupo)]
    );

    if (cursosSinCache.length === 0) return;

    let cancelado = false;

    const precargarEnSegundoPlano = async () => {
      for (const curso of cursosSinCache) {
        if (cancelado) return;
        if (String(curso.idgrupo) === String(cursoSeleccionado)) continue;

        try {
          const [registro, pendientes] = await Promise.all([
            getRegistroNotasByGrupo(curso.idgrupo).catch(() => ({
              evaluaciones: [],
              alumnos: [],
            })),
            getPendientesRevisionByGrupo(curso.idgrupo).catch(() => 0),
          ]);

          if (cancelado) return;

          const detalle = calcularDetalleCurso(curso, registro, pendientes);

          setDetalleCursosMap((prev) => {
            if (prev[String(curso.idgrupo)]) return prev;
            return {
              ...prev,
              [String(curso.idgrupo)]: detalle,
            };
          });
        } catch (err) {
          console.error(err);
        }
      }
    };

    const timeout = setTimeout(() => {
      precargarEnSegundoPlano();
    }, 1200);

    return () => {
      cancelado = true;
      clearTimeout(timeout);
    };
  }, [cursosBase, cursoSeleccionado, detalleCursosMap]);

  const detalleCursos = useMemo(() => {
    return cursosBase.map(
      (curso) => detalleCursosMap[String(curso.idgrupo)] || curso
    );
  }, [cursosBase, detalleCursosMap]);

  const cursoActivo = useMemo(() => {
    if (!cursoSeleccionado) return null;
    return detalleCursosMap[String(cursoSeleccionado)] || null;
  }, [detalleCursosMap, cursoSeleccionado]);

  const stats = useMemo(() => {
    const detalles = Object.values(detalleCursosMap);

    return {
      totalCursos: cursosBase.length,
      totalAlumnos: detalles.reduce(
        (acc, c) => acc + Number(c.totalAlumnos || 0),
        0
      ),
      totalAprobados: detalles.reduce(
        (acc, c) => acc + Number(c.aprobadosCount || 0),
        0
      ),
      pendientesRevision: detalles.reduce(
        (acc, c) => acc + Number(c.pendientes || 0),
        0
      ),
    };
  }, [cursosBase, detalleCursosMap]);

  const alertas = useMemo(() => {
    return Object.values(detalleCursosMap)
      .flatMap((c) => {
        const lista = [];

        if (Number(c.pendientes || 0) > 0) {
          lista.push({
            tipo: "pendientes",
            titulo: `${c.pendientes} entrega(s) pendientes`,
            detalle: `${c.nombre} - ${c.grupo}`,
          });
        }

        if (Number(c.faltantes || 0) > 0) {
          lista.push({
            tipo: "faltantes",
            titulo: `${c.faltantes} nota(s) faltante(s)`,
            detalle: `${c.nombre} - ${c.grupo}`,
          });
        }

        if (c.promedioCurso !== null && Number(c.promedioCurso) < 12) {
          lista.push({
            tipo: "promedio",
            titulo: `Promedio bajo: ${c.promedioCurso}`,
            detalle: `${c.nombre} - ${c.grupo}`,
          });
        }

        return lista;
      })
      .slice(0, 8);
  }, [detalleCursosMap]);

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

  const estadosCursoActivo = useMemo(() => {
    if (!cursoActivo) return [];

    const total =
      Number(cursoActivo.aprobadosCount || 0) +
      Number(cursoActivo.recuperacionCount || 0) +
      Number(cursoActivo.desaprobadosCount || 0) +
      Number(cursoActivo.sinNotasCount || 0);

    const data = [
      {
        name: "Aprobados",
        value: Number(cursoActivo.aprobadosCount || 0),
      },
      {
        name: "Recuperación",
        value: Number(cursoActivo.recuperacionCount || 0),
      },
      {
        name: "Desaprobados",
        value: Number(cursoActivo.desaprobadosCount || 0),
      },
      {
        name: "Sin notas",
        value: Number(cursoActivo.sinNotasCount || 0),
      },
    ];

    return data.map((item) => ({
      ...item,
      porcentaje: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0",
    }));
  }, [cursoActivo]);

  if (loadingGeneral) {
    return (
      <div className="min-h-full bg-slate-50 px-6 py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          <div className="h-[420px] animate-pulse rounded-3xl bg-slate-200" />

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="h-[360px] animate-pulse rounded-3xl bg-slate-200" />
            <div className="h-[360px] animate-pulse rounded-3xl bg-slate-200" />
          </div>

          <div className="h-[320px] animate-pulse rounded-3xl bg-slate-200" />
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
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Dashboard Docente
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Visualiza el estado de tus cursos, alumnos, clases programadas y
                seguimiento académico en un solo lugar.
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

        <div className="grid gap-6 grid-cols-1">
          <SectionCard
            title="Estado académico por curso"
            subtitle="Selecciona un curso para ver el resumen de alumnos"
            icon={BarChart3}
            right={
              <select
                value={cursoSeleccionado}
                onChange={(e) => setCursoSeleccionado(e.target.value)}
                className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 md:min-w-[320px]"
              >
                {detalleCursos.map((curso) => (
                  <option key={curso.idgrupo} value={curso.idgrupo}>
                    {curso.nombre} - {curso.grupo || "Sin grupo"}
                  </option>
                ))}
              </select>
            }
          >
            {loadingCurso ? (
              <SkeletonCursoCard />
            ) : !cursoActivo ? (
              <EmptyState text="No hay cursos disponibles para mostrar el estado académico." />
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {cursoActivo.nombre}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Grupo: {cursoActivo.grupo || "-"} · Modalidad:{" "}
                        {cursoActivo.modalidad || "-"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        Total alumnos: {cursoActivo.totalAlumnos || 0}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        Promedio: {cursoActivo.promedioCurso ?? "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
                    <p className="text-sm font-medium text-emerald-700">Aprobados</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-900">
                      {cursoActivo.aprobadosCount || 0}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4">
                    <p className="text-sm font-medium text-amber-700">Recuperación</p>
                    <p className="mt-2 text-3xl font-bold text-amber-900">
                      {cursoActivo.recuperacionCount || 0}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4">
                    <p className="text-sm font-medium text-rose-700">Desaprobados</p>
                    <p className="mt-2 text-3xl font-bold text-rose-900">
                      {cursoActivo.desaprobadosCount || 0}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-4">
                    <p className="text-sm font-medium text-slate-700">Sin notas</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {cursoActivo.sinNotasCount || 0}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-12 xl:items-center">
                  <div className="xl:col-span-9 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-left text-sm text-slate-500">
                          <th className="px-3 py-2 font-medium">Estado</th>
                          <th className="px-3 py-2 font-medium">Total</th>
                          <th className="px-3 py-2 font-medium">Porcentaje</th>
                          <th className="px-3 py-2 font-medium">Observación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estadosCursoActivo.map((item) => (
                          <tr key={item.name} className="rounded-2xl bg-slate-50">
                            <td className="px-3 py-3 font-semibold text-slate-800">
                              {item.name}
                            </td>
                            <td className="px-3 py-3 text-slate-700">{item.value}</td>
                            <td className="px-3 py-3 text-slate-700">
                              {item.porcentaje}%
                            </td>
                            <td className="px-3 py-3 text-slate-500">
                              {item.name === "Aprobados" &&
                                "Alumnos con promedio aprobatorio."}
                              {item.name === "Recuperación" &&
                                "Alumnos que requieren recuperación."}
                              {item.name === "Desaprobados" &&
                                "Alumnos con promedio desaprobatorio."}
                              {item.name === "Sin notas" &&
                                "Alumnos con evaluaciones pendientes."}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="xl:col-span-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      {estadosCursoActivo.every((item) => !item.value) ? (
                        <EmptyState text="Sin datos" />
                      ) : (
                        <>
                          <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={estadosCursoActivo}
                                  dataKey="value"
                                  nameKey="name"
                                  innerRadius={55}
                                  outerRadius={85}
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

                          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            {estadosCursoActivo.map((item, index) => {
                              const colors = [
                                "bg-emerald-500",
                                "bg-amber-500",
                                "bg-red-500",
                                "bg-slate-400",
                              ];

                              return (
                                <div
                                  key={item.name}
                                  className="flex items-center gap-2 rounded-xl bg-slate-50 px-2 py-1.5 text-slate-700"
                                >
                                  <span
                                    className={`h-3 w-3 rounded-full ${colors[index]}`}
                                  />
                                  <span className="font-medium">
                                    {item.name}:{" "}
                                    <span className="font-semibold">
                                      {item.porcentaje}%
                                    </span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Clases de hoy"
            subtitle="Agenda rápida del día actual"
            icon={CalendarDays}
            className="h-full"
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
            title="Alertas y seguimiento"
            subtitle="Aspectos que requieren atención"
            icon={AlertTriangle}
            className="h-full"
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
                        <h3 className="font-semibold text-amber-900">
                          {alerta.titulo}
                        </h3>
                        <p className="mt-1 text-sm text-amber-800">
                          {alerta.detalle}
                        </p>
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
                    <tr
                      key={`${item.curso}-${item.grupo}-${index}`}
                      className="rounded-2xl bg-slate-50"
                    >
                      <td className="px-3 py-3 font-medium text-slate-800">
                        {item.dia || "-"}
                      </td>
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