import {
  Bell,
  ChevronDown,
  CreditCard,
  LogOut,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPerfilAlumno } from "../services/alumnoService";

function leerNotificaciones() {
  try {
    const data = JSON.parse(localStorage.getItem("notificaciones") || "[]");
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

export default function UserMenu() {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] = useState(leerNotificaciones);

  const [alumno, setAlumno] = useState({
    nombreCompleto: "Cargando...",
    correo: "",
  });

  useEffect(() => {
    setNotificaciones(leerNotificaciones());
  }, []);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const perfil = await getPerfilAlumno();

        if (perfil) {
          setAlumno({
            nombreCompleto:
              perfil.nombreCompleto ||
              `${perfil.nombre ?? perfil.nombres ?? ""} ${
                perfil.apellido ?? perfil.apellidos ?? ""
              }`.trim() ||
              "Alumno",

            correo: perfil.correo || perfil.email || "",
          });
        }
      } catch (error) {
        console.error("Error al cargar perfil del alumno:", error);
      }
    };

    cargarPerfil();
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.clear();
    navigate("/login");
  };

  const inicial = (alumno?.nombreCompleto || "A").charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center gap-4">
        {/* Notificaciones */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-muted-text)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-primary)]"
          title="Notificaciones"
        >
          <Bell size={22} />

          {notificaciones > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white shadow">
              {notificaciones}
            </span>
          )}
        </button>

        {/* Usuario */}
        <button
          type="button"
          onClick={() => setOpenMenu((prev) => !prev)}
          className="flex items-center gap-2 rounded-2xl px-3 py-2 transition hover:bg-[var(--color-background)]"
        >
          <div className="flex h-9 w-9 min-w-[36px] items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white shadow-sm">
            {inicial}
          </div>

          <span className="hidden max-w-[160px] truncate text-sm font-semibold text-[var(--color-text)] sm:block">
            {alumno?.nombreCompleto || "Alumno"}
          </span>

          <ChevronDown
            size={17}
            className={`text-[var(--color-muted-text)] transition-transform ${
              openMenu ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Dropdown */}
      <div
        className={`absolute right-0 z-[999] mt-3 w-64 origin-top-right transition-all duration-200
          ${
            openMenu
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0"
          }
        `}
      >
        <div className="absolute -top-2 right-5 z-0 h-4 w-4 rotate-45 border-l border-t border-[var(--color-border)] bg-[var(--color-card)]" />

        <div className="relative z-10 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl backdrop-blur">
          {/* Header */}
          <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white shadow-sm">
                {inicial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--color-text)]">
                  {alumno?.nombreCompleto || "Alumno"}
                </p>

                <p className="truncate text-xs text-[var(--color-muted-text)]">
                  {alumno?.correo || "Aula virtual"}
                </p>
              </div>
            </div>
          </div>

          {/* Opciones */}
          <div className="p-2">
            <button
              type="button"
              onClick={() => {
                navigate("/alumno/mi-perfil");
                setOpenMenu(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-primary)]"
            >
              <User size={18} />
              Mi perfil
            </button>

            <button
              type="button"
              onClick={() => {
                navigate("/alumno/mis-pagos");
                setOpenMenu(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-primary)]"
            >
              <CreditCard size={18} />
              Mis pagos
            </button>

            <div className="my-2 border-t border-[var(--color-border)]" />

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}