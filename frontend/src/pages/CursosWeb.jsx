import "./CursosWeb.css";
import { addToCart } from "../utils/cart";

function CursosWeb() {
  // =============================
  // DATA TEMPORAL DE CURSOS
  // =============================
  // Luego esto se puede traer desde una base de datos o API
  const cursos = [
    {
      id: 1,
      titulo: "Ofimática Profesional",
      descripcion:
        "Aprende herramientas esenciales como Word, Excel y PowerPoint para el entorno académico y laboral.",
      precio: "S/ 120",
      modalidad: "Virtual",
      duracion: "8 semanas",
    },
    {
      id: 2,
      titulo: "Gestión Educativa",
      descripcion:
        "Fortalece competencias en planificación, organización y mejora de procesos en instituciones educativas.",
      precio: "S/ 150",
      modalidad: "Virtual",
      duracion: "10 semanas",
    },
    {
      id: 3,
      titulo: "Innovación Pedagógica",
      descripcion:
        "Descubre metodologías activas y estrategias modernas para mejorar la enseñanza y el aprendizaje.",
      precio: "S/ 130",
      modalidad: "Virtual",
      duracion: "6 semanas",
    },
    {
      id: 4,
      titulo: "Herramientas Digitales para Docentes",
      descripcion:
        "Integra plataformas y recursos digitales para enriquecer tus clases y mejorar la experiencia educativa.",
      precio: "S/ 140",
      modalidad: "Virtual",
      duracion: "7 semanas",
    },
    {
      id: 5,
      titulo: "Evaluación por Competencias",
      descripcion:
        "Diseña instrumentos y criterios de evaluación alineados al desarrollo de competencias.",
      precio: "S/ 160",
      modalidad: "Virtual",
      duracion: "8 semanas",
    },
    {
      id: 6,
      titulo: "Liderazgo y Comunicación",
      descripcion:
        "Desarrolla habilidades de liderazgo, trabajo en equipo y comunicación efectiva en entornos educativos.",
      precio: "S/ 110",
      modalidad: "Virtual",
      duracion: "5 semanas",
    },
  ];

  return (
    <main className="cursos-web">
      {/* ============================= */}
      {/* ENCABEZADO DE LA PÁGINA */}
      {/* ============================= */}
      <section className="cursos-web-hero">
        <div className="cursos-web-container">
          <p className="cursos-web-tag">Catálogo CONIT</p>
          <h1>Nuestros cursos</h1>
          <p className="cursos-web-description">
            Explora programas diseñados para fortalecer tus conocimientos
            académicos y profesionales con una modalidad flexible y accesible.
          </p>
        </div>
      </section>

      {/* ============================= */}
      {/* GRID DE CURSOS */}
      {/* ============================= */}
      <section className="cursos-web-list">
        <div className="cursos-web-container">
          <div className="cursos-web-grid">
            {cursos.map((curso) => (
              <article className="curso-web-card" key={curso.id}>
                {/* Encabezado de la card */}
                <div className="curso-web-card-header">
                  <span className="curso-web-badge">{curso.modalidad}</span>
                  <h2>{curso.titulo}</h2>
                </div>

                {/* Descripción */}
                <p className="curso-web-text">{curso.descripcion}</p>

                {/* Información adicional */}
                <div className="curso-web-meta">
                  <p>
                    <strong>Duración:</strong> {curso.duracion}
                  </p>
                  <p>
                    <strong>Precio:</strong> {curso.precio}
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="curso-web-actions">
                  <button
                    className="btn-curso btn-curso-primary"
                    onClick={() => addToCart(curso)}
                  >
                    Agregar al carrito
                  </button>

                  <button className="btn-curso btn-curso-secondary">
                    Ver detalle
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default CursosWeb; 