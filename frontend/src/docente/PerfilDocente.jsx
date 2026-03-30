import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PerfilDocumentosHistorial from "./PerfilDocumentosHistorial";
import PerfilCursosCapacitaciones from "./PerfilCursosCapacitaciones";
import { logout } from "../services/auth.service";
import {
  getCursosDocente,
  getHorarioDocente,
  getPerfilDocente,
  uploadFotoDocente,
  updatePerfilDocente,
  getHistorialDocente,
  getGradosInstruccion,
  getDocumentosDocente,
  getCursosAdicionalesDocente,
  deleteCursoAdicionalDocente,
  createCursoAdicionalDocente,
  updatePasswordDocente,
} from "../services/docenteService";

const NAME_LOCK_KEY = "docente_nombre_completo_locked_v1";

function SkeletonBlock({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-300/60 ${className}`} />
  );
}

const parseRangeToMinutes = (range) => {
  if (!range) return { startMinutes: 0, endMinutes: 0 };
  const [ini, fin] = range.split("-").map((s) => s.trim());
  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  return { startMinutes: toMin(ini), endMinutes: toMin(fin) };
};

const minutesNow = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

const dayLabelToday = () => {
  const map = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return map[new Date().getDay()];
};

const splitNombreCompleto = (full) => {
  const clean = String(full ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (!clean) return { nombre: "", apellido: "" };
  const parts = clean.split(" ");
  if (parts.length === 1) return { nombre: parts[0], apellido: "" };
  return { nombre: parts[0], apellido: parts.slice(1).join(" ") };
};

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return "";
  const hoy = new Date();
  const fn = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fn.getFullYear();
  const m = hoy.getMonth() - fn.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) edad--;
  return edad >= 0 ? edad : "";
};

const pct = (value) => `${Math.max(0, Math.min(100, value))}%`;
const telefonoValido = /^[+\d\s-]+$/;

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

function PerfilDocente() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [guardandoCursoExtra, setGuardandoCursoExtra] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const [nombreBloqueado, setNombreBloqueado] = useState(
    () => localStorage.getItem(NAME_LOCK_KEY) === "true"
  );

  const [form, setForm] = useState({
    estado: "Activo",
    estadoMotivo: "",
    nombreCompleto: "",
    correo: "",
    telefono: "",
    direccion: "",
    titulo: "",
    experiencia: "",
    bio: "",
    fechaNacimiento: "",
    gradoInstruccionId: "",
    aniosExperiencia: "",
    sectorExperiencia: "",
    tiempoEstudiosInicio: "",
    tiempoEstudiosFin: "",
    institucionEgreso: "",
    contactoEmergenciaNombre: "",
    contactoEmergenciaTelefono: "",
    perfilProfesional: "",
    password: "",
    passwordConfirm: "",
  });

  const [fotoUrl, setFotoUrl] = useState("");
  const [gradosInstruccion, setGradosInstruccion] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [cursosExtra, setCursosExtra] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [horario, setHorario] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [alumnosTotal, setAlumnosTotal] = useState(0);

  const [mostrarFormCursoExtra, setMostrarFormCursoExtra] = useState(false);
  const [nuevoCurso, setNuevoCurso] = useState({
    nombre: "",
    institucion: "",
    fechaInicio: "",
    fechaFin: "",
    archivo: null,
  });

  const [openSections, setOpenSections] = useState({
    personales: true,
    formacion: true,
    experiencia: false,
    documentos: false,
    cursos: false,
    contrasena: false,
  });

  const showMessage = (tipo, texto) => {
    setMensaje({ tipo, texto });
    window.clearTimeout(window.__perfilDocenteMsgTimeout);
    window.__perfilDocenteMsgTimeout = window.setTimeout(() => {
      setMensaje({ tipo: "", texto: "" });
    }, 3000);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateNuevoCurso = (field, value) => {
    setNuevoCurso((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const abrirSelectorFoto = () => {
    fileInputRef.current?.click();
  };

  const confirmarNombre = () => {
    if (!form.nombreCompleto.trim()) {
      showMessage("error", "Ingresa tu nombre completo antes de confirmar.");
      return;
    }
    localStorage.setItem(NAME_LOCK_KEY, "true");
    setNombreBloqueado(true);
    showMessage("success", "Nombre confirmado. Ya no podrás editarlo nuevamente.");
  };

  const onFotoSeleccionada = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSubiendoFoto(true);
      const url = await uploadFotoDocente(file);
      setFotoUrl(url);
      showMessage("success", "Foto subida correctamente.");
    } catch (error) {
      console.error(error);
      showMessage("error", error?.message || "No se pudo subir la foto.");
    } finally {
      setSubiendoFoto(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const cargarDatosSecundarios = async (docenteId) => {
      try {
        const [c, h, grados, docs, cursosExtraData, hist] = await Promise.all([
          getCursosDocente(),
          getHorarioDocente(),
          getGradosInstruccion(),
          getDocumentosDocente(),
          getCursosAdicionalesDocente(),
          getHistorialDocente(docenteId),
        ]);

        setCursos(c || []);
        setHorario(h || []);
        setGradosInstruccion(grados || []);
        setDocumentos(docs || []);
        setCursosExtra(cursosExtraData || []);
        setAlumnosTotal(0);
        setHistorial(
          (hist || []).map((row) => ({
            id: row.id,
            tipo: row.tipo,
            desde: row.fecha_inicio,
            hasta: row.fecha_fin,
            detalle: row.detalle || row.descripcion,
            institucion: row.institucion,
            cargo: row.cargo,
            area: row.area,
            sector: row.sector,
          }))
        );
      } catch (e) {
        console.error("Error cargando datos secundarios:", e);
      }
    };

    const cargarPerfilBase = async () => {
      try {
        setLoading(true);

        const perfil = await getPerfilDocente();
        if (!perfil) {
          showMessage("error", "No hay sesión. Inicia sesión nuevamente.");
          setLoading(false);
          return;
        }

        setForm({
          estado: perfil.estado === false ? "Inactivo" : "Activo",
          estadoMotivo: (perfil.estado_motivo ?? "").trim(),
          nombreCompleto: `${perfil.nombre ?? ""} ${perfil.apellido ?? ""}`.trim(),
          correo: perfil.correo ?? "",
          telefono:
            perfil.telefono !== null && perfil.telefono !== undefined
              ? String(perfil.telefono)
              : "",
          direccion: perfil.direccion ?? "",
          titulo: perfil.titulo ?? "",
          experiencia: perfil.experiencia ?? "",
          bio: perfil.bio ?? "",
          fechaNacimiento: perfil.fecha_nacimiento ?? "",
          gradoInstruccionId:
            perfil.grado_instruccion_id !== null &&
            perfil.grado_instruccion_id !== undefined
              ? String(perfil.grado_instruccion_id)
              : "",
          aniosExperiencia:
            perfil.anios_experiencia !== null &&
            perfil.anios_experiencia !== undefined
              ? String(perfil.anios_experiencia)
              : "",
          sectorExperiencia: perfil.sector_experiencia ?? "",
          tiempoEstudiosInicio: perfil.tiempo_estudios_inicio ?? "",
          tiempoEstudiosFin: perfil.tiempo_estudios_fin ?? "",
          institucionEgreso: perfil.institucion_egreso ?? "",
          contactoEmergenciaNombre: perfil.contacto_emergencia_nombre ?? "",
          contactoEmergenciaTelefono: perfil.contacto_emergencia_telefono ?? "",
          perfilProfesional: perfil.perfil_profesional ?? perfil.bio ?? "",
        });

        setFotoUrl(perfil.foto_url ?? "");
        setLoading(false);

        cargarDatosSecundarios(perfil.id);
      } catch (e) {
        console.error(e);
        showMessage("error", e?.message || "Error cargando perfil.");
        setLoading(false);
      }
    };

    cargarPerfilBase();

    return () => {
      window.clearTimeout(window.__perfilDocenteMsgTimeout);
    };
  }, []);

  const cursosActivos = cursos.length;

  const proximaClase = useMemo(() => {
    if (!horario?.length) return null;
    const hoy = dayLabelToday();
    const now = minutesNow();

    const clasesHoy = horario
      .filter((h) => h.dia === hoy)
      .slice()
      .sort(
        (a, b) =>
          parseRangeToMinutes(a.hora).startMinutes -
          parseRangeToMinutes(b.hora).startMinutes
      );

    const futuras = clasesHoy.filter(
      (c) => parseRangeToMinutes(c.hora).endMinutes > now
    );

    return futuras.length ? futuras[0] : null;
  }, [horario]);

  const edad = useMemo(
    () => calcularEdad(form.fechaNacimiento),
    [form.fechaNacimiento]
  );

  const resumenAcademico = useMemo(() => {
    const docsAcademicos = (documentos || []).filter((doc) =>
      ["grado_academico", "titulo_profesional", "certificado_estudios"].includes(
        String(doc.tipo || "").toLowerCase()
      )
    );

    const gradoSeleccionado = gradosInstruccion.find(
      (g) => String(g.id) === String(form.gradoInstruccionId)
    );

    const completado =
      !!form.titulo &&
      !!form.gradoInstruccionId &&
      !!form.institucionEgreso &&
      docsAcademicos.length > 0;

    return {
      totalDocs: docsAcademicos.length,
      gradoNombre: gradoSeleccionado?.nombre || "Sin grado seleccionado",
      completado,
      ultimoDocumento: docsAcademicos[0] || null,
    };
  }, [
    documentos,
    gradosInstruccion,
    form.gradoInstruccionId,
    form.titulo,
    form.institucionEgreso,
  ]);

  const perfilStats = useMemo(() => {
    const grupos = [
      {
        key: "personales",
        label: "Datos personales",
        fields: [
          form.nombreCompleto,
          form.correo,
          form.telefono,
          form.direccion,
          form.fechaNacimiento,
          form.contactoEmergenciaNombre,
          form.contactoEmergenciaTelefono,
        ],
      },
      {
        key: "formacion",
        label: "Formación académica",
        fields: [
          form.titulo,
          form.gradoInstruccionId,
          form.tiempoEstudiosInicio,
          form.tiempoEstudiosFin,
          form.institucionEgreso,
        ],
      },
      {
        key: "experiencia",
        label: "Experiencia profesional",
        fields: [
          form.aniosExperiencia,
          form.sectorExperiencia,
          form.experiencia,
          form.perfilProfesional,
          form.bio,
        ],
      },
      {
        key: "cuenta",
        label: "Cuenta",
        fields: [fotoUrl, form.estado],
      },
    ];

    const groups = grupos.map((grupo) => {
      const total = grupo.fields.length;
      const done = grupo.fields.filter((v) => String(v ?? "").trim()).length;
      return {
        ...grupo,
        total,
        done,
        percent: total ? Math.round((done / total) * 100) : 0,
      };
    });

    const totalCampos = groups.reduce((acc, item) => acc + item.total, 0);
    const totalLlenos = groups.reduce((acc, item) => acc + item.done, 0);

    const faltantes = [];
    if (!fotoUrl) faltantes.push("foto de perfil");
    if (!form.gradoInstruccionId) faltantes.push("grado académico");
    if (!form.titulo) faltantes.push("título visible");
    if (!form.institucionEgreso) faltantes.push("institución de egreso");
    if (!form.perfilProfesional) faltantes.push("perfil profesional");
    if (!form.contactoEmergenciaNombre) faltantes.push("contacto de emergencia");

    return {
      groups,
      percent: totalCampos ? Math.round((totalLlenos / totalCampos) * 100) : 0,
      faltantes,
    };
  }, [form, fotoUrl]);

  const perfilCompletado = perfilStats.percent;

  const badgeClass =
    form.estado === "Activo"
      ? "border border-emerald-200 bg-emerald-100 text-emerald-700"
      : "border border-rose-200 bg-rose-100 text-rose-700";

  const guardarCambios = async () => {
    try {
      if (form.aniosExperiencia && !/^\d+$/.test(form.aniosExperiencia)) {
        showMessage("error", "Los años de experiencia solo deben contener números.");
        return;
      }

      if (
        form.contactoEmergenciaTelefono &&
        !telefonoValido.test(form.contactoEmergenciaTelefono)
      ) {
        showMessage("error", "El teléfono de contacto de emergencia no es válido.");
        return;
      }

      if (form.telefono && !telefonoValido.test(form.telefono)) {
        showMessage("error", "El teléfono no es válido.");
        return;
      }

      const { nombre, apellido } = splitNombreCompleto(form.nombreCompleto);

      setGuardando(true);

      await updatePerfilDocente({
        estado: form.estado === "Activo",
        nombre,
        apellido,
        correo: form.correo.trim(),
        telefono: form.telefono?.trim() || null,
        direccion: form.direccion.trim(),
        titulo: form.titulo?.trim() || null,
        experiencia: form.experiencia?.trim() || null,
        bio: form.bio?.trim() || null,
        foto_url: fotoUrl || null,
        fecha_nacimiento: form.fechaNacimiento || null,
        grado_instruccion_id: form.gradoInstruccionId
          ? Number(form.gradoInstruccionId)
          : null,
        anios_experiencia: form.aniosExperiencia
          ? Number(form.aniosExperiencia)
          : null,
        sector_experiencia: form.sectorExperiencia || null,
        tiempo_estudios_inicio: form.tiempoEstudiosInicio || null,
        tiempo_estudios_fin: form.tiempoEstudiosFin || null,
        institucion_egreso: form.institucionEgreso?.trim() || null,
        contacto_emergencia_nombre:
          form.contactoEmergenciaNombre?.trim() || null,
        contacto_emergencia_telefono:
          form.contactoEmergenciaTelefono?.trim() || null,
        perfil_profesional: form.perfilProfesional?.trim() || null,
        estado_motivo: form.estadoMotivo?.trim() || null,
      });

      showMessage("success", "Cambios guardados correctamente.");
    } catch (e) {
      console.error(e);
      showMessage("error", e?.message || "Error guardando cambios.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCursoExtra = async (id) => {
    try {
      await deleteCursoAdicionalDocente(id);
      setCursosExtra((prev) => prev.filter((c) => c.id !== id));
      showMessage("success", "Curso eliminado correctamente.");
    } catch (e) {
      console.error(e);
      showMessage("error", e?.message || "No se pudo eliminar el curso.");
    }
  };

  const limpiarFormCurso = () => {
    setNuevoCurso({
      nombre: "",
      institucion: "",
      fechaInicio: "",
      fechaFin: "",
      archivo: null,
    });
  };

  const agregarCursoExtraLocal = async () => {
    try {
      if (!nuevoCurso.nombre.trim()) {
        showMessage("error", "Ingresa el nombre del curso o capacitación.");
        return;
      }

      setGuardandoCursoExtra(true);

      const cursoCreado = await createCursoAdicionalDocente({
        nombre: nuevoCurso.nombre.trim(),
        institucion: nuevoCurso.institucion.trim(),
        fecha_inicio: nuevoCurso.fechaInicio || null,
        fecha_fin: nuevoCurso.fechaFin || null,
        archivo: nuevoCurso.archivo || null,
      });

      setCursosExtra((prev) => [cursoCreado, ...prev]);
      limpiarFormCurso();
      setMostrarFormCursoExtra(false);
      showMessage("success", "Curso guardado correctamente.");
    } catch (e) {
      console.error(e);
      showMessage("error", e?.message || "No se pudo guardar el curso.");
    } finally {
      setGuardandoCursoExtra(false);
    }
  };

  const cambiarPassword = async () => {
    try {
      const password = String(form.password || "").trim();
      const passwordConfirm = String(form.passwordConfirm || "").trim();

      if (!password || !passwordConfirm) {
        showMessage("error", "Completa ambos campos de contraseña.");
        return;
      }

      if (password.length < 8) {
        showMessage("error", "La nueva contraseña debe tener al menos 8 caracteres.");
        return;
      }

      if (password !== passwordConfirm) {
        showMessage("error", "Las contraseñas no coinciden.");
        return;
      }

      setGuardandoPassword(true);

      await updatePasswordDocente(password);

      setForm((prev) => ({
        ...prev,
        password: "",
        passwordConfirm: "",
      }));

      setShowPassword(false);
      setShowPasswordConfirm(false);

      showMessage("success", "Contraseña actualizada correctamente.");
    } catch (error) {
      console.error(error);
      showMessage(
        "error",
        error?.message || "No se pudo actualizar la contraseña."
      );
    } finally {
      setGuardandoPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {mensaje.texto && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${
            mensaje.tipo === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-white shadow-xl">
        <div className="absolute right-5 top-5 z-20">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25"
          >
            <ExitIcon />
            Cerrar sesión
          </button>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_32%)]" />

        <div className="relative z-10 flex flex-col gap-6 px-6 py-8 md:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white/70 bg-white/10 shadow-lg">
              {loading ? (
                <div className="h-full w-full animate-pulse rounded-full bg-slate-400" />
              ) : fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm font-medium text-slate-600">
                  Sin foto
                </div>
              )}

              <button
                type="button"
                onClick={abrirSelectorFoto}
                disabled={subiendoFoto}
                className="absolute bottom-1 right-1 rounded-full bg-white p-2 text-slate-700 shadow-md transition hover:scale-105 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                title="Cambiar foto"
              >
                <PencilIcon />
              </button>

              <input
                ref={fileInputRef}
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
                  <div className="flex gap-2">
                    <SkeletonBlock className="h-6 w-28 rounded-full" />
                    <SkeletonBlock className="h-6 w-24 rounded-full" />
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}
                  >
                    {form.estado}
                  </div>

                  <h2 className="mt-3 text-3xl font-bold tracking-tight">
                    {form.nombreCompleto || "Docente"}
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm text-slate-200">
                    {form.titulo ||
                      "Completa tu información profesional para mostrar un perfil docente más sólido y confiable."}
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
                    {edad && (
                      <span className="rounded-full bg-white/10 px-3 py-1">
                        {edad} años
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[360px]">
            <MiniStat label="Cursos activos" value={cursosActivos} loading={loading} />
            <MiniStat label="Alumnos" value={alumnosTotal} loading={loading} />
            <MiniStat
              label="Próxima clase"
              value={proximaClase ? proximaClase.hora : "--"}
              loading={loading}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Perfil docente
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Progreso</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    perfilCompletado >= 85
                      ? "bg-emerald-100 text-emerald-700"
                      : perfilCompletado >= 60
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {perfilCompletado}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
                  style={{ width: pct(perfilCompletado) }}
                />
              </div>

              <div className="mt-4 space-y-3">
                {perfilStats.groups.map((item) => (
                  <div key={item.key}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-semibold text-slate-700">
                        {item.done}/{item.total}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-400"
                        style={{ width: pct(item.percent) }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {perfilStats.faltantes.length > 0 && (
                <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Pendiente
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Te falta completar:{" "}
                    <span className="font-medium text-slate-800">
                      {perfilStats.faltantes.slice(0, 3).join(", ")}
                      {perfilStats.faltantes.length > 3 ? "..." : ""}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Navegación
            </p>
            <div className="mt-4 space-y-2">
              <NavBtn text="Datos personales" onClick={() => toggleSection("personales")} />
              <NavBtn text="Formación académica" onClick={() => toggleSection("formacion")} />
              <NavBtn text="Experiencia profesional" onClick={() => toggleSection("experiencia")} />
              <NavBtn text="Documentos e historial" onClick={() => toggleSection("documentos")} />
              <NavBtn text="Cursos y capacitaciones" onClick={() => toggleSection("cursos")} />
              <NavBtn text="Contraseña" onClick={() => toggleSection("contrasena")} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Próxima clase
            </p>
            {loading ? (
              <div className="mt-3 space-y-2">
                <SkeletonBlock className="h-5 w-40" />
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-4 w-36" />
              </div>
            ) : proximaClase ? (
              <div className="mt-3 space-y-2">
                <div className="text-base font-semibold text-slate-800">
                  {proximaClase.curso}
                </div>
                <div className="text-sm text-slate-600">
                  {proximaClase.dia} · {proximaClase.hora}
                </div>
                <div className="text-sm text-slate-500">
                  Grupo {proximaClase.grupo} · {proximaClase.modalidad}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No hay clases programadas para hoy.
              </p>
            )}
          </div>
        </aside>

        <div className={`space-y-4 ${guardando ? "opacity-90" : ""}`}>
          <AccordionCard
            title="Datos personales"
            subtitle="Información básica y de contacto"
            open={openSections.personales}
            onToggle={() => toggleSection("personales")}
          >
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nombre completo
                </label>
                <input
                  value={form.nombreCompleto}
                  onChange={(e) => updateForm("nombreCompleto", e.target.value)}
                  disabled={nombreBloqueado}
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-indigo-400 ${
                    nombreBloqueado ? "bg-slate-100 text-slate-500" : "bg-white"
                  }`}
                />
                {!nombreBloqueado && (
                  <button
                    type="button"
                    onClick={confirmarNombre}
                    className="mt-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Confirmar nombre (solo una vez)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Correo"
                  value={form.correo}
                  onChange={(v) => updateForm("correo", v)}
                />
                <Field
                  label="Teléfono"
                  value={form.telefono}
                  onChange={(v) => updateForm("telefono", v)}
                />
                <Field
                  label="Fecha de nacimiento"
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(v) => updateForm("fechaNacimiento", v)}
                />
                <Field label="Edad" value={edad} disabled />
              </div>

              <Field
                label="Dirección"
                value={form.direccion}
                onChange={(v) => updateForm("direccion", v)}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Contacto de emergencia"
                  value={form.contactoEmergenciaNombre}
                  onChange={(v) => updateForm("contactoEmergenciaNombre", v)}
                  placeholder="Nombre del contacto"
                />
                <Field
                  label="Teléfono de emergencia"
                  value={form.contactoEmergenciaTelefono}
                  onChange={(v) => updateForm("contactoEmergenciaTelefono", v)}
                  placeholder="Ej. +51 999 888 777"
                />
              </div>
            </div>
          </AccordionCard>

          <AccordionCard
            title="Formación académica"
            subtitle="Grado, título visible y sustento académico del docente"
            open={openSections.formacion}
            onToggle={() => toggleSection("formacion")}
            rightNode={<SmallStatusPill complete={resumenAcademico.completado} />}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Resumen académico
                      </p>
                      <h4 className="mt-2 text-lg font-semibold text-slate-900">
                        {form.titulo || "Título pendiente"}
                      </h4>
                      <p className="mt-1 text-sm text-slate-600">
                        {resumenAcademico.gradoNombre}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        resumenAcademico.completado
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {resumenAcademico.completado ? "Validado" : "Pendiente"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <InfoMiniCard
                      label="Documentos"
                      value={String(resumenAcademico.totalDocs)}
                      help="Sustentos académicos"
                    />
                    <InfoMiniCard
                      label="Institución"
                      value={form.institucionEgreso || "Pendiente"}
                      help={form.institucionEgreso ? "Sí" : "No"}
                    />
                    <InfoMiniCard
                      label="Periodo"
                      value={
                        form.tiempoEstudiosInicio || form.tiempoEstudiosFin
                          ? "Registrado"
                          : "Pendiente"
                      }
                      help={
                        form.tiempoEstudiosInicio && form.tiempoEstudiosFin
                          ? `${form.tiempoEstudiosInicio} a ${form.tiempoEstudiosFin}`
                          : "Sin fechas"
                      }
                    />
                  </div>

                  {resumenAcademico.ultimoDocumento && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Último documento
                      </p>
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-sm text-slate-800">
                          {resumenAcademico.ultimoDocumento.nombre}
                        </p>

                        <a
                          href={resumenAcademico.ultimoDocumento.archivo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          Ver
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Recomendaciones
                  </p>

                  <div className="mt-3 space-y-2">
                    <ChecklistItem done={!!form.gradoInstruccionId} text="Seleccionar grado académico" />
                    <ChecklistItem done={!!form.titulo} text="Definir título visible" />
                    <ChecklistItem done={!!form.institucionEgreso} text="Registrar institución" />
                    <ChecklistItem done={resumenAcademico.totalDocs > 0} text="Subir documento" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Título"
                  value={form.titulo}
                  onChange={(v) => updateForm("titulo", v)}
                />

                <select
                  value={form.gradoInstruccionId}
                  onChange={(e) => updateForm("gradoInstruccionId", e.target.value)}
                  className="w-full rounded-xl border px-4 py-3"
                >
                  <option value="">Seleccione</option>
                  {gradosInstruccion.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>

                <Field
                  label="Inicio estudios"
                  type="date"
                  value={form.tiempoEstudiosInicio}
                  onChange={(v) => updateForm("tiempoEstudiosInicio", v)}
                />

                <Field
                  label="Fin estudios"
                  type="date"
                  value={form.tiempoEstudiosFin}
                  onChange={(v) => updateForm("tiempoEstudiosFin", v)}
                />
              </div>

              <Field
                label="Institución"
                value={form.institucionEgreso}
                onChange={(v) => updateForm("institucionEgreso", v)}
              />
            </div>
          </AccordionCard>

          <AccordionCard
            title="Experiencia profesional"
            subtitle="Resumen del perfil, trayectoria y área de especialidad"
            open={openSections.experiencia}
            onToggle={() => toggleSection("experiencia")}
            rightNode={
              <SmallStatusPill
                complete={
                  !!form.aniosExperiencia &&
                  !!form.sectorExperiencia &&
                  !!form.perfilProfesional
                }
              />
            }
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Años de experiencia"
                  value={form.aniosExperiencia}
                  onChange={(v) =>
                    updateForm("aniosExperiencia", v.replace(/[^\d]/g, ""))
                  }
                  placeholder="Solo números"
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Sector de experiencia
                  </label>
                  <select
                    value={form.sectorExperiencia}
                    onChange={(e) => updateForm("sectorExperiencia", e.target.value)}
                    className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-indigo-400"
                  >
                    <option value="">Seleccione</option>
                    <option value="Educación">Educación</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Salud">Salud</option>
                    <option value="Administración">Administración</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              <Field
                label="Experiencia resumida"
                value={form.experiencia}
                onChange={(v) => updateForm("experiencia", v)}
                placeholder="Ej. Docencia universitaria, coordinación académica, consultoría..."
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Perfil profesional
                </label>
                <textarea
                  value={form.perfilProfesional}
                  onChange={(e) => updateForm("perfilProfesional", e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-indigo-400"
                  placeholder="Describe de forma breve y profesional la experiencia y fortalezas del docente."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => updateForm("bio", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-indigo-400"
                  placeholder="Texto corto de presentación."
                />
              </div>
            </div>
          </AccordionCard>

          <AccordionCard
            title="Documentos e historial"
            subtitle="Archivos del docente y experiencia registrada"
            open={openSections.documentos}
            onToggle={() => toggleSection("documentos")}
          >
            <PerfilDocumentosHistorial
              documentos={documentos}
              setDocumentos={setDocumentos}
              historial={historial}
              setHistorial={setHistorial}
              showMessage={showMessage}
            />
          </AccordionCard>

          <AccordionCard
            title="Cursos y capacitaciones"
            subtitle="Agrega cursos complementarios, constancias y certificados"
            open={openSections.cursos}
            onToggle={() => toggleSection("cursos")}
          >
            <PerfilCursosCapacitaciones
              mostrarFormCursoExtra={mostrarFormCursoExtra}
              setMostrarFormCursoExtra={setMostrarFormCursoExtra}
              nuevoCurso={nuevoCurso}
              updateNuevoCurso={updateNuevoCurso}
              limpiarFormCurso={limpiarFormCurso}
              agregarCursoExtraLocal={agregarCursoExtraLocal}
              guardandoCursoExtra={guardandoCursoExtra}
              cursosExtra={cursosExtra}
              eliminarCursoExtra={eliminarCursoExtra}
            />
          </AccordionCard>

          <AccordionCard
            title="Contraseña"
            subtitle="Actualiza tu contraseña de acceso"
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
                  <li>• Combina letras, números y símbolos si es posible.</li>
                  <li>• Evita usar datos personales fáciles de adivinar.</li>
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
                  {guardandoPassword ? "Actualizando..." : "Actualizar contraseña"}
                </button>
              </div>
            </div>
          </AccordionCard>

          <div className="sticky bottom-4 flex justify-end">
            <button
              type="button"
              onClick={guardarCambios}
              disabled={guardando || subiendoFoto}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, loading = false }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-200/80">
        {label}
      </div>
      {loading ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-white/20" />
      ) : (
        <div className="mt-1 text-2xl font-bold text-white">{value}</div>
      )}
    </div>
  );
}

function SmallStatusPill({ complete = false }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        complete
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {complete ? "Completo" : "Pendiente"}
    </span>
  );
}

function NavBtn({ text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      {text}
    </button>
  );
}

function AccordionCard({
  title,
  subtitle,
  open,
  onToggle,
  children,
  rightNode = null,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {rightNode}
          <div className="rounded-full border border-slate-200 p-1 text-slate-500">
            <ChevronIcon open={open} />
          </div>
        </div>
      </button>

      {open && <div className="border-t border-slate-100 px-5 py-5">{children}</div>}
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
        className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-indigo-400 ${
          disabled ? "bg-slate-100 text-slate-500" : "bg-white"
        }`}
      />
    </div>
  );
}

function InfoMiniCard({ label, value, help }) {
  return (
    <div className="rounded-xl border p-3 bg-white">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold">{value}</p>
      <p className="text-xs text-gray-500">{help}</p>
    </div>
  );
}

function ChecklistItem({ done, text }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={done ? "text-green-500" : "text-yellow-500"}>
        ●
      </span>
      {text}
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

export default PerfilDocente;