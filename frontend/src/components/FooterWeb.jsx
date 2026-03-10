import { Link } from "react-router-dom";
import "./FooterWeb.css";

function FooterWeb() {
  return (
    <footer className="footer-web">
      <div className="footer-web-container">
        <div className="footer-web-brand">
          <h3>CONIT</h3>
          <p>
            Plataforma de formación con cursos virtuales orientados al desarrollo
            académico y profesional.
          </p>
        </div>

        <div className="footer-web-links">
          <h4>Enlaces</h4>
          <Link to="/web">Inicio</Link>
          <Link to="/web/cursos">Cursos</Link>
          <Link to="/web/nosotros">Nosotros</Link>
          <Link to="/web/contacto">Contacto</Link>
        </div>

        <div className="footer-web-contact">
          <h4>Contacto</h4>
          <p>Email: contacto@conit.edu.pe</p>
          <p>Teléfono: +51 999 999 999</p>
          <p>Perú</p>
        </div>
      </div>

      <div className="footer-web-bottom">
        © 2026 CONIT - Todos los derechos reservados
      </div>
    </footer>
  );
}

export default FooterWeb;