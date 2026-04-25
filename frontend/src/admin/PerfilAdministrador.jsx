import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  obtenerPerfilAdministrador,
  actualizarPerfilAdministrador,
  actualizarPasswordAdministrador,
  uploadFotoAdministrador,
  uploadCvAdministrador,
} from "../services/administrador.service";
import { logout } from "../services/auth.service";
import toast from "react-hot-toast";
import { FileText, UploadCloud, Eye } from "lucide-react";

function SkeletonBlock({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-300/60 ${className}`} />
  );
}

function ChevronIcon({ open = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ExitIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  );
}

export default function PerfilAdministrador() {
  const navigate = useNavigate();
  const fileInputFotoRef = useRef(null);
  const fileInputCvRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [subiendoCv, setSubiendoCv] = useState(false);

  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [form, setForm] = useState({
    id: "",
    estado: "Activo",
    nombre: "",
    apellido: "",
    tipoDocumento: "DNI",
    numDocumento: "",
    correo: "",
    telefono: "",
    direccion: "",
    foto_url: "",
    cv_url: "",
    password: "",
    passwordConfirm: "",
  });

  const [openSections, setOpenSections] = useState({
    personales: true,
    contrasena: false,
  });

  const showMessage = (tipo, texto) => {
    if (tipo === "success") toast.success(texto);
    else toast.error(texto);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const cargarPerfilBase = async () => {
      try {
        setLoading(true);
        const perfil = await obtenerPerfilAdministrador();

        if (!perfil) {
          showMessage("error", "No hay sesión. Inicia sesión nuevamente.");
          setLoading(false);
          return;
        }

        setForm({
          id: perfil.id,
          estado: perfil.estado === false ? "Inactivo" : "Activo",
          nombre: perfil.nombre || "",
          apellido: perfil.apellido || "",
          tipoDocumento: perfil.tipodocumento || "DNI",
          numDocumento: perfil.numdocumento || "",
          correo: perfil.correo || "",
          telefono: perfil.telefono || "",
          direccion: perfil.direccion || "",
          foto_url: perfil.foto_url || "",
          cv_url: perfil.cv_url || "",
          password: "",
          passwordConfirm: "",
        });

        setLoading(false);
      } catch (e) {
        console.error(e);
        showMessage("error", e?.message || "Error cargando perfil.");
        setLoading(false);
      }
    };
    cargarPerfilBase();
  }, []);

  const badgeClass =
    form.estado === "Activo"
      ? "border border-emerald-200 bg-emerald-100 text-emerald-700"
      : "border border-rose-200 bg-rose-100 text-rose-700";

  const onFotoSeleccionada = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSubiendoFoto(true);
      // Llamada real al backend
      const url = await uploadFotoAdministrador(file);
      updateForm("foto_url", url);
      showMessage("success", "Foto subida correctamente.");
    } catch (error) {
      showMessage("error", "No se pudo subir la foto.", error);
    } finally {
      setSubiendoFoto(false);
      if (e.target) e.target.value = "";
    }
  };

  const onCvSeleccionado = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSubiendoCv(true);
      // Llamada real al backend
      const url = await uploadCvAdministrador(file);
      updateForm("cv_url", url);
      showMessage("success", "CV subido correctamente.");
    } catch (error) {
      showMessage("error", "No se pudo subir el CV.", error);
    } finally {
      setSubiendoCv(false);
      if (e.target) e.target.value = "";
    }
  };

  const guardarCambios = async () => {
    const { nombre, apellido, tipoDocumento, numDocumento, correo, telefono } =
      form;

    if (!nombre.trim() || nombre.trim().length < 2)
      return showMessage(
        "error",
        "El nombre es obligatorio y debe tener al menos 2 caracteres.",
      );
    if (!apellido.trim() || apellido.trim().length < 2)
      return showMessage(
        "error",
        "El apellido es obligatorio y debe tener al menos 2 caracteres.",
      );
    if (!numDocumento.trim())
      return showMessage("error", "El número de documento es obligatorio.");
    if (tipoDocumento === "DNI" && !/^\d{8}$/.test(numDocumento))
      return showMessage("error", "El DNI debe tener exactamente 8 dígitos.");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correo.trim() || !emailRegex.test(correo))
      return showMessage("error", "Ingresa un correo electrónico válido.");

    const soloNumeros = telefono.replace(/\D/g, "");
    if (soloNumeros.length < 6 || soloNumeros.length > 15)
      return showMessage(
        "error",
        "El número de teléfono es muy corto o muy largo.",
      );

    try {
      setGuardando(true);
      await actualizarPerfilAdministrador(form.id, {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        tipodocumento: form.tipoDocumento,
        numdocumento: form.numDocumento.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
        foto_url: form.foto_url || null,
        cv_url: form.cv_url || null,
      });
      showMessage("success", "Cambios guardados correctamente.");
    } catch (e) {
      showMessage("error", e?.message || "Error guardando cambios.");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarPassword = async () => {
    try {
      const password = String(form.password || "").trim();
      const passwordConfirm = String(form.passwordConfirm || "").trim();
      const regexContrasenia =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!password || !passwordConfirm)
        return showMessage("error", "Completa ambos campos de contraseña.");
      if (!regexContrasenia.test(password))
        return showMessage(
          "error",
          "Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial.",
        );
      if (password !== passwordConfirm)
        return showMessage("error", "Las contraseñas no coinciden.");

      setGuardandoPassword(true);
      await actualizarPasswordAdministrador(form.id, password);

      setForm((prev) => ({ ...prev, password: "", passwordConfirm: "" }));
      setShowPassword(false);
      setShowPasswordConfirm(false);
      showMessage("success", "Contraseña actualizada correctamente.");
    } catch (error) {
      showMessage(
        "error",
        error?.message || "No se pudo actualizar la contraseña.",
      );
    } finally {
      setGuardandoPassword(false);
    }
  };

  const iniciales =
    `${form.nombre.charAt(0) || "A"}${form.apellido.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* HEADER DEL PERFIL */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-white shadow-xl">
        <div className="absolute right-5 top-5 z-20">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25"
          >
            <ExitIcon /> Cerrar sesión
          </button>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_32%)]" />

        <div className="relative z-10 flex flex-col gap-6 px-6 py-8 md:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            {/* AVATAR INTERACTIVO */}
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white/70 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg text-4xl font-bold uppercase tracking-wider flex items-center justify-center">
              {loading ? (
                <div className="h-full w-full animate-pulse bg-slate-400" />
              ) : form.foto_url ? (
                <img
                  src={form.foto_url}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                iniciales
              )}

              {/* Botón de Lápiz para cambiar foto */}
              <button
                type="button"
                onClick={() => fileInputFotoRef.current?.click()}
                disabled={subiendoFoto}
                className="absolute bottom-1 right-1 rounded-full bg-white p-2 text-slate-700 shadow-md transition hover:scale-105 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                title="Cambiar foto"
              >
                <PencilIcon />
              </button>

              <input
                ref={fileInputFotoRef}
                type="file"
                accept="image/*"
                onChange={onFotoSeleccionada}
                disabled={subiendoFoto}
                className="hidden"
              />
            </div>

            <div>
              {loading ? (
                <div className="space-y-3">
                  <SkeletonBlock className="h-6 w-24 rounded-full" />
                  <SkeletonBlock className="h-8 w-56" />
                  <SkeletonBlock className="h-4 w-72" />
                </div>
              ) : (
                <>
                  <div
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
                  >
                    Administrador {form.estado}
                  </div>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight">
                    {form.nombre || form.apellido
                      ? `${form.nombre} ${form.apellido}`
                      : "Administrador Principal"}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-slate-200">
                    Panel de control general. Mantén tus datos de contacto y
                    credenciales actualizados por seguridad.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200/90">
                    {form.correo && (
                      <span className="rounded-full bg-white/10 px-3 py-1">
                        {form.correo}
                      </span>
                    )}
                    {form.telefono && (
                      <span className="rounded-full bg-white/10 px-3 py-1">
                        {form.telefono}
                      </span>
                    )}
                    {subiendoFoto && (
                      <span className="rounded-full bg-amber-400/20 px-3 py-1 text-amber-100">
                        Subiendo foto...
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FORMULARIOS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Navegación
            </p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => toggleSection("personales")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Datos personales
              </button>
              <button
                onClick={() => toggleSection("contrasena")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Seguridad y Contraseña
              </button>
            </div>
          </div>
        </aside>

        <div className={`space-y-4 ${guardando ? "opacity-90" : ""}`}>
          {/* DATOS PERSONALES */}
          <AccordionCard
            title="Datos personales"
            subtitle="Información básica y currículum"
            open={openSections.personales}
            onToggle={() => toggleSection("personales")}
          >
            <div className="space-y-5">
              {/* UPLOAD CV */}
              <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      Curriculum Vitae (Opcional)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sube tu CV en formato PDF para mantener tu expediente
                      actualizado.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  {form.cv_url && (
                    <a
                      href={form.cv_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition"
                    >
                      <Eye size={16} /> Ver Actual
                    </a>
                  )}
                  <button
                    onClick={() => fileInputCvRef.current?.click()}
                    disabled={subiendoCv}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-medium transition disabled:opacity-60"
                  >
                    <UploadCloud size={16} />{" "}
                    {subiendoCv
                      ? "Subiendo..."
                      : form.cv_url
                        ? "Actualizar"
                        : "Subir CV"}
                  </button>
                  <input
                    ref={fileInputCvRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={onCvSeleccionado}
                    disabled={subiendoCv}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                <Field
                  label="Nombres *"
                  value={form.nombre}
                  onChange={(v) =>
                    updateForm(
                      "nombre",
                      v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""),
                    )
                  }
                />
                <Field
                  label="Apellidos *"
                  value={form.apellido}
                  onChange={(v) =>
                    updateForm(
                      "apellido",
                      v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""),
                    )
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tipo de Documento
                  </label>
                  <select
                    value={form.tipoDocumento}
                    onChange={(e) => {
                      updateForm("tipoDocumento", e.target.value);
                      updateForm("numDocumento", "");
                    }}
                    className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-indigo-400"
                  >
                    <option value="DNI">DNI</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Carnet Extranjería">
                      Carnet Extranjería
                    </option>
                  </select>
                </div>
                <Field
                  label="Número de Documento *"
                  value={form.numDocumento}
                  onChange={(v) => {
                    let val = v;
                    if (form.tipoDocumento === "DNI")
                      val = val.replace(/\D/g, "").slice(0, 8);
                    else if (form.tipoDocumento === "Carnet Extranjería")
                      val = val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 9);
                    else if (form.tipoDocumento === "Pasaporte")
                      val = val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
                    updateForm("numDocumento", val);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Correo Electrónico *"
                  value={form.correo}
                  onChange={(v) => updateForm("correo", v)}
                  type="email"
                />
                <Field
                  label="Teléfono *"
                  value={form.telefono}
                  onChange={(v) =>
                    updateForm("telefono", v.replace(/[^\d+-\s]/g, ""))
                  }
                  placeholder="Ej. +51 999888777"
                />
              </div>

              <Field
                label="Dirección"
                value={form.direccion}
                onChange={(v) => updateForm("direccion", v)}
              />
            </div>
          </AccordionCard>

          {/* CONTRASEÑA */}
          <AccordionCard
            title="Seguridad y Contraseña"
            subtitle="Actualiza tu contraseña de acceso al panel"
            open={openSections.contrasena}
            onToggle={() => toggleSection("contrasena")}
          >
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">
                  Recomendaciones de seguridad
                </p>
                <ul className="mt-2 space-y-1 text-sm text-slate-500">
                  <li>• Usa al menos 8 caracteres.</li>
                  <li>
                    • Debe contener al menos 1 mayúscula, 1 número y 1 carácter
                    especial (!@#$%).
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <PasswordField
                  label="Nueva contraseña"
                  value={form.password}
                  onChange={(v) => updateForm("password", v)}
                  show={showPassword}
                  onToggleShow={() => setShowPassword((prev) => !prev)}
                  placeholder="Ingresa tu nueva contraseña"
                />
                <PasswordField
                  label="Confirmar contraseña"
                  value={form.passwordConfirm}
                  onChange={(v) => updateForm("passwordConfirm", v)}
                  show={showPasswordConfirm}
                  onToggleShow={() => setShowPasswordConfirm((prev) => !prev)}
                  placeholder="Repite tu nueva contraseña"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Estado de validación
                  </p>
                  <p className="text-sm text-slate-500">
                    {!form.password && !form.passwordConfirm
                      ? "Completa ambos campos para actualizar."
                      : form.password.length < 8
                        ? "La contraseña debe tener al menos 8 caracteres."
                        : form.password !== form.passwordConfirm
                          ? "Las contraseñas no coinciden."
                          : "La contraseña está lista para actualizarse."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cambiarPassword}
                  disabled={guardandoPassword}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {guardandoPassword
                    ? "Actualizando..."
                    : "Actualizar contraseña"}
                </button>
              </div>
            </div>
          </AccordionCard>

          {/* BOTON GUARDAR GENERAL */}
          <div className="sticky bottom-4 flex justify-end">
            <button
              type="button"
              onClick={guardarCambios}
              disabled={guardando || subiendoFoto || subiendoCv}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar datos personales"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccordionCard({ title, subtitle, open, onToggle, children }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-slate-200 p-1 text-slate-500">
            <ChevronIcon open={open} />
          </div>
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-5 py-5">{children}</div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-indigo-400 ${disabled ? "bg-slate-100 text-slate-500" : "bg-white"}`}
      />
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border px-4 py-3 pr-12 outline-none transition focus:border-indigo-400"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {show ? "Ocultar" : "Ver"}
        </button>
      </div>
    </div>
  );
}
