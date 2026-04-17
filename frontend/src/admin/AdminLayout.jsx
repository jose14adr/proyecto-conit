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
  UserCog,
  Award,
  Menu,
  User,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { obtenerPerfilAdministrador } from "../services/administrador.service";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await obtenerPerfilAdministrador();
        setAdminData(data);
        if (data && data.nombre) {
          setAdminData(data);
        } else {
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

  const menuItems = [
    { to: "/admin", label: "Principal", icon: Home, exact: true },
    { to: "/admin/perfil", label: "Mi Perfil", icon: User },
    { to: "/admin/administradores", label: "Administradores", icon: UserCog },
    { to: "/admin/docentes", label: "Docentes", icon: Library },
    { to: "/admin/cursos", label: "Cursos", icon: BookOpen },
    { to: "/admin/alumnos", label: "Alumnos", icon: FileText },
    { to: "/admin/usuarios", label: "Lista de Usuarios", icon: Users },
    { to: "/admin/certificados", label: "Certificados", icon: Award },
    { to: "/admin/pagos", label: "Pagos", icon: CreditCard },
    { to: "/admin/sesiones", label: "Control de Sesiones", icon: Shield },
  ];

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-slate-800 overflow-hidden">
      {/* SIDEBAR DINÁMICO */}
      <aside
        className={`
          ${sidebarOpen ? "w-64" : "w-20"}
          bg-slate-900 text-white flex flex-col py-6 transition-all duration-300 shadow-2xl z-20 shrink-0
        `}
      >
        {/* LOGO & BOTÓN MENU */}
        <div
          className={`flex items-center ${sidebarOpen ? "justify-between px-6" : "justify-center"} mb-8`}
        >
          {sidebarOpen && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold shrink-0">
                C
              </div>
              <h1 className="text-2xl font-bold tracking-widest">CONIT</h1>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-300 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors shrink-0"
            title="Alternar menú"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                title={!sidebarOpen ? item.label : ""}
                className={`flex items-center transition-all duration-200 overflow-hidden
                  ${isActive ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" : "text-slate-400 hover:bg-white/10 hover:text-white"}
                  ${sidebarOpen ? "rounded-xl px-4 py-3 justify-start gap-3" : "rounded-xl justify-center w-12 h-12 mx-auto"}
                `}
              >
                <Icon size={20} className="shrink-0" />
                {sidebarOpen && (
                  <span className="whitespace-nowrap font-medium text-sm">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* BOTÓN CERRAR SESIÓN */}
        <div className="pt-4 border-t border-slate-700/50 mt-2 px-3 shrink-0">
          <button
            onClick={cerrarSesion}
            title={!sidebarOpen ? "Cerrar Sesión" : ""}
            className={`flex items-center text-red-400 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-300
              ${sidebarOpen ? "w-full gap-3 px-4 py-3 rounded-xl justify-start" : "w-12 h-12 rounded-xl justify-center mx-auto"}
            `}
          >
            <LogOut size={20} className="shrink-0" />
            {sidebarOpen && (
              <span className="font-medium text-sm whitespace-nowrap">
                Cerrar Sesión
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Panel de Administración
          </h2>

          <Link
            to="/admin/perfil"
            className="flex items-center gap-3 bg-gray-50 py-1.5 px-3 rounded-full border border-gray-200 shadow-sm hover:bg-white hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer"
            title="Ir a mi perfil"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold uppercase shadow-sm">
              {adminData?.nombre ? adminData.nombre.charAt(0) : "A"}
              {adminData?.apellido ? adminData.apellido.charAt(0) : ""}
            </div>

            {/* Nombre */}
            <span className="font-semibold text-sm text-slate-700 capitalize pr-2">
              {adminData?.nombre || "Cargando..."} {adminData?.apellido || ""}
            </span>
          </Link>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
