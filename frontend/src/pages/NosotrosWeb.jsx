import "./NosotrosWeb.css";

function NosotrosWeb() {
  return (
    <main className="nosotros-web">
      {/* ============================= */}
      {/* HERO / ENCABEZADO PRINCIPAL */}
      {/* ============================= */}
      <section className="nosotros-web-hero">
        <div className="nosotros-web-container">
          <p className="nosotros-web-tag">Sobre CONIT</p>
          <h1>Comprometidos con la formación y el crecimiento profesional</h1>
          <p className="nosotros-web-description">
            En CONIT buscamos brindar oportunidades de aprendizaje accesibles,
            modernas y orientadas al desarrollo académico y laboral de nuestros
            estudiantes.
          </p>
        </div>
      </section>

      {/* ============================= */}
      {/* SECCIÓN QUIÉNES SOMOS */}
      {/* ============================= */}
      <section className="nosotros-web-section">
        <div className="nosotros-web-container nosotros-web-grid">
          <div className="nosotros-web-card">
            <h2>¿Quiénes somos?</h2>
            <p>
              Somos una institución orientada a la capacitación y actualización
              continua, con programas diseñados para responder a las necesidades
              actuales del entorno educativo y profesional.
            </p>
            <p>
              Nuestra propuesta combina accesibilidad, modalidad virtual y una
              experiencia de aprendizaje centrada en el estudiante.
            </p>
          </div>

          <div className="nosotros-web-card">
            <h2>Nuestro propósito</h2>
            <p>
              Impulsar el crecimiento de las personas a través de cursos y
              programas que fortalezcan sus competencias, amplíen sus
              oportunidades y contribuyan a su desarrollo integral.
            </p>
            <p>
              Apostamos por una formación práctica, actualizada y aplicable en
              distintos contextos laborales y académicos.
            </p>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* MISIÓN Y VISIÓN */}
      {/* ============================= */}
      <section className="nosotros-web-values">
        <div className="nosotros-web-container">
          <div className="section-title-web">
            <p className="nosotros-web-tag">Nuestros pilares</p>
            <h2>Misión y visión</h2>
          </div>

          <div className="nosotros-web-grid">
            <article className="nosotros-web-card">
              <h3>Misión</h3>
              <p>
                Brindar formación de calidad mediante programas educativos
                virtuales que promuevan el aprendizaje continuo, la innovación y
                el desarrollo de competencias relevantes para el presente y el
                futuro.
              </p>
            </article>

            <article className="nosotros-web-card">
              <h3>Visión</h3>
              <p>
                Ser una referencia en formación virtual, reconocida por su
                compromiso con la excelencia académica, la innovación educativa y
                el impacto positivo en la trayectoria de sus estudiantes.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* VALORES */}
      {/* ============================= */}
      <section className="nosotros-web-section">
        <div className="nosotros-web-container">
          <div className="section-title-web">
            <p className="nosotros-web-tag">Lo que nos representa</p>
            <h2>Valores institucionales</h2>
          </div>

          <div className="nosotros-web-grid values-grid-web">
            <div className="nosotros-web-card">
              <h3>Compromiso</h3>
              <p>
                Trabajamos con responsabilidad para ofrecer una experiencia
                educativa de calidad.
              </p>
            </div>

            <div className="nosotros-web-card">
              <h3>Innovación</h3>
              <p>
                Incorporamos herramientas y metodologías actuales para enriquecer
                el aprendizaje.
              </p>
            </div>

            <div className="nosotros-web-card">
              <h3>Accesibilidad</h3>
              <p>
                Buscamos que más personas puedan acceder a formación flexible y
                útil para su crecimiento.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default NosotrosWeb;