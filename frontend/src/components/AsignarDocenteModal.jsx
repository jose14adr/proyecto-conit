import { useState, useEffect } from "react";
import { X, BookPlus, Loader2, Search, Briefcase } from "lucide-react";
import { asignarDocenteAGrupo } from "../services/grupo.service";
import api from "../services/api";
import toast from "react-hot-toast";

export default function AsignarDocenteModal({ docente, onClose, onSuccess }) {
  const [cursos, setCursos] = useState([]);
  const [grupos, setGrupos] = useState([]);

  const [busquedaCurso, setBusquedaCurso] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [mostrarDropdownCursos, setMostrarDropdownCursos] = useState(false);

  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");

  const [isLoadingCursos, setIsLoadingCursos] = useState(false);
  const [isLoadingGrupos, setIsLoadingGrupos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const cargarCursos = async () => {
      setIsLoadingCursos(true);

      try {
        const response = await api.get("/curso");
        const cursosActivos = response.data.filter((c) => c.estado !== false);
        setCursos(cursosActivos);
      } catch (error) {
        console.error("Error al cargar la lista de cursos:", error);
        toast.error("Error al cargar la lista de cursos");
      } finally {
        setIsLoadingCursos(false);
      }
    };

    cargarCursos();
  }, []);

  useEffect(() => {
    if (!cursoSeleccionado) {
      setGrupos([]);
      setGrupoSeleccionado("");
      return;
    }

    const cargarGrupos = async () => {
      setIsLoadingGrupos(true);

      try {
        const response = await api.get(`/grupo/curso/${cursoSeleccionado}`);
        setGrupos(response.data);
      } catch (error) {
        console.error("Error al cargar los grupos:", error);
        toast.error("Error al cargar los grupos");
      } finally {
        setIsLoadingGrupos(false);
      }
    };

    cargarGrupos();
  }, [cursoSeleccionado]);

  const cursosFiltrados = cursos.filter((curso) => {
    const textoCurso = curso.nombrecurso || `Curso #${curso.id}`;
    return textoCurso.toLowerCase().includes(busquedaCurso.toLowerCase());
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cursoSeleccionado || !grupoSeleccionado) {
      return toast.error("Por favor, selecciona un curso y un grupo");
    }

    const grupoEncontrado = grupos.find(
      (g) => g.id.toString() === grupoSeleccionado
    );

    if (grupoEncontrado && grupoEncontrado.docente) {
      if (grupoEncontrado.docente.id === docente.id) {
        return toast.error("Este docente ya está asignado a este grupo.");
      }

      return toast.error(
        `Este grupo ya está siendo dictado por el docente ${grupoEncontrado.docente.nombre} ${grupoEncontrado.docente.apellido}.`
      );
    }

    setIsSubmitting(true);

    try {
      const permisosDefault = {
        control_total: false,
        gestionar_contenido: false,
        gestionar_tareas: false,
        gestionar_examenes: false,
        gestionar_sesiones: false,
        tomar_asistencia: true,
        gestionar_calificaciones: false,
      };

      await asignarDocenteAGrupo(
        grupoSeleccionado,
        docente.id,
        permisosDefault
      );

      toast.success("Carga académica asignada exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al asignar carga académica:", error);
      toast.error(
        error.response?.data?.message || "Error al asignar carga académica"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
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
            <div className="rounded-2xl bg-white/20 p-2 backdrop-blur-sm">
              <Briefcase size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black">Asignar Carga Académica</h2>
              <p className="mt-0.5 text-sm text-white/75">
                Docente: {docente.nombre} {docente.apellido}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-white/20"
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Buscador de cursos */}
          <div className="relative">
            <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text)]">
              1. Busca y selecciona el curso
            </label>

            <div
              className={`flex items-center rounded-2xl border px-3 py-2.5 transition-all ${
                mostrarDropdownCursos
                  ? "border-[var(--color-primary)] bg-[var(--color-card)] ring-4 ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
                  : "border-[var(--color-border)] bg-[var(--color-background)]"
              }`}
            >
              <Search
                size={18}
                className="mr-2 shrink-0 text-[var(--color-muted-text)]"
              />

              <input
                type="text"
                className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted-text)]"
                placeholder="Escribe el nombre del curso..."
                value={busquedaCurso}
                onChange={(e) => {
                  setBusquedaCurso(e.target.value);
                  setMostrarDropdownCursos(true);
                  setCursoSeleccionado("");
                  setGrupoSeleccionado("");
                }}
                onFocus={() => setMostrarDropdownCursos(true)}
                onBlur={() =>
                  setTimeout(() => setMostrarDropdownCursos(false), 200)
                }
              />

              {isLoadingCursos && (
                <Loader2
                  size={16}
                  className="shrink-0 animate-spin text-[var(--color-primary)]"
                />
              )}
            </div>

            {mostrarDropdownCursos && (
              <div className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl">
                {cursosFiltrados.length === 0 ? (
                  <div className="p-3 text-center text-sm text-[var(--color-muted-text)]">
                    No se encontraron cursos
                  </div>
                ) : (
                  cursosFiltrados.map((curso) => {
                    const nombreVisible =
                      curso.nombrecurso || `Curso #${curso.id}`;

                    return (
                      <button
                        key={curso.id}
                        type="button"
                        className="w-full border-b border-[var(--color-border)] px-4 py-3 text-left text-sm text-[var(--color-text)] transition last:border-0 hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
                        onClick={() => {
                          setCursoSeleccionado(curso.id.toString());
                          setBusquedaCurso(nombreVisible);
                          setMostrarDropdownCursos(false);
                          setGrupoSeleccionado("");
                        }}
                      >
                        {nombreVisible}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Selector de grupos */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text)]">
              2. Selecciona el grupo
            </label>

            <div className="relative">
              <select
                className="w-full appearance-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
                value={grupoSeleccionado}
                onChange={(e) => setGrupoSeleccionado(e.target.value)}
                disabled={
                  !cursoSeleccionado || isLoadingGrupos || grupos.length === 0
                }
                required
              >
                <option value="">
                  {!cursoSeleccionado
                    ? "Primero elige un curso arriba"
                    : grupos.length === 0 && !isLoadingGrupos
                    ? "No hay grupos disponibles para este curso"
                    : "-- Elige un grupo --"}
                </option>

                {grupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nombregrupo} ({grupo.horario}){" "}
                    {grupo.docente ? " - Ocupado" : ""}
                  </option>
                ))}
              </select>

              {isLoadingGrupos && (
                <Loader2
                  size={16}
                  className="absolute right-3 top-3.5 animate-spin text-[var(--color-primary)]"
                />
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!grupoSeleccionado || isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-button-primary)] px-5 py-2.5 font-semibold text-[var(--color-button-primary-text)] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Asignando...
                </>
              ) : (
                <>
                  <BookPlus size={18} />
                  Asignar Curso
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}