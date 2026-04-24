import { useEffect, useState, useContext } from "react"
import { X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { usePagos } from "../context/PagosContext"
import { NotificacionesContext } from "../context/NotificacionesContext"
import api from "../api"

export default function Matricula() {
  const [cursos, setCursos] = useState([])
  const [selectedCurso, setSelectedCurso] = useState(null)
  const [grupoSeleccionado, setGrupoSeleccionado] = useState({})
  const [matriculados, setMatriculados] = useState([])
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("")

  const navigate = useNavigate()
  const { agregarPago } = usePagos()
  const { agregarNotificacion } = useContext(NotificacionesContext)

  // 🚀 CARGA INICIAL (cursos + matrículas reales)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const idAlumno = localStorage.getItem("idalumno")

        const cursosRes = await api.get("/curso")

        const matriculasRes = await api.get(`/curso/alumno/${idAlumno}`)

        const cursosMatriculados = matriculasRes.data.map(
          (m) => m.grupo.curso.id
        )

        setCursos(cursosRes.data)
        setMatriculados(cursosMatriculados)

      } catch (error) {
        console.error("Error inicial:", error.response?.data || error.message)
      }
    }

    fetchData()
  }, [])

  // 🎯 CONFIRMAR MATRÍCULA
  const confirmarMatricula = async () => {
    const grupoId = grupoSeleccionado[selectedCurso.id]

    if (!grupoId) {
      return alert("Debes seleccionar un grupo")
    }

    if (matriculados.includes(selectedCurso.id)) {
      return alert("Ya estás matriculado en este curso")
    }

    try {
      const idAlumno = localStorage.getItem("idalumno")

      await api.post("/matricula", {
        alumnoId: Number(idAlumno),
        grupoId: Number(grupoId),
      })

      // actualizar estado
      setMatriculados(prev => [...prev, selectedCurso.id])
      setSelectedCurso(null)

      setMensajeConfirmacion(
        `Te matriculaste correctamente en "${selectedCurso.nombrecurso}". Dirígete a "Mis Pagos".`
      )

      // 🔔 notificación
      agregarNotificacion?.({
        mensaje: "Te matriculaste en un curso",
        fecha: new Date()
      })

    } catch (error) {
      const msg = error.response?.data?.message

      if (msg === "Ya estás matriculado en este grupo") {
        setMensajeConfirmacion("Ya estás matriculado en este curso")
      } else {
        console.error(msg)
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-slate-800">
        Cursos Sugeridos
      </h1>

      {/* ✅ MENSAJE */}
      {mensajeConfirmacion && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          {mensajeConfirmacion}
        </div>
      )}

      {/* 📚 LISTA DE CURSOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cursos.map(curso => {
          const yaMatriculado = matriculados.includes(curso.id)

          return (
            <div
              key={curso.id}
              className="bg-white rounded-2xl shadow-lg border p-6 hover:shadow-xl transition"
            >
              <h2 className="text-lg font-bold text-slate-800">
                {curso.nombrecurso}
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                {curso.descripcion}
              </p>

              <p className="mt-4 text-indigo-600 font-semibold">
                Costo: S/.{curso.precio}.00
              </p>

              {/* 🎯 SELECT DE GRUPOS */}
              <select
                className="mt-3 w-full border rounded-lg p-2"
                onChange={(e) =>
                  setGrupoSeleccionado(prev => ({
                    ...prev,
                    [curso.id]: e.target.value
                  }))
                }
                value={grupoSeleccionado[curso.id] || ""}
                disabled={yaMatriculado}
              >
                <option value="">Seleccionar grupo</option>
                {curso.grupos?.map(grupo => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nombregrupo} - {grupo.cantidadpersonas} cupos
                  </option>
                ))}
              </select>

              {/* 🔘 BOTÓN */}
              <button
                disabled={yaMatriculado}
                onClick={() => setSelectedCurso(curso)}
                className={`mt-6 w-full py-2 rounded-lg text-sm transition ${
                  yaMatriculado
                    ? "bg-green-100 text-green-700 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {yaMatriculado ? "Ya inscrito" : "Matricularme"}
              </button>
            </div>
          )
        })}
      </div>

      {/* 🧾 MODAL */}
      {selectedCurso && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-96 relative">
            <button
              onClick={() => setSelectedCurso(null)}
              className="absolute top-4 right-4 text-gray-500"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold mb-4">
              Confirmar Matrícula
            </h2>

            <p className="text-gray-600 text-sm">
              Estás a punto de matricularte en:
            </p>

            <p className="mt-2 font-semibold text-slate-800">
              {selectedCurso.nombrecurso}
            </p>

            <p className="mt-2 text-indigo-600 font-bold">
              Costo: S/. {selectedCurso.precio}.00
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Grupo: {grupoSeleccionado[selectedCurso.id] || "No seleccionado"}
            </p>

            <button
              onClick={confirmarMatricula}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}