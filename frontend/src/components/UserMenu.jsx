import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UserMenu() {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Inicializamos el estado leyendo directamente de localStorage.
  // Esto elimina la necesidad del useEffect y el error de rendimiento de React.
  const [notificaciones, setNotificaciones] = useState(() => {
    const data = JSON.parse(localStorage.getItem("notificaciones")) || [];
    return data.length;
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell size={22} className="text-gray-600" />

          {/* Notificaciones ya es un número, por lo que quitamos el .length */}
          {notificaciones > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
              {notificaciones}
            </span>
          )}
        </div>

        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="text-sm text-gray-700 hover:text-gray-900 transition font-medium"
        >
          Karem Daniela Paredes Sandoval
        </button>
      </div>

      {/* Reemplazamos framer-motion por Tailwind puro para la animación */}
      <div
        className={`absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 transition-all duration-200 origin-top-right z-50
          ${openMenu ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        `}
      >
        <button
          onClick={() => {
            navigate("/alumno/mi-perfil");
            setOpenMenu(false);
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition"
        >
          Mi perfil
        </button>

        <button
          onClick={() => {
            navigate("/alumno/mis-pagos");
            setOpenMenu(false);
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition"
        >
          Mis pagos
        </button>

        <div className="border-t my-2 border-gray-100"></div>

        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
