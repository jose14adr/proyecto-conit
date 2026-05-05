import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPerfilAlumno } from "../services/alumnoService";

export default function UserMenu() {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Inicializamos el estado leyendo directamente de localStorage (Tu optimización HEAD)
  const [notificaciones, setNotificaciones] = useState(() => {
    const data = JSON.parse(localStorage.getItem("notificaciones")) || [];
    return data.length;
  });

  const [alumno, setAlumno] = useState({
    nombreCompleto: "Cargando...",
    correo: "",
  });

  // 🔔 Notificaciones
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("notificaciones")) || []
    setNotificaciones(data.length)
  }, [])

  // 👤 Cargar perfil alumno
  /*useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const perfil = await getPerfilAlumno();
        if (!perfil) return;

        setAlumno({
          nombreCompleto:
            `${perfil.nombre ?? ""} ${perfil.apellido ?? ""}`.trim(),
          correo: perfil.correo ?? "",
        });
      } catch (error) {
        console.error("Error cargando perfil alumno:", error);
      }
    };

    cargarPerfil()
  }, [])*/

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const perfil = await getPerfilAlumno();

        console.log("PERFIL 👉", perfil);

        if (perfil) {
          setAlumno({
            nombreCompleto:
              perfil.nombreCompleto ||
              `${perfil.nombre ?? perfil.nombres ?? ""} ${perfil.apellido ?? perfil.apellidos ?? ""}`.trim(),

            correo:
              perfil.correo ||
              perfil.email ||
              ""
          });
        }

      } catch (error) {
        console.error("Error al cargar perfil del alumno:", error);
      }
    };

    cargarPerfil();
  }, []);
  // ❌ cerrar menú fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 🚪 logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center gap-4">
        {/* 🔔 Notificaciones */}
        <div className="relative">
          <Bell size={22} className="text-gray-600" />

          {notificaciones > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
              {notificaciones}
            </span>
          )}
        </div>

        {/* 👤 Usuario */}
        <button
          onClick={() => setOpenMenu((prev) => !prev)}
          className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-xl transition"
        >
          {/* Avatar (De la nube) */}
          <div className="h-8 w-8 min-w-[32px] rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center text-sm font-bold">
            {(alumno?.nombreCompleto || "A").charAt(0)}
          </div>

          {/* Nombre */}
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            {alumno?.nombreCompleto || "Alumno"}
          </span>
        </button>
      </div>

      {/* 📂 Dropdown con animaciones de Tailwind puro (Tu optimización HEAD) */}
      <div
        className={`absolute right-0 mt-3 w-60 z-[999] transition-all duration-200 origin-top-right
          ${openMenu ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        `}
      >
        {/* 🔺 Flechita (De la nube) */}
        <div className="absolute -top-2 right-4 w-4 h-4 bg-white rotate-45 border-l border-t z-0"></div>

        <div className="relative bg-white rounded-xl shadow-2xl border overflow-hidden backdrop-blur z-10">
          {/* Header */}
          <div className="px-4 py-3 border-b bg-gray-50">
            <p className="font-semibold text-gray-800 text-sm">
              {alumno?.nombreCompleto}
            </p>
            <p className="text-xs text-gray-500 truncate">{alumno?.correo}</p>
          </div>

          {/* Opciones */}
          <div className="p-1">
            <button
              onClick={() => {
                navigate("/alumno/mi-perfil");
                setOpenMenu(false);
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition"
            >
              Mi perfil
            </button>

            <button
              onClick={() => {
                navigate("/alumno/mis-pagos");
                setOpenMenu(false);
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
      </div>
    </div>
  );
}
