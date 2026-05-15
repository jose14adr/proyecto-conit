import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { crearDocente, actualizarDocente } from "../services/docente.service";
import { obtenerCurso } from "../services/curso.service";
import {
  obtenerGruposPorCurso,
  asignarDocenteAGrupo,
} from "../services/grupo.service";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  AlertTriangle,
  BookOpen,
  Loader2,
  Search,
  Key,
  X,
  UserPlus,
  BookPlus,
  Save,
} from "lucide-react";

const regexContrasenia =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const docenteSchema = z
  .object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    apellido: z.string().min(1, "El apellido es obligatorio"),
    tipoDocumento: z.enum(["DNI", "Pasaporte", "Carnet Extranjería"]),
    numDocumento: z.string().min(1, "El número de documento es obligatorio"),
    prefijo: z.string().regex(/^\+\d{1,4}$/, "Prefijo inválido (Ej: +51)"),
    telefono: z
      .string()
      .min(6, "El número es muy corto")
      .max(15, "El número es muy largo")
      .regex(/^\d+$/, "Ingresa solo números"),
    correo: z.string().email("Ingresa un correo electrónico válido"),
    direccion: z.string().min(1, "La dirección es obligatoria"),
    titulo: z.string().optional(),
    experiencia: z.string().optional(),
    bio: z.string().optional(),
    contacto_emergencia_nombre: z.string().optional(),
    contacto_emergencia_telefono: z.string().optional(),
    isEditing: z.boolean(),
    contrasenia: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipoDocumento === "DNI" && !/^\d{8}$/.test(data.numDocumento)) {
      ctx.addIssue({
        path: ["numDocumento"],
        code: z.ZodIssueCode.custom,
        message: "El DNI debe tener 8 dígitos",
      });
    }

    if (
      data.tipoDocumento === "Carnet Extranjería" &&
      !/^[a-zA-Z0-9]{1,9}$/.test(data.numDocumento)
    ) {
      ctx.addIssue({
        path: ["numDocumento"],
        code: z.ZodIssueCode.custom,
        message: "Máximo 9 caracteres",
      });
    }

    if (
      data.tipoDocumento === "Pasaporte" &&
      (data.numDocumento.length < 8 || data.numDocumento.length > 12)
    ) {
      ctx.addIssue({
        path: ["numDocumento"],
        code: z.ZodIssueCode.custom,
        message: "Entre 8 y 12 caracteres",
      });
    }

    if (!data.isEditing) {
      if (!data.contrasenia) {
        ctx.addIssue({
          path: ["contrasenia"],
          code: z.ZodIssueCode.custom,
          message: "La contraseña es obligatoria para crear el usuario",
        });
      } else if (!regexContrasenia.test(data.contrasenia)) {
        ctx.addIssue({
          path: ["contrasenia"],
          code: z.ZodIssueCode.custom,
          message:
            "Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial",
        });
      }
    }
  });

