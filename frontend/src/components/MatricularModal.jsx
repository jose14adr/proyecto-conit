import { useState, useEffect } from "react";
import { X, BookPlus, Loader2, Search } from "lucide-react";
import { matricularAlumno } from "../services/matricula.service";
import api from "../services/api";
import toast from "react-hot-toast";

export default function MatricularModal({ alumno, onClose, onSuccess }) {
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
        console.error("Error al cargar cursos", error);
        toast.error("Error al cargar cursos");
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
        console.error("Error al cargar grupos", error);
        toast.error("Error al cargar grupos");
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

    if (!cursoSeleccionado) {
      return toast.error("Por favor, selecciona un curso");
    }

    if (!grupoSeleccionado) {
      return toast.error("Por favor, selecciona un grupo");
    }

    const cursoObjeto = cursos.find(
      (c) => c.id.toString() === cursoSeleccionado
    );

    if (!cursoObjeto) {
      return toast.error("Curso seleccionado no es válido");
    }

    setIsSubmitting(true);

    try {
      await matricularAlumno(
        alumno.id,
        parseInt(grupoSeleccionado),
        cursoObjeto.nombrecurso
      );

      toast.success("Alumno matriculado exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al matricular alumno", error);
      const mensajeError =
        error.response?.data?.message || "Error al matricular alumno";
      toast.error(mensajeError);
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
              <BookPlus size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black">Nueva Matrícula</h2>
              <p className="mt-0.5 text-sm text-white/75">
                Alumno: {alumno.nombre} {alumno.apellido}
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
                    {grupo.nombregrupo} ({grupo.horario})
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
                  Procesando...
                </>
              ) : (
                <>
                  <BookPlus size={18} />
                  Confirmar Matrícula
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}