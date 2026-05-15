import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { actualizarUsuario } from "../services/usuario.service";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  ShieldAlert,
  X,
  Save,
  Loader2,
  KeyRound,
} from "lucide-react";

const usuarioSchema = z.object({
  correo: z.string().email("Ingrese un correo electrónico válido"),
  rol: z.enum(["ADMIN", "ADMINISTRADOR", "DOCENTE", "ALUMNO"], {
    errorMap: () => ({ message: "Seleccione un rol válido" }),
  }),
  contrasenia: z.string().optional(),
});

export default function UsuarioModal({ onClose, onSuccess, usuarioEditar }) {
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(usuarioSchema),
    mode: "onChange",
    defaultValues: {
      correo: "",
      rol: "ALUMNO",
      contrasenia: "",
    },
  });

  useEffect(() => {
    if (usuarioEditar) {
      reset({
        correo: usuarioEditar.correo || "",
        rol: usuarioEditar.rol || "ALUMNO",
        contrasenia: "",
      });
    }
  }, [usuarioEditar, reset]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const dataToSend = {
        correo: data.correo,
        rol: data.rol,
      };

      if (data.contrasenia && data.contrasenia.trim() !== "") {
        if (data.contrasenia.length < 8) {
          setError("contrasenia", {
            type: "manual",
            message: "La nueva contraseña debe tener al menos 8 caracteres",
          });
          setIsLoading(false);
          return;
        }

        dataToSend.contrasenia = data.contrasenia;
      }

      await actualizarUsuario(usuarioEditar.id, dataToSend);

      toast.success("Credenciales actualizadas correctamente");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al actualizar las credenciales");
      console.error("Error al actualizar las credenciales", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (error) => {
    return `w-full rounded-2xl border px-4 py-3 mt-1 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted-text)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] ${
      error
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-[var(--color-border)] bg-[var(--color-background)] focus:border-[var(--color-primary)]"
    }`;
  };

  if (!usuarioEditar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl animate-fadeIn">
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-2.5 backdrop-blur">
              <KeyRound size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black">Editar Credenciales</h2>
              <p className="mt-0.5 text-sm text-white/75">
                Actualiza el acceso y rol del usuario.
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
          {/* Correo Electrónico */}
          <div>
            <label className="text-sm font-semibold text-[var(--color-text)]">
              Correo Electrónico de Acceso *
            </label>

            <input
              type="email"
              placeholder="ejemplo@conit.edu"
              {...register("correo")}
              className={getInputClass(errors.correo)}
            />

            {errors.correo && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.correo.message}
              </p>
            )}
          </div>

          {/* Rol */}
          <div>
            <label className="text-sm font-semibold text-[var(--color-text)]">
              Rol en el Sistema *
            </label>

            <select {...register("rol")} className={getInputClass(errors.rol)}>
              <option value="ALUMNO">Alumno</option>
              <option value="DOCENTE">Docente</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>

            {errors.rol && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.rol.message}
              </p>
            )}

            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] p-3 text-[var(--color-primary)]">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />

              <p className="text-xs leading-relaxed">
                Cambiar el rol modificará los paneles a los que puede acceder el
                usuario al iniciar sesión, pero no trasladará sus datos
                personales de tabla.
              </p>
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="text-sm font-semibold text-[var(--color-text)]">
              Restablecer Contraseña
              <span className="ml-1 text-[var(--color-muted-text)]">
                (Opcional)
              </span>
            </label>

            <div className="relative">
              <input
                type={mostrarContrasenia ? "text" : "password"}
                placeholder="Dejar en blanco para no cambiar"
                {...register("contrasenia")}
                className={`${getInputClass(errors.contrasenia)} pr-12`}
              />

              <button
                type="button"
                onClick={() => setMostrarContrasenia(!mostrarContrasenia)}
                className="absolute right-3 top-[15px] text-[var(--color-muted-text)] transition hover:text-[var(--color-primary)]"
                title={mostrarContrasenia ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {mostrarContrasenia ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errors.contrasenia && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.contrasenia.message}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-5">
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
              className="flex min-w-[145px] items-center justify-center gap-2 rounded-xl bg-[var(--color-button-primary)] px-6 py-2.5 font-semibold text-[var(--color-button-primary-text)] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Actualizar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}