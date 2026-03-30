import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { crearAlumno, actualizarAlumno } from "../services/alumno.service";
import toast from "react-hot-toast";

const alumnoSchema = z
  .object({
    nombre: z
      .string()
      .min(1, "El nombre es obligatorio")
      .min(2, "El nombre debe tener al menos 2 caracteres"),
    apellido: z
      .string()
      .min(1, "El apellido es obligatorio")
      .min(2, "El apellido debe tener al menos 2 caracteres"),
    tipoDocumento: z.enum(["DNI", "Pasaporte", "Carnet de Extranjería"]),
    numeroDocumento: z.string().min(1, "El número de documento es obligatorio"),
    telefono: z
      .string()
      .length(9, "El teléfono debe tener 9 dígitos")
      .regex(/^9/, "El celular debe comenzar con 9"),
    correo: z.string().email("El correo electrónico no es válido"),
    direccion: z.string().optional(),
    lugar_residencia: z.string().optional(),
    departamento: z.string().optional(),
    provincia: z.string().optional(),
    distrito: z.string().optional(),
    estado_civil: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipoDocumento === "DNI" && !/^\d{8}$/.test(data.numeroDocumento)) {
      ctx.addIssue({
        path: ["numeroDocumento"],
        code: z.ZodIssueCode.custom,
        message: "El número de DNI debe tener 8 dígitos",
      });
    }
    if (
      data.tipoDocumento === "Pasaporte" &&
      (data.numeroDocumento.length < 8 || data.numeroDocumento.length > 12)
    ) {
      ctx.addIssue({
        path: ["numeroDocumento"],
        code: z.ZodIssueCode.custom,
        message: "El número de pasaporte debe tener entre 8 y 12 caracteres",
      });
    }
  });

export default function AlumnoModal({ onClose, onSuccess, alumnoEditar }) {
  const [isLoading, setIsLoading] = useState(false);
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
      tipoDocumento: "DNI",
      numeroDocumento: "",
      telefono: "",
      correo: "",
      direccion: "",
      lugar_residencia: "",
      departamento: "",
      provincia: "",
      distrito: "",
      estado_civil: "Soltero(a)",
    },
  });

  const tipoDocumentoActual = watch("tipoDocumento");

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
      });
    }
  }, [alumnoEditar, reset]);

  useEffect(() => {
    if (!alumnoEditar) {
      setValue("numeroDocumento", "");
    }
  }, [tipoDocumentoActual, setValue, alumnoEditar]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const dataToSend = {
        ...data,
        telefono: Number(data.telefono),
      };

      if (alumnoEditar) {
        await actualizarAlumno(alumnoEditar.id, dataToSend);
        toast.success("Alumno actualizado correctamente");
      } else {
        await crearAlumno(dataToSend);
        toast.success("Alumno creado correctamente");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar el alumno:", error);
      toast.error("Ocurrió un error al guardar el alumno");
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (error, hasPrefix = false) => {
    const baseClass =
      "w-full border p-2 focus:ring-2 outline-none transition-colors";
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">
          {alumnoEditar ? "Editar Alumno" : "Registrar Nuevo Alumno"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
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

            {/* Documento */}
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
                <option value="Carnet Extranjería">Carnet Extranjería</option>
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
                Celular *
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
                    const val = e.target.value.replace(/\D/g, "").slice(0, 9);
                    setValue("telefono", val, { shouldValidate: true });
                  }}
                  className={getInputClass(errors.telefono, true)}
                />
              </div>
              {errors.telefono && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.telefono.message}
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
                <option value="Soltero">Soltero(a)</option>
                <option value="Casado">Casado(a)</option>
                <option value="Divorciado">Divorciado(a)</option>
                <option value="Viudo">Viudo(a)</option>
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
                className={getInputClass(errors.lugar_residencia)}
                placeholder="Ej: Urb. Las Flores"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 font-medium">
                Dirección Exacta
              </label>
              <input
                type="text"
                {...register("direccion")}
                className={getInputClass(errors.direccion)}
                placeholder="Av. Principal 123"
              />
            </div>
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
                  : "Guardar Alumno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
