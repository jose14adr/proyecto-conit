import { useParams } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import api from "../api";
import confetti from "canvas-confetti"

export default function CursoDetalle() {
  const { id } = useParams()

  const [curso, setCurso] = useState(null)
  const [moduloAbierta, setModuloAbierta] = useState(null)
  const [progreso, setProgreso] = useState(0)

  const [respuestasExamen, setRespuestasExamen] = useState({})
  const [examenActivo, setExamenActivo] = useState(null)
  const [tiempoRestante, setTiempoRestante] = useState(0)
  const [resultados, setResultados] = useState({});

  const [intentos, setIntentos] = useState({})
  const [preguntaActiva, setPreguntaActiva] = useState(0)
  const [intentoId, setIntentoId] = useState(null)

  const [loading, setLoading] = useState(false)

  const sonidoClickRef = useRef(null)
  const [loadingExamenId, setLoadingExamenId] = useState(null)

  const [modoRevision, setModoRevision] = useState(false)
const [resultadoDetalle, setResultadoDetalle] = useState(null)

useEffect(() => {
  sonidoClickRef.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3")
}, [])

//confetti
const lanzarConfeti = () => {
  const duration = 1500
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    })

    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}


const getFileStyle = (fileName = "") => {
  const ext = fileName.split(".").pop().toLowerCase();

  switch (ext) {
    case "pdf":
      return {
        icon: "📕",
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-200"
      };
    case "doc":
    case "docx":
      return {
        icon: "📘",
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200"
      };
    case "xls":
    case "xlsx":
      return {
        icon: "📗",
        bg: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200"
      };
    default:
      return {
        icon: "📄",
        bg: "bg-gray-50",
        text: "text-gray-600",
        border: "border-gray-200"
      };
  }
};
  

  /* ========================= */
  /* CARGAR CURSO */
  /* ========================= */
  useEffect(() => {
    async function cargarCurso() {
      try {
        const idalumno = Number(localStorage.getItem("idalumno"));

        if (!idalumno) {
          console.error("ID alumno inválido");
          return;
        }

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

useEffect(() => {
  if (!curso) return;

  async function cargarIntentos() {
    try {
      const idalumno = Number(localStorage.getItem("idalumno"));

      if (!idalumno) {
        console.error("ID alumno inválido");
        return;
      }

      const res = await api.get(`/examen/intentos/${idalumno}`);

      const mapa = {};

      res.data.forEach((i) => {
        mapa[i.idexamen] = (mapa[i.idexamen] || 0) + 1;
      });

      setIntentos(mapa);

    } catch (err) {
      console.log("Error cargando intentos", err);
    }
  }

  cargarIntentos();
}, [curso]);

/* ========================= */
  /* CARGAR RESULTADOS */
  /* ========================= */


  useEffect(() => {
  if (!curso) return; // 🔥 clave

  async function cargarResultados() {
    try {
      const idalumno = Number(localStorage.getItem("idalumno"));

      if (!idalumno) {
        console.error("ID alumno inválido");
        return;
      }

      const res = await api.get(`/examen/intentos/${idalumno}`);

      const mapa = {};

      res.data.forEach((intento) => {
        if (
          !mapa[intento.idexamen] ||
          intento.id > mapa[intento.idexamen].id
        ) {
          mapa[intento.idexamen] = {
            id: intento.id,
            nota: intento.nota
          };
        }
      });

      const limpio = {};
      Object.keys(mapa).forEach(k => {
        limpio[k] = mapa[k].nota;
      });

      setResultados(limpio);

    } catch (err) {
      console.log("Error cargando resultados", err);
    }
  }

  cargarResultados();
}, [curso]); // 👈 importante


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
const iniciarExamen = async (ex) => {
  if (loadingExamenId === ex.id) return;

  setLoadingExamenId(ex.id);

  try {
    const idalumno = Number(localStorage.getItem("idalumno"));

    // 🔹 crear intento
    const intento = await api.post(`/examen/${ex.id}/iniciar`, {
      idAlumno: idalumno,
    });

    setIntentoId(intento.data.id);

    // 🔥 TRAER EXAMEN COMPLETO
    const resExamen = await api.get(`/examen/${ex.id}`);

    setExamenActivo(resExamen.data);
    setTiempoRestante((ex.duracion_minutos || 30) * 60);

  } catch (err) {
    console.error(err);
    alert("❌ Error iniciando examen");
  }

  setLoadingExamenId(null);
};

  /* ========================= */
  /* RESPUESTAS */
  /* ========================= */
  const seleccionarRespuestaExamen = (preguntaId, opcionId) => {
    if (sonidoClickRef.current) {
      sonidoClickRef.current.currentTime = 0
      sonidoClickRef.current.play().catch(() => {})
    }

    setRespuestasExamen((prev) => ({
      ...prev,
      [preguntaId]: opcionId,
    }))
  }
  

  /* ========================= */
  /* ENVIAR EXAMEN */
  /* ========================= */
  const enviarExamen = async (examen) => {
    const idalumno = Number(localStorage.getItem("idalumno"));

      if (!idalumno) {
        console.error("ID alumno inválido");
        return;
      }

     const respuestas = {}

    examen.preguntas.forEach((p) => {
      if (respuestasExamen[p.id]) {
        respuestas[p.id] = respuestasExamen[p.id]
      }
    })

    try {
      const res = await api.post(`/examen/responder`, {
        intentoId: intentoId,
        respuestas,
      })

      lanzarConfeti()

      // 🔥 GUARDAMOS DATA PARA MOSTRAR RESULTADO
      setResultadoDetalle({
        nota: res.data.nota,
        preguntas: examen.preguntas,
        respuestasUsuario: respuestasExamen
      })

      setResultados((prev) => ({
        ...prev,
        [examen.id]: res.data.nota,
      }))

      // 🔥 CAMBIO A MODO REVISIÓN
      setModoRevision(true)
      setExamenActivo(null)

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
        <div className="bg-white/80 backdrop-blur shadow-sm px-8 py-4 flex items-center justify-between border-b">

          {/* IZQUIERDA */}
          <div className="flex items-center gap-6">
            
            <button
              onClick={() => setExamenActivo(null)}
              className="text-sm text-gray-500 hover:text-indigo-600 font-medium transition"
            >
              ← Volver
            </button>

            <div className="h-6 w-px bg-gray-300"></div>

            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              {examenActivo.titulo}
            </h2>

          </div>

  {/* PROGRESO */}
  <div className="flex flex-col items-center w-1/3">
    <p className="text-xs text-gray-400 mb-1">
      {respondidas} de {total} preguntas
    </p>

    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700"
        style={{ width: `${progreso}%` }}
      />
    </div>
  </div>

  {/* TIMER DINÁMICO */}
  <div className="text-right">
    <p className="text-xs text-gray-400">Tiempo restante</p>
    <p
      className={`text-2xl font-bold tracking-widest transition ${
        tiempoRestante < 60
          ? "text-red-500 animate-pulse"
          : tiempoRestante < 300
          ? "text-yellow-500"
          : "text-indigo-600"
      }`}
    >
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
                  className={`bg-white/90 backdrop-blur p-6 rounded-2xl border transition-all duration-300
                    hover:shadow-lg hover:-translate-y-1
                    ${
                      preguntaActiva === index
                        ? "border-indigo-500 ring-2 ring-indigo-200 shadow-md scale-[1.01]"
                        : "border-gray-200"
                    }`}
                >
                  <p className="font-semibold text-lg mb-4 text-gray-800 leading-relaxed">
                    {index + 1}. {p.enunciado}
                  </p>

                  <div className="space-y-3">

                    {/* 🔥 OPCIÓN ÚNICA */}
                    {p.tipo_pregunta === "unica" && p.opciones?.map((op, i) => {
                      const seleccionada = respuestasExamen[p.id] == op.id

                      return (
                        <label
                          key={op.id}
                          className={`flex items-center gap-4 border rounded-2xl px-4 py-3 cursor-pointer
                          ${seleccionada ? "bg-indigo-50 border-indigo-400" : "bg-white border-gray-200"}`}
                        >
                          <input
                            type="radio"
                            name={`p-${p.id}`}
                            checked={seleccionada}
                            onChange={() =>
                              setRespuestasExamen(prev => ({
                                ...prev,
                                [p.id]: op.id
                              }))
                            }
                          />
                          <span>{op.texto}</span>
                        </label>
                      )
                    })}

                    {/* 🔥 OPCIÓN MÚLTIPLE */}
                    {p.tipo_pregunta === "multiple" && p.opciones?.map((op) => {
                      const seleccionadas = respuestasExamen[p.id] || []

                      return (
                        <label key={op.id} className="flex gap-3">
                          <input
                            type="checkbox"
                            checked={seleccionadas.includes(op.id)}
                            onChange={(e) => {
                              let nuevas = [...seleccionadas]

                              if (e.target.checked) {
                                nuevas.push(op.id)
                              } else {
                                nuevas = nuevas.filter(id => id !== op.id)
                              }

                              setRespuestasExamen(prev => ({
                                ...prev,
                                [p.id]: nuevas
                              }))
                            }}
                          />
                          <span>{op.texto}</span>
                        </label>
                      )
                    })}

                    {/* 🔥 TEXTO CORTO */}
                    {p.tipo_pregunta === "texto_corto" && (
                      <input
                        type="text"
                        placeholder={p.texto_placeholder || "Escribe tu respuesta"}
                        className="w-full border rounded p-2"
                        value={respuestasExamen[p.id] || ""}
                        onChange={(e) =>
                          setRespuestasExamen(prev => ({
                            ...prev,
                            [p.id]: e.target.value
                          }))
                        }
                      />
                    )}

                    {/* 🔥 TEXTO LARGO */}
                    {p.tipo_pregunta === "texto_largo" && (
                      <textarea
                        placeholder={p.texto_placeholder || "Escribe tu respuesta"}
                        className="w-full border rounded p-2"
                        rows={4}
                        value={respuestasExamen[p.id] || ""}
                        onChange={(e) =>
                          setRespuestasExamen(prev => ({
                            ...prev,
                            [p.id]: e.target.value
                          }))
                        }
                      />
                    )}

                    {/* 🔥 NUMÉRICA */}
                    {p.tipo_pregunta === "numerica" && (
                      <input
                        type="number"
                        className="w-full border rounded p-2"
                        placeholder={p.texto_placeholder || "Ingresa un número"}
                        value={respuestasExamen[p.id] || ""}
                        onChange={(e) =>
                          setRespuestasExamen(prev => ({
                            ...prev,
                            [p.id]: e.target.value
                          }))
                        }
                      />
                    )}

                    {/* 🔥 ARCHIVO */}
                    {p.tipo_pregunta === "archivo" && (
                      <input
                        type="file"
                        className="w-full"
                        onChange={(e) =>
                          setRespuestasExamen(prev => ({
                            ...prev,
                            [p.id]: e.target.files[0]
                          }))
                        }
                      />
                    )}

                  </div>
                </div>
              ))}

              <button
                onClick={confirmarEnvio}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02]"
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
                        className={`h-10 rounded-lg text-sm font-bold transition-all duration-200
                          ${preguntaActiva === index ? "ring-2 ring-indigo-500 scale-110 shadow" : ""}
                          ${
                            respondida
                              ? "bg-green-500 text-white hover:scale-105"
                              : "bg-red-100 text-red-600 hover:bg-red-200"
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
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  🚀 Terminar intento
                </button>

              </div>
            </div>

          </div>
        </div>

      </div>
    )
  }

  /* ========================= */
  /* VISTA REVISIÓN EXAMEN */
  /* ========================= */
  if (modoRevision && resultadoDetalle) {
    const total = resultadoDetalle.preguntas.length
    const correctas = resultadoDetalle.preguntas.filter(p => {
      const r = resultadoDetalle.respuestasUsuario[p.id]
      return p.opciones.find(o => o.id === r)?.es_correcta
    }).length

    const porcentaje = Math.round((correctas / total) * 100)
    const aprobado = resultadoDetalle.nota >= 11 // 🔥 ajusta si tu escala es distinta

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">

        {/* HEADER FULL */}
        <div className="w-full bg-white shadow px-10 py-5 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold">
            📊 Resultado del examen
          </h2>

          <button
            onClick={() => {
              setModoRevision(false)
              setExamenActivo(null)
              setRespuestasExamen({})
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
          >
            Volver al curso
          </button>
        </div>

        {/* RESUMEN TOP */}
        <div className="w-full px-10 py-8">

          <div className="bg-white rounded-2xl shadow p-8 w-full">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              {/* NOTA */}
              <div>
                <p className="text-sm text-gray-400">Tu nota</p>
                <p className="text-5xl font-extrabold text-indigo-600">
                  {resultadoDetalle.nota}
                </p>
              </div>

              {/* ESTADO */}
              <div>
                <p className="text-sm text-gray-400">Estado</p>
                <p className={`text-2xl font-bold ${aprobado ? "text-green-600" : "text-red-500"}`}>
                  {aprobado ? "✅ APROBADO" : "❌ DESAPROBADO"}
                </p>
              </div>

              {/* PORCENTAJE */}
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">
                  {correctas} de {total} correctas
                </p>

                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-4 transition-all duration-700 ${
                      aprobado ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* PREGUNTAS FULL WIDTH */}
        <div className="flex-1 w-full px-10 pb-10">

          <div className="w-full space-y-6">

            {resultadoDetalle.preguntas.map((p, index) => {
              const respuestaUsuario = resultadoDetalle.respuestasUsuario[p.id]

              return (
                <div key={p.id} className="bg-white p-6 rounded-2xl shadow border w-full">

                  <p className="font-semibold text-lg mb-4">
                    {index + 1}. {p.enunciado}
                  </p>


                    <div className="space-y-3">

                      {/* 🔥 DEBUG */}
                      <p className="text-xs text-red-500">
                        tipo_pregunta: {String(p.tipo_pregunta)}
                      </p>

                      {/* 🔥 ALTERNATIVAS (SI EXISTEN) */}
                      {(p.opciones || []).map((op, i) => {
                        const seleccionada = respuestasExamen[p.id] == op.id

                        return (
                          <label
                            key={op.id}
                            className={`flex items-center gap-4 border rounded-xl px-4 py-3 cursor-pointer
                            ${
                              seleccionada
                                ? "bg-indigo-50 border-indigo-400"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`p-${p.id}`}
                              checked={seleccionada}
                              onChange={() =>
                                setRespuestasExamen((prev) => ({
                                  ...prev,
                                  [p.id]: op.id,
                                }))
                              }
                            />
                            <span>{op.texto}</span>
                          </label>
                        )
                      })}

                      {/* 🔥 INPUT TEXTO (SI ES PREGUNTA ABIERTA) */}
                      {p.tipo_pregunta === "texto" && (
                        <textarea
                          className="w-full border rounded-xl p-3 mt-3"
                          placeholder="Escribe tu respuesta..."
                          value={respuestasExamen[p.id] || ""}
                          onChange={(e) =>
                            setRespuestasExamen((prev) => ({
                              ...prev,
                              [p.id]: e.target.value,
                            }))
                          }
                        />
                      )}

                    </div>

                </div>
              )
            })}

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

          {modulos
            .filter((modulo) => !modulo.idpadre) // 👈 SOLO PADRES
            .map((modulo) => (
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

              {/* CONTENIDO MODULO */}
              {moduloAbierta === modulo.id && (
                <div className="p-5 space-y-6">

                  {/* 🔥 LECCIONES DEL MODULO PADRE */}
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
                        {leccion.materiales?.map((m) => {
                          if (m.tipo !== "archivo") return null;

                          const style = getFileStyle(m.nombre_archivo || m.titulo);

                          return (
                            <a
                              key={m.id}
                              href={m.archivo_url}
                              target="_blank"
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${style.bg} ${style.border}`}
                            >
                              <span>{style.icon}</span>
                              <span>{m.titulo || m.nombre_archivo}</span>
                            </a>
                          );
                        })}
                      </div>

                      {/* EXÁMENES */}
                      {leccion.examenes?.map((ex) => {
                        const usados = intentos[ex.id] || 0;
                        const bloqueado = usados >= ex.intentos_permitidos;
                        const nota = resultados[ex.id];

                        return (
                          <div key={ex.id} className="border p-4 rounded-xl bg-white shadow mb-3">
                            <div className="flex justify-between items-center">

                              <div>
                                <p className="font-semibold">🧪 {ex.titulo}</p>
                                <p className="text-sm text-gray-500">
                                  ⏱ {ex.duracion_minutos} min
                                </p>

                                {nota !== undefined && (
                                  <p className="text-green-600 font-bold">
                                    🎯 Nota: {nota}
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() => iniciarExamen(ex)}
                                disabled={bloqueado || nota !== undefined}
                                className={`px-4 py-2 rounded ${
                                  nota
                                    ? "bg-green-500 text-white"
                                    : bloqueado
                                    ? "bg-gray-400 text-white"
                                    : "bg-indigo-600 text-white"
                                }`}
                              >
                                {nota
                                  ? "Realizado"
                                  : bloqueado
                                  ? "Bloqueado"
                                  : "Rendir"}
                              </button>

                            </div>
                          </div>
                        );
                      })}

                    </div>
                  ))}

                  {/* 🔥 SUBMODULOS */}
                  {modulo.hijos?.map((sub) => (
    <div key={sub.id} className="border-l-4 border-indigo-400 pl-4 ml-4">

      <h3 className="font-bold text-indigo-600 mb-3">
        📂 {sub.titulo}
      </h3>

      {sub.lecciones?.map((leccion) => (
        <div key={leccion.id} className="bg-gray-50 p-4 rounded-xl border mb-4">

          <h4 className="font-semibold mb-3">
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
            {leccion.materiales?.map((m) => {
              if (m.tipo !== "archivo") return null;

              const style = getFileStyle(m.nombre_archivo || m.titulo);

              return (
                <a
                  key={m.id}
                  href={m.archivo_url}
                  target="_blank"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${style.bg} ${style.border}`}
                >
                  <span>{style.icon}</span>
                  <span>{m.titulo || m.nombre_archivo}</span>
                </a>
              );
            })}
          </div>

          {/* EXÁMENES */}
          {leccion.examenes?.map((ex) => {
            const usados = intentos[ex.id] || 0;
            const bloqueado = usados >= ex.intentos_permitidos;
            const nota = resultados[ex.id];

            return (
              <div key={ex.id} className="border p-4 rounded-xl bg-white shadow mb-3">
                <div className="flex justify-between items-center">

                  <div>
                    <p className="font-semibold">🧪 {ex.titulo}</p>
                    <p className="text-sm text-gray-500">
                      ⏱ {ex.duracion_minutos} min
                    </p>

                    {nota !== undefined && (
                      <p className="text-green-600 font-bold">
                        🎯 Nota: {nota}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => iniciarExamen(ex)}
                    disabled={bloqueado || nota !== undefined}
                    className={`px-4 py-2 rounded ${
                      nota
                        ? "bg-green-500 text-white"
                        : bloqueado
                        ? "bg-gray-400 text-white"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {nota
                      ? "Realizado"
                      : bloqueado
                      ? "Bloqueado"
                      : "Rendir"}
                  </button>

                </div>
              </div>
            );
          })}

        </div>
      ))}

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