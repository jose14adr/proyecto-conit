import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, ShoppingCart, X } from "lucide-react";
import { getCartCount } from "../utils/cart";
import { listarPaginasMenuWeb } from "../services/webCatalogService";

const fallbackMenu = [
  { id: "inicio", titulo: "Inicio", ruta: "/web", slug: "inicio", orden: 1 },
  { id: "cursos", titulo: "Cursos", ruta: "/web/cursos", slug: "cursos", orden: 2 },
  { id: "nosotros", titulo: "Nosotros", ruta: "/web/nosotros", slug: "nosotros", orden: 3 },
  { id: "contacto", titulo: "Contacto", ruta: "/web/contacto", slug: "contacto", orden: 4 },
  { id: "carrito", titulo: "Carrito", ruta: "/web/carrito", slug: "carrito", orden: 5 },
];

function HeaderWeb() {
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paginasMenu, setPaginasMenu] = useState(fallbackMenu);

  const cargarMenu = async () => {
    try {
      const data = await listarPaginasMenuWeb();

      if (Array.isArray(data) && data.length > 0) {
        setPaginasMenu(data);
      } else {
        setPaginasMenu(fallbackMenu);
      }
    } catch (error) {
      console.error("Error cargando menú web:", error);
      setPaginasMenu(fallbackMenu);
    }
  };

  useEffect(() => {
    cargarMenu();
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartCount());
    };

    updateCartCount();

    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const paginasOrdenadas = useMemo(() => {
    return [...paginasMenu].sort(
      (a, b) => Number(a.orden || 1) - Number(b.orden || 1)
    );
  }, [paginasMenu]);

  const paginaCarrito = paginasOrdenadas.find(
    (pagina) => pagina.slug === "carrito" || pagina.ruta === "/web/carrito"
  );

  const linksMenu = paginasOrdenadas.filter(
    (pagina) => pagina.slug !== "carrito" && pagina.ruta !== "/web/carrito"
  );

  const navLinkClass = ({ isActive }) =>
    `rounded-xl px-4 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-sky-100 text-sky-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5">
        <Link to="/web" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-blue-800 text-lg font-black text-white shadow-sm">
            C
          </div>

          <div>
            <p className="text-xl font-black tracking-wide text-slate-900">
              CONIT
            </p>
            <p className="-mt-1 text-xs font-medium text-slate-500">
              Formación profesional
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {linksMenu.map((pagina) => (
            <NavLink
              key={pagina.id || pagina.ruta}
              to={pagina.ruta}
              end={pagina.ruta === "/web"}
              className={navLinkClass}
            >
              {pagina.titulo}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {paginaCarrito && (
            <Link
              to={paginaCarrito.ruta || "/web/carrito"}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-sky-100 hover:text-sky-700"
              title="Carrito"
            >
              <ShoppingCart size={21} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-500 px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <Link
            to="/login"
            className="hidden rounded-2xl bg-sky-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 sm:inline-flex"
          >
            Aula Virtual
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 lg:hidden"
            aria-label="Abrir menú"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 shadow-lg lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2">
            {linksMenu.map((pagina) => (
              <NavLink
                key={pagina.id || pagina.ruta}
                to={pagina.ruta}
                end={pagina.ruta === "/web"}
                className={navLinkClass}
              >
                {pagina.titulo}
              </NavLink>
            ))}

            <Link
              to="/login"
              className="mt-2 rounded-2xl bg-sky-500 px-5 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-sky-600"
            >
              Aula Virtual
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default HeaderWeb;