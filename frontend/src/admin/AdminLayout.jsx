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
  Menu,
  User,
  Globe2,
  Palette,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { obtenerPerfilAdministrador } from "../services/administrador.service";
import { useTheme } from "../theme/ThemeProvider";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [adminData, setAdminData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(!theme?.sidenavMini);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    setSidebarOpen(!theme?.sidenavMini);
  }, [theme?.sidenavMini]);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await obtenerPerfilAdministrador();

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
    { to: "/admin/gestion-web", label: "Gestión Web", icon: Globe2 },
    { to: "/admin/estilos", label: "Estilos", icon: Palette },
    { to: "/admin/alumnos", label: "Alumnos", icon: FileText },
    { to: "/admin/usuarios", label: "Lista de Usuarios", icon: Users },
    { to: "/admin/certificados", label: "Certificados", icon: Award },
    { to: "/admin/pagos", label: "Pagos", icon: CreditCard },
    { to: "/admin/sesiones", label: "Control de Sesiones", icon: Shield },
  ];

  const sidenavClaro =
    theme?.tipoSidenav === "BLANCO" || theme?.tipoSidenav === "TRANSPARENTE";

  const sidenavStyle =
    theme?.tipoSidenav === "BLANCO"
      ? {
          backgroundColor: "var(--color-card)",
          color: "var(--color-text)",
          borderRight: "1px solid var(--color-border)",
        }
      : theme?.tipoSidenav === "TRANSPARENTE"
      ? {
          backgroundColor: "rgba(255,255,255,0.72)",
          color: "var(--color-text)",
          borderRight: "1px solid var(--color-border)",
          backdropFilter: "blur(18px)",
        }
      : {
          backgroundColor: "var(--color-sidenav)",
          color: "var(--color-sidenav-text)",
        };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-background)] text-[var(--color-text)]">
      <aside
        className={`
          ${sidebarOpen ? "w-64" : "w-20"}
          flex flex-col py-6 transition-all duration-300 shadow-2xl z-20 shrink-0
        `}
        style={sidenavStyle}
      >
        <div
          className={`flex items-center ${
            sidebarOpen ? "justify-between px-6" : "justify-center"
          } mb-8`}
        >
          {sidebarOpen && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                C
              </div>

              <h1 className="text-2xl font-bold tracking-widest">CONIT</h1>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg transition-colors shrink-0 ${
              sidenavClaro
                ? "text-[var(--color-text)] hover:bg-slate-100"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
            title="Alternar menú"
          >
            <Menu size={24} />
          </button>
        </div>

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
                className={`
                  flex items-center transition-all duration-200 overflow-hidden
                  ${
                    isActive
                      ? "text-white shadow-md"
                      : sidenavClaro
                      ? "text-slate-600 hover:bg-slate-100 hover:text-[var(--color-primary)]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }
                  ${
                    sidebarOpen
                      ? "rounded-xl px-4 py-3 justify-start gap-3"
                      : "rounded-xl justify-center w-12 h-12 mx-auto"
                  }
                `}
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--color-primary)",
                        color: "#FFFFFF",
                      }
                    : undefined
                }
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

        <div
          className={`pt-4 mt-2 px-3 shrink-0 ${
            sidenavClaro ? "border-t border-slate-200" : "border-t border-white/10"
          }`}
        >
          <button
            onClick={cerrarSesion}
            title={!sidebarOpen ? "Cerrar Sesión" : ""}
            className={`flex items-center text-red-400 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-300
              ${
                sidebarOpen
                  ? "w-full gap-3 px-4 py-3 rounded-xl justify-start"
                  : "w-12 h-12 rounded-xl justify-center mx-auto"
              }
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[var(--color-card)]/90 backdrop-blur-md border-b border-[var(--color-border)] flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-[var(--color-text)] tracking-tight">
            Panel de Administración
          </h2>

          <Link
            to="/admin/perfil"
            className="flex items-center gap-3 bg-[var(--color-background)] py-1.5 px-3 rounded-full border border-[var(--color-border)] shadow-sm hover:bg-[var(--color-card)] hover:shadow-md transition-all duration-200 cursor-pointer"
            title="Ir a mi perfil"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold uppercase shadow-sm">
              {adminData?.nombre ? adminData.nombre.charAt(0) : "A"}
              {adminData?.apellido ? adminData.apellido.charAt(0) : ""}
            </div>

            <span className="font-semibold text-sm text-[var(--color-text)] capitalize pr-2">
              {adminData?.nombre || "Cargando..."} {adminData?.apellido || ""}
            </span>
          </Link>
        </header>

        <main className="flex-1 overflow-auto bg-[var(--color-background)] p-6">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}