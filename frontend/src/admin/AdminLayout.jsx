import { useState, useEffect } from "react";
import {
  Home,
  BookOpen,
  FileText,
  Library,
  LifeBuoy,
  LogOut,
  Users,
  CreditCard,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { obtenerPerfilAdministrador } from "../services/administrador.service";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  //Estado para almacenar los datos del administrador
  const [adminData, setAdminData] = useState(null);

  //Funcion para cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    //Efecto para pedir los datos al backend cuando el compoente carga
    const cargarPerfil = async () => {
      try {
        const data = await obtenerPerfilAdministrador();
        setAdminData(data);
      } catch (error) {
        //Si el token es inválido o ha expirado, el backend responderá con un error 401, por lo que redirigimos al login
        console.error("Error al cargar perfil del administrador:", error);
        cerrarSesion();
      }
    };
    cargarPerfil();
  }, []);

  //Funcion auxiliar para saber si un link esta activo o no, para aplicar estilos condicionales
  const isPathActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  //Estilo basse para los links
  const linkStyle =
    "flex items-center gap-3 p-3 rounded transition-colors duration-200";
  //Color cuando está activo o inactivo
  const activeStyle = "bg-[#5573b3] text-white font-semibold";
  const inactiveStyle = "hover:bg-slate-800 text-gray-300 hover:text-white";
  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-8">
        <h1 className="text-2xl font-bold mb-10 tracking-widest">CONIT</h1>

        <nav className="flex-1 space-y-2 text-md">
          <Link
            to="/admin"
            className={`${linkStyle} ${isPathActive("/admin") ? activeStyle : inactiveStyle}`}
          >
            <Home size={20} /> Principal
          </Link>
          <Link
            to="/admin/docentes"
            className={`${linkStyle} ${isPathActive("/admin/docentes") ? activeStyle : inactiveStyle}`}
          >
            <Library size={20} /> Docentes
          </Link>
          <Link
            to="/admin/cursos"
            className={`${linkStyle} ${isPathActive("/admin/cursos") ? activeStyle : inactiveStyle}`}
          >
            <BookOpen size={20} /> Cursos
          </Link>
          <Link
            to="/admin/alumnos"
            className={`${linkStyle} ${isPathActive("/admin/alumnos") ? activeStyle : inactiveStyle}`}
          >
            <FileText size={20} /> Alumnos
          </Link>
          <Link
            to="/admin/usuarios"
            className={`${linkStyle} ${isPathActive("/admin/usuarios") ? activeStyle : inactiveStyle}`}
          >
            <Users size={20} /> Usuarios
          </Link>
          <Link
            to="/admin/pagos"
            className={`${linkStyle} ${isPathActive("/admin/pagos") ? activeStyle : inactiveStyle}`}
          >
            <CreditCard size={20} /> Pagos
          </Link>
        </nav>

        {/* Botón de Cerrar Sesión */}
        <div className="pt-8 border-t border-slate-700 mt-auto">
          <button
            onClick={cerrarSesion}
            className="flex items-center w-full gap-3 p-3 text-red-400 rounded hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-slate-800">Aula Virtual</h2>

          {/* AQUÍ VA EL NOMBRE DINÁMICO */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#5573b3] text-white flex items-center justify-center font-bold uppercase">
              {/* Toma la primera letra del nombre, o muestra 'A' si aún está cargando */}
              {adminData?.nombre ? adminData.nombre.charAt(0) : "A"}
            </div>
            <span className="font-medium text-slate-700 capitalize">
              {/* Muestra el nombre real, o 'Cargando...' mientras espera al backend */}
              {adminData?.nombre || "Cargando..."}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
