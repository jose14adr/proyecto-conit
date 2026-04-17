import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { crearCurso, actualizarCurso } from "../services/curso.service";
import {
  crearGrupo,
  obtenerGruposPorCurso,
  cerrarGrupo,
  actualizarEstadoGrupo,
} from "../services/grupo.service";
import toast from "react-hot-toast";
import { BookOpen, Users, Loader2, Plus, Clock, MapPin } from "lucide-react";

const cursoSchema = z.object({
  nombrecurso: z.string().min(1, "Obligatorio").min(3, "Mínimo 3 caracteres"),
  descripcion: z.string().optional(),
  nivel: z.enum(["Básico", "Intermedio", "Avanzado"]),
  publicoobjetivo: z.string().optional(),
  tiemposemana: z.string().optional(),
  duracion: z.coerce.number().min(1, "Mínimo 1"),
  creditos: z.coerce.number().min(0, "No negativos"),
  precio: z.coerce.number().min(0, "No negativo"),
  descuento: z.coerce
    .number()
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%")
    .optional()
    .default(0),
});

export default function CursoModal({ onClose, onSuccess, cursoEditar }) {
  const [activeTab, setActiveTab] = useState("datos"); // 'datos' o 'grupos'
  const [cursoCreadoId, setCursoCreadoId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [listaGrupos, setListaGrupos] = useState([]);
  const [isLoadingGrupos, setIsLoadingGrupos] = useState(false);
  const [formGrupo, setFormGrupo] = useState({
    nombregrupo: "Grupo A",
    horario: "",
    modalidad: "Virtual Asincrónico",
    cantidadpersonas: 30,
  });

  const cursoIdActual = cursoEditar?.id || cursoCreadoId;

  const {
    register,
    handleSubmit,
    watch,
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
      descuento: 0,
    },
  });

  const precioBase = watch("precio") || 0;
  const descuento = watch("descuento") || 0;
  const precioFinal = precioBase - precioBase * (descuento / 100);

  useEffect(() => {
    if (cursoEditar) {
      reset({
        ...cursoEditar,
        descripcion: cursoEditar.descripcion || "",
        publicoobjetivo: cursoEditar.publicoobjetivo || "",
        tiemposemana: cursoEditar.tiemposemana || "",
        descuento: cursoEditar.descuento || 0,
      });
    }
  }, [cursoEditar, reset]);

  useEffect(() => {
    if (activeTab === "grupos" && cursoIdActual) {
      cargarGruposDelCurso();
    }
  }, [activeTab, cursoIdActual]);

  const cargarGruposDelCurso = async () => {
    setIsLoadingGrupos(true);
    try {
      const data = await obtenerGruposPorCurso(cursoIdActual);
      setListaGrupos(data);
    } catch (error) {
      toast.error("Error al cargar los grupos del curso", error);
    } finally {
      setIsLoadingGrupos(false);
    }
  };

  const onSubmitDatos = async (data) => {
    try {
      setIsLoading(true);
      const dataToSend = { ...data, precio_final: precioFinal };

      if (cursoEditar) {
        await actualizarCurso(cursoEditar.id, dataToSend);
        toast.success("Curso actualizado exitosamente");
        onSuccess();
      } else {
        const nuevoCurso = await crearCurso(dataToSend);
        toast.success("Curso guardado. Ahora puedes crear grupos.");
        setCursoCreadoId(nuevoCurso.id);
        setActiveTab("grupos");
        onSuccess();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Ocurrió un error al guardar",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrearGrupo = async (e) => {
    e.preventDefault();
    if (!formGrupo.horario) return toast.error("El horario es obligatorio");

    try {
      setIsLoading(true);
      await crearGrupo({
        ...formGrupo,
        idcurso: cursoIdActual,
        cantidadpersonas: Number(formGrupo.cantidadpersonas),
      });
      toast.success("Grupo añadido correctamente");
      setFormGrupo({
        ...formGrupo,
        nombregrupo: `Grupo ${String.fromCharCode(65 + listaGrupos.length + 1)}`,
        horario: "",
      });
      cargarGruposDelCurso();
    } catch (error) {
      toast.error("Error al crear el grupo", error);
    } finally {
      setIsLoading(false);
    }
  };

    const handleCerrarGrupo = async (idGrupo) => {
      const ok = window.confirm("¿Seguro que deseas cerrar este grupo?");
      if (!ok) return;

      try {
        setIsLoading(true);
        await cerrarGrupo(idGrupo);
        toast.success("Grupo cerrado correctamente");
        await cargarGruposDelCurso();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "No se pudo cerrar el grupo",
        );
      } finally {
        setIsLoading(false);
      }
    };

    const handleCambiarEstadoGrupo = async (idGrupo, estado) => {
      try {
        setIsLoading(true);
        await actualizarEstadoGrupo(idGrupo, estado);
        toast.success("Estado del grupo actualizado");
        await cargarGruposDelCurso();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "No se pudo actualizar el estado",
        );
      } finally {
        setIsLoading(false);
      }
    };

    const getEstadoBadgeClass = (estado) => {
      switch (estado) {
        case "CERRADO":
          return "bg-red-50 text-red-700 border border-red-100";
        case "PAUSADO":
          return "bg-amber-50 text-amber-700 border border-amber-100";
        default:
          return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      }
    };

  const getInputClass = (error) =>
    `w-full border rounded-xl p-2.5 mt-1 outline-none transition-colors ${error ? "border-red-500 bg-red-50 focus:border-red-500" : "border-gray-300 bg-gray-50 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"}`;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 py-4 px-2">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden my-auto">
        {/* Headers y Pestañas */}
        <div className="px-8 pt-8 pb-4 border-b border-gray-200 bg-white shrink-0">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
            <BookOpen className="text-indigo-600" />
            {cursoEditar
              ? "Gestión Comercial del Curso"
              : "Registrar Nuevo Curso"}
          </h2>

          <div className="flex gap-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("datos")}
              className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
                activeTab === "datos"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Información Comercial
            </button>
            <button
              onClick={() => setActiveTab("grupos")}
              disabled={!cursoIdActual}
              className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
                activeTab === "grupos"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={
                !cursoIdActual
                  ? "Guarda el curso primero para añadir grupos"
                  : ""
              }
            >
              <Users size={16} /> Apertura de Grupos
            </button>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="p-8 overflow-y-auto flex-1 bg-gray-50/50">
          {/* DATOS DEL CURSO */}
          {activeTab === "datos" && (
            <form
              id="form-curso"
              onSubmit={handleSubmit(onSubmitDatos)}
              className="animate-fadeIn"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 font-medium">
                      Nombre del Curso *
                    </label>
                    <input
                      type="text"
                      {...register("nombrecurso")}
                      className={getInputClass(errors.nombrecurso)}
                      placeholder="Ej: Diplomado en Salud Ocupacional"
                    />
                    {errors.nombrecurso && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.nombrecurso.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 font-medium">
                        Nivel Académico
                      </label>
                      <select
                        {...register("nivel")}
                        className={getInputClass(errors.nivel)}
                      >
                        <option value="Básico">Básico</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 font-medium">
                        Duración (Horas) *
                      </label>
                      <input
                        type="number"
                        {...register("duracion")}
                        className={getInputClass(errors.duracion)}
                        placeholder="Ej: 120"
                      />
                      {errors.duracion && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.duracion.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                        <p className="text-red-500 text-xs mt-1">
                          {errors.creditos.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 font-medium">
                        Dedicación Sugerida
                      </label>
                      <input
                        type="text"
                        {...register("tiemposemana")}
                        className={getInputClass(errors.tiemposemana)}
                        placeholder="Ej: 4 horas/semana"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 font-medium">
                      Público Objetivo
                    </label>
                    <input
                      type="text"
                      {...register("publicoobjetivo")}
                      className={getInputClass(errors.publicoobjetivo)}
                      placeholder="Ej: Ingenieros y médicos ocupacionales"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 font-medium">
                      Descripción Breve
                    </label>
                    <textarea
                      {...register("descripcion")}
                      rows="3"
                      className={getInputClass(errors.descripcion)}
                      placeholder="¿De qué trata este curso?"
                    ></textarea>
                  </div>
                </div>

                <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm h-fit">
                  <h3 className="font-semibold text-emerald-600 border-b border-emerald-100 pb-2 mb-4">
                    Costos y Promociones
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 font-medium">
                        Precio Base (S/.) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register("precio")}
                        className={getInputClass(errors.precio)}
                        placeholder="0.00"
                      />
                      {errors.precio && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.precio.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 font-medium flex justify-between">
                        Descuento (%){" "}
                        <span className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 rounded text-xs py-0.5">
                          Opcional
                        </span>
                      </label>
                      <input
                        type="number"
                        {...register("descuento")}
                        className={getInputClass(errors.descuento)}
                        placeholder="0 - 100"
                      />
                      {errors.descuento && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.descuento.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-4">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                        Costo Final al Alumno
                      </p>
                      <div className="bg-emerald-600 text-white rounded-xl p-4 text-center">
                        {descuento > 0 && (
                          <p className="text-emerald-200 text-sm line-through decoration-emerald-400 mb-0.5">
                            S/ {Number(precioBase).toFixed(2)}
                          </p>
                        )}
                        <h4 className="text-3xl font-black tracking-tight">
                          S/ {precioFinal > 0 ? precioFinal.toFixed(2) : "0.00"}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* GESTIÓN DE GRUPOS */}
          {activeTab === "grupos" && (
            <div className="animate-fadeIn space-y-8">
              {/* Formulario Añadir Grupo */}
              <form
                onSubmit={handleCrearGrupo}
                className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5"
              >
                <h3 className="font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                  <Plus size={18} /> Aperturar Nuevo Grupo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="text-xs font-semibold text-emerald-700 mb-1 block">
                      Nombre / Letra
                    </label>
                    <input
                      type="text"
                      value={formGrupo.nombregrupo}
                      onChange={(e) =>
                        setFormGrupo({
                          ...formGrupo,
                          nombregrupo: e.target.value,
                        })
                      }
                      className="w-full border border-emerald-200 rounded-lg p-2.5 outline-none focus:border-emerald-500 bg-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-emerald-700 mb-1 block">
                      Modalidad
                    </label>
                    <select
                      value={formGrupo.modalidad}
                      onChange={(e) =>
                        setFormGrupo({
                          ...formGrupo,
                          modalidad: e.target.value,
                        })
                      }
                      className="w-full border border-emerald-200 rounded-lg p-2.5 outline-none focus:border-emerald-500 bg-white text-sm"
                    >
                      <option value="Virtual Asincrónico">Asincrónico</option>
                      <option value="Virtual en Vivo">En Vivo (Zoom)</option>
                      <option value="Presencial">Presencial</option>
                      <option value="Híbrido">Híbrido</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-emerald-700 mb-1 block">
                      Vacantes
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formGrupo.cantidadpersonas}
                      onChange={(e) =>
                        setFormGrupo({
                          ...formGrupo,
                          cantidadpersonas: e.target.value,
                        })
                      }
                      className="w-full border border-emerald-200 rounded-lg p-2.5 outline-none focus:border-emerald-500 bg-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-emerald-700 mb-1 block">
                      Horario *
                    </label>
                    <input
                      type="text"
                      value={formGrupo.horario}
                      onChange={(e) =>
                        setFormGrupo({ ...formGrupo, horario: e.target.value })
                      }
                      className="w-full border border-emerald-200 rounded-lg p-2.5 outline-none focus:border-emerald-500 bg-white text-sm"
                      placeholder="Sábados 9AM-1PM"
                      required
                    />
                  </div>
                  <div className="md:col-span-4 flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isLoading ? "Añadiendo..." : "Añadir Grupo"}
                    </button>
                  </div>
                </div>
              </form>

              {/* Lista de Grupos Existentes */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">
                  Grupos Activos en este Curso
                </h3>
                {isLoadingGrupos ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin text-indigo-500" />
                  </div>
                ) : listaGrupos.length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-gray-300 rounded-2xl bg-white text-gray-500 text-sm">
                    No hay grupos aperturados todavía. Crea el primero arriba.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listaGrupos.map((g) => (
                      <div
                        key={g.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2 gap-3">
                            <div>
                              <h4 className="font-bold text-gray-800 text-lg">
                                {g.nombregrupo}
                              </h4>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">
                                  {g.modalidad}
                                </span>
                                <span
                                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${getEstadoBadgeClass(
                                    g.estado || "ACTIVO"
                                  )}`}
                                >
                                  {g.estado || "ACTIVO"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                            <Clock size={14} className="text-gray-400" />
                            {g.horario}
                          </p>

                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Users size={14} className="text-gray-400" />
                            {g.cantidadpersonas} vacantes máximas
                          </p>

                          {g.fechaCierre && (
                            <p className="text-xs text-red-500 mt-2">
                              Cerrado: {new Date(g.fechaCierre).toLocaleString()}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            <MapPin size={12} />
                            {g.docente
                              ? `Docente: ${g.docente.nombre} ${g.docente.apellido}`
                              : "Sin docente asignado"}
                          </div>

                          <div className="flex flex-col md:flex-row gap-2">
                            <select
                              value={g.estado || "ACTIVO"}
                              onChange={(e) => handleCambiarEstadoGrupo(g.id, e.target.value)}
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                              disabled={isLoading}
                            >
                              <option value="ACTIVO">Activo</option>
                              <option value="PAUSADO">Pausado</option>
                              <option value="CERRADO">Cerrado</option>
                            </select>

                            {g.estado !== "CERRADO" && (
                              <button
                                type="button"
                                onClick={() => handleCerrarGrupo(g.id)}
                                disabled={isLoading}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                Cerrar grupo
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACCIONES */}
        <div className="px-8 py-5 border-t border-gray-200 bg-white shrink-0 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition text-sm"
          >
            {activeTab === "grupos" ? "Cerrar" : "Cancelar"}
          </button>

          {activeTab === "datos" && (
            <button
              type="submit"
              form="form-curso"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg text-white font-bold transition shadow-md bg-indigo-600 hover:bg-indigo-700 text-sm"
            >
              {isLoading
                ? "Procesando..."
                : cursoEditar
                  ? "Actualizar Datos"
                  : "Guardar y Añadir Grupos"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
