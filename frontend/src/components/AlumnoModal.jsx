import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { crearAlumno, actualizarAlumno } from "../services/alumno.service";
import { matricularAlumno } from "../services/matricula.service";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  AlertTriangle,
  BookPlus,
  Loader2,
  Search,
  X,
  UserPlus,
} from "lucide-react";

const regexContrasenia =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const alumnoSchema = z
  .object({
    nombre: z
      .string()
      .min(1, "El nombre es obligatorio")
      .min(2, "Mínimo 2 caracteres"),
    apellido: z
      .string()
      .min(1, "El apellido es obligatorio")
      .min(2, "Mínimo 2 caracteres"),
    tipodocumento: z.enum(["DNI", "Pasaporte", "Carnet Extranjería"]),
    numdocumento: z.string().min(1, "El número de documento es obligatorio"),
    prefijo: z.string().regex(/^\+\d{1,4}$/, "Prefijo inválido (Ej: +51)"),
    telefono: z
      .string()
      .min(6, "El número es muy corto")
      .max(15, "El número es muy largo")
      .regex(/^\d+$/, "Ingresa solo números"),
    correo: z.string().email("El correo electrónico no es válido"),
    direccion: z.string().optional(),
    lugar_residencia: z.string().optional(),
    departamento: z.string().optional(),
    provincia: z.string().optional(),
    distrito: z.string().optional(),
    estado_civil: z.string().optional(),

    isEditing: z.boolean(),
    contrasenia: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipodocumento === "DNI" && !/^\d{8}$/.test(data.numdocumento)) {
      ctx.addIssue({
        path: ["numdocumento"],
        code: z.ZodIssueCode.custom,
        message: "El DNI debe tener 8 dígitos",
      });
    }

    if (
      data.tipodocumento === "Pasaporte" &&
      (data.numdocumento.length < 8 || data.numdocumento.length > 12)
    ) {
      ctx.addIssue({
        path: ["numdocumento"],
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

export default function AlumnoModal({ onClose, onSuccess, alumnoEditar }) {
  const [step, setStep] = useState(1);
  const [alumnoCreado, setAlumnoCreado] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [cursos, setCursos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [busquedaCurso, setBusquedaCurso] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [mostrarDropdownCursos, setMostrarDropdownCursos] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [isLoadingCursos, setIsLoadingCursos] = useState(false);
  const [isLoadingGrupos, setIsLoadingGrupos] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(alumnoSchema),
    mode: "onChange",
    defaultValues: {
      nombre: "",
      apellido: "",
      tipodocumento: "DNI",
      numdocumento: "",
      telefono: "",
      correo: "",
      direccion: "",
      lugar_residencia: "",
      departamento: "",
      provincia: "",
      distrito: "",
      estado_civil: "Soltero(a)",
      isEditing: !!alumnoEditar,
      contrasenia: "",
      prefijo: "+51",
    },
  });

  const tipoDocumentoActual = watch("tipodocumento");

  useEffect(() => {
    if (alumnoEditar) {
      reset({
        ...alumnoEditar,
        telefono: String(alumnoEditar.telefono || "").replace(/[^\d]/g, ""),
        direccion: alumnoEditar.direccion || "",
        lugar_residencia: alumnoEditar.lugar_residencia || "",
        departamento: alumnoEditar.departamento || "",
        provincia: alumnoEditar.provincia || "",
        distrito: alumnoEditar.distrito || "",
        estado_civil: alumnoEditar.estado_civil || "Soltero(a)",
        isEditing: true,
        contrasenia: "",
        prefijo: "+51",
      });
    }
  }, [alumnoEditar, reset]);

  useEffect(() => {
    if (!alumnoEditar) setValue("numdocumento", "");
  }, [tipoDocumentoActual, setValue, alumnoEditar]);

  useEffect(() => {
    if (step === 2) {
      const cargarCursos = async () => {
        setIsLoadingCursos(true);

        try {
          const response = await api.get("/curso");
          setCursos(response.data.filter((c) => c.estado !== false));
        } catch (error) {
          console.error("Error al cargar cursos", error);
          toast.error("Error al cargar cursos");
        } finally {
          setIsLoadingCursos(false);
        }
      };

      cargarCursos();
    }
  }, [step]);

  useEffect(() => {
    if (!cursoSeleccionado) {
      setGrupos([]);
      setGrupoSeleccionado("");
      return;
    }

    const cargarGrupos = async () => {
      setIsLoadingGrupos(true);

      try {
        const response = await api.get(`/grupo/curso/${cursoSeleccionado}`);
        setGrupos(response.data);
      } catch (error) {
        console.error("Error al cargar grupos", error);
        toast.error("Error al cargar grupos");
      } finally {
        setIsLoadingGrupos(false);
      }
    };

    cargarGrupos();
  }, [cursoSeleccionado]);

  const cursosFiltrados = cursos.filter((curso) => {
    const textoCurso = curso.nombrecurso || `Curso #${curso.id}`;
    return textoCurso.toLowerCase().includes(busquedaCurso.toLowerCase());
  });

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

      if (alumnoEditar) {
        delete dataToSend.contrasenia;
        delete dataToSend.crearUsuario;

        await actualizarAlumno(alumnoEditar.id, dataToSend);

        toast.success("Alumno actualizado correctamente");
        onSuccess();
        onClose();
      } else {
        dataToSend.crearUsuario = true;

        const nuevoAlumno = await crearAlumno(dataToSend);

        toast.success("Alumno y credenciales creados exitosamente");
        setAlumnoCreado(nuevoAlumno);
        setStep(2);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Ocurrió un error al guardar el alumno"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatricular = async () => {
    if (!cursoSeleccionado || !grupoSeleccionado) {
      return toast.error("Por favor, selecciona un curso y un grupo");
    }

    const cursoObjeto = cursos.find(
      (c) => c.id.toString() === cursoSeleccionado
    );

    if (!cursoObjeto) return toast.error("Curso no válido");

    setIsLoading(true);

    try {
      await matricularAlumno(
        alumnoCreado.id,
        parseInt(grupoSeleccionado),
        cursoObjeto.nombrecurso
      );

      toast.success("Alumno matriculado exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al matricular alumno"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOmitirMatricula = () => {
    toast.success("Creación finalizada sin matrícula");
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
      <div className="max-h-[95vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl animate-fadeIn">
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-6 text-white"
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
                  ? alumnoEditar
                    ? "Editar Alumno"
                    : "Registrar Nuevo Alumno"
                  : "Matricular Alumno"}
              </h2>

              <p className="mt-1 text-sm text-white/75">
                {step === 1
                  ? "Completa los datos personales y de acceso."
                  : "Selecciona curso y grupo para completar la matrícula."}
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

        <div className="max-h-[calc(95vh-96px)] overflow-y-auto p-8">
          {/* Creación / edición de alumno */}
          {step === 1 && (
            <form onSubmit={handleSubmit(onSubmitPaso1)} onKeyUp={handleKeyUp}>
              <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
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

                <Campo label="Tipo Documento" error={errors.tipodocumento}>
                  <select
                    {...register("tipodocumento")}
                    className={getInputClass(errors.tipodocumento)}
                  >
                    <option value="DNI">DNI</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Carnet Extranjería">
                      Carnet Extranjería
                    </option>
                  </select>
                </Campo>

                <Campo label="N° Documento *" error={errors.numdocumento}>
                  <input
                    type="text"
                    {...register("numdocumento")}
                    onChange={(e) => {
                      let val = e.target.value;

                      if (tipoDocumentoActual === "DNI")
                        val = val.replace(/\D/g, "").slice(0, 8);
                      else if (tipoDocumentoActual === "Carnet Extranjería")
                        val = val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 9);
                      else if (tipoDocumentoActual === "Pasaporte")
                        val = val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);

                      setValue("numdocumento", val, { shouldValidate: true });
                    }}
                    className={getInputClass(errors.numdocumento)}
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
                        if (!val.startsWith("+"))
                          val = "+" + val.replace(/\+/g, "");

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

                <Campo label="Estado Civil" error={errors.estado_civil}>
                  <select
                    {...register("estado_civil")}
                    className={getInputClass(errors.estado_civil)}
                  >
                    <option value="Soltero(a)">Soltero(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viudo(a)">Viudo(a)</option>
                  </select>
                </Campo>

                <Campo label="Departamento" error={errors.departamento}>
                  <input
                    type="text"
                    {...register("departamento")}
                    className={getInputClass(errors.departamento)}
                  />
                </Campo>

                <Campo label="Provincia" error={errors.provincia}>
                  <input
                    type="text"
                    {...register("provincia")}
                    className={getInputClass(errors.provincia)}
                  />
                </Campo>

                <Campo label="Distrito" error={errors.distrito}>
                  <input
                    type="text"
                    {...register("distrito")}
                    className={getInputClass(errors.distrito)}
                  />
                </Campo>

                <div className="md:col-span-2">
                  <Campo
                    label="Lugar de Residencia (Detalle)"
                    error={errors.lugar_residencia}
                  >
                    <input
                      type="text"
                      {...register("lugar_residencia")}
                      placeholder="Ej: Urb. Las Flores"
                      className={getInputClass(errors.lugar_residencia)}
                    />
                  </Campo>
                </div>

                <div className="md:col-span-2">
                  <Campo label="Dirección Exacta" error={errors.direccion}>
                    <input
                      type="text"
                      {...register("direccion")}
                      placeholder="Av. Principal 123"
                      className={getInputClass(errors.direccion)}
                    />
                  </Campo>
                </div>

                {!alumnoEditar && (
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
                  className="rounded-xl px-5 py-2.5 font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-[var(--color-button-primary)] px-6 py-2.5 font-semibold text-[var(--color-button-primary-text)] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading && <Loader2 size={18} className="animate-spin" />}
                  {isLoading
                    ? "Procesando..."
                    : alumnoEditar
                    ? "Actualizar Alumno"
                    : "Guardar y Continuar"}
                </button>
              </div>
            </form>
          )}

          {/* Matrícula Alumno */}
          {step === 2 && alumnoCreado && (
            <div className="animate-fadeIn">
              <div className="mb-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                <p className="text-[var(--color-muted-text)]">
                  Alumno{" "}
                  <span className="font-black text-[var(--color-primary)]">
                    {alumnoCreado.nombre}
                  </span>{" "}
                  registrado con éxito. Si deseas matricularlo ahora, busca un
                  curso y selecciona el grupo.
                </p>
              </div>

              <div className="mb-10 space-y-6">
                <div className="relative">
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text)]">
                    1. Busca y selecciona el curso
                  </label>

                  <div
                    className={`flex items-center rounded-2xl border px-3 py-3 transition-all ${
                      mostrarDropdownCursos
                        ? "border-[var(--color-primary)] bg-[var(--color-card)] ring-4 ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
                        : "border-[var(--color-border)] bg-[var(--color-background)]"
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
                    <div className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl">
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

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text)]">
                    2. Selecciona el grupo
                  </label>

                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
                      value={grupoSeleccionado}
                      onChange={(e) => setGrupoSeleccionado(e.target.value)}
                      disabled={
                        !cursoSeleccionado ||
                        isLoadingGrupos ||
                        grupos.length === 0
                      }
                    >
                      <option value="">
                        {!cursoSeleccionado
                          ? "Primero elige un curso arriba"
                          : grupos.length === 0 && !isLoadingGrupos
                          ? "No hay grupos disponibles para este curso"
                          : "-- Elige un grupo --"}
                      </option>

                      {grupos.map((grupo) => (
                        <option key={grupo.id} value={grupo.id}>
                          {grupo.nombregrupo}{" "}
                          {grupo.horario && `(${grupo.horario})`}
                        </option>
                      ))}
                    </select>

                    {isLoadingGrupos && (
                      <Loader2
                        size={16}
                        className="absolute right-3 top-3.5 animate-spin text-[var(--color-primary)]"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 border-t border-[var(--color-border)] pt-6">
                <button
                  type="button"
                  onClick={handleOmitirMatricula}
                  disabled={isLoading}
                  className="rounded-xl px-6 py-2.5 font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] disabled:opacity-60"
                >
                  Omitir Matrícula
                </button>

                <button
                  type="button"
                  onClick={handleMatricular}
                  disabled={isLoading || !grupoSeleccionado}
                  className="flex min-w-[190px] items-center justify-center gap-2 rounded-xl bg-[var(--color-button-primary)] px-7 py-2.5 font-semibold text-[var(--color-button-primary-text)] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading && <Loader2 size={18} className="animate-spin" />}
                  {isLoading ? "Procesando..." : "Matricular y Finalizar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
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