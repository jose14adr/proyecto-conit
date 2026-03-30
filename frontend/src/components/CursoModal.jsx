import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { crearCurso, actualizarCurso } from "../services/curso.service";
import toast from "react-hot-toast";

const cursoSchema = z.object({
  nombrecurso: z
    .string()
    .min(1, "El nombre del curso es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  nivel: z.enum(["Básico", "Intermedio", "Avanzado"]),
  publicoobjetivo: z.string().optional(),
  tiemposemana: z.string().optional(),
  //Validaciones para campos numéricos, asegurando que se conviertan a números y tengan valores válidos
  duracion: z.coerce
    .number({ invalid_type_error: "La duración debe ser un número válido" })
    .min(1, "La duración debe ser mayor a 0"),
  creditos: z.coerce
    .number({ invalid_type_error: "Los créditos deben ser un número válido" })
    .min(0, "Los créditos no pueden ser negativos"),
  precio: z.coerce
    .number({ invalid_type_error: "El precio debe ser un número válido" })
    .min(0, "El precio no puede ser negativo"),
  idrequisito: z.coerce.number().optional(),
  idcategorizacion: z.coerce.number().optional(),
});

export default function CursoModal({ onClose, onSuccess, cursoEditar }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cursoSchema),
    mode: "onChange",
    defaultValues: {
      nombrecurso: "",
      descripcion: "",
      nivel: "Básico",
      publicoobjetivo: "",
      tiemposemana: "",
      duracion: "",
      creditos: "",
      precio: "",
      idrequisito: "",
      idcategorizacion: "",
    },
  });

  useEffect(() => {
    if (cursoEditar) {
      reset({
        ...cursoEditar,
        //Aseguramos que los campos opcionales tengan un valor por defecto
        descripcion: cursoEditar.descripcion || "",
        publicoobjetivo: cursoEditar.publicoobjetivo || "",
        tiemposemana: cursoEditar.tiempoSemana || "",
      });
    }
  }, [cursoEditar, reset]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      if (cursoEditar) {
        await actualizarCurso(cursoEditar.id, data);
        toast.success("Curso actualizado exitosamente");
      } else {
        await crearCurso(data);
        toast.success("Curso creado exitosamente");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar el curso:", error);
      toast.error(
        error.response?.data?.message || "Ocurrió un error al guardar el curso",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (error) => {
    return `w-full border rounded-lg p-2 mt-1 focus:ring-2 outline-none transition-colors ${
      error
        ? "border-red-500 focus:ring-red-500 bg-red-50"
        : "border-gray-300 focus:ring-blue-500 bg-white"
    }`;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
          {cursoEditar ? "Editar Curso" : "Registrar Nuevo Curso"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 font-medium">
                Nombre del Curso *
              </label>
              <input
                type="text"
                {...register("nombrecurso")}
                className={getInputClass(errors.nombrecurso)}
                placeholder="Ej: Matemáticas Avanzadas"
              />
              {errors.nombrecurso && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.nombrecurso.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">Nivel</label>
              <select
                {...register("nivel")}
                className={getInputClass(errors.nivel)}
              >
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
              {errors.nivel && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.nivel.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Precio (S/.) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register("precio")}
                className={getInputClass(errors.precio)}
                placeholder="0.00"
              />
              {errors.precio && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.precio.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Duración (Horas/Semanas) *
              </label>
              <input
                type="number"
                {...register("duracion")}
                className={getInputClass(errors.duracion)}
                placeholder="Ej: 40"
              />
              {errors.duracion && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.duracion.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Créditos *
              </label>
              <input
                type="number"
                {...register("creditos")}
                className={getInputClass(errors.creditos)}
                placeholder="Ej: 4"
              />
              {errors.creditos && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.creditos.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Tiempo Semanal
              </label>
              <input
                type="text"
                {...register("tiemposemana")}
                className={getInputClass(errors.tiemposemana)}
                placeholder="Ej: 4 horas/semana"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Público Objetivo
              </label>
              <input
                type="text"
                {...register("publicoobjetivo")}
                className={getInputClass(errors.publicoobjetivo)}
                placeholder="Ej: Estudiantes universitarios"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 font-medium">
                Descripción
              </label>
              <textarea
                {...register("descripcion")}
                rows="3"
                className={getInputClass(errors.descripcion)}
                placeholder="Breve descripción del curso..."
              ></textarea>
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
              //Bloqueamos visualmente el botón si el formulario no es válido
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg text-white font-medium transition shadow-sm bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center min-w-[160px]"
            >
              {isLoading
                ? "Procesando..."
                : cursoEditar
                  ? "Actualizar Curso"
                  : "Guardar Curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
