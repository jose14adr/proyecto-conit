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
      (c) => c.id.toString() === cursoSeleccionado,
    );

    if (!cursoObjeto) {
      return toast.error("Curso seleccionado no es válido");
    }

    setIsSubmitting(true);
    try {
      await matricularAlumno(
        alumno.id,
        parseInt(grupoSeleccionado),
        cursoObjeto.nombrecurso,
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <BookPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Nueva Matrícula</h2>
              <p className="text-indigo-100 text-sm mt-0.5">
                Alumno: {alumno.nombre} {alumno.apellido}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              1. Busca y Selecciona el Curso
            </label>
            <div
              className={`flex items-center border rounded-lg px-3 py-2 bg-gray-50 transition-all ${mostrarDropdownCursos ? "border-indigo-500 ring-2 ring-indigo-100 bg-white" : "border-gray-300"}`}
            >
              <Search size={18} className="text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                className="w-full outline-none bg-transparent text-gray-700"
                placeholder="Escribe el nombre del curso..."
                value={busquedaCurso}
                onChange={(e) => {
                  setBusquedaCurso(e.target.value);
                  setMostrarDropdownCursos(true);
                  setCursoSeleccionado(""); // Resetea si empieza a borrar
                }}
                onFocus={() => setMostrarDropdownCursos(true)}
                onBlur={() =>
                  setTimeout(() => setMostrarDropdownCursos(false), 200)
                }
              />
              {isLoadingCursos && (
                <Loader2
                  size={16}
                  className="animate-spin text-indigo-500 shrink-0"
                />
              )}
            </div>

            {/* Dropdown flotante con los resultados */}
            {mostrarDropdownCursos && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                {cursosFiltrados.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">
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
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 hover:text-indigo-700 border-b border-gray-50 last:border-0 transition-colors"
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

          {/* Select de Grupos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              2. Selecciona el Grupo
            </label>
            <div className="relative">
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  className="absolute right-3 top-3 animate-spin text-indigo-500"
                />
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!grupoSeleccionado || isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  <BookPlus size={18} /> Confirmar Matrícula
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
