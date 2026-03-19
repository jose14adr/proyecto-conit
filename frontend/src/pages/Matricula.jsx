import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { usePagos } from "../context/PagosContext"
import axios from "axios"
import { useContext } from "react"
import { NotificacionesContext } from "../context/NotificacionesContext"

export default function Matricula() {
  const [cursos, setCursos] = useState([])
  const [selectedCurso, setSelectedCurso] = useState(null)
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null)
  const [matriculados, setMatriculados] = useState([])
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("") // <-- nuevo estado

  const navigate = useNavigate()
  const { agregarPago } = usePagos()

  const { agregarNotificacion } = useContext(NotificacionesContext)

  // Traer cursos desde backend
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await axios.get("http://localhost:3000/curso")
        setCursos(res.data)
      } catch (error) {
        console.error("Error al traer cursos:", error.response?.data || error.message)
      }
    }

    fetchCursos()
  }, [])

  const generarSerie = async (nombreCurso) => {
    const prefijo = nombreCurso.slice(0, 3) // primeras 3 letras
    const { data, error } = await supabase
      .from("serie")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)

    if (error) {
      console.error(error)
      return prefijo + "000001"
    }

    const ultimoId = data?.[0]?.id || 0
    const correlativo = String(ultimoId + 1).padStart(6, "0")
    return prefijo + correlativo
  }

  const confirmarMatricula = async () => {
    if (!grupoSeleccionado) return alert("Debes seleccionar un grupo")

    try {
      const idAlumno = localStorage.getItem("idalumno")
      const res = await axios.post("http://localhost:3000/matricula", {
        alumnoId: Number(idAlumno),
        grupoId: Number(grupoSeleccionado),
        nombreCurso: selectedCurso.nombrecurso
      })

      // Actualiza la UI
      setMatriculados(prev => [...prev, selectedCurso.id])
      setSelectedCurso(null)
      setGrupoSeleccionado(null)

      // Mostrar mensaje de confirmación
      setMensajeConfirmacion(
        `Te has matriculado correctamente en "${selectedCurso.nombrecurso}". Dirígete a "Mis Pagos" para realizar el pago.`
      )

      console.log("Matrícula creada", res.data)
    } catch (error) {
      console.error(error.response?.data || error.message)
    }
  }

  const registrarMatricula = async () => {

  await axios.post("http://localhost:3000/matricula", {
    alumnoId: usuario.id,
    grupoId: grupoSeleccionado
  })

  // obtener notificaciones actuales
  const notificaciones =
    JSON.parse(localStorage.getItem("notificaciones")) || []

  // agregar nueva notificación
  notificaciones.push({
    mensaje: "Te matriculaste en un curso",
    fecha: new Date()
  })

  localStorage.setItem("notificaciones", JSON.stringify(notificaciones))
}

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-slate-800">
        Cursos Sugeridos
      </h1>

      {/* Mostrar mensaje de confirmación */}
      {mensajeConfirmacion && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          {mensajeConfirmacion}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cursos.map(curso => {
          const yaMatriculado = matriculados.includes(curso.id)

          return (
            <div
              key={curso.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition"
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

              <select
                className="mt-3 w-full border rounded-lg p-2"
                onChange={(e) => setGrupoSeleccionado(e.target.value)}
                value={grupoSeleccionado || ""}
              >
                <option value="">Seleccionar grupo</option>
                {curso.grupos?.map(grupo => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nombregrupo} - {grupo.cantidadpersonas} cupos disponibles
                  </option>
                ))}
              </select>

              <button
                disabled={yaMatriculado}
                onClick={() => setSelectedCurso(curso)}
                className={`mt-6 w-full py-2 rounded-lg text-sm transition ${
                  yaMatriculado
                    ? "bg-green-100 text-green-700 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {yaMatriculado ? "Matriculado" : "Matricularme"}
              </button>
            </div>
          )
        })}
      </div>

      {/* MODAL */}
      {selectedCurso && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-96 relative">
            <button
              onClick={() => setSelectedCurso(null)}
              className="absolute top-4 right-4 text-gray-500"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold mb-4">Confirmar Matrícula</h2>

            <p className="text-gray-600 text-sm">
              Estás a punto de matricularte en:
            </p>

            <p className="mt-2 font-semibold text-slate-800">
              {selectedCurso.nombrecurso}
            </p>

            <p className="mt-2 text-indigo-600 font-bold">
              Costo: S/. {selectedCurso.precio}.00
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