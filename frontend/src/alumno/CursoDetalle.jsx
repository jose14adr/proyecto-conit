import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../api";

export default function CursoDetalle() {
  const { id } = useParams()

  const [curso, setCurso] = useState(null)
  const [tareas, setTareas] = useState([])
  const [unidadAbierta, setUnidadAbierta] = useState(null)
  const [progreso, setProgreso] = useState(0)

  const [tareaAbierta, setTareaAbierta] = useState(null)
  const [tareasAbiertas, setTareasAbiertas] = useState({})
  const [respuestas, setRespuestas] = useState({})

  const [examenes, setExamenes] = useState([])
  const [examenesAbiertos, setExamenesAbiertos] = useState({})
  const [examenAbierto, setExamenAbierto] = useState(null)
  const [respuestasExamen, setRespuestasExamen] = useState({})
  const [resultadoExamen, setResultadoExamen] = useState({})
  const [enviandoExamen, setEnviandoExamen] = useState(false)

  /* ========================= */
  /* CARGAR CURSO */
  /* ========================= */
  useEffect(() => {
    async function cargarCurso() {
      try {
        const res = await api.get(`/curso/${id}`)
        console.log(res.data); // Esto es importante para ver qué datos estamos recibiendo
        setCurso(res.data)
      } catch (err) {
        console.log("Error cargando curso", err)
      }
    }
    cargarCurso()
  }, [id])

  /* ========================= */
  /* CARGAR TAREAS */
  /* ========================= */
  useEffect(() => {
    async function cargarTareas() {
      try {
        const res = await api.get(`/tarea/${id}`)
        setTareas(res.data || [])
      } catch (err) {
        console.log("Error cargando tareas", err)
      }
    }
    cargarTareas()
  }, [id])

  /* ========================= */
  /* CARGAR EXÁMENES */
  /* ========================= */
  useEffect(() => {
  async function cargarExamenes() {
    try {
      const res = await api.get(`/examen/curso/${id}`);
      console.log('Exámenes cargados:', res.data);

      if (Array.isArray(res.data)) {
        console.log("¡Es un array!");
        setExamenes(res.data);
      } else {
        console.log("No es un array");
        setExamenes([]); // Si no es un array, vacía el estado
      }
    } catch (err) {
      console.log("Error cargando exámenes", err);
      setExamenes([]);
    }
  }
  cargarExamenes();
}, [id]);

  /* ========================= */
  /* PROGRESO */
  /* ========================= */
  useEffect(() => {
    if (!curso) return

    let total = 0
    let vistos = 0

    const unidades = curso?.temario?.unidades || []

    unidades.forEach((u) => {
      if (u.sesion) total++
    })

    if (total > 0) {
      setProgreso(Math.round((vistos / total) * 100))
    }
  }, [curso])

  const toggleExamen = (examenId) => {
    setExamenAbierto(examenAbierto === examenId ? null : examenId)
  }

  const seleccionarRespuestaExamen = (preguntaId, opcionId) => {
    setRespuestasExamen((prev) => ({
      ...prev,
      [preguntaId]: opcionId,
    }));
  };

  const enviarExamen = async () => {
    const respuestas = {};

    // Recopilar las respuestas seleccionadas
    examenes.forEach((ex) => {
      ex.preguntas.forEach((pregunta) => {
        const respuestaSeleccionada = respuestasExamen[pregunta.id];
        if (respuestaSeleccionada) {
          respuestas[pregunta.id] = respuestaSeleccionada;
        }
      });
    });

    try {
      const res = await api.post(`/examen/${examenAbierto}/responder`, {
        respuestas: respuestas,  // Enviar las respuestas correctamente
      });
      alert(`Examen enviado correctamente. Tu nota es: ${res.data.nota}`);
    } catch (err) {
      console.error("Error al enviar examen:", err);
      alert('Hubo un error al enviar el examen.');
    }
  };

  

  

  if (!curso) {
    return <div className="p-10">Cargando curso...</div>
  }

  const unidades = curso?.temario?.unidades || []

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
          {unidades.map((unidad) => (
            <div key={unidad.id} className="border rounded-lg bg-white shadow">
              <button
                onClick={() =>
                  setUnidadAbierta(unidadAbierta === unidad.id ? null : unidad.id)
                }
                className="w-full flex justify-between p-4 bg-gray-100 hover:bg-gray-200"
              >
                <span className="font-semibold">📚 {unidad.nombreunidad}</span>
                <span>{unidadAbierta === unidad.id ? "▲" : "▼"}</span>
              </button>

              {unidadAbierta === unidad.id && (
                <div className="p-4 space-y-6">
                  <p className="text-gray-600">{unidad.descripcion}</p>

                  <div className="border p-4 rounded bg-gray-50 space-y-4">
                    <p className="font-semibold">🎬 {unidad.sesion?.nombresesion}</p>

                    {/* 🎬 VIDEO DESDE MÓDULOS */}
                    {curso.modulos?.map((modulo) =>
                      modulo.lecciones?.map((leccion) =>
                        leccion.materiales?.map((m) => {
                          if (m.tipo === "video") {
                            const url =
                              m.embed_url ||
                              (m.vimeo_video_id
                                ? `https://player.vimeo.com/video/${m.vimeo_video_id}`
                                : null)

                            if (!url) return null

                            return (
                              <iframe
                                key={m.id}
                                src={url}
                                className="w-full rounded"
                                height="400"
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                title={m.titulo || "Video"}
                              />
                            )
                          }

                          return null
                        })
                      )
                    )}

                    {/* 📂 DOCUMENTOS */}
                    <div>
                      <h4 className="font-semibold mb-3">📂 Material del docente</h4>

                      <div className="flex gap-4 flex-wrap">
                        {curso.modulos?.map((modulo) =>
                          modulo.lecciones?.map((leccion) =>
                            leccion.materiales?.map((m) => {
                              if (m.tipo === "archivo") {
                                return (
                                  <a
                                    key={m.id}
                                    href={m.archivo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="border p-3 rounded bg-white hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    📄 {m.titulo}
                                  </a>
                                )
                              }

                              return null
                            })
                          )
                        )}
                      </div>
                    </div>

                    {/* ================= TAREAS ================= */}
                    <div>
                      <div className="border rounded-xl overflow-hidden">
                        <button
                          onClick={() =>
                            setTareasAbiertas((prev) => ({
                              ...prev,
                              [unidad.id]: !prev[unidad.id],
                            }))
                          }
                          className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200"
                        >
                          <span className="font-semibold">📝 Tareas de esta unidad</span>
                          <span>{tareasAbiertas[unidad.id] ? "▲" : "▼"}</span>
                        </button>

                        <div className={`${tareasAbiertas[unidad.id] ? "block" : "hidden"}`}>
                          <div className="p-4 space-y-3 bg-white">
                            {tareas.length === 0 && (
                              <p className="text-sm text-gray-500">No hay tareas</p>
                            )}

                            {tareas.map((t) => (
                              <div key={t.id} className="border rounded-lg mb-3 bg-white shadow">
                                <button
                                  onClick={() =>
                                    setTareaAbierta(tareaAbierta === t.id ? null : t.id)
                                  }
                                  className="w-full flex justify-between items-center p-3 bg-gray-100"
                                >
                                  <div className="text-left">
                                    <p className="font-medium">📝 {t.titulo}</p>
                                    <p className="text-xs text-gray-500">
                                      Fecha límite: {t.fecha_limite}
                                    </p>
                                  </div>
                                  <span>{tareaAbierta === t.id ? "▲" : "▼"}</span>
                                </button>

                                {tareaAbierta === t.id && (
                                  <div className="p-4 space-y-3 border-t">
                                    <p className="text-sm text-gray-600">{t.descripcion}</p>

                                    {/* 🔥 MATERIAL DE APOYO */}
                                    {(t.texto_apoyo ||
                                      t.archivo_apoyo_url ||
                                      t.video_apoyo_url) && (
                                      <div className="border rounded-xl p-4 bg-yellow-50">
                                        <h4 className="font-semibold mb-2">
                                          📌 Material de apoyo
                                        </h4>

                                        {t.texto_apoyo && (
                                          <p className="text-sm whitespace-pre-line">
                                            {t.texto_apoyo}
                                          </p>
                                        )}

                                        {t.archivo_apoyo_url && (
                                          <a
                                            href={t.archivo_apoyo_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block mt-2 text-blue-600 underline text-sm"
                                          >
                                            📄 Descargar archivo
                                          </a>
                                        )}

                                        {t.video_apoyo_url && (
                                          <video controls className="w-full mt-3 rounded">
                                            <source src={t.video_apoyo_url} />
                                          </video>
                                        )}
                                      </div>
                                    )}

                                    {/* TEXTO */}
                                    {t.tipo_entrega === "texto" && (
                                      <textarea
                                        className="w-full border rounded p-2"
                                        rows={4}
                                        value={respuestas[t.id] || ""}
                                        onChange={(e) =>
                                          setRespuestas((prev) => ({
                                            ...prev,
                                            [t.id]: e.target.value,
                                          }))
                                        }
                                      />
                                    )}

                                    {/* ARCHIVO */}
                                    {t.tipo_entrega === "archivo" && (
                                      <input
                                        type="file"
                                        onChange={(e) =>
                                          setRespuestas((prev) => ({
                                            ...prev,
                                            [t.id]: e.target.files[0],
                                          }))
                                        }
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ================= EXÁMENES ================= */}
                    <div>
                      <div className="border rounded-xl overflow-hidden mt-4">
                        <button
                          onClick={() =>
                            setExamenesAbiertos((prev) => ({
                              ...prev,
                              [unidad.id]: !prev[unidad.id],
                            }))
                          }
                          className="w-full flex justify-between items-center p-4 bg-indigo-100 hover:bg-indigo-200"
                        >
                          <span className="font-semibold">🧪 Exámenes de esta unidad</span>
                          <span>{examenesAbiertos[unidad.id] ? "▲" : "▼"}</span>
                        </button>

                        <div className={`${examenesAbiertos[unidad.id] ? "block" : "hidden"}`}>
                          <div className="p-4 space-y-4 bg-white">
                            {examenes.length === 0 && (
                              <p className="text-sm text-gray-500">
                                No hay exámenes disponibles
                              </p>
                            )}

                            {examenes.map((ex) => (
                              <div key={ex.id} className="border rounded-lg shadow">
                                <button
                                  onClick={() => toggleExamen(ex.id)}
                                  className="w-full flex justify-between items-center p-3 bg-indigo-50"
                                >
                                  <div className="text-left">
                                    <p className="font-medium">🧪 {ex.titulo}</p>
                                    <p className="text-xs text-gray-500">
                                      Duración: {ex.duracion_minutos || 30} min
                                    </p>
                                  </div>
                                  <span>{examenAbierto === ex.id ? "▲" : "▼"}</span>
                                </button>

                                {examenAbierto === ex.id && (
  <div className="p-4 space-y-4">
    {ex.preguntas && ex.preguntas.length > 0 ? (
      ex.preguntas.map((p, index) => (
        <div key={p.id} className="border rounded p-3 bg-gray-50">
          <p className="font-semibold mb-2">
            {index + 1}. {p.enunciado}
          </p>

          <div className="space-y-2">
            {p.opciones?.map((op) => (
              <label key={op.id} className="flex gap-2 items-center">
                <input
                  type="radio"
                  name={`pregunta-${p.id}`}
                  value={op.id}
                  checked={Number(respuestasExamen[p.id]) === Number(op.id)}
                  onChange={() => seleccionarRespuestaExamen(p.id, op.id)}
                />
                {op.texto}  {/* Muestra el texto de la opción */}
              </label>
            ))}
          </div>
        </div>
      ))
    ) : (
      <p>No hay preguntas disponibles para este examen.</p>
    )}
    <button
      onClick={enviarExamen}
      className="w-full p-3 bg-green-500 text-white font-semibold rounded-md"
    >
      Enviar examen
    </button>
  </div>
  
)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SIDEBAR */}
        <div className="col-span-1">
          <div className="bg-white border rounded-lg p-5 shadow">
            <h3 className="font-semibold mb-3">Progreso del curso</h3>

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