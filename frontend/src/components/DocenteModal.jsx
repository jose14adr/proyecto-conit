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

  // NUEVO: Estado para los permisos del docente
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
        nombre: docenteEditar.nombre,
        apellido: docenteEditar.apellido,
        tipoDocumento:
          docenteEditar.tipoDocumento || docenteEditar.tipodocumento,
        numDocumento: docenteEditar.numDocumento || docenteEditar.numdocumento,
        telefono: String(docenteEditar.telefono),
        direccion: docenteEditar.direccion,
        correo: docenteEditar.correo,
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
            data.filter((c) =>
              c.estado !== true && c.estado !== false ? true : c.estado,
            ),
          );
        } catch (error) {
          toast.error("Error al cargar los cursos:", error);
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
          setGruposBD(data);
        } catch (error) {
          toast.error("Error al cargar los grupos de este curso", error);
        } finally {
          setIsLoadingGrupos(false);
        }
      };
      fetchGrupos();
    } else {
      setGruposBD([]);
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
          "Ocurrió un error al guardar el docente",
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // NUEVO: Función para manejar el cambio de los checkboxes de permisos
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
        // Si apagas alguno específico, se apaga el control total
        if (!checked) next.control_total = false;
        // Si por casualidad marcas todos manualmente, se marca el control total
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
      // OJO: Le pasamos los permisos en la petición (Asegúrate de que tu backend lo reciba)
      await asignarDocenteAGrupo(grupoSeleccionado, docenteCreado.id, permisos);
      toast.success(`Docente asignado al grupo con sus permisos exitosamente`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Ocurrió un error al intentar asignar el grupo", error);
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
      "w-full border p-2 focus:ring-2 outline-none transition-colors ";
    const roundedClass = hasPrefix
      ? "rounded-r-lg border-l-0"
      : "rounded-lg mt-1";
    return `${baseClass} ${roundedClass} ${
      error
        ? "border-red-500 focus:ring-red-500 bg-red-50"
        : "border-gray-300 focus:ring-indigo-600 bg-white"
    }`;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 py-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-8 animate-fadeIn max-h-[95vh] overflow-y-visible my-auto flex flex-col">
        {step === 1 && (
          <div className="overflow-y-auto pr-2">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {docenteEditar ? "Editar Docente" : "Registrar Nuevo Docente"}
            </h2>

            <form onSubmit={handleSubmit(onSubmitPaso1)} onKeyUp={handleKeyUp}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-indigo-600 mb-2 border-b pb-1">
                    Datos Personales y Contacto
                  </h3>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    {...register("nombre")}
                    onChange={(e) =>
                      setValue(
                        "nombre",
                        e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""),
                        { shouldValidate: true },
                      )
                    }
                    className={getInputClass(errors.nombre)}
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.nombre.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    {...register("apellido")}
                    onChange={(e) =>
                      setValue(
                        "apellido",
                        e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""),
                        { shouldValidate: true },
                      )
                    }
                    className={getInputClass(errors.apellido)}
                  />
                  {errors.apellido && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.apellido.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Tipo Documento
                  </label>
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
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    N° Documento *
                  </label>
                  <input
                    type="text"
                    {...register("numDocumento")}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (tipoDocumentoActual === "DNI")
                        val = val.replace(/\D/g, "").slice(0, 8);
                      else if (tipoDocumentoActual === "Carnet Extranjería")
                        val = val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 9);
                      else if (tipoDocumentoActual === "Pasaporte")
                        val = val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
                      setValue("numDocumento", val, { shouldValidate: true });
                    }}
                    className={getInputClass(errors.numDocumento)}
                  />
                  {errors.numDocumento && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.numDocumento.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    {...register("correo")}
                    className={getInputClass(errors.correo)}
                  />
                  {errors.correo && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.correo.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Celular / Teléfono *
                  </label>
                  <div className="flex mt-1">
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
                      className={`w-20 border border-r-0 rounded-l-lg px-2 bg-gray-50 text-gray-700 font-medium outline-none text-center transition-colors focus:bg-white ${
                        errors.prefijo
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-indigo-600"
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
                          { shouldValidate: true },
                        )
                      }
                      className={getInputClass(errors.telefono, true)}
                    />
                  </div>
                  {(errors.prefijo || errors.telefono) && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.prefijo?.message || errors.telefono?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600 font-medium">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    {...register("direccion")}
                    className={getInputClass(errors.direccion)}
                  />
                  {errors.direccion && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.direccion.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 mt-2">
                  <h3 className="font-semibold text-indigo-600 mb-2 border-b pb-1">
                    Perfil Profesional (Opcional)
                  </h3>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Grado Académico / Título
                  </label>
                  <input
                    type="text"
                    {...register("titulo")}
                    className={getInputClass(errors.titulo)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Experiencia Laboral
                  </label>
                  <input
                    type="text"
                    {...register("experiencia")}
                    className={getInputClass(errors.experiencia)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600 font-medium">
                    Biografía Breve
                  </label>
                  <textarea
                    rows={2}
                    {...register("bio")}
                    className={`${getInputClass(errors.bio)} resize-none`}
                  />
                </div>

                <div className="md:col-span-2 mt-2">
                  <h3 className="font-semibold text-indigo-600 mb-2 border-b pb-1">
                    Contacto de Emergencia (Opcional)
                  </h3>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Nombre de Contacto
                  </label>
                  <input
                    type="text"
                    {...register("contacto_emergencia_nombre")}
                    className={getInputClass(errors.contacto_emergencia_nombre)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Teléfono de Emergencia
                  </label>
                  <input
                    type="text"
                    {...register("contacto_emergencia_telefono")}
                    className={getInputClass(
                      errors.contacto_emergencia_telefono,
                    )}
                  />
                </div>

                {!docenteEditar && (
                  <div className="md:col-span-2 mt-4 bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                      Credenciales de Acceso
                    </h3>
                    <p className="text-xs text-blue-700 mb-4">
                      Se creará automáticamente un usuario con el correo
                      ingresado.
                    </p>

                    <label className="text-sm font-medium block mb-1 text-blue-900">
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {capsLockOn && (
                      <p className="text-orange-500 text-xs mt-1 flex items-center gap-1 font-medium">
                        <AlertTriangle size={14} /> Bloq Mayús activado
                      </p>
                    )}
                    {errors.contrasenia && (
                      <p className="text-red-500 text-xs mt-1 font-medium">
                        {errors.contrasenia.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-8 border-t pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-lg bg-[#5573b3] text-white hover:bg-[#344c92] shadow-md flex items-center justify-center min-w-[160px] font-semibold transition-colors"
                >
                  {isLoading
                    ? "Procesando..."
                    : docenteEditar
                      ? "Actualizar Docente"
                      : "Guardar y Continuar"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ASIGNACIÓN DE CURSO Y PERMISOS */}
        {step === 2 && docenteCreado && (
          <div className="animate-fadeIn overflow-y-auto pr-2">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-3">
              <BookOpen className="text-indigo-600" size={28} />
              Asignar Carga Académica
            </h2>

            <p className="text-gray-600 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100 font-medium">
              ¡Docente{" "}
              <span className="font-bold text-blue-800">
                {docenteCreado.nombre}
              </span>{" "}
              creado con éxito! <br />
              Selecciona primero el Curso, luego el Grupo y finalmente configura
              sus permisos.
            </p>

            <div className="space-y-6 mb-6">
              {/* BUSCADOR DE CURSOS */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  1. Busca y Selecciona el Curso
                </label>
                <div
                  className={`flex items-center border rounded-lg px-3 py-2 bg-gray-50 transition-all ${
                    mostrarDropdownCursos
                      ? "border-indigo-500 ring-2 ring-indigo-100 bg-white"
                      : "border-gray-300"
                  }`}
                >
                  <Search size={18} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    className="w-full outline-none bg-transparent text-gray-700"
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
                      className="animate-spin text-indigo-500 shrink-0"
                    />
                  )}
                </div>

                {mostrarDropdownCursos && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {cursosFiltrados.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 text-center">
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
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 hover:text-indigo-700 border-b border-gray-50 last:border-0 transition-colors"
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

              {/* SELECTOR DE GRUPO */}
              {cursoSeleccionado && (
                <div className="animate-fadeIn">
                  <label className="text-sm text-gray-600 font-medium block mb-2">
                    2. Seleccionar Grupo Específico
                  </label>
                  <div className="relative">
                    <select
                      value={grupoSeleccionado}
                      onChange={(e) => setGrupoSeleccionado(e.target.value)}
                      disabled={isLoadingGrupos}
                      className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-emerald-500 bg-white outline-none cursor-pointer"
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
                        className="absolute right-8 top-3.5 animate-spin text-emerald-500"
                        size={20}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* PERMISOS Y ACCESOS (Aparece cuando ya se seleccionó grupo) */}
              {grupoSeleccionado && (
                <div className="animate-fadeIn border rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-[#eef2f6] px-5 py-4 border-b flex items-start gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                      <Key size={20} className="text-[#5573b3]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">
                        Permisos de Docente para el Grupo
                      </h4>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Configura qué acciones podrá realizar este docente en el
                        grupo asignado.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-5">
                    {/* Control Total Master Switch */}
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            name="control_total"
                            checked={permisos.control_total}
                            onChange={handlePermisoChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5573b3]"></div>
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-black">
                          Control total
                        </span>
                      </label>
                    </div>

                    {/* Checkboxes Individuales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="tomar_asistencia"
                          checked={permisos.tomar_asistencia}
                          onChange={handlePermisoChange}
                          className="w-5 h-5 rounded border-gray-300 text-[#5573b3] focus:ring-[#5573b3]"
                        />
                        <span className="text-gray-700 group-hover:text-black font-medium">
                          Tomar asistencia
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="crear_tareas"
                          checked={permisos.crear_tareas}
                          onChange={handlePermisoChange}
                          className="w-5 h-5 rounded border-gray-300 text-[#5573b3] focus:ring-[#5573b3]"
                        />
                        <span className="text-gray-700 group-hover:text-black font-medium">
                          Crear tareas
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="modificar_modulos"
                          checked={permisos.modificar_modulos}
                          onChange={handlePermisoChange}
                          className="w-5 h-5 rounded border-gray-300 text-[#5573b3] focus:ring-[#5573b3]"
                        />
                        <span className="text-gray-700 group-hover:text-black font-medium">
                          Modificar módulos
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="modificar_notas"
                          checked={permisos.modificar_notas}
                          onChange={handlePermisoChange}
                          className="w-5 h-5 rounded border-gray-300 text-[#5573b3] focus:ring-[#5573b3]"
                        />
                        <span className="text-gray-700 group-hover:text-black font-medium">
                          Modificar notas
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="cargar_notas"
                          checked={permisos.cargar_notas}
                          onChange={handlePermisoChange}
                          className="w-5 h-5 rounded border-gray-300 text-[#5573b3] focus:ring-[#5573b3]"
                        />
                        <span className="text-gray-700 group-hover:text-black font-medium">
                          Cargar notas
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="enviar_mensajes"
                          checked={permisos.enviar_mensajes}
                          onChange={handlePermisoChange}
                          className="w-5 h-5 rounded border-gray-300 text-[#5573b3] focus:ring-[#5573b3]"
                        />
                        <span className="text-gray-700 group-hover:text-black font-medium">
                          Enviar mensajes
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-4 border-t border-gray-100 pt-6">
              <button
                type="button"
                onClick={handleOmitirAsignacion}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Omitir Paso
              </button>
              <button
                type="button"
                onClick={handleAsignarCurso}
                disabled={isLoading || !grupoSeleccionado}
                className="px-7 py-2.5 rounded-lg bg-[#059669] text-white hover:bg-[#047857] disabled:bg-gray-300 shadow-md flex items-center justify-center min-w-[180px] font-semibold transition-colors"
              >
                {isLoading ? "Procesando..." : "Asignar Grupo y Finalizar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
