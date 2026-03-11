import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { crearDocente, actualizarDocente } from "../services/docente.service";
import toast from "react-hot-toast";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

const docenteSchema = z
  .object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    apellido: z.string().min(1, "El apellido es obligatorio"),
    tipoDocumento: z.enum(["DNI", "Pasaporte", "Carnet Extranjería"]),
    numDocumento: z.string().min(1, "El número de documento es obligatorio"),
    telefono: z
      .string()
      .length(9, "El celular debe tener 9 dígitos")
      .regex(/^9/, "El celular debe iniciar con 9"),
    correo: z.string().email("Ingresa un correo electrónico válido"),
    direccion: z.string().min(1, "La dirección es obligatoria"),
    crearUsuario: z.boolean(),
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
        message: "El Carnet de Extranjería debe tener máximo 9 caracteres",
      });
    }
    if (
      data.tipoDocumento === "Pasaporte" &&
      (data.numDocumento.length < 8 || data.numDocumento.length > 12)
    ) {
      ctx.addIssue({
        path: ["numDocumento"],
        code: z.ZodIssueCode.custom,
        message: "El pasaporte debe contener entre 8 y 12 caracteres",
      });
    }

    if (data.crearUsuario) {
      const regexContrasenia =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!data.contrasenia || !regexContrasenia.test(data.contrasenia)) {
        ctx.addIssue({
          path: ["contrasenia"],
          code: z.ZodIssueCode.custom,
          message:
            "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un caracter especial",
        });
      }
    }
  });

