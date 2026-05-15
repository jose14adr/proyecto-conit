import { Link } from "react-router-dom";

function FooterWeb() {
  return (
    <footer
      className="border-t border-[var(--color-border)] text-white"
      style={{
        background:
          "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
      }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-black text-white shadow-sm backdrop-blur">
              C
            </div>

            <h3 className="text-2xl font-black tracking-wide">CONIT</h3>
          </div>

          <p className="max-w-sm leading-relaxed text-white/75">
            Plataforma de formación con cursos virtuales orientados al desarrollo
            académico y profesional.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-black uppercase tracking-wider text-white/80">
            Enlaces
          </h4>

          <div className="flex flex-col gap-2">
            <Link className="text-white/70 transition hover:text-white" to="/web">
              Inicio
            </Link>
            <Link className="text-white/70 transition hover:text-white" to="/web/cursos">
              Cursos
            </Link>
            <Link className="text-white/70 transition hover:text-white" to="/web/nosotros">
              Nosotros
            </Link>
            <Link className="text-white/70 transition hover:text-white" to="/web/contacto">
              Contacto
            </Link>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-black uppercase tracking-wider text-white/80">
            Contacto
          </h4>

          <div className="space-y-2 text-white/70">
            <p>Email: contacto@conit.edu.pe</p>
            <p>Teléfono: +51 999 999 999</p>
            <p>Perú</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-4 text-center text-sm text-white/65">
        © 2026 CONIT - Todos los derechos reservados
      </div>
    </footer>
  );
}

export default FooterWeb;