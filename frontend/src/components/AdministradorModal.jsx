import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react";

import {
  crearAdministrador,
  actualizarAdministrador,
} from "../services/administrador.service";

const regexContrasenia =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const adminSchema = z
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
    correo: z.string().email("Ingresa un correo electrónico válido"),
    direccion: z.string().optional(),
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

export default function AdministradorModal({
  onClose,
  onSuccess,
  adminEditar,
}) {
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
    resolver: zodResolver(adminSchema),
    mode: "onChange",
    defaultValues: {
      nombre: "",
      apellido: "",
      tipodocumento: "DNI",
      numdocumento: "",
      prefijo: "+51",
      telefono: "",
      correo: "",
      direccion: "",
      isEditing: !!adminEditar,
      contrasenia: "",
    },
  });

  const tipoDocumentoActual = watch("tipodocumento");

  useEffect(() => {
    if (adminEditar) {
      reset({
        ...adminEditar,
        telefono: String(adminEditar.telefono || ""),
        direccion: adminEditar.direccion || "",
        isEditing: true,
        contrasenia: "",
      });
    }
  }, [adminEditar, reset]);

  useEffect(() => {
    if (!adminEditar) setValue("numdocumento", "");
  }, [tipoDocumentoActual, setValue, adminEditar]);

  const handleKeyUp = (e) => {
    if (e.getModifierState("CapsLock")) setCapsLockOn(true);
    else setCapsLockOn(false);
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const dataToSend = { ...data };
      dataToSend.telefono = `${data.prefijo} ${data.telefono}`;

      delete dataToSend.prefijo;
      delete dataToSend.isEditing;

      if (adminEditar) {
        delete dataToSend.contrasenia;
        delete dataToSend.crearUsuario;
        await actualizarAdministrador(adminEditar.id, dataToSend);
        toast.success("Administrador actualizado correctamente");
      } else {
        dataToSend.crearUsuario = true;
        await crearAdministrador(dataToSend);
        toast.success("Administrador y credenciales creados exitosamente");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Ocurrió un error al guardar el administrador",
      );
      console.error(error);
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 py-4 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-8 animate-fadeIn max-h-[95vh] overflow-y-auto my-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">
          {adminEditar
            ? "Editar Administrador"
            : "Registrar Nuevo Administrador"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} onKeyUp={handleKeyUp}>
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
                    setValue("telefono", e.target.value.replace(/\D/g, ""), {
                      shouldValidate: true,
                    })
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
                Dirección
              </label>
              <input
                type="text"
                {...register("direccion")}
                className={getInputClass(errors.direccion)}
              />
            </div>

            {/* Creación de Usuario (Solo visible al crear uno nuevo adaptado a indigo) */}
            {!adminEditar && (
              <div className="md:col-span-2 mt-4 bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
                  Credenciales de Acceso
                </h3>
                <p className="text-xs text-indigo-700 mb-4">
                  Se creará automáticamente un usuario administrador con el
                  correo ingresado.
                </p>

                <label className="text-sm font-medium block mb-1 text-indigo-900">
                  Contraseña de acceso *
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("contrasenia")}
                    className={getInputClass(errors.contrasenia)}
                    placeholder="Ej: Admin@123"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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

          <div className="flex justify-end gap-4 mt-8 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg text-white font-medium transition shadow-sm bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center min-w-[160px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Procesando...
                </>
              ) : adminEditar ? (
                "Actualizar Administrador"
              ) : (
                "Guardar Administrador"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}