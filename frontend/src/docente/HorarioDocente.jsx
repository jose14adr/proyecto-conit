import { useEffect, useMemo, useState } from "react";
import { getHorarioDocente, getHorariosDocentes } from "../services/docenteService";

// =====================================
// Helpers de fechas / horario
// =====================================
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

// =====================================
// Card reutilizable
// =====================================
function ClaseCard({ clase, mostrarDocente = false }) {
  const modalidad = (clase.modalidad || "").toUpperCase();

  return (
    <div className="rounded border border-blue-200 bg-blue-50 p-4 space-y-2">
      <div className="font-semibold text-lg">{clase.curso}</div>

      {mostrarDocente && (
        <div className="text-sm text-gray-700">
          Docente: <span className="font-semibold">{clase.docente || "—"}</span>
        </div>
      )}

      <div className="text-sm text-gray-700">
        {clase.dia} • {clase.hora} • Grupo {clase.grupo || "—"}
      </div>

      <div className="text-sm">
        Modalidad: <span className="font-semibold">{modalidad || "—"}</span>
      </div>

      {modalidad === "PRESENCIAL" && (
        <div className="text-sm text-gray-700">
          Salón: <span className="font-semibold">{clase.salon || "—"}</span>
        </div>
      )}

      {modalidad === "VIRTUAL" && (
        <div className="text-sm text-gray-700">
          Enlace:{" "}
          {clase.link ? (
            <button
              onClick={() => window.open(clase.link, "_blank")}
              className="text-blue-600 hover:underline font-medium"
            >
              Ir a clase
            </button>
          ) : (
            <span className="font-semibold">No registrado</span>
          )}
        </div>
      )}
    </div>
  );
}

