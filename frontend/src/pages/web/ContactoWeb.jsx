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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HERO */}
      <section className="bg-gradient-to-r from-slate-900 to-blue-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <p className="mb-4 inline-block rounded-full bg-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-300">
            {hero.tag}
          </p>

          <h1 className="mb-5 text-4xl font-bold leading-tight md:text-5xl">
            {hero.title}
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-slate-200 md:text-lg">
            {hero.description}
          </p>
        </div>
      </section>

      {/* INFORMACIÓN DE CONTACTO */}
      <section className="py-14">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-2">
          <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-5 text-2xl font-bold text-slate-900">
              {contactInfo.title}
            </h2>

            <div className="space-y-4">
              {(contactInfo.items || []).map((item, index) => (
                <p key={index} className="leading-7 text-slate-600">
                  <span className="font-semibold text-slate-900">
                    {item.label}:
                  </span>{" "}
                  {item.value}
                </p>
              ))}
            </div>
          </article>

          <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-5 text-2xl font-bold text-slate-900">
              {support.title}
            </h2>

            <div className="space-y-4">
              {(support.paragraphs || []).map((paragraph, index) => (
                <p key={index} className="leading-8 text-slate-600">
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
          <div className="rounded-[28px] bg-white p-6 shadow-lg ring-1 ring-slate-200 md:p-10">
            <div className="mb-8 text-center">
              <p className="mb-3 inline-block rounded-full bg-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-500">
                {form.tag}
              </p>

              <h2 className="text-3xl font-bold text-slate-900">
                {form.title}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5">
              <div>
                <label
                  htmlFor="nombre"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  {form.fields?.nombre?.label || "Nombre"}
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  placeholder={
                    form.fields?.nombre?.placeholder || "Ingresa tu nombre"
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div>
                <label
                  htmlFor="correo"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  {form.fields?.correo?.label || "Correo"}
                </label>
                <input
                  id="correo"
                  type="email"
                  value={formData.correo}
                  onChange={(e) => handleChange("correo", e.target.value)}
                  placeholder={
                    form.fields?.correo?.placeholder || "Ingresa tu correo"
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div>
                <label
                  htmlFor="asunto"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  {form.fields?.asunto?.label || "Asunto"}
                </label>
                <input
                  id="asunto"
                  type="text"
                  value={formData.asunto}
                  onChange={(e) => handleChange("asunto", e.target.value)}
                  placeholder={
                    form.fields?.asunto?.placeholder || "Motivo de contacto"
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <div>
                <label
                  htmlFor="mensaje"
                  className="mb-2 block text-sm font-semibold text-slate-800"
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
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-2xl bg-sky-500 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
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

export default ContactoWeb;