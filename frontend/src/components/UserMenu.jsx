import { Bell } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { getPerfilAlumno } from "../services/alumnoService"

export default function UserMenu() {

  const [openMenu, setOpenMenu] = useState(false)
  const [notificaciones, setNotificaciones] = useState(0)
  const [loading, setLoading] = useState(true)
  const [alumno, setAlumno] = useState({
    nombreCompleto: "",
    correo: ""
  })

  const menuRef = useRef(null)
  const navigate = useNavigate()

  // 🔔 Notificaciones
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("notificaciones")) || []
    setNotificaciones(data.length)
  }, [])

  // 👤 Cargar perfil alumno
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const perfil = await getPerfilAlumno()
        if (!perfil) return

        setAlumno({
          nombreCompleto: `${perfil.nombre ?? ""} ${perfil.apellido ?? ""}`.trim(),
          correo: perfil.correo ?? ""
        })
      } catch (error) {
        console.error("Error cargando perfil alumno:", error)
      }
    }

    cargarPerfil()
  }, [])

  // ❌ cerrar menú fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 🚪 logout
  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  return (
    <div className="relative" ref={menuRef}>

      <div className="flex items-center gap-4">

        {/* 🔔 Notificaciones */}
        <div className="relative">
          <Bell size={22} />

          {notificaciones > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
              {notificaciones}
            </span>
          )}
        </div>

        {/* 👤 Usuario */}
         <button
            onClick={() => setOpenMenu(prev => !prev)}
            className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-xl transition"
          >

            {/* Avatar */}
            <div className="h-8 w-8 min-w-[32px] rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center text-sm font-bold">
              {(alumno?.nombreCompleto || "A").charAt(0)}
            </div>

            {/* Nombre */}
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {alumno?.nombreCompleto || "Alumno"}
            </span>

          </button>

      </div>

      {/* 📂 Dropdown */}
      <AnimatePresence>
        {openMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-60 z-[999]"
          >

            {/* 🔺 Flechita */}
            <div className="absolute -top-2 right-4 w-4 h-4 bg-white rotate-45 border-l border-t"></div>

            <div className="bg-white rounded-xl shadow-2xl border overflow-hidden backdrop-blur">

              {/* Header */}
              <div className="px-4 py-3 border-b bg-gray-50">
                <p className="font-semibold text-gray-800 text-sm">
                  {alumno?.nombreCompleto}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {alumno?.correo}
                </p>
              </div>

              {/* Opciones */}
              <div className="p-1">

                <button
                  onClick={() => {
                    navigate("/alumno/mi-perfil")
                    setOpenMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition"
                >
                  Mi perfil
                </button>

                <button
                  onClick={() => {
                    navigate("/alumno/mis-pagos")
                    setOpenMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition"
                >
                  Mis pagos
                </button>

                <div className="my-1 border-t"></div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition"
                >
                  Cerrar sesión
                </button>

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}