export default function DocenteModal({ onClose, onSuccess, docenteEditar }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
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
      crearUsuario: false,
      contrasenia: "",
    },
  });

  const tipoDocumentoActual = watch("tipoDocumento");
  const crearUsuarioActual = watch("crearUsuario");

  useEffect(() => {
    if (docenteEditar) {
      reset({
        nombre: docenteEditar.nombre,
        apellido: docenteEditar.apellido,
        tipoDocumento: docenteEditar.tipoDocumento,
        numDocumento: docenteEditar.numDocumento,
        telefono: String(docenteEditar.telefono),
        direccion: docenteEditar.direccion,
        correo: docenteEditar.correo,
        crearUsuario: false,
        contrasenia: "",
      });
    }
  }, [docenteEditar, reset]);

  useEffect(() => {
    if (!docenteEditar) {
      setValue("numDocumento", ""); //Aseguramos limpiar el campo de número de documento al cambiar el tipo si no estamos editando
    }
  }, [tipoDocumentoActual, setValue, docenteEditar]);

  useEffect(() => {
    if (!crearUsuarioActual) setValue("contrasenia", ""); //Limpiamos la contraseña si el usuario decide no crear un usuario
  }, [crearUsuarioActual, setValue]);

  const handleKeyUp = (e) => {
    if (e.getModifierState("CapsLock")) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const dataToSend = {
        ...data,
        telefono: Number(data.telefono), //Convertimos el teléfono a número
      };
      if (docenteEditar) {
        const datosActualizar = { ...dataToSend };
        if (!datosActualizar.crearUsuario) {
          delete datosActualizar.crearUsuario; //Aseguramos no enviar el campo crearUsuario al backend si es false, para evitar confusiones
          delete datosActualizar.contrasenia; //Lo mismo con la contraseña
        }
        await actualizarDocente(docenteEditar.id, datosActualizar);
        toast.success("Docente actualizado exitosamente");
      } else {
        await crearDocente(dataToSend);
        toast.success("Docente creado exitosamente");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al crear docente:", error);
      toast.error(error.response?.data?.message || "Error al crear el docente");
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (error, hasPrefix = false) => {
    const baseClass = "w-full border p-2 focus:ring-2 outline-none ";
    const roundedClass = hasPrefix
      ? "rounded-r-lg border-l-0"
      : "rounded-lg mt-1";
    return `${baseClass} ${roundedClass} ${error ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500 bg-white"}`;
  };

  const mostrarSeccionUsuario = !docenteEditar || docenteEditar.usuario;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {docenteEditar ? "Editar Docente" : "Registrar Nuevo Docente"}
        </h2>

        {/* Agregamos onKeyUp al formulario para atrapar cuando se presiona Bloq Mayús */}
        <form onSubmit={handleSubmit(onSubmit)} onKeyUp={handleKeyUp}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <label className="text-sm text-gray-600 font-medium">
                Nombre
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
                <p className="text-red-500 text-xs mt-1 leading-tight">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Apellido
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
                <p className="text-red-500 text-xs mt-1 leading-tight">
                  {errors.apellido.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Tipo de Documento
              </label>
              <select
                {...register("tipoDocumento")}
                className={getInputClass(errors.tipoDocumento)}
              >
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Carnet Extranjería">Carnet Extranjería</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                N° Documento
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
                <p className="text-red-500 text-xs mt-1 leading-tight">
                  {errors.numDocumento.message}
                </p>
              )}
            </div>

            {/* CAMPO DE TELÉFONO CON PREFIJO +51 VISUAL */}
            <div>
              <label className="text-sm text-gray-600 font-medium">
                Teléfono
              </label>
              <div className="flex mt-1">
                <span
                  className={`inline-flex items-center px-3 rounded-l-lg border border-r-0 font-medium text-gray-600 ${errors.telefono ? "border-red-500 bg-red-100" : "border-gray-300 bg-gray-100"}`}
                >
                  +51
                </span>
                <input
                  type="text"
                  placeholder="9XXXXXXXX"
                  {...register("telefono")}
                  onChange={(e) => {
                    // Filtrar solo números y máximo 9 dígitos
                    const val = e.target.value.replace(/\D/g, "").slice(0, 9);
                    setValue("telefono", val, { shouldValidate: true });
                  }}
                  className={getInputClass(errors.telefono, true)}
                />
              </div>
              {errors.telefono && (
                <p className="text-red-500 text-xs mt-1 leading-tight">
                  {errors.telefono.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Correo
              </label>
              <input
                type="email"
                {...register("correo")}
                className={getInputClass(errors.correo)}
              />
              {errors.correo && (
                <p className="text-red-500 text-xs mt-1 leading-tight">
                  {errors.correo.message}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="text-sm text-gray-600 font-medium">
                Dirección
              </label>
              <input
                type="text"
                {...register("direccion")}
                className={getInputClass(errors.direccion)}
              />
              {errors.direccion && (
                <p className="text-red-500 text-xs mt-1 leading-tight">
                  {errors.direccion.message}
                </p>
              )}
            </div>
          </div>

          {/* SECCIÓN DE USUARIO DINÁMICA */}
          {mostrarSeccionUsuario && (
            <div className="col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100 mt-6 transition-all">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...register("crearUsuario")}
                  className="w-4 h-4 cursor-pointer"
                />
                <label className="text-blue-900 font-medium text-sm">
                  {docenteEditar
                    ? "¿Deseas crearle un usuario a este docente ahora?"
                    : "¿Asignar usuario al docente automáticamente?"}
                </label>
              </div>

              {crearUsuarioActual && (
                <div className="mt-4 pt-4 border-t border-blue-200 animate-fadeIn">
                  <label className="text-sm text-blue-900 font-medium block mb-1">
                    Contraseña de acceso *
                  </label>

                  {/* INPUT DE CONTRASEÑA */}
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Ej: P@ssw0rd123"
                      {...register("contrasenia")}
                      className={getInputClass(errors.contrasenia)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#5573b3] transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Advertencia de Mayúsculas usando AlertTriangle */}
                  {capsLockOn && (
                    <p className="text-orange-500 text-xs mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle size={14} /> Bloq Mayús activado
                    </p>
                  )}

                  {errors.contrasenia && (
                    <p className="text-red-500 text-xs mt-1 leading-tight">
                      {errors.contrasenia.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8 border-t pt-4">
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
              className="px-6 py-2 rounded-lg bg-[#5573b3] text-white hover:bg-[#344c92] transition shadow-md flex items-center justify-center min-w-[160px]"
            >
              {isLoading
                ? "Procesando..."
                : docenteEditar
                  ? "Actualizar Docente"
                  : "Guardar Docente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
