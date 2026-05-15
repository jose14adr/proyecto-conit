import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  X,
  UserCog,
  Save,
  ShieldCheck,
} from "lucide-react";

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
        telefono: String(adminEditar.telefono || "").replace(/[^\d]/g, ""),
        direccion: adminEditar.direccion || "",
        isEditing: true,
        contrasenia: "",
        prefijo: "+51",
      });
    }
  }, [adminEditar, reset]);

  useEffect(() => {
    if (!adminEditar) setValue("numdocumento", "");
  }, [tipoDocumentoActual, setValue, adminEditar]);

  const handleKeyUp = (e) => {
    setCapsLockOn(e.getModifierState("CapsLock"));
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
          "Ocurrió un error al guardar el administrador"
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl animate-fadeIn">
        <div
          className="flex shrink-0 items-center justify-between px-8 py-6 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-2.5 backdrop-blur">
              <UserCog size={26} />
            </div>

            <div>
              <h2 className="text-2xl font-black">
                {adminEditar
                  ? "Editar Administrador"
                  : "Registrar Nuevo Administrador"}
              </h2>

              <p className="mt-1 text-sm text-white/75">
                Completa los datos personales y credenciales administrativas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full p-2 transition hover:bg-white/20 disabled:opacity-60"
            title="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[var(--color-background)] p-8">
          <form onSubmit={handleSubmit(onSubmit)} onKeyUp={handleKeyUp}>
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
              <SectionTitle title="Datos personales" />

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

                    if (tipoDocumentoActual === "DNI") {
                      val = val.replace(/\D/g, "").slice(0, 8);
                    } else if (tipoDocumentoActual === "Carnet Extranjería") {
                      val = val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 9);
                    } else if (tipoDocumentoActual === "Pasaporte") {
                      val = val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
                    }

                    setValue("numdocumento", val, { shouldValidate: true });
                  }}
                  className={getInputClass(errors.numdocumento)}
                />
              </Campo>

              <SectionTitle title="Contacto" />

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
                      setValue("telefono", e.target.value.replace(/\D/g, ""), {
                        shouldValidate: true,
                      })
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
                <Campo label="Dirección" error={errors.direccion}>
                  <input
                    type="text"
                    {...register("direccion")}
                    className={getInputClass(errors.direccion)}
                  />
                </Campo>
              </div>

              {!adminEditar && (
                <div className="md:col-span-2 rounded-3xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] p-5">
                  <h3 className="mb-1 flex items-center gap-2 font-black text-[var(--color-text)]">
                    <ShieldCheck size={18} className="text-[var(--color-primary)]" />
                    Credenciales de Acceso
                  </h3>

                  <p className="mb-4 text-xs font-medium text-[var(--color-muted-text)]">
                    Se creará automáticamente un usuario administrador con el
                    correo ingresado.
                  </p>

                  <label className="mb-1 block text-sm font-semibold text-[var(--color-text)]">
                    Contraseña de acceso *
                  </label>

                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("contrasenia")}
                      className={`${getInputClass(errors.contrasenia)} pr-12`}
                      placeholder="Ej: Admin@123"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-text)] transition hover:text-[var(--color-primary)]"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                ) : (
                  <>
                    <Save size={18} />
                    {adminEditar
                      ? "Actualizar Administrador"
                      : "Guardar Administrador"}
                  </>
                )}
              </button>
            </div>
          </form>
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