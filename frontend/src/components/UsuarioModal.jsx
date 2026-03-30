import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { crearUsuario, actualizarUsuario } from "../services/usuario.service";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const usuarioSchema = z.object({
  correo: z.string().email("Ingrese un correo electronico válido"),
  rol: z.enum(["ADMIN", "DOCENTE", "ALUMNO"], {
    errorMap: () => ({ message: "Seleccione un rol válido" }),
  }),
  contrasenia: z.string().optional(),
});

export default function UsuarioModal({ onClose, onSuccess, usuarioEditar }) {
    const [isLoading, setIsLoading] = useState(false);
    const [mostrarContrasenia, setMostrarContrasenia] = useState(false);

    const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({
        resolver: zodResolver(usuarioSchema),
        mode: "onChange",
        defaultValues: {
            correo: "",
            rol: "ALUMNO",
            idempresa: "1",
            contrasenia: "",
        },
    });

    useEffect(() => {
        if (usuarioEditar) {
            reset({
                correo: usuarioEditar.correo || "",
                rol: usuarioEditar.rol || "ALUMNO",
                idempresa: usuarioEditar.idempresa || "1",
                contrasenia: "", //No se muestra la contraseña al editar, el usuario debe ingresar una nueva si desea cambiarla
            });
        }
    }, [usuarioEditar, reset]);

    const onSubmit = async (data) => {
        try{
            if(!usuarioEditar && (!data.contrasenia || data.contrasenia.length < 8)){
                setError("contrasenia", {
                    type: "manual",
                    message: "La contraseña es obligatoria y debe tener al menos 8 caracteres",
                });
                return;
            }

            setIsLoading(true);

            const dataToSend = {
                correo: data.correo,
                rol: data.rol,
                idempresa: 1, 
            };

            if (data.contrasenia && data.contrasenia.trim() !== "") {
                dataToSend.contrasenia = data.contrasenia;
            }

            if (usuarioEditar) {
                await actualizarUsuario(usuarioEditar.id, dataToSend);
                toast.success("Usuario actualizado correctamente");
            } else {
                await crearUsuario(dataToSend);
                toast.success("Usuario registrado correctamente");
            }

            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Error al guardar el usuario", error);
            console.error("Error al guardar el usuario", error);
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

return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 animate-fadeIn">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">
          {usuarioEditar ? "Editar Usuario" : "Registrar Usuario"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Correo Electrónico */}
          <div>
            <label className="text-sm text-gray-600 font-medium">Correo Electrónico *</label>
            <input
              type="email"
              placeholder="ejemplo@conit.edu"
              {...register("correo")}
              className={getInputClass(errors.correo)}
            />
            {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message}</p>}
          </div>

          {/* Rol y Empresa */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 font-medium">Rol en Sistema *</label>
              <select {...register("rol")} className={getInputClass(errors.rol)}>
                <option value="ALUMNO">Alumno</option>
                <option value="DOCENTE">Docente</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            
            {/* Campo Empresa */}
            <div>
              <label className="text-sm text-gray-600 font-medium">Empresa</label>
              <div className="w-full border border-gray-200 bg-gray-50 text-gray-500 p-2.5 rounded-lg mt-1 font-medium cursor-not-allowed flex items-center gap-2">
                CONIT
              </div>
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="text-sm text-gray-600 font-medium">
              Contraseña {usuarioEditar ? "(Opcional)" : "*"}
            </label>
            <div className="relative">
              <input
                type={mostrarContrasenia ? "text" : "password"}
                placeholder={usuarioEditar ? "Dejar en blanco para no cambiar" : "Mínimo 8 caracteres"}
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
            {usuarioEditar && (
              <p className="text-xs text-gray-500 mt-1.5">
                Si no deseas cambiar la contraseña de este usuario, deja este campo vacío.
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
              className="px-6 py-2.5 rounded-lg text-white font-medium transition shadow-sm bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center min-w-[160px]"
            >
              {isLoading ? "Guardando..." : usuarioEditar ? "Actualizar" : "Guardar Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}