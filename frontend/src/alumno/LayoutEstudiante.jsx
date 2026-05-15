import {
  Home,
  BookOpen,
  FileText,
  Library,
  LifeBuoy,
  Menu,
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import UserMenu from "../components/UserMenu";
import { useTheme } from "../theme/ThemeProvider";

function SidebarItem({ to, label, icon, active, sidebarOpen, sidenavClaro }) {
  return (
    <Link
      to={to}
      title={!sidebarOpen ? label : ""}
      className={`flex items-center rounded-xl font-medium transition-all ${
        active
          ? "text-white shadow-md"
          : sidenavClaro
          ? "text-slate-600 hover:bg-slate-100 hover:text-[var(--color-primary)]"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      } ${
        sidebarOpen
          ? "gap-3 px-4 py-3 justify-start text-sm"
          : "h-12 w-12 mx-auto justify-center text-base"
      }`}
      style={
        active
          ? {
              backgroundColor: "var(--color-primary)",
              color: "#FFFFFF",
            }
          : undefined
      }
    >
      {icon}
      {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
    </Link>
  );
}

export default function LayoutEstudiante() {
  const location = useLocation();
  const { theme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(!theme?.sidenavMini);
  const iconSize = sidebarOpen ? 22 : 24;

  useEffect(() => {
    setSidebarOpen(!theme?.sidenavMini);
  }, [theme?.sidenavMini]);

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

  const menuItems = [
    {
      to: "/alumno",
      label: "Principal",
      active: location.pathname === "/alumno",
      icon: <Home size={iconSize} />,
    },
    {
      to: "/alumno/mis-cursos",
      label: "Mis Cursos",
      active: location.pathname.startsWith("/alumno/mis-cursos"),
      icon: <BookOpen size={iconSize} />,
    },
    {
      to: "/alumno/asistencia",
      label: "Mi Asistencia",
      active: location.pathname.startsWith("/alumno/asistencia"),
      icon: <BookOpen size={iconSize} />,
    },
    {
      to: "/alumno/historial",
      label: "Historial Académico",
      active: location.pathname.startsWith("/alumno/historial"),
      icon: <BookOpen size={iconSize} />,
    },
    {
      to: "/alumno/matricula",
      label: "Cursos Sugeridos",
      active: location.pathname.startsWith("/alumno/matricula"),
      icon: <BookOpen size={iconSize} />,
    },
    {
      to: "/alumno/mis-sesiones",
      label: "Mis Sesiones",
      active: location.pathname.startsWith("/alumno/mis-sesiones"),
      icon: <FileText size={iconSize} />,
    },
    {
      to: "/alumno/mis-certificados",
      label: "Mis Certificados",
      active: location.pathname.startsWith("/alumno/mis-certificados"),
      icon: <FileText size={iconSize} />,
    },
    {
      to: "/alumno/recursos",
      label: "Biblioteca",
      active: location.pathname.startsWith("/alumno/recursos"),
      icon: <Library size={iconSize} />,
    },
    {
      to: "/alumno/soporte",
      label: "Soporte",
      active: location.pathname.startsWith("/alumno/soporte"),
      icon: <LifeBuoy size={iconSize} />,
    },
  ];

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[var(--color-background)] text-[var(--color-text)]">
      <aside
        className={`
          ${sidebarOpen ? "w-64" : "w-20"}
          flex flex-col p-5 transition-all duration-300 shadow-xl shrink-0
        `}
        style={sidenavStyle}
      >
        <div className="flex items-center justify-between mb-10">
          {sidebarOpen && (
            <h1 className="text-3xl font-extrabold tracking-wide text-[var(--color-primary)]">
              CONIT
            </h1>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg transition ${
              sidenavClaro
                ? "text-[var(--color-text)] hover:bg-slate-100"
                : "text-white/90 hover:bg-white/10"
            }`}
          >
            <Menu size={26} />
          </button>
        </div>

        <nav className="space-y-3 text-base overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              label={item.label}
              active={item.active}
              icon={item.icon}
              sidebarOpen={sidebarOpen}
              sidenavClaro={sidenavClaro}
            />
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[var(--color-card)] border-b border-[var(--color-border)] shadow-sm flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Aula Virtual
          </h2>

          <UserMenu />
        </header>

        <main className="flex-1 overflow-auto p-8 bg-[var(--color-background)]">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}