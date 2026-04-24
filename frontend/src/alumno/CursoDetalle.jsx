import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../api";

export default function CursoDetalle() {
  const { id } = useParams()

  const [curso, setCurso] = useState(null)
  const [moduloAbierta, setModuloAbierta] = useState(null)
  const [progreso, setProgreso] = useState(0)

  const [respuestasExamen, setRespuestasExamen] = useState({})
  const [examenActivo, setExamenActivo] = useState(null)
  const [tiempoRestante, setTiempoRestante] = useState(0)

  const [intentos, setIntentos] = useState({})
  const [preguntaActiva, setPreguntaActiva] = useState(0)
  

  /* ========================= */
  /* CARGAR CURSO */
  /* ========================= */
  useEffect(() => {
    async function cargarCurso() {
      try {
        const idalumno = localStorage.getItem("idalumno");

        const res = await api.get(
          `/curso/alumno/${idalumno}/curso/${id}`
        );

        setCurso(res.data)

      } catch (err) {
        console.log("Error cargando curso", err)
      }
    }
    cargarCurso()
  }, [id])

    useEffect(() => {
  if (!examenActivo) return

  const handleScroll = () => {
    const offsets = examenActivo?.preguntas?.map((_, i) => {
      const el = document.getElementById(`pregunta-${i}`)
      if (!el) return Infinity
      return Math.abs(el.getBoundingClientRect().top)
    })

    if (!offsets) return

    const minIndex = offsets.indexOf(Math.min(...offsets))
    setPreguntaActiva(minIndex)
  }

  window.addEventListener("scroll", handleScroll)
  return () => window.removeEventListener("scroll", handleScroll)
}, [examenActivo])

  /* ========================= */
  /* AUTO GUARDADO + REANUDAR */
  /* ========================= */

useEffect(() => {
  if (examenActivo) {
    const saved = localStorage.getItem(`examen_${examenActivo.id}`)
    if (saved) {
      setRespuestasExamen(JSON.parse(saved))
    }
  }
}, [examenActivo])

useEffect(() => {
  if (examenActivo) {
    localStorage.setItem(
      `examen_${examenActivo.id}`,
      JSON.stringify(respuestasExamen)
    )
  }
}, [respuestasExamen, examenActivo])

  /* ========================= */
  /* DETECTAR SCROLL */
  /* ========================= */


useEffect(() => {
  if (!examenActivo) return

  const handleScroll = () => {
    const offsets = examenActivo.preguntas.map((_, i) => {
      const el = document.getElementById(`pregunta-${i}`)
      if (!el) return Infinity
      return Math.abs(el.getBoundingClientRect().top)
    })

    const minIndex = offsets.indexOf(Math.min(...offsets))
    setPreguntaActiva(minIndex)
  }

  const container = document.getElementById("contenedor-preguntas")
  container?.addEventListener("scroll", handleScroll)

  return () => container?.removeEventListener("scroll", handleScroll)
}, [examenActivo])


/* ========================= */
  /* BLOQUEAR SALIDA */
  /* ========================= */

  useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (examenActivo) {
      e.preventDefault()
      e.returnValue = ""
    }
  }

  window.addEventListener("beforeunload", handleBeforeUnload)
  return () => window.removeEventListener("beforeunload", handleBeforeUnload)
}, [examenActivo])

  /* ========================= */
  /* TIMER */
  /* ========================= */

  useEffect(() => {
    if (!examenActivo) return

    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          alert("⏳ Tiempo terminado")
          setExamenActivo(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examenActivo])

  /* ========================= */
  /* INICIAR EXAMEN */
  /* ========================= */
const [loading, setLoading] = useState(false)

const iniciarExamen = async (ex) => {
  if (loading) return
  setLoading(true)

  const idalumno = localStorage.getItem("idalumno");

  try {
    await api.post(`/examen/${ex.id}/iniciar`, {
      idAlumno: idalumno,
    });

    setExamenActivo(ex)
    setTiempoRestante((ex.duracion_minutos || 30) * 60)

  } catch (err) {
    alert("❌ Ya no tienes intentos disponibles")
  }

  setLoading(false)
}

  /* ========================= */
  /* RESPUESTAS */
  /* ========================= */
  const seleccionarRespuestaExamen = (preguntaId, opcionId) => {
    setRespuestasExamen((prev) => ({
      ...prev,
      [preguntaId]: opcionId,
    }))
  }

  /* ========================= */
  /* ENVIAR EXAMEN */
  /* ========================= */
  const enviarExamen = async (examen) => {
    const idalumno = localStorage.getItem("idalumno");

    const respuestas = {}

    examen.preguntas.forEach((p) => {
      if (respuestasExamen[p.id]) {
        respuestas[p.id] = respuestasExamen[p.id]
      }
    })

    try {
      const res = await api.post(`/examen/${examen.id}/responder`, {
        respuestas,
        idAlumno: localStorage.getItem("idalumno")

      })

      alert(`🎯 Nota: ${res.data.nota}`)

      setIntentos((prev) => ({
        ...prev,
        [examen.id]: (prev[examen.id] || 0) + 1
      }))

      setExamenActivo(null)
      setRespuestasExamen({})

    } catch (err) {
      alert("Error al enviar examen")
    }
  }

  if (!curso) return <div className="p-10">Cargando...</div>

  const modulos = curso.modulos || []

  /* ========================= */
  /* VISTA EXAMEN FULL */
  /* ========================= */
  if (examenActivo) {

    const total = examenActivo.preguntas.length
    const respondidas = Object.keys(respuestasExamen).length
    const progreso = Math.round((respondidas / total) * 100)

    const irAPregunta = (index) => {
      const el = document.getElementById(`pregunta-${index}`)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    const confirmarEnvio = () => {
      if (confirm("¿Seguro que quieres terminar el examen?")) {
        enviarExamen(examenActivo)
        localStorage.removeItem(`examen_${examenActivo.id}`)
      }
    }

    return (
      <div className="h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">

        {/* HEADER PREMIUM */}
        <div className="bg-white/90 backdrop-blur shadow px-8 py-4 flex items-center justify-between border-b">

          {/* IZQUIERDA: VOLVER + TITULO */}
          <div className="flex items-center gap-6">
            
            <button
              onClick={() => setExamenActivo(null)}
              className="text-sm text-gray-500 hover:text-indigo-600 font-medium transition"
            >
              ← Volver
            </button>

            <div className="h-6 w-px bg-gray-300"></div>

            <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
              {examenActivo.titulo}
            </h2>

          </div>

          {/* CENTRO: PROGRESO */}
          <div className="flex flex-col items-center w-1/3">
            <p className="text-xs text-gray-400 mb-1">
              {respondidas} de {total} preguntas
            </p>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>

          {/* DERECHA: TIMER */}
          <div className="text-right">
            <p className="text-xs text-gray-400">Tiempo restante</p>
            <p className="text-2xl font-bold text-indigo-600 tracking-widest">
              {String(Math.floor(tiempoRestante / 60)).padStart(2, '0')}:
              {String(tiempoRestante % 60).padStart(2, '0')}
            </p>
          </div>

        </div>
        {/* CONTENIDO */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto grid grid-cols-12 gap-6 p-6">

            {/* PREGUNTAS */}
            <div
              id="contenedor-preguntas"
              className="col-span-9 overflow-y-auto space-y-6 pr-2"
            >

              {examenActivo.preguntas.map((p, index) => (
                <div
                  key={p.id}
                  id={`pregunta-${index}`}
                  className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border ${
                    preguntaActiva === index
                      ? "border-indigo-500 ring-2 ring-indigo-200"
                      : "border-gray-200"
                  }`}
                >
                  <p className="font-semibold text-lg mb-4 text-gray-800 leading-relaxed">
                    {index + 1}. {p.enunciado}
                  </p>

                  <div className="space-y-3">
                    {p.opciones.map((op, i) => {
                      const seleccionada = respuestasExamen[p.id] == op.id

                      return (
                        <label
                          key={op.id}
                          className={`flex items-center gap-4 border rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200 group
                          ${
                            seleccionada
                              ? "bg-indigo-50 border-indigo-400 shadow-sm"
                              : "bg-white border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                          }`}
                        >
                          {/* CÍRCULO TIPO RADIO BONITO */}
                          <div
                            className={`w-5 h-5 flex items-center justify-center rounded-full border-2 transition
                            ${
                              seleccionada
                                ? "border-indigo-500 bg-indigo-500"
                                : "border-gray-300 group-hover:border-indigo-400"
                            }`}
                          >
                            {seleccionada && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>

                          {/* TEXTO */}
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {op.texto}
                            </p>
                          </div>

                          {/* LETRA A, B, C... */}
                          <div className="text-xs font-bold text-gray-400">
                            {String.fromCharCode(65 + i)}
                          </div>

                          <input
                            type="radio"
                            name={`p-${p.id}`}
                            checked={seleccionada}
                            onChange={() => seleccionarRespuestaExamen(p.id, op.id)}
                            className="hidden"
                          />
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}

              <button
                onClick={confirmarEnvio}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold shadow-lg transition"
              >
                🚀 Terminar intento
              </button>

            </div>

            {/* SIDEBAR PREMIUM */}
            <div className="col-span-3">
              <div className="bg-white rounded-2xl shadow p-5 border h-fit">

                <h3 className="font-semibold mb-3">
                  Navegación
                </h3>

                <div className="grid grid-cols-5 gap-2 mb-4">
                  {examenActivo.preguntas.map((p, index) => {
                    const respondida = respuestasExamen[p.id]

                    return (
                      <button
                        key={index}
                        onClick={() => irAPregunta(index)}
                        className={`h-10 rounded-lg text-sm font-bold transition-all
                          ${preguntaActiva === index ? "ring-2 ring-indigo-500 scale-105" : ""}
                          ${
                            respondida
                              ? "bg-green-500 text-white"
                              : "bg-red-100 text-red-600"
                          }
                        `}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={confirmarEnvio}
                  className="w-full text-red-600 font-semibold hover:underline"
                >
                  Terminar intento...
                </button>

              </div>
            </div>

          </div>
        </div>

      </div>
    )
  }
  /* ========================= */
  /* VISTA CURSO */
  /* ========================= */
  return (
    <div className="w-full px-10 py-8">

      {/* HEADER */}
      <div className="bg-indigo-600 text-white p-6 rounded-lg mb-8">
        <h1 className="text-2xl font-bold">{curso.nombrecurso}</h1>
        <p>{curso.descripcion}</p>
      </div>

      <div className="grid grid-cols-4 gap-8">

        {/* CONTENIDO */}
        <div className="col-span-3 space-y-4">

          {modulos.map((modulo) => (
            <div key={modulo.id} className="border rounded-xl bg-white shadow">

              {/* HEADER MODULO */}
              <button
                onClick={() =>
                  setModuloAbierta(moduloAbierta === modulo.id ? null : modulo.id)
                }
                className="w-full flex justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-t-xl"
              >
                <span className="font-semibold text-lg">
                  📦 {modulo.titulo}
                </span>
                <span>{moduloAbierta === modulo.id ? "▲" : "▼"}</span>
              </button>

              {/* CONTENIDO */}
              {moduloAbierta === modulo.id && (
                <div className="p-5 space-y-6">

                  {modulo.lecciones?.map((leccion) => (
                    <div key={leccion.id} className="bg-gray-50 p-4 rounded-xl border">

                      <h4 className="font-semibold text-md mb-3">
                        📘 {leccion.titulo}
                      </h4>

                      {/* VIDEOS */}
                      {leccion.materiales?.map((m) =>
                        m.tipo === "video" ? (
                          <iframe
                            key={m.id}
                            src={m.embed_url || `https://player.vimeo.com/video/${m.vimeo_video_id}`}
                            className="w-full rounded mb-4"
                            height="350"
                          />
                        ) : null
                      )}

                      {/* ARCHIVOS */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        {leccion.materiales?.map((m) =>
                          m.tipo === "archivo" ? (
                            <a
                              key={m.id}
                              href={m.archivo_url}
                              target="_blank"
                              className="bg-white border px-3 py-2 rounded hover:bg-gray-100"
                            >
                              📄 {m.titulo}
                            </a>
                          ) : null
                        )}
                      </div>

                      {/* EXÁMENES */}
                      {leccion.examenes?.length > 0 && (
                        <div className="space-y-3">
                          {leccion.examenes.map((ex) => {
                            const usados = intentos[ex.id] || 0
                            const bloqueado = usados >= ex.intentos_permitidos

                            return (
                              <div key={ex.id} className="border p-4 rounded-lg bg-white shadow-sm">

                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-semibold">🧪 {ex.titulo}</p>
                                    <p className="text-sm text-gray-500">
                                      ⏱ {ex.duracion_minutos} min
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Intentos: {usados}/{ex.intentos_permitidos}
                                    </p>
                                  </div>

                                  <button
                                    onClick={() => iniciarExamen(ex)}
                                    disabled={bloqueado}
                                    className={`px-4 py-2 rounded ${
                                      bloqueado
                                        ? "bg-gray-400"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                    }`}
                                  >
                                    {bloqueado ? "Bloqueado" : "Rendir"}
                                  </button>
                                </div>

                              </div>
                            )
                          })}
                        </div>
                      )}

                    </div>
                  ))}

                </div>
              )}
            </div>
          ))}

        </div>

        {/* SIDEBAR */}
        <div className="col-span-1">
          <div className="bg-white border rounded-lg p-5 shadow">
            <h3 className="font-semibold mb-3">Progreso</h3>

            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${progreso}%` }}
              />
            </div>

            <p className="text-sm mt-2">{progreso}% completado</p>
          </div>
        </div>

      </div>
    </div>
  )
}