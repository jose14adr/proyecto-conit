import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  RotateCcw,
  Video,
} from "lucide-react";
import { getHorarioDocente } from "../services/docenteService";

/* =====================================================
HELPERS
===================================================== */

const startOfWeekMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const formatDateShort = (date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
};

const parseRangeToMinutes = (range) => {
  if (!range || !range.includes("-")) {
    return { startMinutes: 0, endMinutes: 0 };
  }

  const [ini, fin] = range.split("-").map((s) => s.trim());

  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  return {
    startMinutes: toMin(ini),
    endMinutes: toMin(fin),
  };
};

const minutesNow = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

const getModalidadBadge = (modalidad) => {
  const tipo = (modalidad || "").toUpperCase();

  if (tipo === "PRESENCIAL") {
    return "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)] border border-[var(--color-primary)]";
  }

  if (tipo === "VIRTUAL") {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }

  return "bg-[var(--color-background)] text-[var(--color-muted-text)] border border-[var(--color-border)]";
};

/* =====================================================
CARD CLASE
===================================================== */

function ClaseCard({ clase }) {
  const modalidad = (clase.modalidad || "").toUpperCase();

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-card))] p-4 shadow-sm transition hover:border-[var(--color-primary)] hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h4 className="line-clamp-2 font-black text-[var(--color-text)]">
          {clase.curso || "Curso"}
        </h4>

        <span
          className={`rounded-full px-2 py-1 text-xs font-bold ${getModalidadBadge(
            modalidad
          )}`}
        >
          {modalidad || "N/A"}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-[var(--color-muted-text)]">
        <Clock3 size={15} className="text-[var(--color-primary)]" />
        {clase.dia} • {clase.hora}
      </div>

      <div className="flex items-center gap-2 text-sm text-[var(--color-muted-text)]">
        <BookOpen size={15} className="text-[var(--color-primary)]" />
        Grupo: {clase.grupo || "—"}
      </div>

      {modalidad === "PRESENCIAL" && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-muted-text)]">
          <MapPin size={15} className="text-[var(--color-primary)]" />
          Salón: {clase.salon || "—"}
        </div>
      )}

      {modalidad === "VIRTUAL" && clase.link && (
        <button
          type="button"
          onClick={() => window.open(clase.link, "_blank")}
          className="inline-flex items-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-3 py-2 text-sm font-bold text-[var(--color-primary)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
        >
          <Video size={16} />
          Ir a clase
        </button>
      )}
    </div>
  );
}

/* =====================================================
CARD RESUMEN
===================================================== */

