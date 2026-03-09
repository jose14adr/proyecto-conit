import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCartCount } from "../utils/cart";
import "./HeaderWeb.css";

function HeaderWeb() {

  // =============================
  // ESTADO DEL CONTADOR DEL CARRITO
  // =============================
  const [cartCount, setCartCount] = useState(0);

  // =============================
  // ESTADO DEL MENÚ MOBILE
  // =============================
  const [menuOpen, setMenuOpen] = useState(false);

  // =============================
  // ACTUALIZAR CONTADOR DEL CARRITO
  // =============================
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

  return (
    <header className="header-web">

      <div className="header-web-container">

        {/* ============================= */}
        {/* LOGO */}
        {/* ============================= */}
        <Link to="/web" className="logo-web">
          CONIT
        </Link>


        {/* ============================= */}
        {/* MENÚ PRINCIPAL */}
        {/* ============================= */}
        <nav className={`nav-web ${menuOpen ? "open" : ""}`}>

          <Link to="/web">Inicio</Link>
          <Link to="/web/cursos">Cursos</Link>
          <Link to="/web/nosotros">Nosotros</Link>
          <Link to="/web/contacto">Contacto</Link>

        </nav>


        {/* ============================= */}
        {/* ACCIONES DERECHA */}
        {/* ============================= */}
        <div className="actions-web">

          {/* Carrito */}
          <Link to="/web/carrito" className="cart-web">

            🛒

            {cartCount > 0 && (
              <span className="cart-badge-web">
                {cartCount}
              </span>
            )}

          </Link>

          {/* Aula virtual */}
          <Link to="/login" className="btn-aula-web">
            Aula Virtual
          </Link>

          {/* Botón hamburguesa */}
          <button
            className="menu-toggle-web"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

        </div>

      </div>

    </header>
  );
}

export default HeaderWeb;