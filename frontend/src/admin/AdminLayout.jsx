import { useState, useEffect } from "react";
import {
  Home,
  BookOpen,
  FileText,
  Library,
  LogOut,
  Users,
  CreditCard,
  Shield,
  Award,
  UserCog,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { obtenerPerfilAdministrador } from "../services/administrador.service";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState(null);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await obtenerPerfilAdministrador();

        // ✅ Si viene bien del backend
        if (data && data.nombre) {
          setAdminData(data);
        } else {
          // 🔥 fallback usando localStorage
          const localUser = JSON.parse(localStorage.getItem("usuario") || "{}");
          const nombreFallback = localUser.correo
            ? localUser.correo.split("@")[0]
            : "Admin";

          setAdminData({ nombre: nombreFallback });
        }
      } catch (error) {
        console.error("Error al cargar perfil del administrador:", error);
        cerrarSesion();
      }
    };

    cargarPerfil();
  }, []);

  const isPathActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const linkStyle =
    "flex items-center gap-3 p-3 rounded-lg transition-all duration-200";
  const activeStyle = "bg-indigo-600 text-white font-semibold shadow-md";
  const inactiveStyle = "hover:bg-slate-800 text-gray-300 hover:text-white";

  return (
    <div className="flex h-screen bg-gray-50 text-slate-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 shadow-2xl z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold">
            C
          </div>
          <h1 className="text-2xl font-bold tracking-widest">CONIT</h1>
        </div>

        <nav className="flex-1 space-y-2 text-sm font-medium overflow-y-auto pr-2">
          <Link
            to="/admin"
            className={`${linkStyle} ${
              isPathActive("/admin") ? activeStyle : inactiveStyle
            }`}
          >
            <Home size={20} /> Principal
          </Link>

          <Link
            to="/admin/administradores"
            className={`${linkStyle} ${
              isPathActive("/admin/administradores")
                ? activeStyle
                : inactiveStyle
            }`}
          >
            <UserCog size={20} /> Administradores
          </Link>

          <Link
            to="/admin/docentes"
            className={`${linkStyle} ${
              isPathActive("/admin/docentes") ? activeStyle : inactiveStyle
            }`}
          >
            <Library size={20} /> Docentes
          </Link>

          <Link
            to="/admin/cursos"
            className={`${linkStyle} ${
              isPathActive("/admin/cursos") ? activeStyle : inactiveStyle
            }`}
          >
            <BookOpen size={20} /> Cursos
          </Link>

          <Link
            to="/admin/alumnos"
            className={`${linkStyle} ${
              isPathActive("/admin/alumnos") ? activeStyle : inactiveStyle
            }`}
          >
            <FileText size={20} /> Alumnos
          </Link>

          <Link
            to="/admin/usuarios"
            className={`${linkStyle} ${
              isPathActive("/admin/usuarios") ? activeStyle : inactiveStyle
            }`}
          >
            <Users size={20} /> Lista de Usuarios
          </Link>

          <Link
            to="/admin/certificados"
            className={`${linkStyle} ${
              isPathActive("/admin/certificados")
                ? activeStyle
                : inactiveStyle
            }`}
          >
            <Award size={20} /> Certificados
          </Link>


          <Link
            to="/admin/pagos"
            className={`${linkStyle} ${
              isPathActive("/admin/pagos") ? activeStyle : inactiveStyle
            }`}
          >
            <CreditCard size={20} /> Pagos
          </Link>

          <Link
            to="/admin/sesiones"
            className={`${linkStyle} ${
              isPathActive("/admin/sesiones") ? activeStyle : inactiveStyle
            }`}
          >
            <Shield size={20} /> Control de Sesiones
          </Link>
        </nav>

        {/* LOGOUT */}
        <div className="pt-6 border-t border-slate-700/50 mt-4 shrink-0">
          <button
            onClick={cerrarSesion}
            className="flex items-center w-full gap-3 p-3 text-red-400 rounded-lg hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium"
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Panel de Administración
          </h2>

          <div className="flex items-center gap-3 bg-gray-50 py-1.5 px-3 rounded-full border border-gray-100 shadow-sm">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold uppercase shadow-sm">
              {adminData?.nombre ? adminData.nombre.charAt(0) : "A"}
              {adminData?.apellido ? adminData.apellido.charAt(0) : ""}
            </div>

            {/* Nombre */}
            <span className="font-semibold text-sm text-slate-700 capitalize pr-2">
              {adminData?.nombre || "Cargando..."}{" "}
              {adminData?.apellido || ""}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}