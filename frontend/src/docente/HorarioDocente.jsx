import { useEffect, useMemo, useState } from "react"
import { getHorarioDocente } from "../services/docenteService"

// === Helpers ===
const startOfWeekMonday = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const addDays = (date, days) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const formatDateShort = (date) => {
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  return `${dd}/${mm}`
}

const parseRangeToMinutes = (range) => {
  const [ini, fin] = range.split("-").map((s) => s.trim())
  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number)
    return h * 60 + m
  }
  return { startMinutes: toMin(ini), endMinutes: toMin(fin) }
}

const minutesNow = () => {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

// === Card reutilizable (mismo look que "Próxima clase") ===
function ClaseCard({ clase }) {
  const modalidad = (clase.modalidad || "").toUpperCase()

  return (
    <div className="rounded border border-blue-200 bg-blue-50 p-4 space-y-2">
      <div className="font-semibold text-lg">{clase.curso}</div>

      <div className="text-sm text-gray-700">
        {clase.dia} • {clase.hora} • Grupo {clase.grupo}
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
        <button
          onClick={() => clase.link && window.open(clase.link, "_blank")}
          className="mt-2 bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm disabled:opacity-60"
          disabled={!clase.link}
          title={!clase.link ? "No hay link registrado" : "Abrir clase"}
        >
          Ir a clase
        </button>
      )}
    </div>
  )
}

function HorarioDocente() {
  const [horario, setHorario] = useState([])
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()))

  useEffect(() => {
    getHorarioDocente().then(setHorario)
  }, [])

  const dias = useMemo(() => {
    const labels = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
    return labels.map((label, idx) => ({
      label,
      date: addDays(weekStart, idx),
    }))
  }, [weekStart])

  const horas = useMemo(() => {
    const unicas = Array.from(new Set(horario.map((h) => h.hora)))
    return unicas.sort(
      (a, b) =>
        parseRangeToMinutes(a).startMinutes - parseRangeToMinutes(b).startMinutes
    )
  }, [horario])

  const buscar = (diaLabel, hora) =>
    horario.find((h) => h.dia === diaLabel && h.hora === hora)

  const hoyLabel = useMemo(() => {
    const map = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ]
    return map[new Date().getDay()]
  }, [])

  const clasesHoy = useMemo(() => {
    return horario
      .filter((h) => h.dia === hoyLabel)
      .slice()
      .sort(
        (a, b) =>
          parseRangeToMinutes(a.hora).startMinutes -
          parseRangeToMinutes(b.hora).startMinutes
      )
  }, [horario, hoyLabel])

  const proximaClase = useMemo(() => {
    const now = minutesNow()
    const futuras = clasesHoy.filter(
      (c) => parseRangeToMinutes(c.hora).endMinutes > now
    )
    return futuras.length ? futuras[0] : null
  }, [clasesHoy])

  const weekLabel = useMemo(() => {
    const end = addDays(weekStart, 5)
    return `${formatDateShort(weekStart)} - ${formatDateShort(end)}`
  }, [weekStart])

  const prevWeek = () => setWeekStart((prev) => addDays(prev, -7))
  const nextWeek = () => setWeekStart((prev) => addDays(prev, 7))
  const goToday = () => setWeekStart(startOfWeekMonday(new Date()))

  return (

    <div className="space-y-6">
      {/* Header */}
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

      {/* Paneles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* === PANEL 1: CLASES DE HOY === */}
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

        {/* === PANEL 2: PRÓXIMA CLASE  === */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold text-lg mb-2">Próxima clase</h3>

          {proximaClase ? (
            <ClaseCard clase={proximaClase} />
          ) : (
            <p className="text-gray-500">No tienes más clases programadas.</p>
          )}
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-white p-4 rounded shadow overflow-auto">
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
                    const item = buscar(d.label, hora)
                    const esHoy = d.label === hoyLabel

                    return (
                      <td
                        key={d.label}
                        className={`border p-3 align-top ${
                          esHoy ? "bg-yellow-50/40" : ""
                        }`}
                      >
                        {item ? (
                          <div className="rounded p-3 bg-blue-50 border border-blue-200">
                            <div className="font-semibold">{item.curso}</div>
                            <div className="text-sm text-gray-600">
                              Grupo {item.grupo}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HorarioDocente