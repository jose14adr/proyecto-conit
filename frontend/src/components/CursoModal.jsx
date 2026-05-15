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
import {
  BookOpen,
  Users,
  Loader2,
  Plus,
  Clock,
  MapPin,
  X,
  Save,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("datos");
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
      setListaGrupos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar los grupos del curso");
    } finally {
      setIsLoadingGrupos(false);
    }
  };

  const onSubmitDatos = async (data) => {
    try {
      setIsLoading(true);

      const dataToSend = {
        ...data,
        precio_final: precioFinal,
      };

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
      console.error(error);
      toast.error(
        error.response?.data?.message || "Ocurrió un error al guardar"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrearGrupo = async (e) => {
    e.preventDefault();

    if (!formGrupo.horario) {
      return toast.error("El horario es obligatorio");
    }

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
        nombregrupo: `Grupo ${String.fromCharCode(
          65 + listaGrupos.length + 1
        )}`,
        horario: "",
      });

      cargarGruposDelCurso();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el grupo");
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
      console.error(error);
      toast.error(error.response?.data?.message || "No se pudo cerrar el grupo");
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
      console.error(error);
      toast.error(
        error.response?.data?.message || "No se pudo actualizar el estado"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case "CERRADO":
        return "bg-red-100 text-red-700 border border-red-200";
      case "PAUSADO":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      default:
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    }
  };

  const getInputClass = (error) =>
    `w-full rounded-2xl border px-4 py-3 mt-1 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted-text)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] ${
      error
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-[var(--color-border)] bg-[var(--color-background)] focus:border-[var(--color-primary)]"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 py-4 backdrop-blur-sm">
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl animate-fadeIn">
        {/* HEADER */}
        <div
          className="shrink-0 px-8 pt-7 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
          }}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/20 p-2.5 backdrop-blur">
                <BookOpen size={26} />
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  {cursoEditar
                    ? "Gestión Comercial del Curso"
                    : "Registrar Nuevo Curso"}
                </h2>

                <p className="mt-1 text-sm text-white/75">
                  Configura la información comercial y la apertura de grupos.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 transition hover:bg-white/20"
              title="Cerrar"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex gap-6 border-b border-white/15">
            <button
              type="button"
              onClick={() => setActiveTab("datos")}
              className={`border-b-2 pb-4 text-sm font-bold transition ${
                activeTab === "datos"
                  ? "border-white text-white"
                  : "border-transparent text-white/65 hover:text-white"
              }`}
            >
              Información Comercial
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("grupos")}
              disabled={!cursoIdActual}
              className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-bold transition ${
                activeTab === "grupos"
                  ? "border-white text-white"
                  : "border-transparent text-white/65 hover:text-white"
              } disabled:cursor-not-allowed disabled:opacity-40`}
              title={
                !cursoIdActual
                  ? "Guarda el curso primero para añadir grupos"
                  : ""
              }
            >
              <Users size={16} />
              Apertura de Grupos
            </button>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto bg-[var(--color-background)] p-8">
          {activeTab === "datos" && (
            <form
              id="form-curso"
              onSubmit={handleSubmit(onSubmitDatos)}
              className="animate-fadeIn"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="space-y-4 md:col-span-8">
                  <Campo
                    label="Nombre del Curso *"
                    error={errors.nombrecurso}
                  >
                    <input
                      type="text"
                      {...register("nombrecurso")}
                      className={getInputClass(errors.nombrecurso)}
                      placeholder="Ej: Diplomado en Salud Ocupacional"
                    />
                  </Campo>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Campo label="Nivel Académico" error={errors.nivel}>
                      <select
                        {...register("nivel")}
                        className={getInputClass(errors.nivel)}
                      >
                        <option value="Básico">Básico</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                      </select>
                    </Campo>

                    <Campo
                      label="Duración (Horas) *"
                      error={errors.duracion}
                    >
                      <input
                        type="number"
                        {...register("duracion")}
                        className={getInputClass(errors.duracion)}
                        placeholder="Ej: 120"
                      />
                    </Campo>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Campo label="Créditos *" error={errors.creditos}>
                      <input
                        type="number"
                        {...register("creditos")}
                        className={getInputClass(errors.creditos)}
                        placeholder="Ej: 4"
                      />
                    </Campo>

                    <Campo
                      label="Dedicación Sugerida"
                      error={errors.tiemposemana}
                    >
                      <input
                        type="text"
                        {...register("tiemposemana")}
                        className={getInputClass(errors.tiemposemana)}
                        placeholder="Ej: 4 horas/semana"
                      />
                    </Campo>
                  </div>

                  <Campo
                    label="Público Objetivo"
                    error={errors.publicoobjetivo}
                  >
                    <input
                      type="text"
                      {...register("publicoobjetivo")}
                      className={getInputClass(errors.publicoobjetivo)}
                      placeholder="Ej: Ingenieros y médicos ocupacionales"
                    />
                  </Campo>

                  <Campo label="Descripción Breve" error={errors.descripcion}>
                    <textarea
                      {...register("descripcion")}
                      rows="3"
                      className={`${getInputClass(errors.descripcion)} resize-none`}
                      placeholder="¿De qué trata este curso?"
                    />
                  </Campo>
                </div>

                <div className="h-fit rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm md:col-span-4">
                  <h3 className="mb-4 border-b border-[var(--color-border)] pb-3 font-black text-[var(--color-primary)]">
                    Costos y Promociones
                  </h3>

                  <div className="space-y-4">
                    <Campo label="Precio Base (S/.) *" error={errors.precio}>
                      <input
                        type="number"
                        step="0.01"
                        {...register("precio")}
                        className={getInputClass(errors.precio)}
                        placeholder="0.00"
                      />
                    </Campo>

                    <Campo label="Descuento (%)" error={errors.descuento}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--color-muted-text)]">
                          Opcional
                        </span>
                      </div>

                      <input
                        type="number"
                        {...register("descuento")}
                        className={getInputClass(errors.descuento)}
                        placeholder="0 - 100"
                      />
                    </Campo>

                    <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                      <p className="mb-2 text-xs font-black uppercase tracking-wider text-[var(--color-muted-text)]">
                        Costo Final al Alumno
                      </p>

                      <div className="rounded-2xl bg-[var(--color-button-primary)] p-5 text-center text-[var(--color-button-primary-text)] shadow-sm">
                        {descuento > 0 && (
                          <p className="mb-0.5 text-sm line-through opacity-70">
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

          {activeTab === "grupos" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Formulario Añadir Grupo */}
              <form
                onSubmit={handleCrearGrupo}
                className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm"
              >
                <h3 className="mb-4 flex items-center gap-2 font-black text-[var(--color-text)]">
                  <Plus size={18} className="text-[var(--color-primary)]" />
                  Aperturar Nuevo Grupo
                </h3>

                <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
                  <GrupoCampo label="Nombre / Letra">
                    <input
                      type="text"
                      value={formGrupo.nombregrupo}
                      onChange={(e) =>
                        setFormGrupo({
                          ...formGrupo,
                          nombregrupo: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
                      required
                    />
                  </GrupoCampo>

                  <GrupoCampo label="Modalidad">
                    <select
                      value={formGrupo.modalidad}
                      onChange={(e) =>
                        setFormGrupo({
                          ...formGrupo,
                          modalidad: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
                    >
                      <option value="Virtual Asincrónico">Asincrónico</option>
                      <option value="Virtual en Vivo">En Vivo</option>
                      <option value="Presencial">Presencial</option>
                      <option value="Híbrido">Híbrido</option>
                    </select>
                  </GrupoCampo>

                  <GrupoCampo label="Vacantes">
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
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
                      required
                    />
                  </GrupoCampo>

                  <GrupoCampo label="Horario *">
                    <input
                      type="text"
                      value={formGrupo.horario}
                      onChange={(e) =>
                        setFormGrupo({
                          ...formGrupo,
                          horario: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
                      placeholder="Sábados 9AM-1PM"
                      required
                    />
                  </GrupoCampo>

                  <div className="mt-2 flex justify-end md:col-span-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="rounded-xl bg-[var(--color-button-primary)] px-5 py-2.5 text-sm font-bold text-[var(--color-button-primary-text)] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? "Añadiendo..." : "Añadir Grupo"}
                    </button>
                  </div>
                </div>
              </form>

              {/* Lista de Grupos Existentes */}
              <div>
                <h3 className="mb-4 font-black text-[var(--color-text)]">
                  Grupos activos en este curso
                </h3>

                {isLoadingGrupos ? (
                  <div className="flex justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8">
                    <Loader2 className="animate-spin text-[var(--color-primary)]" />
                  </div>
                ) : listaGrupos.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center text-sm text-[var(--color-muted-text)]">
                    No hay grupos aperturados todavía. Crea el primero arriba.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {listaGrupos.map((g) => (
                      <div
                        key={g.id}
                        className="flex flex-col justify-between rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm transition hover:border-[var(--color-primary)]"
                      >
                        <div>
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-lg font-black text-[var(--color-text)]">
                                {g.nombregrupo}
                              </h4>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-2.5 py-1 text-xs font-bold text-[var(--color-primary)]">
                                  {g.modalidad}
                                </span>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${getEstadoBadgeClass(
                                    g.estado || "ACTIVO"
                                  )}`}
                                >
                                  {g.estado || "ACTIVO"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="mt-2 flex items-center gap-2 text-sm text-[var(--color-muted-text)]">
                            <Clock size={14} />
                            {g.horario}
                          </p>

                          <p className="mt-1 flex items-center gap-2 text-sm text-[var(--color-muted-text)]">
                            <Users size={14} />
                            {g.cantidadpersonas} vacantes máximas
                          </p>

                          {g.fechaCierre && (
                            <p className="mt-2 text-xs font-semibold text-red-500">
                              Cerrado:{" "}
                              {new Date(g.fechaCierre).toLocaleString()}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 space-y-3 border-t border-[var(--color-border)] pt-4">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-muted-text)]">
                            <MapPin size={12} />
                            {g.docente
                              ? `Docente: ${g.docente.nombre} ${g.docente.apellido}`
                              : "Sin docente asignado"}
                          </div>

                          <div className="flex flex-col gap-2 md:flex-row">
                            <select
                              value={g.estado || "ACTIVO"}
                              onChange={(e) =>
                                handleCambiarEstadoGrupo(g.id, e.target.value)
                              }
                              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
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
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
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

        {/* FOOTER */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-card)] px-8 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] disabled:opacity-50"
          >
            {activeTab === "grupos" ? "Cerrar" : "Cancelar"}
          </button>

          {activeTab === "datos" && (
            <button
              type="submit"
              form="form-curso"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-button-primary)] px-6 py-2.5 text-sm font-bold text-[var(--color-button-primary-text)] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {cursoEditar ? "Actualizar Datos" : "Guardar y Añadir Grupos"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
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

function GrupoCampo({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-[var(--color-muted-text)]">
        {label}
      </label>

      {children}
    </div>
  );
}