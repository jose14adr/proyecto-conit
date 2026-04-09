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
        telefono: String(alumnoEditar.telefono || ""),
        direccion: alumnoEditar.direccion || "",
        lugar_residencia: alumnoEditar.lugar_residencia || "",
        departamento: alumnoEditar.departamento || "",
        provincia: alumnoEditar.provincia || "",
        distrito: alumnoEditar.distrito || "",
        estado_civil: alumnoEditar.estado_civil || "Soltero(a)",
        isEditing: true,
        contrasenia: "",
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
          // Filtramos solo cursos activos
          setCursos(response.data.filter((c) => c.estado !== false));
        } catch (error) {
          toast.error("Error al cargar cursos", error);
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
        toast.error("Error al cargar grupos", error);
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
        setStep(2); // Pasamos al paso de matrícula
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Ocurrió un error al guardar el alumno",
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
      (c) => c.id.toString() === cursoSeleccionado,
    );
    if (!cursoObjeto) return toast.error("Curso no válido");

    setIsLoading(true);
    try {
      await matricularAlumno(
        alumnoCreado.id,
        parseInt(grupoSeleccionado),
        cursoObjeto.nombrecurso,
      );
      toast.success("Alumno matriculado exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al matricular alumno",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOmitirMatricula = () => {
    toast.success("Creación finalizada (Sin matrícula)");
    onSuccess();
    onClose();
  };

  const getInputClass = (error, hasPrefix = false) => {
    const baseClass =
      "w-full border p-2 focus:ring-2 outline-none transition-colors";
    const roundedClass = hasPrefix
      ? "rounded-r-lg border-l-0"
      : "rounded-lg mt-1";
    return `${baseClass} ${roundedClass} ${error ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-indigo-600 bg-white"}`;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 py-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-8 animate-fadeIn max-h-[95vh] overflow-y-auto my-auto">
        {/* Creacion de Alumno */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">
              {alumnoEditar ? "Editar Alumno" : "Registrar Nuevo Alumno"}
            </h2>

            <form onSubmit={handleSubmit(onSubmitPaso1)} onKeyUp={handleKeyUp}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                {/* Datos Personales */}
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
                    {...register("tipodocumento")}
                    className={getInputClass(errors.tipodocumento)}
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
                  {errors.numdocumento && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.numdocumento.message}
                    </p>
                  )}
                </div>

                {/* Contacto */}
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
                    {/* INPUT DE PREFIJO LIBRE */}
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

                    {/* INPUT DE NÚMERO */}
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
                  {/* Mensajes de error unificados */}
                  {(errors.prefijo || errors.telefono) && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.prefijo?.message || errors.telefono?.message}
                    </p>
                  )}
                </div>

                {/* Demografía */}
                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Estado Civil
                  </label>
                  <select
                    {...register("estado_civil")}
                    className={getInputClass(errors.estado_civil)}
                  >
                    <option value="Soltero(a)">Soltero(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viudo(a)">Viudo(a)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Departamento
                  </label>
                  <input
                    type="text"
                    {...register("departamento")}
                    className={getInputClass(errors.departamento)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Provincia
                  </label>
                  <input
                    type="text"
                    {...register("provincia")}
                    className={getInputClass(errors.provincia)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">
                    Distrito
                  </label>
                  <input
                    type="text"
                    {...register("distrito")}
                    className={getInputClass(errors.distrito)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600 font-medium">
                    Lugar de Residencia (Detalle)
                  </label>
                  <input
                    type="text"
                    {...register("lugar_residencia")}
                    placeholder="Ej: Urb. Las Flores"
                    className={getInputClass(errors.lugar_residencia)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600 font-medium">
                    Dirección Exacta
                  </label>
                  <input
                    type="text"
                    {...register("direccion")}
                    placeholder="Av. Principal 123"
                    className={getInputClass(errors.direccion)}
                  />
                </div>

                {/* Creacion de Usuario */}
                {!alumnoEditar && (
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

              <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-lg text-white font-medium transition shadow-sm bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center min-w-[160px]"
                >
                  {isLoading
                    ? "Procesando..."
                    : alumnoEditar
                      ? "Actualizar Alumno"
                      : "Guardar y Continuar"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Matrícula Alumno */}
        {step === 2 && alumnoCreado && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-3">
              <BookPlus className="text-indigo-600" size={28} />
              Matricular Alumno
            </h2>

            <p className="text-gray-600 mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100 font-medium">
              ¡Alumno{" "}
              <span className="font-bold text-blue-800">
                {alumnoCreado.nombre}
              </span>{" "}
              registrado con éxito! <br />
              Si deseas matricularlo ahora, busca un curso y selecciona el
              grupo.
            </p>

            <div className="space-y-6 mb-10">
              {/* Buscador Cursos */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  1. Busca y Selecciona el Curso
                </label>
                <div
                  className={`flex items-center border rounded-lg px-3 py-3 transition-all ${mostrarDropdownCursos ? "border-indigo-500 ring-2 ring-indigo-100 bg-white" : "border-gray-300 bg-gray-50"}`}
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
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
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

              {/* Grupos */}
              <div className="animate-fadeIn">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  2. Selecciona el Grupo
                </label>
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none disabled:opacity-50 disabled:bg-gray-100"
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
                      className="absolute right-3 top-3 animate-spin text-indigo-500"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-10 border-t border-gray-100 pt-6">
              <button
                type="button"
                onClick={handleOmitirMatricula}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Omitir Matrícula
              </button>
              <button
                type="button"
                onClick={handleMatricular}
                disabled={isLoading || !grupoSeleccionado}
                className="px-7 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 shadow-md flex items-center justify-center min-w-[180px] font-semibold transition-colors"
              >
                {isLoading ? "Procesando..." : "Matricular y Finalizar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