function ResumenCard({ titulo, valor, subtitulo, icon: Icon, tone = "primary" }) {
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
            {titulo}
          </p>

          <p className="mt-2 text-3xl font-black text-[var(--color-text)]">
            {valor}
          </p>

          <p className="mt-2 text-sm text-[var(--color-muted-text)]">
            {subtitulo}
          </p>
        </div>

        {Icon && (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: selected.accent }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
COMPONENTE PRINCIPAL
===================================================== */

function HorarioDocente() {
  const [horario, setHorario] = useState([]);
  const [loading, setLoading] = useState(true);

  const [weekStart, setWeekStart] = useState(() =>
    startOfWeekMonday(new Date())
  );

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getHorarioDocente();
        setHorario(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar horario docente:", error);
        setHorario([]);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const dias = useMemo(() => {
    const labels = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    return labels.map((label, idx) => ({
      label,
      date: addDays(weekStart, idx),
    }));
  }, [weekStart]);

  const horas = useMemo(() => {
    const unicas = Array.from(new Set(horario.map((h) => h.hora))).filter(
      Boolean
    );

    return unicas.sort(
      (a, b) =>
        parseRangeToMinutes(a).startMinutes -
        parseRangeToMinutes(b).startMinutes
    );
  }, [horario]);

  const buscar = (dia, hora) =>
    horario.find((h) => h.dia === dia && h.hora === hora);

  const hoyLabel = useMemo(() => {
    const map = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    return map[new Date().getDay()];
  }, []);

  const clasesHoy = useMemo(() => {
    return horario
      .filter((h) => h.dia === hoyLabel)
      .sort(
        (a, b) =>
          parseRangeToMinutes(a.hora).startMinutes -
          parseRangeToMinutes(b.hora).startMinutes
      );
  }, [horario, hoyLabel]);

  const proximaClase = useMemo(() => {
    const now = minutesNow();

    const futuras = clasesHoy.filter(
      (c) => parseRangeToMinutes(c.hora).endMinutes > now
    );

    return futuras.length ? futuras[0] : null;
  }, [clasesHoy]);

  const weekLabel = useMemo(() => {
    const end = addDays(weekStart, 5);
    return `${formatDateShort(weekStart)} - ${formatDateShort(end)}`;
  }, [weekStart]);

  const prevWeek = () => setWeekStart((prev) => addDays(prev, -7));
  const nextWeek = () => setWeekStart((prev) => addDays(prev, 7));
  const goToday = () => setWeekStart(startOfWeekMonday(new Date()));

  const totalClasesSemana = horario.length;

  return (
    <div className="space-y-8 bg-[var(--color-background)] text-[var(--color-text)]">
      {/* HEADER */}
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
              <CalendarDays size={16} />
              Agenda docente
            </div>

            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              Mi horario
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
              Visualiza tus clases por semana, revisa tu próxima sesión y accede
              rápidamente a las clases virtuales.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Semana actual
            </p>

            <p className="mt-1 text-2xl font-black text-white">{weekLabel}</p>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      </section>

      {/* CONTROLES */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-black text-[var(--color-text)]">
              Navegación semanal
            </h3>

            <p className="mt-1 text-sm text-[var(--color-muted-text)]">
              Cambia entre semanas o vuelve al horario de la semana actual.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={prevWeek}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm font-bold text-[var(--color-text)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:text-[var(--color-primary)]"
            >
              <ChevronLeft size={18} />
              Anterior
            </button>

            <button
              type="button"
              onClick={goToday}
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-button-primary)] px-4 py-2.5 text-sm font-bold text-[var(--color-button-primary-text)] shadow-sm transition hover:brightness-95"
            >
              <RotateCcw size={18} />
              Hoy
            </button>

            <button
              type="button"
              onClick={nextWeek}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm font-bold text-[var(--color-text)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:text-[var(--color-primary)]"
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* RESUMEN */}
      <div className="grid gap-4 md:grid-cols-3">
        <ResumenCard
          titulo="Clases de hoy"
          valor={clasesHoy.length}
          subtitulo={`Hoy es ${hoyLabel}`}
          icon={CalendarDays}
          tone="primary"
        />

        <ResumenCard
          titulo="Próxima clase"
          valor={proximaClase ? proximaClase.hora : "—"}
          subtitulo={proximaClase ? proximaClase.curso : "No hay más clases hoy"}
          icon={Clock3}
          tone="secondary"
        />

        <ResumenCard
          titulo="Total semanal"
          valor={totalClasesSemana}
          subtitulo="Clases registradas"
          icon={BookOpen}
          tone="sidenav"
        />
      </div>

      {/* CLASES DE HOY */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-2xl font-black text-[var(--color-text)]">
            Clases de hoy
          </h3>

          <p className="mt-1 text-sm text-[var(--color-muted-text)]">
            Vista rápida de las clases programadas para {hoyLabel}.
          </p>
        </div>

        {loading ? (
          <LoadingBox />
        ) : clasesHoy.length === 0 ? (
          <EmptyBox
            title="No tienes clases programadas para hoy."
            description="Revisa el calendario semanal para ver otras sesiones."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {clasesHoy.map((clase, index) => (
              <ClaseCard key={`${clase.dia}-${clase.hora}-${index}`} clase={clase} />
            ))}
          </div>
        )}
      </section>

      {/* TABLA HORARIO */}
      <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-6 py-5">
          <h3 className="text-2xl font-black text-[var(--color-text)]">
            Horario semanal
          </h3>

          <p className="mt-1 text-sm text-[var(--color-muted-text)]">
            Distribución de clases por día y hora.
          </p>
        </div>

        <div className="overflow-auto p-5">
          {loading ? (
            <LoadingBox />
          ) : horas.length === 0 ? (
            <EmptyBox
              title="No hay horario registrado."
              description="Cuando se asignen clases a tus grupos, aparecerán en esta tabla."
            />
          ) : (
            <table className="w-full min-w-[980px] table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 w-44 rounded-tl-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-3 text-left text-sm font-black text-[var(--color-text)]">
                    Hora
                  </th>

                  {dias.map((d) => {
                    const esHoy = d.label === hoyLabel;

                    return (
                      <th
                        key={d.label}
                        className={`border border-[var(--color-border)] p-3 text-left text-sm font-black ${
                          esHoy
                            ? "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]"
                            : "bg-[var(--color-background)] text-[var(--color-text)]"
                        }`}
                      >
                        <div>{d.label}</div>

                        <div className="mt-1 text-xs font-semibold opacity-80">
                          {formatDateShort(d.date)}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {horas.map((hora) => (
                  <tr key={hora}>
                    <td className="sticky left-0 z-10 w-44 border border-[var(--color-border)] bg-[var(--color-card)] p-3 font-black text-[var(--color-text)]">
                      {hora}
                    </td>

                    {dias.map((d) => {
                      const item = buscar(d.label, hora);
                      const esHoy = d.label === hoyLabel;
                      const modalidad = (item?.modalidad || "").toUpperCase();

                      return (
                        <td
                          key={d.label + hora}
                          className={`border border-[var(--color-border)] p-3 ${
                            esHoy
                              ? "bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)]"
                              : "bg-[var(--color-card)]"
                          }`}
                        >
                          <div className="h-[130px]">
                            {item ? (
                              <div className="h-full w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-card))] p-3 shadow-sm transition-all hover:scale-[1.02] hover:border-[var(--color-primary)] hover:shadow-lg">
                                <div className="flex h-full flex-col justify-between">
                                  <div>
                                    <div className="line-clamp-2 font-black text-[var(--color-text)]">
                                      {item.curso}
                                    </div>

                                    <div className="mt-1 line-clamp-1 text-sm text-[var(--color-muted-text)]">
                                      Grupo {item.grupo || "—"}
                                    </div>

                                    {modalidad === "PRESENCIAL" && (
                                      <div className="mt-1 line-clamp-1 text-xs text-[var(--color-muted-text)]">
                                        Salón {item.salon || "—"}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between gap-2">
                                    <span
                                      className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${getModalidadBadge(
                                        modalidad
                                      )}`}
                                    >
                                      {modalidad || "N/A"}
                                    </span>

                                    {modalidad === "VIRTUAL" && item.link && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          window.open(item.link, "_blank")
                                        }
                                        className="rounded-lg bg-[var(--color-primary)] px-2 py-1 text-xs font-bold text-white transition hover:brightness-95"
                                      >
                                        Entrar
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)] text-xs italic text-[var(--color-muted-text)]">
                                Sin clase
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function LoadingBox() {
  return (
    <div className="flex items-center justify-center gap-3 rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)] p-10 text-[var(--color-muted-text)]">
      <Loader2 size={22} className="animate-spin text-[var(--color-primary)]" />
      Cargando horario...
    </div>
  );
}

function EmptyBox({ title, description }) {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)] p-10 text-center">
      <p className="font-black text-[var(--color-text)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--color-muted-text)]">
        {description}
      </p>
    </div>
  );
}

export default HorarioDocente;