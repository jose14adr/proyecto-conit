import { useState, useMemo } from "react"
import { ArrowUpDown, Upload, FileText, Trash2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"

export default function MisCertificados() {

  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null)

  const [sesiones, setSesiones] = useState([
    {
      id: 1,
      fecha: "2030-05-07",
      curso: "Análisis Matemático",
      horas: 20,
      credito: 2,
      archivo: null,
    },
  ])

  const [ordenAsc, setOrdenAsc] = useState(true)

  // Simular carga inicial
  setTimeout(() => {
    setLoading(false)
  }, 1000)

  // ===== ORDEN =====
  const ordenadas = useMemo(() => {
    return [...sesiones].sort((a, b) =>
      ordenAsc
        ? new Date(a.fecha) - new Date(b.fecha)
        : new Date(b.fecha) - new Date(a.fecha)
    )
  }, [sesiones, ordenAsc])

  // ===== UPLOAD =====
  const handleUpload = (e, id) => {
    const file = e.target.files[0]
    if (!file) return

    const url = URL.createObjectURL(file)

    setSesiones(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, archivo: { file, url } }
          : s
      )
    )

    toast.success("PDF cargado correctamente")
  }

  const eliminarArchivo = (id) => {
    setSesiones(prev =>
      prev.map(s =>
        s.id === id ? { ...s, archivo: null } : s
      )
    )

    toast("Archivo eliminado", { icon: "🗑️" })
  }

  return (
    <div className="h-full flex flex-col gap-8">

      <h1 className="text-2xl font-semibold text-gray-800">
        Mis certificados
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-5 px-6 py-4 text-sm font-medium text-gray-500 border-b bg-gray-50">
          <button
            onClick={() => setOrdenAsc(!ordenAsc)}
            className="flex items-center gap-2 hover:text-gray-800"
          >
            Fecha <ArrowUpDown size={16} />
          </button>
          <div>Curso</div>
          <div>Horas</div>
          <div>Créditos</div>
          <div>Archivo</div>
        </div>

        {/* BODY */}
        <div className="divide-y">

          {loading && <SkeletonRows />}

          {!loading && ordenadas.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-5 px-6 py-4 text-sm hover:bg-gray-50 transition"
            >
              <div>{formatearFecha(s.fecha)}</div>
              <div>{s.curso}</div>
              <div>{s.horas}</div>
              <div>{s.credito}</div>

              <div>
                {!s.archivo ? (
                  <label className="flex items-center gap-2 text-blue-600 cursor-pointer hover:underline">
                    <Upload size={16} />
                    Subir PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => handleUpload(e, s.id)}
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-3">

                    <button
                      onClick={() => setPreview(s.archivo.url)}
                      className="flex items-center gap-2 text-green-600 hover:underline"
                    >
                      <FileText size={16} />
                      Ver
                    </button>

                    <button
                      onClick={() => eliminarArchivo(s.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                )}
              </div>

            </motion.div>
          ))}

        </div>
      </div>

      {/* ===== MODAL PREVIEW ===== */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-[90%] h-[90%] shadow-xl relative"
            >
              <button
                onClick={() => setPreview(null)}
                className="absolute top-4 right-4 text-gray-600 hover:text-black"
              >
                <X />
              </button>

              <iframe
                src={preview}
                className="w-full h-full rounded-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

// ===== SKELETON =====
function SkeletonRows() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="grid grid-cols-5 px-6 py-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="h-4 bg-gray-200 rounded w-10" />
          <div className="h-4 bg-gray-200 rounded w-10" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      ))}
    </>
  )
}

function formatearFecha(fechaISO) {
  return new Date(fechaISO).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
