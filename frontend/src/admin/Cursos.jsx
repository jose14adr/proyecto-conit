import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  obtenerCurso,
  eliminarCurso,
  habilitarCurso,
} from "../services/curso.service";
import CursoModal from "../components/CursoModal";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function Cursos() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [cursos, setCursos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [cursoEditar, setCursoEditar] = useState(null);
  const [cursoInhabilitar, setCursoInhabilitar] = useState(null);
  const [cursoHabilitar, setCursoHabilitar] = useState(null);

  const cargarCursos = async () => {
    try {
      setIsLoading(true);
      const data = await obtenerCurso();
      setCursos(data);
    } catch (error) {
      toast.error("Error al cargar los cursos",error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarCursos();
  }, []);

  const solicitarInhabilitacion = (curso) => setCursoInhabilitar(curso);
  const confirmarInhabilitacion = async () => {
    try {
      await eliminarCurso(cursoInhabilitar.id);
      toast.success("Curso inhabilitado exitosamente");
      setCursoInhabilitar(null);
      cargarCursos();
    } catch (error) {
      toast.error("Ocurrió un error al inhabilitar el curso", error);
    }
  };

  const solicitarHabilitacion = (curso) => setCursoHabilitar(curso);
  const confirmarHabilitacion = async () => {
    try {
      await habilitarCurso(cursoHabilitar.id);
      toast.success("Curso habilitado exitosamente");
      setCursoHabilitar(null);
      cargarCursos();
    } catch (error) {
      toast.error("Ocurrió un error al habilitar el curso", error);
    }
  };

  const handleEditar = (curso) => {
    setCursoEditar(curso);
    setMostrarModal(true);
  };

  const handleNuevo = () => {
    setCursoEditar(null);
    setMostrarModal(true);
  };

  const cursosFiltrados = cursos.filter((curso) => {
    const temario = busqueda.toLowerCase();
    const nombre = (curso.nombrecurso || "").toLowerCase();
    return nombre.includes(temario);
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 rounded-xl flex items-center justify-between px-8 text-white shadow">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <BookOpen size={28} /> Gestión de Cursos
          </h2>
          <p className="text-sm opacity-90 mt-2">
            Administra el catálogo de cursos, precios, duraciones y niveles.
          </p>
        </div>
        <button
          onClick={handleNuevo}
          className="bg-white text-indigo-700 hover:bg-gray-100 px-5 py-2.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          Nuevo Curso
        </button>
      </div>

      {/* Contenedor de busqueda y tabla */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar curso por nombre..."
              className="pl-10 border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider border-b">
              <tr>
                <th className="px-6 py-4">Curso</th>
                <th className="px-6 py-4">Nivel</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Duración</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500 font-medium"
                  >
                    Cargando datos...
                  </td>
                </tr>
              ) : cursosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500 font-medium"
                  >
                    No se encontraron cursos.
                  </td>
                </tr>
              ) : (
                cursosFiltrados.map((curso) => {
                  const esInactivo = curso.estado === false;
                  const textoEstado = esInactivo ? "INACTIVO" : "ACTIVO";

                  return (
                    <tr
                      key={curso.id}
                      onClick={() => navigate(`/admin/cursos/${curso.id}`)}
                      className={`transition-colors cursor-pointer group ${esInactivo ? "bg-gray-50 opacity-75" : "hover:bg-indigo-50/60"}`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-4">
                        <div
                          className={`p-3 rounded-lg ${esInactivo ? "bg-gray-200 text-gray-500" : "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"}`}
                        >
                          <BookOpen size={24} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-base group-hover:text-indigo-700 transition-colors">
                            {curso.nombrecurso}
                          </div>
                          <div className="text-xs text-gray-500 font-normal truncate max-w-[200px] mt-0.5">
                            {curso.descripcion || "Sin descripción"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="font-medium bg-gray-100 px-2 py-1.5 rounded-md border border-gray-200">
                          {curso.nivel || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-700">
                        {curso.precio != null
                          ? `S/. ${Number(curso.precio).toFixed(2)}`
                          : "Gratis"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="font-medium text-gray-800">
                          {curso.duracion} hrs
                        </span>{" "}
                        / {curso.creditos} crs
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${esInactivo ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                        >
                          {textoEstado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditar(curso);
                            }}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 bg-indigo-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          {esInactivo ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                solicitarHabilitacion(curso);
                              }}
                              className="p-2 text-green-600 hover:bg-green-100 bg-green-50 rounded-lg transition-colors"
                              title="Re-habilitar"
                            >
                              <CheckCircle size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                solicitarInhabilitacion(curso);
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 bg-red-50 rounded-lg transition-colors"
                              title="Inhabilitar"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarModal && (
        <CursoModal
          cursoEditar={cursoEditar}
          onClose={() => setMostrarModal(false)}
          onSuccess={cargarCursos}
        />
      )}

      {/* Modal Inhabilitar */}
      {cursoInhabilitar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¿Inhabilitar Curso?
              </h3>
              <p className="text-gray-600">
                Estás a punto de inhabilitar{" "}
                <span className="font-bold text-gray-800">
                  {cursoInhabilitar.nombrecurso}
                </span>
                .
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setCursoInhabilitar(null)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarInhabilitacion}
                className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors shadow"
              >
                Sí, inhabilitar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Habilitar */}
      {cursoHabilitar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¿Habilitar Curso?
              </h3>
              <p className="text-gray-600">
                Estás a punto de re-habilitar{" "}
                <span className="font-bold text-gray-800">
                  {cursoHabilitar.nombrecurso}
                </span>
                .
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setCursoHabilitar(null)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarHabilitacion}
                className="px-4 py-2 bg-green-600 text-white font-medium hover:bg-green-700 rounded-lg transition-colors shadow"
              >
                Sí, habilitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
