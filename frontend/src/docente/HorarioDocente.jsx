import { useEffect, useMemo, useState } from "react";
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

  if (tipo === "PRESENCIAL")
    return "bg-violet-100 text-violet-700 border border-violet-200";

  if (tipo === "VIRTUAL")
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";

  return "bg-gray-100 text-gray-700 border border-gray-200";
};

/* =====================================================
CARD CLASE
===================================================== */

function ClaseCard({ clase }) {
  const modalidad = (clase.modalidad || "").toUpperCase();

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-4 shadow-sm space-y-3 hover:shadow-md transition">

      <div className="flex items-start justify-between gap-3">

        <h4 className="font-semibold text-gray-800 line-clamp-2">
          {clase.curso || "Curso"}
        </h4>

        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${getModalidadBadge(
            modalidad
          )}`}
        >
          {modalidad}
        </span>

      </div>

      <div className="text-sm text-gray-600">
        {clase.dia} • {clase.hora}
      </div>

      <div className="text-sm text-gray-600 line-clamp-1">
        Grupo: {clase.grupo || "—"}
      </div>

      {modalidad === "PRESENCIAL" && (
        <div className="text-sm text-gray-600">
          Salón: {clase.salon || "—"}
        </div>
      )}

      {modalidad === "VIRTUAL" && clase.link && (
        <button
          onClick={() => window.open(clase.link, "_blank")}
          className="text-sm text-blue-600 hover:underline"
        >
          Ir a clase
        </button>
      )}
    </div>
  );
}

/* =====================================================
CARD RESUMEN
===================================================== */

function ResumenCard({ titulo, valor, subtitulo }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-3xl font-bold text-gray-800 mt-2">{valor}</p>
      <p className="text-sm text-gray-500 mt-2">{subtitulo}</p>
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
        setHorario(data || []);
      } catch (error) {
        console.error(error);
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

    const unicas = Array.from(new Set(horario.map((h) => h.hora)));

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
    <div className="space-y-6">

      {/* HEADER */}

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Mi horario
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Semana: {weekLabel}
          </p>
        </div>

        <div className="flex gap-2">

          <button
            onClick={prevWeek}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            ← Anterior
          </button>

          <button
            onClick={goToday}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Hoy
          </button>

          <button
            onClick={nextWeek}
            className="border px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Siguiente →
          </button>

        </div>
      </div>

      {/* RESUMEN */}

      <div className="grid md:grid-cols-3 gap-4">

        <ResumenCard
          titulo="Clases de hoy"
          valor={clasesHoy.length}
          subtitulo={`Hoy es ${hoyLabel}`}
        />

        <ResumenCard
          titulo="Próxima clase"
          valor={proximaClase ? proximaClase.hora : "—"}
          subtitulo={
            proximaClase
              ? proximaClase.curso
              : "No hay más clases hoy"
          }
        />

        <ResumenCard
          titulo="Total semanal"
          valor={totalClasesSemana}
          subtitulo="Clases registradas"
        />

      </div>

      {/* TABLA HORARIO */}

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 overflow-auto">

        <table className="min-w-[980px] w-full table-fixed border-separate border-spacing-0">

          <thead>
            <tr>

              <th className="sticky left-0 z-10 w-44 bg-gray-50 border border-gray-200 p-3 text-left text-sm font-semibold text-gray-700">
                Hora
              </th>

              {dias.map((d) => {

                const esHoy = d.label === hoyLabel;

                return (
                  <th
                    key={d.label}
                    className={`border border-gray-200 p-3 text-left text-sm font-semibold ${
                      esHoy
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div>{d.label}</div>

                    <div className="text-xs mt-1 opacity-80">
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

                <td className="sticky left-0 z-10 w-44 bg-white border border-gray-200 p-3 font-semibold text-gray-700">
                  {hora}
                </td>

                {dias.map((d) => {

                  const item = buscar(d.label, hora);
                  const esHoy = d.label === hoyLabel;
                  const modalidad = (item?.modalidad || "").toUpperCase();

                  return (

                    <td
                      key={d.label + hora}
                      className={`border border-gray-200 p-3 ${
                        esHoy ? "bg-blue-50/40" : ""
                      }`}
                    >

                      <div className="h-[120px]">

                        {item ? (

                          <div className="h-full w-full rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-3 shadow-sm overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all">

                            <div className="flex flex-col justify-between h-full">

                              <div>

                                <div className="font-semibold text-gray-800 line-clamp-2">
                                  {item.curso}
                                </div>

                                <div className="text-sm text-gray-600 line-clamp-1">
                                  Grupo {item.grupo || "—"}
                                </div>

                              </div>

                              <div>

                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getModalidadBadge(
                                    modalidad
                                  )}`}
                                >
                                  {modalidad}
                                </span>

                              </div>

                            </div>

                          </div>

                        ) : (

                          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-xs italic text-gray-400">
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

      </div>

    </div>
  );
}

export default HorarioDocente;