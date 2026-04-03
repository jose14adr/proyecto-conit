import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Video,
  Bell,
  X,
  UserRound,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../api";

const localizer = momentLocalizer(moment);

export default function MisSesiones() {
  const [sesiones, setSesiones] = useState([]);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [notificacion, setNotificacion] = useState(null);
  const [ahora, setAhora] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const notificacionesMostradas = useRef(new Set());

  useEffect(() => {
    cargarSesiones();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAhora(new Date());

      sesiones.forEach((s) => {
        const inicio = new Date(s.fecha);
        const diff = inicio.getTime() - Date.now();

        // Mostrar alerta una sola vez cuando falten 10 minutos o menos
        if (diff <= 10 * 60 * 1000 && diff > 0) {
          if (!notificacionesMostradas.current.has(s.id)) {
            notificacionesMostradas.current.add(s.id);
            setNotificacion(s);
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sesiones]);

  const sesionesOrdenadas = useMemo(() => {
    return [...sesiones].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
  }, [sesiones]);

  const resumen = useMemo(() => {
    const total = sesiones.length;

    const enVivo = sesiones.filter((s) => estadoSesion(s, ahora) === "envivo").length;
    const proximas = sesiones.filter((s) => estadoSesion(s, ahora) === "proxima").length;

    return { total, enVivo, proximas };
  }, [sesiones, ahora]);

  const siguienteSesion = useMemo(() => {
    return sesionesOrdenadas.find((s) => new Date(s.fecha).getTime() > ahora.getTime()) || null;
  }, [sesionesOrdenadas, ahora]);

  const eventos = useMemo(() => {
    return sesiones.map((s) => {
      const inicio = new Date(s.fecha);
      const duracionMin = Number(s.duracion || 60);

      return {
        title: s.titulo || "Sesión",
        start: inicio,
        end: new Date(inicio.getTime() + duracionMin * 60000),
        data: s,
      };
    });
  }, [sesiones]);

  async function cargarSesiones() {
    try {
      setLoading(true);
      setError("");

      // Puedes cambiar este endpoint más adelante por uno filtrado por alumno
      const res = await api.get("/sesion-vivo");
      const lista = Array.isArray(res.data) ? res.data : [];

      setSesiones(lista);
    } catch (err) {
      console.error("Error cargando sesiones:", err);
      setError("No se pudieron cargar las sesiones.");
      setSesiones([]);
    } finally {
      setLoading(false);
    }
  }

  function tiempoRestante(fecha) {
    const inicio = new Date(fecha).getTime();
    const diff = inicio - ahora.getTime();

    if (diff <= 0) return "EN_VIVO";

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    return { dias, horas, minutos, segundos };
  }

  function abrirReunion(link) {
    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Mis Sesiones</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Consulta tus clases en vivo, revisa el calendario y entra a tus sesiones.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<CalendarDays size={20} />}
            label="Total sesiones"
            value={resumen.total}
          />
          <StatCard
            icon={<Video size={20} />}
            label="En vivo"
            value={resumen.enVivo}
          />
          <StatCard
            icon={<Bell size={20} />}
            label="Próximas"
            value={resumen.proximas}
          />
        </div>
      </div>

      {/* ALERTA */}
      {notificacion && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-100 p-2 text-amber-700">
              <Bell size={18} />
            </div>

            <div>
              <p className="font-semibold text-amber-800">
                Tu clase comienza pronto
              </p>
              <p className="text-sm text-amber-700">
                <span className="font-medium">{notificacion.titulo || "Sesión"}</span>
                {" • "}
                {formatearFechaHora(notificacion.fecha)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => abrirReunion(notificacion.link_reunion)}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Entrar ahora
            </button>

            <button
              onClick={() => setNotificacion(null)}
              className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* COLUMNA PRINCIPAL */}
        <div className="space-y-6">
          {/* TABLA */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Sesiones programadas
              </h2>
            </div>

            {loading ? (
              <div className="space-y-4 p-5">
                {[...Array(4)].map((_, i) => (
                  <SkeletonSesion key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : sesionesOrdenadas.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <CalendarDays size={24} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-700">
                  No tienes sesiones registradas
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Cuando se programen clases en vivo, aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-5 py-4 text-left font-semibold">Fecha</th>
                      <th className="px-5 py-4 text-left font-semibold">Curso</th>
                      <th className="px-5 py-4 text-left font-semibold">Docente</th>
                      <th className="px-5 py-4 text-left font-semibold">Estado</th>
                      <th className="px-5 py-4 text-left font-semibold">Cuenta regresiva</th>
                      <th className="px-5 py-4 text-left font-semibold">Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sesionesOrdenadas.map((s) => {
                      const fecha = new Date(s.fecha);
                      const docente = obtenerDocente(s);
                      const estado = estadoSesion(s, ahora);
                      const puedeEntrar = puedeEntrarSesion(s, ahora);
                      const t = tiempoRestante(s.fecha);

                      return (
                        <tr
                          key={s.id}
                          className="border-t border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-5 py-4 align-top">
                            <div className="font-medium text-slate-800">
                              {fecha.toLocaleDateString()}
                            </div>
                            <div className="text-slate-500">
                              {fecha.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>

                          <td className="px-5 py-4 align-top">
                            <div className="font-medium text-slate-800">
                              {s.curso?.nombrecurso || s.titulo || "Sesión"}
                            </div>
                            <div className="text-slate-500">
                              {s.titulo || "Clase en vivo"}
                            </div>
                          </td>

                          <td className="px-5 py-4 align-top text-slate-700">
                            {docente || "Docente por asignar"}
                          </td>

                          <td className="px-5 py-4 align-top">
                            <EstadoBadge estado={estado} />
                          </td>

                          <td className="px-5 py-4 align-top">
                            {t === "EN_VIVO" ? (
                              <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                🔴 EN VIVO
                              </span>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                <TimeBlock value={t.dias} label="días" />
                                <TimeBlock value={t.horas} label="hrs" />
                                <TimeBlock value={t.minutos} label="min" />
                                <TimeBlock value={t.segundos} label="seg" />
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4 align-top">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setSesionSeleccionada(s)}
                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                              >
                                Ver detalle
                              </button>

                              <button
                                onClick={() => abrirReunion(s.link_reunion)}
                                disabled={!puedeEntrar}
                                className={`rounded-xl px-3 py-2 text-xs font-semibold text-white transition ${
                                  puedeEntrar
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "cursor-not-allowed bg-slate-300"
                                }`}
                              >
                                Entrar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CALENDARIO */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Calendario de sesiones
            </h2>

            <div className="overflow-hidden rounded-2xl">
              <Calendar
                localizer={localizer}
                events={eventos}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 520 }}
                onSelectEvent={(evento) => {
                  setSesionSeleccionada(evento.data);
                }}
                messages={{
                  next: "Sig.",
                  previous: "Ant.",
                  today: "Hoy",
                  month: "Mes",
                  week: "Semana",
                  day: "Día",
                  agenda: "Agenda",
                  date: "Fecha",
                  time: "Hora",
                  event: "Evento",
                  noEventsInRange: "No hay sesiones en este rango",
                }}
              />
            </div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">
              Próxima sesión
            </h3>

            {siguienteSesion ? (
              <>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Título</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {siguienteSesion.titulo || "Sesión en vivo"}
                  </p>

                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <InfoLine
                      icon={<BookOpen size={16} />}
                      text={siguienteSesion.curso?.nombrecurso || "Curso"}
                    />
                    <InfoLine
                      icon={<UserRound size={16} />}
                      text={obtenerDocente(siguienteSesion) || "Docente por asignar"}
                    />
                    <InfoLine
                      icon={<Clock3 size={16} />}
                      text={formatearFechaHora(siguienteSesion.fecha)}
                    />
                  </div>

                  <button
                    onClick={() => setSesionSeleccionada(siguienteSesion)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Ver sesión
                    <ArrowRight size={16} />
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                No hay próximas sesiones programadas.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">
              Recomendaciones
            </h3>

            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <TipItem text="Ingresa unos minutos antes de iniciar la clase." />
              <TipItem text="Verifica tu conexión y audio antes de entrar." />
              <TipItem text="Revisa tu calendario para no perder sesiones." />
            </div>
          </div>
        </aside>
      </div>

      {/* MODAL */}
      {sesionSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {sesionSeleccionada.titulo || "Sesión en vivo"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {sesionSeleccionada.curso?.nombrecurso || "Curso"}
                </p>
              </div>

              <button
                onClick={() => setSesionSeleccionada(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoCard
                    label="Fecha y hora"
                    value={formatearFechaHora(sesionSeleccionada.fecha)}
                  />
                  <InfoCard
                    label="Duración"
                    value={`${Number(sesionSeleccionada.duracion || 60)} min`}
                  />
                  <InfoCard
                    label="Docente"
                    value={obtenerDocente(sesionSeleccionada) || "Por asignar"}
                  />
                  <InfoCard
                    label="Estado"
                    value={textoEstado(estadoSesion(sesionSeleccionada, ahora))}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => abrirReunion(sesionSeleccionada.link_reunion)}
                  disabled={!puedeEntrarSesion(sesionSeleccionada, ahora)}
                  className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white ${
                    puedeEntrarSesion(sesionSeleccionada, ahora)
                      ? "bg-red-600 hover:bg-red-700"
                      : "cursor-not-allowed bg-slate-300"
                  }`}
                >
                  Entrar a la sesión
                </button>

                <button
                  onClick={() => setSesionSeleccionada(null)}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function estadoSesion(sesion, ahora) {
  const inicio = new Date(sesion.fecha).getTime();
  const duracionMin = Number(sesion.duracion || 60);
  const fin = inicio + duracionMin * 60000;
  const actual = ahora.getTime();

  if (actual >= inicio && actual <= fin) return "envivo";
  if (actual < inicio && inicio - actual <= 10 * 60 * 1000) return "proxima";
  if (actual < inicio) return "programada";
  return "finalizada";
}

function puedeEntrarSesion(sesion, ahora) {
  const inicio = new Date(sesion.fecha).getTime();
  const duracionMin = Number(sesion.duracion || 60);
  const fin = inicio + duracionMin * 60000;
  const actual = ahora.getTime();

  // Permitir entrar desde 10 minutos antes hasta el fin de la sesión
  return actual >= inicio - 10 * 60 * 1000 && actual <= fin;
}

function obtenerDocente(sesion) {
  const docente =
    sesion?.docente ||
    sesion?.curso?.docente ||
    sesion?.curso?.grupos?.[0]?.docente ||
    null;

  if (!docente) return "";
  return [docente.nombre, docente.apellido].filter(Boolean).join(" ").trim();
}

function formatearFechaHora(fecha) {
  const f = new Date(fecha);

  return f.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function textoEstado(estado) {
  switch (estado) {
    case "envivo":
      return "En vivo";
    case "proxima":
      return "Próxima";
    case "programada":
      return "Programada";
    case "finalizada":
      return "Finalizada";
    default:
      return "Sin estado";
  }
}

function EstadoBadge({ estado }) {
  const estilos = {
    envivo: "bg-red-100 text-red-700",
    proxima: "bg-amber-100 text-amber-700",
    programada: "bg-blue-100 text-blue-700",
    finalizada: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        estilos[estado] || "bg-slate-100 text-slate-700"
      }`}
    >
      {textoEstado(estado)}
    </span>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-white/90">{icon}</span>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="mt-3 text-sm text-indigo-100">{label}</p>
    </div>
  );
}

function TimeBlock({ value, label }) {
  return (
    <div className="min-w-[52px] rounded-xl bg-slate-100 px-2 py-2 text-center">
      <div className="text-sm font-bold text-slate-800">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
    </div>
  );
}

function InfoLine({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function TipItem({ text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
      <p>{text}</p>
    </div>
  );
}

function SkeletonSesion() {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-3 h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
      <div className="mb-2 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
      <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
    </div>
  );
}