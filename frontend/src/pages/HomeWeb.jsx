import { Link } from "react-router-dom";
import "./HomeWeb.css";

function HomeWeb() {
  return (
    <main className="home-web">

      {/* ============================= */}
      {/* HERO / PORTADA PRINCIPAL */}
      {/* ============================= */}
      <section className="hero-web">
        <div className="hero-web-overlay">
          <div className="hero-web-content">

            {/* Etiqueta pequeña superior */}
            <p className="hero-web-tag">Bienvenido a CONIT</p>

            {/* Título principal */}
            <h1>Impulsa tu aprendizaje con cursos virtuales de calidad</h1>

            {/* Descripción */}
            <p className="hero-web-description">
              Accede a programas diseñados para fortalecer tus conocimientos
              académicos y profesionales.
            </p>

            {/* Botones principales */}
            <div className="hero-web-buttons">

              {/* Botón que dirige al catálogo de cursos */}
              <Link to="/web/cursos" className="btn-web btn-web-primary">
                Ver cursos
              </Link>

              {/* Botón que dirige al aula virtual */}
              <Link to="/login" className="btn-web btn-web-secondary">
                Ir al Aula Virtual
              </Link>

            </div>

          </div>
        </div>
      </section>


      {/* ============================= */}
      {/* SECCIÓN DE BENEFICIOS */}
      {/* ============================= */}
      <section className="info-web">

        <div className="info-web-container">

          {/* Tarjeta 1 */}
          <div className="info-web-card">
            <h3>Formación actualizada</h3>
            <p>
              Contenidos alineados a las necesidades actuales del entorno
              educativo y profesional.
            </p>
          </div>

          {/* Tarjeta 2 */}
          <div className="info-web-card">
            <h3>Modalidad virtual</h3>
            <p>
              Aprende desde cualquier lugar con acceso sencillo a recursos y
              materiales.
            </p>
          </div>

          {/* Tarjeta 3 */}
          <div className="info-web-card">
            <h3>Docentes capacitados</h3>
            <p>
              Cursos guiados por profesionales preparados para acompañarte en tu
              formación.
            </p>
          </div>

        </div>

      </section>


      {/* ============================= */}
      {/* SECCIÓN CURSOS DESTACADOS */}
      {/* ============================= */}
      <section className="featured-web">

        <div className="featured-web-container">

          {/* Encabezado de la sección */}
          <div className="section-web-header">
            <p className="section-web-tag">Cursos destacados</p>
            <h2>Áreas de aprendizaje para tu crecimiento</h2>
          </div>

          {/* Grid de cursos */}
          <div className="featured-web-grid">

            {/* Curso 1 */}
            <article className="featured-web-card">
              <h3>Ofimática</h3>
              <p>
                Fortalece tus habilidades en herramientas digitales.
              </p>

              <Link to="/web/cursos" className="featured-web-link">
                Explorar cursos
              </Link>
            </article>

            {/* Curso 2 */}
            <article className="featured-web-card">
              <h3>Gestión educativa</h3>
              <p>
                Capacítate en temas clave para la administración educativa.
              </p>

              <Link to="/web/cursos" className="featured-web-link">
                Explorar cursos
              </Link>
            </article>

            {/* Curso 3 */}
            <article className="featured-web-card">
              <h3>Innovación pedagógica</h3>
              <p>
                Estrategias modernas para mejorar la enseñanza.
              </p>

              <Link to="/web/cursos" className="featured-web-link">
                Explorar cursos
              </Link>
            </article>

          </div>

        </div>

      </section>


      {/* ============================= */}
      {/* Acción final */}
      {/* ============================= */}
      <section className="cta-web">

        <div className="cta-web-container">

          <h2>Comienza hoy tu formación con CONIT</h2>

          <p>
            Revisa nuestros cursos disponibles y encuentra el programa ideal.
          </p>

          <Link to="/web/cursos" className="btn-web btn-web-primary">
            Ver catálogo
          </Link>

        </div>

      </section>

    </main>
  );
}

export default HomeWeb;