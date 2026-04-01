import { useState, useEffect } from "react";
import {
  obtenerAlumno,
  eliminarAlumno,
  habilitarAlumno,
} from "../services/alumno.service";
import AlumnoModal from "../components/AlumnoModal";
import AlumnoPerfilModal from "../components/AlumnoPerfilModal";
import MatricularModal from "../components/MatricularModal";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  User,
  AlertTriangle,
  CheckCircle,
  Users,
  BookPlus,
} from "lucide-react";

export default function Alumnos() {
  //Buscar alumno
  const [busqueda, setBusqueda] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //Alumno a editar, inhabilitar o habilitar
  const [alumnoEditar, setAlumnoEditar] = useState(null);
  const [alumnoInhabilitar, setAlumnoInhabilitar] = useState(null);
  const [alumnoHabilitar, setAlumnoHabilitar] = useState(null);
  const [alumnoVer, setAlumnoVer] = useState(null);

  const [alumnoMatricular, setAlumnoMatricular] = useState(null);

  const cargarAlumnos = async () => {
    try {
      setIsLoading(true);
      const data = await obtenerAlumno();
      setAlumnos(data);
    } catch (error) {
      toast.error("Error al cargar alumnos");
      console.error("Error al cargar alumnos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarAlumnos();
  }, []);

  const solicitarInhabilitacion = (alumno) => setAlumnoInhabilitar(alumno);
  const confirmarInhabilitacion = async () => {
    try {
      await eliminarAlumno(alumnoInhabilitar.id);
      toast.success("Alumno inhabilitado correctamente");
      setAlumnoInhabilitar(null);
      cargarAlumnos();
    } catch (error) {
      console.error("Error al inhabilitar alumno:", error);
      toast.error("Error al inhabilitar alumno");
    }
  };

  const solicitarHabilitacion = (alumno) => setAlumnoHabilitar(alumno);
  const confirmarHabilitacion = async () => {
    try {
      await habilitarAlumno(alumnoHabilitar.id);
      toast.success("Alumno habilitado correctamente");
      setAlumnoHabilitar(null);
      cargarAlumnos();
    } catch (error) {
      toast.error("Error al habilitar alumno");
      console.error("Error al habilitar alumno:", error);
    }
  };

  const handleEditar = (alumno) => {
    setAlumnoEditar(alumno);
    setMostrarModal(true);
  };

  const handleNuevo = () => {
    setAlumnoEditar(null);
    setMostrarModal(true);
  };

  const alumnosFiltrados = alumnos.filter((alumno) => {
    const termino = busqueda.toLowerCase();
    const nombreCompleto =
      `${alumno.nombre || ""} ${alumno.apellido || ""}`.toLowerCase();
    const documento = (
      alumno.numdocumento ||
      alumno.numDocumento ||
      ""
    ).toLowerCase();

    return nombreCompleto.includes(termino) || documento.includes(termino);
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 rounded-xl flex items-center justify-between px-8 text-white shadow">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Users size={28} /> Gestión de Alumnos
          </h2>
          <p className="text-sm opacity-90 mt-2">
            Administra el registro, edición y estado de los estudiantes.
          </p>
        </div>
        <button
          onClick={handleNuevo}
          className="bg-white text-indigo-700 hover:bg-gray-100 px-5 py-2.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          Nuevo Alumno
        </button>
      </div>

      {/* Contenedor de busqueda y tabla */}
      <div className="bg-white p-6 rounded-xl shadow">
        {/* Buscador */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o documento..."
              className="pl-10 border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider border-b">
              <tr>
                <th className="px-6 py-4">Alumno</th>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500 font-medium"
                  >
                    Cargando datos...
                  </td>
                </tr>
              ) : alumnosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500 font-medium"
                  >
                    No se encontraron alumnos.
                  </td>
                </tr>
              ) : (
                alumnosFiltrados.map((alumno) => {
                  const esInactivo = alumno.estado === false;
                  const textoEstado = esInactivo ? "INACTIVO" : "ACTIVO";

                  return (
                    <tr
                      key={alumno.id}
                      className={`transition-colors ${esInactivo ? "bg-gray-50 opacity-75" : "hover:shadow-sm"}`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-4">
                        <div
                          className={`p-3 rounded-lg ${esInactivo ? "bg-gray-200 text-gray-500" : "bg-indigo-100 text-indigo-600"}`}
                        >
                          <User size={24} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-base">
                            {alumno.nombre} {alumno.apellido}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="font-semibold text-gray-700">
                          {alumno.tipoDocumento || "DNI"}:
                        </span>{" "}
                        {alumno.numDocumento || alumno.numdocumento}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="font-medium">{alumno.correo}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {alumno.telefono}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                            esInactivo
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {textoEstado}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setAlumnoVer(alumno)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver Perfil"
                          >
                            <User size={18} />
                          </button>
                          <button
                            onClick={() => setAlumnoMatricular(alumno)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Matricular en Curso"
                          >
                            <BookPlus size={18} />
                          </button>
                          <button
                            onClick={() => handleEditar(alumno)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>

                          {esInactivo ? (
                            <button
                              onClick={() => solicitarHabilitacion(alumno)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Re-habilitar"
                            >
                              <CheckCircle size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => solicitarInhabilitacion(alumno)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <AlumnoModal
          alumnoEditar={alumnoEditar}
          onClose={() => setMostrarModal(false)}
          onSuccess={cargarAlumnos}
        />
      )}

      {alumnoVer && (
        <AlumnoPerfilModal
          alumno={alumnoVer}
          onClose={() => setAlumnoVer(null)}
        />
      )}

      {alumnoMatricular && (
        <MatricularModal
          alumno={alumnoMatricular}
          onClose={() => setAlumnoMatricular(null)}
          onSuccess={cargarAlumnos}
        />
      )}

      {/* Modal de confirmación */}
      {alumnoInhabilitar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¿Inhabilitar Alumno?
              </h3>
              <p className="text-gray-600">
                Estás a punto de inhabilitar a{" "}
                <span className="font-bold text-gray-800">
                  {alumnoInhabilitar.nombre} {alumnoInhabilitar.apellido}
                </span>
                .
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setAlumnoInhabilitar(null)}
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

      {alumnoHabilitar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¿Habilitar Alumno?
              </h3>
              <p className="text-gray-600">
                Estás a punto de re-habilitar a{" "}
                <span className="font-bold text-gray-800">
                  {alumnoHabilitar.nombre} {alumnoHabilitar.apellido}
                </span>
                .
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setAlumnoHabilitar(null)}
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
