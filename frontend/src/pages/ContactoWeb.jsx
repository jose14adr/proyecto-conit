import "./ContactoWeb.css";

function ContactoWeb() {
  return (
    <main className="contacto-web">
      {/* ============================= */}
      {/* HERO / ENCABEZADO */}
      {/* ============================= */}
      <section className="contacto-web-hero">
        <div className="contacto-web-container">
          <p className="contacto-web-tag">Contáctanos</p>
          <h1>Estamos aquí para ayudarte</h1>
          <p className="contacto-web-description">
            Si tienes dudas sobre nuestros cursos, matrícula o aula virtual,
            puedes comunicarte con nosotros a través de los siguientes medios.
          </p>
        </div>
      </section>

      {/* ============================= */}
      {/* INFORMACIÓN DE CONTACTO */}
      {/* ============================= */}
      <section className="contacto-web-section">
        <div className="contacto-web-container contacto-web-grid">
          <article className="contacto-web-card">
            <h2>Información de contacto</h2>
            <p>
              <strong>Correo:</strong> contacto@conit.edu.pe
            </p>
            <p>
              <strong>Teléfono:</strong> +51 999 999 999
            </p>
            <p>
              <strong>Horario:</strong> Lunes a Viernes, 8:00 a. m. - 6:00 p. m.
            </p>
            <p>
              <strong>Ubicación:</strong> Perú
            </p>
          </article>

          <article className="contacto-web-card">
            <h2>Atención al estudiante</h2>
            <p>
              Nuestro equipo está disponible para orientarte en el proceso de
              inscripción, acceso a cursos y uso del aula virtual.
            </p>
            <p>
              También puedes escribirnos si necesitas soporte con pagos,
              certificados o información general de la plataforma.
            </p>
          </article>
        </div>
      </section>

      {/* ============================= */}
      {/* FORMULARIO VISUAL */}
      {/* ============================= */}
      <section className="contacto-web-form-section">
        <div className="contacto-web-container">
          <div className="contacto-web-form-wrapper">
            <div className="contacto-web-form-header">
              <p className="contacto-web-tag">Escríbenos</p>
              <h2>Déjanos tu mensaje</h2>
            </div>

            <form className="contacto-web-form">
              {/* Campo nombre */}
              <div className="form-group-web">
                <label htmlFor="nombre">Nombre completo</label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Ingresa tu nombre"
                />
              </div>

              {/* Campo correo */}
              <div className="form-group-web">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                  id="correo"
                  type="email"
                  placeholder="Ingresa tu correo"
                />
              </div>

              {/* Campo asunto */}
              <div className="form-group-web">
                <label htmlFor="asunto">Asunto</label>
                <input
                  id="asunto"
                  type="text"
                  placeholder="Escribe el asunto"
                />
              </div>

              {/* Campo mensaje */}
              <div className="form-group-web">
                <label htmlFor="mensaje">Mensaje</label>
                <textarea
                  id="mensaje"
                  rows="5"
                  placeholder="Escribe tu mensaje"
                ></textarea>
              </div>

              {/* Botón visual */}
              <button type="button" className="btn-contacto-web">
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ContactoWeb;