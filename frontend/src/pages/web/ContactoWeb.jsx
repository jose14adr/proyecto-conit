import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { contactoWebContent } from "../../data/contactoWebContent";
import {
  enviarMensajeContacto,
  obtenerContenidoWeb,
} from "../../services/webCatalogService";

function ContactoWeb() {
  const [contenido, setContenido] = useState(contactoWebContent);
  const [enviando, setEnviando] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    asunto: "",
    mensaje: "",
  });

  const hero = contenido?.hero || contactoWebContent.hero;
  const contactInfo = contenido?.contactInfo || contactoWebContent.contactInfo;
  const support = contenido?.support || contactoWebContent.support;
  const form = contenido?.form || contactoWebContent.form;

  const cargarContenidoContacto = async () => {
    try {
      const data = await obtenerContenidoWeb("contacto");

      if (data && typeof data === "object") {
        setContenido({
          ...contactoWebContent,
          ...data,
          hero: {
            ...contactoWebContent.hero,
            ...(data.hero || {}),
          },
          contactInfo: {
            ...contactoWebContent.contactInfo,
            ...(data.contactInfo || {}),
            items: Array.isArray(data.contactInfo?.items)
              ? data.contactInfo.items
              : contactoWebContent.contactInfo.items,
          },
          support: {
            ...contactoWebContent.support,
            ...(data.support || {}),
            paragraphs: Array.isArray(data.support?.paragraphs)
              ? data.support.paragraphs
              : contactoWebContent.support.paragraphs,
          },
          form: {
            ...contactoWebContent.form,
            ...(data.form || {}),
            fields: {
              ...contactoWebContent.form.fields,
              ...(data.form?.fields || {}),
            },
          },
        });
      }
    } catch (error) {
      console.error("Error cargando contenido de Contacto:", error);
      setContenido(contactoWebContent);
    }
  };

  useEffect(() => {
    cargarContenidoContacto();
  }, []);

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error("Ingresa tu nombre");
      return;
    }

    if (!formData.correo.trim()) {
      toast.error("Ingresa tu correo");
      return;
    }

    if (!formData.asunto.trim()) {
      toast.error("Ingresa el asunto");
      return;
    }

    if (!formData.mensaje.trim()) {
      toast.error("Escribe tu mensaje");
      return;
    }

    try {
      setEnviando(true);

      await enviarMensajeContacto({
        nombre: formData.nombre.trim(),
        correo: formData.correo.trim(),
        asunto: formData.asunto.trim(),
        mensaje: formData.mensaje.trim(),
      });

      toast.success("Mensaje enviado correctamente");

      setFormData({
        nombre: "",
        correo: "",
        asunto: "",
        mensaje: "",
      });
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      toast.error(error?.message || "No se pudo enviar el mensaje");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      {/* HERO */}
      <section
        className="py-20 text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
        }}
      >
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-4 inline-block rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur">
            {hero.tag}
          </p>

          <h1 className="mb-5 text-4xl font-black leading-tight md:text-5xl">
            {hero.title}
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-white/80 md:text-lg">
            {hero.description}
          </p>
        </div>
      </section>

      {/* INFORMACIÓN DE CONTACTO */}
      <section className="py-14">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-2">
          <article className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-sm">
            <div className="mb-5 h-1.5 w-16 rounded-full bg-[var(--color-primary)]" />

            <h2 className="mb-5 text-2xl font-bold text-[var(--color-text)]">
              {contactInfo.title}
            </h2>

            <div className="space-y-4">
              {(contactInfo.items || []).map((item, index) => (
                <p key={index} className="leading-7 text-[var(--color-muted-text)]">
                  <span className="font-semibold text-[var(--color-text)]">
                    {item.label}:
                  </span>{" "}
                  {item.value}
                </p>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-sm">
            <div className="mb-5 h-1.5 w-16 rounded-full bg-[var(--color-secondary)]" />

            <h2 className="mb-5 text-2xl font-bold text-[var(--color-text)]">
              {support.title}
            </h2>

            <div className="space-y-4">
              {(support.paragraphs || []).map((paragraph, index) => (
                <p key={index} className="leading-8 text-[var(--color-muted-text)]">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* FORMULARIO */}
      <section className="pb-20 pt-4">
        <div className="mx-auto max-w-6xl px-5">
          <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg md:p-10">
            <div className="mb-8 text-center">
              <p className="mb-3 inline-block rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
                {form.tag}
              </p>

              <h2 className="text-3xl font-black text-[var(--color-text)]">
                {form.title}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5">
              <CampoTexto
                id="nombre"
                label={form.fields?.nombre?.label || "Nombre"}
                value={formData.nombre}
                onChange={(value) => handleChange("nombre", value)}
                placeholder={form.fields?.nombre?.placeholder || "Ingresa tu nombre"}
              />

              <CampoTexto
                id="correo"
                type="email"
                label={form.fields?.correo?.label || "Correo"}
                value={formData.correo}
                onChange={(value) => handleChange("correo", value)}
                placeholder={form.fields?.correo?.placeholder || "Ingresa tu correo"}
              />

              <CampoTexto
                id="asunto"
                label={form.fields?.asunto?.label || "Asunto"}
                value={formData.asunto}
                onChange={(value) => handleChange("asunto", value)}
                placeholder={form.fields?.asunto?.placeholder || "Motivo de contacto"}
              />

              <div>
                <label
                  htmlFor="mensaje"
                  className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                >
                  {form.fields?.mensaje?.label || "Mensaje"}
                </label>

                <textarea
                  id="mensaje"
                  rows="5"
                  value={formData.mensaje}
                  onChange={(e) => handleChange("mensaje", e.target.value)}
                  placeholder={
                    form.fields?.mensaje?.placeholder || "Escribe tu consulta"
                  }
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted-text)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]"
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-2xl bg-[var(--color-button-primary)] px-5 py-3.5 text-base font-semibold text-[var(--color-button-primary-text)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando
                  ? "Enviando..."
                  : form.buttonText || "Enviar mensaje"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function CampoTexto({
  id,
  type = "text",
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted-text)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]"
      />
    </div>
  );
}

export default ContactoWeb;