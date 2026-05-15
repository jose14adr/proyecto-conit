import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  User,
  BookOpen,
  FileText,
  CheckCircle,
  CalendarDays,
  Home,
  ChevronDown,
  LogOut,
  Menu,
} from "lucide-react";
import { getPerfilDocente } from "../services/docenteService";
import { logout } from "../services/auth.service";
import { useTheme } from "../theme/ThemeProvider";

function DocenteLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(!theme?.sidenavMini);
  const [menuOpen, setMenuOpen] = useState(false);
  const [docente, setDocente] = useState({
    nombreCompleto: "",
    titulo: "",
    fotoUrl: "",
    correo: "",
  });

  const menuRef = useRef(null);

  const menuItems = [
    { to: "/docente", label: "Inicio", icon: Home },
    { to: "/docente/perfil", label: "Mi Perfil", icon: User },
    { to: "/docente/notas", label: "Registro de Notas", icon: FileText },
    { to: "/docente/cursos", label: "Mis Cursos", icon: BookOpen },
    { to: "/docente/aprobados", label: "Lista de Aprobados", icon: CheckCircle },
    { to: "/docente/horario", label: "Horario", icon: CalendarDays },
  ];

  useEffect(() => {
    setSidebarOpen(!theme?.sidenavMini);
  }, [theme?.sidenavMini]);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const perfil = await getPerfilDocente();
        if (!perfil) return;

        setDocente({
          nombreCompleto: `${perfil.nombre ?? ""} ${perfil.apellido ?? ""}`.trim(),
          titulo: perfil.titulo ?? "Panel docente",
          fotoUrl: perfil.foto_url ?? "",
          correo: perfil.correo ?? "",
        });
      } catch (error) {
        console.error("Error cargando perfil del docente:", error);
      }
    };

    cargarPerfil();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const inicial = useMemo(() => {
    const nombre = docente.nombreCompleto?.trim();
    if (!nombre) return "D";
    return nombre.charAt(0).toUpperCase();
  }, [docente.nombreCompleto]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activeRoute = (to) => {
    return to === "/docente"
      ? location.pathname === "/docente"
      : location.pathname.startsWith(to);
  };

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
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <div className="flex min-h-screen">
        <aside
          className={`sticky top-0 h-screen flex flex-col shadow-xl transition-all duration-300 ${
            sidebarOpen ? "w-72" : "w-24"
          }`}
          style={sidenavStyle}
        >
          <div
            className={
              sidenavClaro
                ? "border-b border-slate-200"
                : "border-b border-white/10"
            }
          >
            <div
              className={`flex items-center ${
                sidebarOpen
                  ? "justify-between px-6 py-6"
                  : "justify-center px-3 py-6"
              }`}
            >
              {sidebarOpen ? (
                <>
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-wide">
                      CONIT
                    </h1>
                    <p
                      className={`mt-1 text-sm ${
                        sidenavClaro ? "text-[var(--color-muted-text)]" : "text-white/70"
                      }`}
                    >
                      Panel Docente
                    </p>
                  </div>

                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={`rounded-xl p-2 transition ${
                      sidenavClaro
                        ? "text-[var(--color-text)] hover:bg-slate-100"
                        : "text-white/90 hover:bg-white/10"
                    }`}
                  >
                    <Menu size={22} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={`rounded-xl p-2 transition ${
                    sidenavClaro
                      ? "text-[var(--color-text)] hover:bg-slate-100"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <Menu size={24} />
                </button>
              )}
            </div>
          </div>

          <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const active = activeRoute(item.to);
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    active
                      ? "text-white shadow-md"
                      : sidenavClaro
                      ? "text-slate-600 hover:bg-slate-100 hover:text-[var(--color-primary)]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  } ${sidebarOpen ? "justify-start gap-3" : "justify-center"}`}
                  style={
                    active
                      ? {
                          backgroundColor: "var(--color-primary)",
                          color: "#FFFFFF",
                        }
                      : undefined
                  }
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div
            className={`px-4 py-4 ${
              sidenavClaro ? "border-t border-slate-200" : "border-t border-white/10"
            }`}
          >
            {sidebarOpen ? (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  sidenavClaro
                    ? "bg-slate-100 text-slate-600"
                    : "bg-white/5 text-white/70"
                }`}
              >
                Aula docente
              </div>
            ) : (
              <div
                className={`text-center text-xs ${
                  sidenavClaro ? "text-slate-400" : "text-white/50"
                }`}
              >
                •
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 h-20 bg-[var(--color-card)] border-b border-[var(--color-border)] flex items-center justify-between px-8">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)]">
                {docente.titulo || "Aula Docente"}
              </h2>
              <p className="text-sm text-[var(--color-muted-text)]">
                Gestiona tu perfil, cursos y clases
              </p>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 transition hover:bg-[var(--color-background)]"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-[var(--color-text)]">
                    {docente.nombreCompleto || "Docente"}
                  </span>
                  <span className="text-xs text-[var(--color-muted-text)]">
                    Panel académico
                  </span>
                </div>

                {docente.fotoUrl ? (
                  <img
                    src={docente.fotoUrl}
                    alt="Foto docente"
                    className="h-11 w-11 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold shadow-md">
                    {inicial}
                  </div>
                )}

                <ChevronDown
                  size={18}
                  className={`text-[var(--color-muted-text)] transition-transform ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl">
                  <div className="border-b border-[var(--color-border)] px-4 py-4">
                    <p className="font-semibold text-[var(--color-text)]">
                      {docente.nombreCompleto || "Docente"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-muted-text)]">
                      {docente.correo || "Panel académico"}
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/docente/perfil");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
                    >
                      <User size={18} />
                      Mi perfil
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-rose-600 transition hover:bg-rose-50"
                    >
                      <LogOut size={18} />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 px-8 py-8 bg-[var(--color-background)]">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DocenteLayout;