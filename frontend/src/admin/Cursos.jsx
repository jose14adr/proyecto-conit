import { useState, useEffect } from "react";
import {
  obtenerCursos,
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
      const data = await obtenerCursos();
      setCursos(data);
    } catch (error) {
      console.error("Error al cargar los cursos:", error);
      toast.error("Ocurrió un error al cargar los cursos");
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
      console.error("Error al inhabilitar el curso:", error);
      toast.error("Ocurrió un error al inhabilitar el curso");
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
      console.error("Error al habilitar el curso:", error);
      toast.error("Ocurrió un error al habilitar el curso");
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
    const nombre = (curso.nombreCurso || "").toLowerCase();
    return nombre.includes(temario);
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">
        Gestión de Cursos
      </h1>

      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar curso por nombre..."
            className="pl-10 border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#5573b3]"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <button
          onClick={handleNuevo}
          className="bg-[#5573b3] hover:bg-[#344c92] text-white px-5 py-2 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Curso
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider border-b">
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
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Cargando datos...
                  </td>
                </tr>
              ) : cursosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No se encontraron cursos.
                  </td>
                </tr>
              ) : (
                cursosFiltrados.map((curso) => {
                  //LÓGICA DE ESTADO BOOLEANO
                  //Si es false, está inactivo. Si es true o null, es activo.
                  const esInactivo = curso.estado === false;
                  const textoEstado = esInactivo ? "INACTIVO" : "ACTIVO";

                  return (
                    <tr
                      key={curso.id}
                      className={`transition-colors ${esInactivo ? "bg-gray-50 opacity-75" : "hover:bg-blue-50/30"}`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${esInactivo ? "bg-gray-200 text-gray-400" : "bg-blue-100 text-blue-600"}`}
                        >
                          <BookOpen size={24} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">
                            {curso.nombreCurso}
                          </div>
                          <div className="text-xs text-gray-500 font-normal truncate max-w-[200px]">
                            {curso.descripcion || "Sin descripción"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="font-medium bg-gray-100 px-2 py-1 rounded-md">
                          {curso.nivel || "N/A"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                        {curso.precio != null
                          ? `S/. ${Number(curso.precio).toFixed(2)}`
                          : "Gratis"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {curso.duracion} hrs / {curso.creditos} crs
                      </td>

                      {/* Etiqueta de Estado */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            esInactivo
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-green-100 text-green-700 border border-green-200"
                          }`}
                        >
                          {textoEstado}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditar(curso)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>

                          {/* Mostrar Basurero o Check según el estado */}
                          {esInactivo ? (
                            <button
                              onClick={() => solicitarHabilitacion(curso)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Re-habilitar"
                            >
                              <CheckCircle size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => solicitarInhabilitacion(curso)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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

      {/* Renderiza el modal de formulario */}
      {mostrarModal && (
        <CursoModal
          cursoEditar={cursoEditar}
          onClose={() => setMostrarModal(false)}
          onSuccess={cargarCursos}
        />
      )}

      {/* Modal para inhabilitar */}
      {cursoInhabilitar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-zoomIn">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¿Inhabilitar Curso?
              </h3>
              <p className="text-gray-600">
                Estás a punto de inhabilitar el curso{" "}
                <span className="font-bold text-gray-800">
                  {cursoInhabilitar.nombreCurso}
                </span>
                . Dejará de estar disponible para nuevas asignaciones.
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
                className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                Sí, inhabilitar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para habilitar */}
      {cursoHabilitar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-zoomIn">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¿Habilitar Curso?
              </h3>
              <p className="text-gray-600">
                Estás a punto de re-habilitar el curso{" "}
                <span className="font-bold text-gray-800">
                  {cursoHabilitar.nombreCurso}
                </span>
                . Volverá a estar visible y disponible.
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
                className="px-4 py-2 bg-green-600 text-white font-medium hover:bg-green-700 rounded-lg transition-colors shadow-sm"
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