export default function DocenteModal({ onClose, onSuccess, docenteEditar }) {
  const [step, setStep] = useState(1);
  const [docenteCreado, setDocenteCreado] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [cursosBD, setCursosBD] = useState([]);
  const [gruposBD, setGruposBD] = useState([]);

  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");

  const [isLoadingCursos, setIsLoadingCursos] = useState(false);
  const [isLoadingGrupos, setIsLoadingGrupos] = useState(false);

  const [busquedaCurso, setBusquedaCurso] = useState("");
  const [mostrarDropdownCursos, setMostrarDropdownCursos] = useState(false);

  const [permisos, setPermisos] = useState({
    control_total: false,
    tomar_asistencia: true,
    crear_tareas: false,
    modificar_modulos: false,
    modificar_notas: false,
    cargar_notas: true,
    enviar_mensajes: false,
  });

  const cursosFiltrados = cursosBD.filter((curso) => {
    const textoCurso = curso.nombrecurso || `Curso #${curso.id}`;
    return textoCurso.toLowerCase().includes(busquedaCurso.toLowerCase());
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(docenteSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      tipoDocumento: "DNI",
      telefono: "",
      direccion: "",
      correo: "",
      numDocumento: "",
      titulo: "",
      experiencia: "",
      bio: "",
      contacto_emergencia_nombre: "",
      contacto_emergencia_telefono: "",
      isEditing: !!docenteEditar,
      contrasenia: "",
      prefijo: "+51",
    },
  });

  const tipoDocumentoActual = watch("tipoDocumento");

  useEffect(() => {
    if (docenteEditar) {
      reset({
        nombre: docenteEditar.nombre || "",
        apellido: docenteEditar.apellido || "",
        tipoDocumento:
          docenteEditar.tipoDocumento || docenteEditar.tipodocumento || "DNI",
        numDocumento:
          docenteEditar.numDocumento || docenteEditar.numdocumento || "",
        telefono: String(docenteEditar.telefono || "").replace(/[^\d]/g, ""),
        direccion: docenteEditar.direccion || "",
        correo: docenteEditar.correo || "",
        titulo: docenteEditar.titulo || "",
        experiencia:
          docenteEditar.experiencia || docenteEditar.perfil_profesional || "",
        bio: docenteEditar.bio || "",
        contacto_emergencia_nombre:
          docenteEditar.contacto_emergencia_nombre || "",
        contacto_emergencia_telefono:
          docenteEditar.contacto_emergencia_telefono || "",
        isEditing: true,
        contrasenia: "",
        prefijo: "+51",
      });
    }
  }, [docenteEditar, reset]);

  useEffect(() => {
    if (!docenteEditar) {
      setValue("numDocumento", "");
    }
  }, [tipoDocumentoActual, setValue, docenteEditar]);

  useEffect(() => {
    if (step === 2) {
      const fetchCursos = async () => {
        try {
          setIsLoadingCursos(true);

          const data = await obtenerCurso();

          setCursosBD(
            Array.isArray(data)
              ? data.filter((c) =>
                  c.estado !== true && c.estado !== false ? true : c.estado
                )
              : []
          );
        } catch (error) {
          console.error(error);
          toast.error("Error al cargar los cursos");
        } finally {
          setIsLoadingCursos(false);
        }
      };

      fetchCursos();
    }
  }, [step]);

  useEffect(() => {
    if (cursoSeleccionado) {
      const fetchGrupos = async () => {
        try {
          setIsLoadingGrupos(true);
          setGrupoSeleccionado("");

          const data = await obtenerGruposPorCurso(cursoSeleccionado);
          setGruposBD(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error(error);
          toast.error("Error al cargar los grupos de este curso");
        } finally {
          setIsLoadingGrupos(false);
        }
      };

      fetchGrupos();
    } else {
      setGruposBD([]);
      setGrupoSeleccionado("");
    }
  }, [cursoSeleccionado]);

  const handleKeyUp = (e) => {
    if (e.getModifierState("CapsLock")) setCapsLockOn(true);
    else setCapsLockOn(false);
  };

  const onSubmitPaso1 = async (data) => {
    try {
      setIsLoading(true);

      const dataToSend = { ...data };
      dataToSend.telefono = `${data.prefijo} ${data.telefono}`;

      delete dataToSend.prefijo;
      delete dataToSend.isEditing;

      if (docenteEditar) {
        delete dataToSend.crearUsuario;
        delete dataToSend.contrasenia;

        await actualizarDocente(docenteEditar.id, dataToSend);

        toast.success("Docente actualizado correctamente");
        onSuccess();
        onClose();
      } else {
        dataToSend.crearUsuario = true;

        const nuevoDocente = await crearDocente(dataToSend);

        toast.success("Docente y credenciales creados exitosamente");
        setDocenteCreado(nuevoDocente);
        setStep(2);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Ocurrió un error al guardar el docente"
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermisoChange = (e) => {
    const { name, checked } = e.target;

    if (name === "control_total") {
      setPermisos({
        control_total: checked,
        tomar_asistencia: checked,
        crear_tareas: checked,
        modificar_modulos: checked,
        modificar_notas: checked,
        cargar_notas: checked,
        enviar_mensajes: checked,
      });
    } else {
      setPermisos((prev) => {
        const next = { ...prev, [name]: checked };

        if (!checked) next.control_total = false;

        const todosMarcados = [
          "tomar_asistencia",
          "crear_tareas",
          "modificar_modulos",
          "modificar_notas",
          "cargar_notas",
          "enviar_mensajes",
        ].every((k) => next[k]);

        if (todosMarcados) next.control_total = true;

        return next;
      });
    }
  };

  const handleAsignarCurso = async () => {
    if (!grupoSeleccionado) {
      toast.error("Debes seleccionar un grupo para hacer la asignación.");
      return;
    }

    try {
      setIsLoading(true);

      await asignarDocenteAGrupo(grupoSeleccionado, docenteCreado.id, permisos);

      toast.success("Docente asignado al grupo con sus permisos exitosamente");

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al intentar asignar el grupo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOmitirAsignacion = () => {
    toast.success("Creación finalizada sin carga académica");
    onSuccess();
    onClose();
  };

  const getInputClass = (error, hasPrefix = false) => {
    const baseClass =
      "w-full border px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted-text)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

    const roundedClass = hasPrefix
      ? "rounded-r-2xl border-l-0"
      : "rounded-2xl mt-1";

    return `${baseClass} ${roundedClass} ${
      error
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-[var(--color-border)] bg-[var(--color-background)] focus:border-[var(--color-primary)]"
    }`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl animate-fadeIn">
        {/* HEADER */}
        <div
          className="flex shrink-0 items-center justify-between px-8 py-6 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-2 backdrop-blur-sm">
              {step === 1 ? <UserPlus size={24} /> : <BookPlus size={24} />}
            </div>

            <div>
              <h2 className="text-2xl font-black">
                {step === 1
                  ? docenteEditar
                    ? "Editar Docente"
                    : "Registrar Nuevo Docente"
                  : "Asignar Carga Académica"}
              </h2>

              <p className="mt-1 text-sm text-white/75">
                {step === 1
                  ? "Completa los datos personales, profesionales y de acceso."
                  : "Selecciona curso, grupo y permisos iniciales del docente."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-white/20"
            title="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[var(--color-background)] p-8">
          {step === 1 && (
            <form onSubmit={handleSubmit(onSubmitPaso1)} onKeyUp={handleKeyUp}>
              <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
                <SectionTitle title="Datos personales y contacto" />

                <Campo label="Nombre *" error={errors.nombre}>
                  <input
                    type="text"
                    {...register("nombre")}
                    onChange={(e) =>
                      setValue(
                        "nombre",
                        e.target.value.replace(
                          /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                          ""
                        ),
                        { shouldValidate: true }
                      )
                    }
                    className={getInputClass(errors.nombre)}
                  />
                </Campo>

                <Campo label="Apellido *" error={errors.apellido}>
                  <input
                    type="text"
                    {...register("apellido")}
                    onChange={(e) =>
                      setValue(
                        "apellido",
                        e.target.value.replace(
                          /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                          ""
                        ),
                        { shouldValidate: true }
                      )
                    }
                    className={getInputClass(errors.apellido)}
                  />
                </Campo>

                <Campo label="Tipo Documento" error={errors.tipoDocumento}>
                  <select
                    {...register("tipoDocumento")}
                    className={getInputClass(errors.tipoDocumento)}
                  >
                    <option value="DNI">DNI</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Carnet Extranjería">
                      Carnet Extranjería
                    </option>
                  </select>
                </Campo>

                <Campo label="N° Documento *" error={errors.numDocumento}>
                  <input
                    type="text"
                    {...register("numDocumento")}
                    onChange={(e) => {
                      let val = e.target.value;

                      if (tipoDocumentoActual === "DNI") {
                        val = val.replace(/\D/g, "").slice(0, 8);
                      } else if (tipoDocumentoActual === "Carnet Extranjería") {
                        val = val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 9);
                      } else if (tipoDocumentoActual === "Pasaporte") {
                        val = val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
                      }

                      setValue("numDocumento", val, {
                        shouldValidate: true,
                      });
                    }}
                    className={getInputClass(errors.numDocumento)}
                  />
                </Campo>

                <Campo label="Correo Electrónico *" error={errors.correo}>
                  <input
                    type="email"
                    {...register("correo")}
                    className={getInputClass(errors.correo)}
                  />
                </Campo>

                <div>
                  <label className="text-sm font-semibold text-[var(--color-text)]">
                    Celular / Teléfono *
                  </label>

                  <div className="mt-1 flex">
                    <input
                      type="text"
                      placeholder="+51"
                      {...register("prefijo")}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^\d+]/g, "");

                        if (!val.startsWith("+")) {
                          val = "+" + val.replace(/\+/g, "");
                        }

                        setValue("prefijo", val.slice(0, 5), {
                          shouldValidate: true,
                        });
                      }}
                      className={`w-20 rounded-l-2xl border border-r-0 px-2 text-center text-sm font-semibold text-[var(--color-text)] outline-none transition ${
                        errors.prefijo
                          ? "border-red-400 bg-red-50"
                          : "border-[var(--color-border)] bg-[var(--color-background)] focus:border-[var(--color-primary)]"
                      }`}
                    />

                    <input
                      type="text"
                      placeholder="Número..."
                      {...register("telefono")}
                      onChange={(e) =>
                        setValue(
                          "telefono",
                          e.target.value.replace(/\D/g, ""),
                          { shouldValidate: true }
                        )
                      }
                      className={getInputClass(errors.telefono, true)}
                    />
                  </div>

                  {(errors.prefijo || errors.telefono) && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.prefijo?.message || errors.telefono?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Campo label="Dirección *" error={errors.direccion}>
                    <input
                      type="text"
                      {...register("direccion")}
                      className={getInputClass(errors.direccion)}
                    />
                  </Campo>
                </div>

                <SectionTitle title="Perfil profesional" />

                <Campo label="Grado Académico / Título" error={errors.titulo}>
                  <input
                    type="text"
                    {...register("titulo")}
                    className={getInputClass(errors.titulo)}
                  />
                </Campo>

                <Campo label="Experiencia Laboral" error={errors.experiencia}>
                  <input
                    type="text"
                    {...register("experiencia")}
                    className={getInputClass(errors.experiencia)}
                  />
                </Campo>

                <div className="md:col-span-2">
                  <Campo label="Biografía breve" error={errors.bio}>
                    <textarea
                      rows={2}
                      {...register("bio")}
                      className={`${getInputClass(errors.bio)} resize-none`}
                    />
                  </Campo>
                </div>

                <SectionTitle title="Contacto de emergencia" />

                <Campo
                  label="Nombre de Contacto"
                  error={errors.contacto_emergencia_nombre}
                >
                  <input
                    type="text"
                    {...register("contacto_emergencia_nombre")}
                    className={getInputClass(
                      errors.contacto_emergencia_nombre
                    )}
                  />
                </Campo>

                <Campo
                  label="Teléfono de Emergencia"
                  error={errors.contacto_emergencia_telefono}
                >
                  <input
                    type="text"
                    {...register("contacto_emergencia_telefono")}
                    className={getInputClass(
                      errors.contacto_emergencia_telefono
                    )}
                  />
                </Campo>

                {!docenteEditar && (
                  <div className="md:col-span-2 rounded-3xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] p-5">
                    <h3 className="mb-1 flex items-center gap-2 font-black text-[var(--color-text)]">
                      Credenciales de Acceso
                    </h3>

                    <p className="mb-4 text-xs font-medium text-[var(--color-muted-text)]">
                      Se creará automáticamente un usuario con el correo
                      ingresado.
                    </p>

                    <label className="mb-1 block text-sm font-semibold text-[var(--color-text)]">
                      Contraseña de acceso *
                    </label>

                    <div className="relative mt-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("contrasenia")}
                        className={getInputClass(errors.contrasenia)}
                        placeholder="Ej: P@ssw0rd123"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-text)] transition hover:text-[var(--color-primary)]"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>

                    {capsLockOn && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-orange-500">
                        <AlertTriangle size={14} />
                        Bloq Mayús activado
                      </p>
                    )}

                    {errors.contrasenia && (
                      <p className="mt-1 text-xs font-medium text-red-500">
                        {errors.contrasenia.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-4 border-t border-[var(--color-border)] pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="rounded-xl px-5 py-2.5 font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-card)] disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex min-w-[190px] items-center justify-center gap-2 rounded-xl bg-[var(--color-button-primary)] px-6 py-2.5 font-semibold text-[var(--color-button-primary-text)] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Procesando...
                    </>
                  ) : docenteEditar ? (
                    <>
                      <Save size={18} />
                      Actualizar Docente
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Guardar y Continuar
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 2 && docenteCreado && (
            <div className="animate-fadeIn">
              <div className="mb-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
                <h3 className="mb-2 flex items-center gap-2 text-xl font-black text-[var(--color-text)]">
                  <BookOpen className="text-[var(--color-primary)]" size={24} />
                  Asignar Carga Académica
                </h3>

                <p className="text-[var(--color-muted-text)]">
                  Docente{" "}
                  <span className="font-black text-[var(--color-primary)]">
                    {docenteCreado.nombre}
                  </span>{" "}
                  creado con éxito. Puedes asignarle un grupo ahora o continuar
                  sin asignación.
                </p>
              </div>

              <div className="mb-8 space-y-6">
                <div className="relative">
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text)]">
                    1. Busca y selecciona el curso
                  </label>

                  <div
                    className={`flex items-center rounded-2xl border px-3 py-3 transition-all ${
                      mostrarDropdownCursos
                        ? "border-[var(--color-primary)] bg-[var(--color-card)] ring-4 ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
                        : "border-[var(--color-border)] bg-[var(--color-card)]"
                    }`}
                  >
                    <Search
                      size={18}
                      className="mr-2 shrink-0 text-[var(--color-muted-text)]"
                    />

                    <input
                      type="text"
                      className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted-text)]"
                      placeholder="Escribe el nombre del curso..."
                      value={busquedaCurso}
                      onChange={(e) => {
                        setBusquedaCurso(e.target.value);
                        setMostrarDropdownCursos(true);
                        setCursoSeleccionado("");
                        setGrupoSeleccionado("");
                      }}
                      onFocus={() => setMostrarDropdownCursos(true)}
                      onBlur={() =>
                        setTimeout(() => setMostrarDropdownCursos(false), 200)
                      }
                    />

                    {isLoadingCursos && (
                      <Loader2
                        size={16}
                        className="shrink-0 animate-spin text-[var(--color-primary)]"
                      />
                    )}
                  </div>

                  {mostrarDropdownCursos && (
                    <div className="absolute z-50 mt-2 max-h-48 w-full overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl">
                      {cursosFiltrados.length === 0 ? (
                        <div className="p-3 text-center text-sm text-[var(--color-muted-text)]">
                          No se encontraron cursos
                        </div>
                      ) : (
                        cursosFiltrados.map((curso) => {
                          const nombreVisible =
                            curso.nombrecurso || `Curso #${curso.id}`;

                          return (
                            <button
                              key={curso.id}
                              type="button"
                              className="w-full border-b border-[var(--color-border)] px-4 py-3 text-left text-sm text-[var(--color-text)] transition last:border-0 hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
                              onClick={() => {
                                setCursoSeleccionado(curso.id.toString());
                                setBusquedaCurso(nombreVisible);
                                setMostrarDropdownCursos(false);
                                setGrupoSeleccionado("");
                              }}
                            >
                              {nombreVisible}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {cursoSeleccionado && (
                  <div className="animate-fadeIn">
                    <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text)]">
                      2. Seleccionar grupo específico
                    </label>

                    <div className="relative">
                      <select
                        value={grupoSeleccionado}
                        onChange={(e) => setGrupoSeleccionado(e.target.value)}
                        disabled={isLoadingGrupos}
                        className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">-- Elige un grupo --</option>

                        {gruposBD.length === 0 && !isLoadingGrupos ? (
                          <option value="" disabled>
                            Este curso no tiene grupos creados
                          </option>
                        ) : (
                          gruposBD.map((grupo) => (
                            <option key={grupo.id} value={grupo.id}>
                              {grupo.nombregrupo} ({grupo.horario})
                            </option>
                          ))
                        )}
                      </select>

                      {isLoadingGrupos && (
                        <Loader2
                          className="absolute right-4 top-3.5 animate-spin text-[var(--color-primary)]"
                          size={20}
                        />
                      )}
                    </div>
                  </div>
                )}

                {grupoSeleccionado && (
                  <div className="animate-fadeIn overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
                    <div className="flex items-start gap-3 border-b border-[var(--color-border)] bg-[var(--color-background)] px-5 py-4">
                      <div className="shrink-0 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] p-2 text-[var(--color-primary)]">
                        <Key size={20} />
                      </div>

                      <div>
                        <h4 className="font-black text-[var(--color-text)]">
                          Permisos de docente para el grupo
                        </h4>

                        <p className="mt-0.5 text-sm text-[var(--color-muted-text)]">
                          Configura qué acciones podrá realizar este docente en
                          el grupo asignado.
                        </p>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="mb-4 border-b border-[var(--color-border)] pb-4">
                        <label className="group flex cursor-pointer items-center gap-3">
                          <SwitchInput
                            name="control_total"
                            checked={permisos.control_total}
                            onChange={handlePermisoChange}
                          />

                          <span className="font-black text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                            Control total
                          </span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <CheckPermiso
                          name="tomar_asistencia"
                          checked={permisos.tomar_asistencia}
                          onChange={handlePermisoChange}
                          label="Tomar asistencia"
                        />

                        <CheckPermiso
                          name="crear_tareas"
                          checked={permisos.crear_tareas}
                          onChange={handlePermisoChange}
                          label="Crear tareas"
                        />

                        <CheckPermiso
                          name="modificar_modulos"
                          checked={permisos.modificar_modulos}
                          onChange={handlePermisoChange}
                          label="Modificar módulos"
                        />

                        <CheckPermiso
                          name="modificar_notas"
                          checked={permisos.modificar_notas}
                          onChange={handlePermisoChange}
                          label="Modificar notas"
                        />

                        <CheckPermiso
                          name="cargar_notas"
                          checked={permisos.cargar_notas}
                          onChange={handlePermisoChange}
                          label="Cargar notas"
                        />

                        <CheckPermiso
                          name="enviar_mensajes"
                          checked={permisos.enviar_mensajes}
                          onChange={handlePermisoChange}
                          label="Enviar mensajes"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 border-t border-[var(--color-border)] pt-6">
                <button
                  type="button"
                  onClick={handleOmitirAsignacion}
                  disabled={isLoading}
                  className="rounded-xl px-6 py-2.5 font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-card)] disabled:opacity-60"
                >
                  Omitir Paso
                </button>

                <button
                  type="button"
                  onClick={handleAsignarCurso}
                  disabled={isLoading || !grupoSeleccionado}
                  className="flex min-w-[210px] items-center justify-center gap-2 rounded-xl bg-[var(--color-button-primary)] px-7 py-2.5 font-semibold text-[var(--color-button-primary-text)] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <BookPlus size={18} />
                      Asignar y Finalizar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <div className="md:col-span-2 mt-2">
      <h3 className="border-b border-[var(--color-border)] pb-2 font-black text-[var(--color-primary)]">
        {title}
      </h3>
    </div>
  );
}

function Campo({ label, error, children }) {
  return (
    <div>
      <label className="text-sm font-semibold text-[var(--color-text)]">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-xs font-medium text-red-500">
          {error.message}
        </p>
      )}
    </div>
  );
}

function SwitchInput({ name, checked, onChange }) {
  return (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />

      <div className="h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white" />
    </div>
  );
}

function CheckPermiso({ name, checked, onChange, label }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 cursor-pointer rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
      />

      <span className="font-medium text-[var(--color-muted-text)] group-hover:text-[var(--color-text)]">
        {label}
      </span>
    </label>
  );
}