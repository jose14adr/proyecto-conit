import { useState, useEffect } from "react";
import {
  obtenerDocentes,
  inhabilitarDocente,
  habilitarDocente,
} from "../services/docente.service";
import DocenteModal from "../components/DocenteModal";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  UserCircle,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function Docentes() {
  const [busqueda, setBusqueda] = useState("");
  const [docentes, setDocentes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [docenteEditar, setDocenteEditar] = useState(null); //Para editar un docente existente
  const [docenteInhabilitar, setDocenteInhabilitar] = useState(null); //Para inhabilitar un docente
  const [docenteHabilitar, setDocenteHabilitar] = useState(null); //Para habilitar un docente

  //Usamos nuestra funcion segura que incluye el Token en el header
  const cargarDocentes = async () => {
    try {
      setIsLoading(true);
      const data = await obtenerDocentes();
      setDocentes(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar docentes");
    } finally {
      setIsLoading(false);
    }
  };

  //Cargamos los docentes al montar el componente
  useEffect(() => {
    cargarDocentes();
  }, []);

  const solicitarInhabilitacion = (docente) => setDocenteInhabilitar(docente);
  const confirmarInhabilitacion = async () => {
    try {
      await inhabilitarDocente(docenteInhabilitar.id);
      toast.success("Docente inhabilitado correctamente");
      setDocenteInhabilitar(null);
      cargarDocentes();
    } catch (error) {
      console.error(error);
      toast.error("Error al inhabilitar docente");
    }
  };

  const solicitarHabilitacion = (docente) => setDocenteHabilitar(docente);
  const confirmarHabilitacion = async () => {
    try {
      await habilitarDocente(docenteHabilitar.id);
      toast.success("Docente habilitado correctamente");
      setDocenteHabilitar(null);
      cargarDocentes();
    } catch (error) {
      console.error(error);
      toast.error("Error al habilitar docente");
    }
  };

  const handleEditar = (docente) => {
    setDocenteEditar(docente);
    setMostrarModal(true);
  };

  const handleNuevo = () => {
    setDocenteEditar(null);
    setMostrarModal(true);
  };

  const docentesFiltrados = docentes.filter((docente) => {
    const termino = busqueda.toLowerCase();
    const nombreCompleto =
      `${docente.nombre || ""} ${docente.apellido || ""}`.toLowerCase();
    return nombreCompleto.includes(termino);
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">
        Gestión de Docentes
      </h1>

      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o apellido..."
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
          Nuevo Docente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider border-b">
              <tr>
                <th className="px-6 py-4">Docente</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Teléfono</th>
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
              ) : docentesFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No se encontraron docentes.
                  </td>
                </tr>
              ) : (
                docentesFiltrados.map((doc) => {
                  const estadoNormalizado = doc.estado
                    ? doc.estado.toUpperCase()
                    : "ACTIVO";
                  const esInactivo = estadoNormalizado === "INACTIVO";

                  return (
                    <tr
                      key={doc.id}
                      className={`transition-colors ${esInactivo ? "bg-gray-50 opacity-75" : "hover:bg-blue-50/30"}`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                        <UserCircle
                          size={36}
                          className={
                            esInactivo ? "text-gray-300" : "text-gray-400"
                          }
                        />
                        <div>
                          {doc.nombre} {doc.apellido}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="font-semibold">
                          {doc.tipoDocumento}:
                        </span>{" "}
                        {doc.numDocumento}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {doc.correo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {doc.telefono}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            esInactivo
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-green-100 text-green-700 border border-green-200"
                          }`}
                        >
                          {estadoNormalizado}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditar(doc)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>

                          {/* BOTÓN DINÁMICO: Mostrar Basurero o Check según el estado */}
                          {esInactivo ? (
                            <button
                              onClick={() => solicitarHabilitacion(doc)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Re-habilitar"
                            >
                              <CheckCircle size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => solicitarInhabilitacion(doc)}
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

      {mostrarModal && (
        <DocenteModal
          docenteEditar={docenteEditar}
          onClose={() => setMostrarModal(false)}
          onSuccess={cargarDocentes}
        />
      )}

      {/* PARA INHABILITAR */}
      {docenteInhabilitar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-zoomIn">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¿Inhabilitar Docente?
              </h3>
              <p className="text-gray-600">
                Estás a punto de inhabilitar a{" "}
                <span className="font-bold text-gray-800">
                  {docenteInhabilitar.nombre} {docenteInhabilitar.apellido}
                </span>
                . Perderá el acceso al sistema.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setDocenteInhabilitar(null)}
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

      {/* MODAL PARA HABILITAR */}
      {docenteHabilitar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-zoomIn">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¿Habilitar Docente?
              </h3>
              <p className="text-gray-600">
                Estás a punto de re-habilitar a{" "}
                <span className="font-bold text-gray-800">
                  {docenteHabilitar.nombre} {docenteHabilitar.apellido}
                </span>
                . Volverá a tener acceso al sistema y aparecerá como Activo.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setDocenteHabilitar(null)}
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