function HorarioDocente() {
  // =====================================
  // Estados del horario del docente actual
  // =====================================
  const [horario, setHorario] = useState([]);
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeekMonday(new Date())
  );

  // =====================================
  // Estados para consultar otros docentes
  // =====================================
  const [horariosDocentes, setHorariosDocentes] = useState([]);
  const [busquedaDocente, setBusquedaDocente] = useState("");
  const [loadingOtros, setLoadingOtros] = useState(true);

  // =====================================
  // Carga inicial
  // =====================================
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [miHorario, todosLosHorarios] = await Promise.all([
          getHorarioDocente(),
          getHorariosDocentes(),
        ]);

        setHorario(miHorario || setHorario([]));
        setHorariosDocentes(todosLosHorarios || []);
      } catch (error) {
        console.error("Error cargando horarios:", error);
        setHorario([]);
        setHorariosDocentes([]);
      } finally {
        setLoadingOtros(false);
      }
    };

    cargarDatos();
  }, []);

  // =====================================
  // Días de la semana para calendario
  // =====================================
  const dias = useMemo(() => {
    const labels = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return labels.map((label, idx) => ({
      label,
      date: addDays(weekStart, idx),
    }));
  }, [weekStart]);

  // =====================================
  // Horas únicas del docente actual
  // =====================================
  const horas = useMemo(() => {
    const unicas = Array.from(new Set(horario.map((h) => h.hora)));
    return unicas.sort(
      (a, b) =>
        parseRangeToMinutes(a).startMinutes - parseRangeToMinutes(b).startMinutes
    );
  }, [horario]);

  const buscar = (diaLabel, hora) =>
    horario.find((h) => h.dia === diaLabel && h.hora === hora);

  // =====================================
  // Día actual
  // =====================================
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

  // =====================================
  // Clases de hoy del docente actual
  // =====================================
  const clasesHoy = useMemo(() => {
    return horario
      .filter((h) => h.dia === hoyLabel)
      .slice()
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

  // =====================================
  // Filtro de otros docentes por nombre
  // =====================================
  const otrosDocentesFiltrados = useMemo(() => {
    const q = busquedaDocente.trim().toLowerCase();

    const lista = (horariosDocentes || []).slice().sort((a, b) => {
      const nombreA = (a.docente || "").toLowerCase();
      const nombreB = (b.docente || "").toLowerCase();

      if (nombreA !== nombreB) return nombreA.localeCompare(nombreB);

      return (
        parseRangeToMinutes(a.hora).startMinutes -
        parseRangeToMinutes(b.hora).startMinutes
      );
    });

    if (!q) return lista;

    return lista.filter((item) =>
      (item.docente || "").toLowerCase().includes(q)
    );
  }, [horariosDocentes, busquedaDocente]);

  return (
    <div className="space-y-6">
      {/* ============================= */}
      {/* Header */}
      {/* ============================= */}
      <div className="bg-white p-4 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Horario</h2>
          <p className="text-sm text-gray-500">Semana: {weekLabel}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={prevWeek}
            className="border px-3 py-2 rounded hover:bg-gray-50"
          >
            ← Anterior
          </button>
          <button
            onClick={goToday}
            className="border px-3 py-2 rounded hover:bg-gray-50"
          >
            Hoy
          </button>
          <button
            onClick={nextWeek}
            className="border px-3 py-2 rounded hover:bg-gray-50"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* ============================= */}
      {/* Paneles: clases de hoy / próxima clase */}
      {/* ============================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold text-lg mb-2">Clases de hoy ({hoyLabel})</h3>

          {clasesHoy.length ? (
            <div className="space-y-3">
              {clasesHoy.map((c, idx) => (
                <ClaseCard key={idx} clase={c} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Hoy no tienes clases.</p>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold text-lg mb-2">Próxima clase</h3>

          {proximaClase ? (
            <ClaseCard clase={proximaClase} />
          ) : (
            <p className="text-gray-500">No tienes más clases programadas.</p>
          )}
        </div>
      </div>

      {/* ============================= */}
      {/* Calendario del docente actual */}
      {/* ============================= */}
      <div className="bg-white p-4 rounded shadow overflow-auto">
        <h3 className="font-bold text-lg mb-4">Mi horario semanal</h3>

        <table className="min-w-[950px] w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-3 bg-gray-50 text-left">Hora</th>
              {dias.map((d) => (
                <th key={d.label} className="border p-3 bg-gray-50 text-left">
                  {d.label} {formatDateShort(d.date)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {horas.length === 0 ? (
              <tr>
                <td className="p-4 text-gray-500" colSpan={dias.length + 1}>
                  No hay horario cargado.
                </td>
              </tr>
            ) : (
              horas.map((hora) => (
                <tr key={hora}>
                  <td className="border p-3 font-semibold">{hora}</td>

                  {dias.map((d) => {
                    const item = buscar(d.label, hora);
                    const esHoy = d.label === hoyLabel;

                    return (
                      <td
                        key={d.label}
                        className={`border p-3 align-top ${
                          esHoy ? "bg-yellow-50/40" : ""
                        }`}
                      >
                        {item ? (
                          <div className="rounded p-3 bg-blue-50 border border-blue-200 space-y-1">
                            <div className="font-semibold">{item.curso}</div>
                            <div className="text-sm text-gray-600">
                              Grupo {item.grupo || "—"}
                            </div>
                            <div className="text-sm text-gray-600">
                              Modalidad: {item.modalidad || "—"}
                            </div>

                            {(item.modalidad || "").toUpperCase() === "PRESENCIAL" && (
                              <div className="text-sm text-gray-600">
                                Salón: {item.salon || "—"}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ============================= */}
      {/* Consulta de horarios de otros docentes */}
      {/* ============================= */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg">Horario de otros docentes</h3>
            <p className="text-sm text-gray-500">
              Busca por nombre de docente y revisa curso, modalidad, horario y salón.
            </p>
          </div>

          <div className="w-full md:w-96">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar docente
            </label>
            <input
              type="text"
              value={busquedaDocente}
              onChange={(e) => setBusquedaDocente(e.target.value)}
              placeholder="Ejemplo: María, Carlos, Pérez..."
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {loadingOtros ? (
          <p className="text-gray-500">Cargando horarios de docentes...</p>
        ) : otrosDocentesFiltrados.length === 0 ? (
          <p className="text-gray-500">
            No se encontraron horarios para la búsqueda ingresada.
          </p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-[900px] w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-3 bg-gray-50 text-left">Docente</th>
                  <th className="border p-3 bg-gray-50 text-left">Curso</th>
                  <th className="border p-3 bg-gray-50 text-left">Modalidad</th>
                  <th className="border p-3 bg-gray-50 text-left">Día</th>
                  <th className="border p-3 bg-gray-50 text-left">Horario</th>
                  <th className="border p-3 bg-gray-50 text-left">Salón</th>
                </tr>
              </thead>

              <tbody>
                {otrosDocentesFiltrados.map((item, idx) => {
                  const modalidad = (item.modalidad || "").toUpperCase();
                  const salonMostrar =
                    modalidad === "PRESENCIAL" ? item.salon || "—" : "No aplica";

                  return (
                    <tr key={`${item.docente}-${item.curso}-${item.dia}-${item.hora}-${idx}`}>
                      <td className="border p-3">{item.docente || "—"}</td>
                      <td className="border p-3">{item.curso || "—"}</td>
                      <td className="border p-3">{item.modalidad || "—"}</td>
                      <td className="border p-3">{item.dia || "—"}</td>
                      <td className="border p-3">{item.hora || "—"}</td>
                      <td className="border p-3">{salonMostrar}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default HorarioDocente;