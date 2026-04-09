import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { actualizarUsuario } from "../services/usuario.service";
import toast from "react-hot-toast";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";

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
    return `w-full border p-2.5 rounded-lg mt-1 focus:ring-2 outline-none transition-colors ${
      error
        ? "border-red-500 focus:ring-red-500 bg-red-50"
        : "border-gray-300 focus:ring-indigo-600 bg-white"
    }`;
  };

  if (!usuarioEditar) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 animate-fadeIn">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">
          Editar Credenciales
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Correo Electrónico */}
          <div>
            <label className="text-sm text-gray-600 font-medium">
              Correo Electrónico de Acceso *
            </label>
            <input
              type="email"
              placeholder="ejemplo@conit.edu"
              {...register("correo")}
              className={getInputClass(errors.correo)}
            />
            {errors.correo && (
              <p className="text-red-500 text-xs mt-1">
                {errors.correo.message}
              </p>
            )}
          </div>

          {/* Rol */}
          <div>
            <label className="text-sm text-gray-600 font-medium">
              Rol en el Sistema *
            </label>
            <select {...register("rol")} className={getInputClass(errors.rol)}>
              <option value="ALUMNO">Alumno</option>
              <option value="DOCENTE">Docente</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
            <div className="mt-2 bg-blue-50 text-blue-700 p-3 rounded-lg flex gap-2 items-start border border-blue-100">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                Cambiar el rol modificará los paneles a los que puede acceder el
                usuario al iniciar sesión, pero no trasladará sus datos
                personales de tabla.
              </p>
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="text-sm text-gray-600 font-medium">
              Restablecer Contraseña (Opcional)
            </label>
            <div className="relative">
              <input
                type={mostrarContrasenia ? "text" : "password"}
                placeholder="Dejar en blanco para no cambiar"
                {...register("contrasenia")}
                className={getInputClass(errors.contrasenia)}
              />
              <button
                type="button"
                onClick={() => setMostrarContrasenia(!mostrarContrasenia)}
                className="absolute right-3 top-[14px] text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {mostrarContrasenia ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.contrasenia && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contrasenia.message}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg text-white font-medium transition shadow-sm bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center min-w-[140px]"
            >
              {isLoading ? "Guardando..." : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
