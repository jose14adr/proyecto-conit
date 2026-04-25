import { useState, useEffect } from "react";
import {
  obtenerDocente,
  inhabilitarDocente,
  habilitarDocente,
} from "../services/docente.service";
import DocenteModal from "../components/DocenteModal";
import DocentePerfilModal from "../components/DocentePerfilModal";
import AsignarDocenteModal from "../components/AsignarDocenteModal";
import PermisosDocenteModal from "../components/PermisosDocenteModal";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Users,
  BookPlus,
} from "lucide-react";

export default function Docentes() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("habilitados");
  const [docentes, setDocentes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [docenteEditar, setDocenteEditar] = useState(null);
  const [docenteInhabilitar, setDocenteInhabilitar] = useState(null);
  const [docenteHabilitar, setDocenteHabilitar] = useState(null);

  const [docenteVer, setDocenteVer] = useState(null);
  const [docenteAsignar, setDocenteAsignar] = useState(null);

  // NUEVO: Estado para controlar el modal de permisos
  const [grupoPermisosEditar, setGrupoPermisosEditar] = useState(null);

  const cargarDocentes = async () => {
    try {
      setIsLoading(true);
      const data = await obtenerDocente();
      setDocentes(data);
    } catch (error) {
      toast.error("Error al cargar docentes");
      console.error("Error al cargar docentes:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
    const documento = (
      docente.numdocumento ||
      docente.numDocumento ||
      ""
    ).toLowerCase();
    const correo = (docente.correo || "").toLowerCase();

    const coincideTexto =
      nombreCompleto.includes(termino) ||
      documento.includes(termino) ||
      correo.includes(termino);

    let coincideEstado = true;
    if (filtroEstado === "habilitados") {
      coincideEstado = docente.estado === true || docente.estado === null;
    } else if (filtroEstado === "inhabilitados") {
      coincideEstado = docente.estado === false;
    }

    return coincideTexto && coincideEstado;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 rounded-xl flex items-center justify-between px-8 text-white shadow">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Users size={28} /> Gestión de Docentes
          </h2>
          <p className="text-sm opacity-90 mt-2">
            Administra el registro, edición y estado del personal docente.
          </p>
        </div>
        <button
          onClick={handleNuevo}
          className="bg-white text-indigo-700 hover:bg-gray-100 px-5 py-2.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          Nuevo Docente
        </button>
      </div>

      {/* Contenedor de búsqueda y tabla */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o apellido..."
              className="pl-10 border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="sm:w-48 shrink-0">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium cursor-pointer"
            >
              <option value="habilitados">Solo Habilitados</option>
              <option value="inhabilitados">Solo Inhabilitados</option>
              <option value="todos">Mostrar Todos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider border-b">
              <tr>
                <th className="px-6 py-4">Docente</th>
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
              ) : docentesFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500 font-medium"
                  >
                    No se encontraron docentes.
                  </td>
                </tr>
              ) : (
                docentesFiltrados.map((docente) => {
                  const esInactivo = docente.estado === false;
                  const textoEstado = esInactivo ? "INACTIVO" : "ACTIVO";

                  return (
                    <tr
                      key={docente.id}
                      onClick={() => setDocenteVer(docente)}
                      className={`transition-colors cursor-pointer group ${
                        esInactivo
                          ? "bg-gray-50 opacity-75"
                          : "hover:bg-indigo-50/60"
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-4">
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center text-lg font-bold transition-colors uppercase ${
                            esInactivo
                              ? "bg-gray-200 text-gray-500"
                              : "bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white"
                          }`}
                        >
                          {docente.nombre?.charAt(0)}
                          {docente.apellido?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-sm group-hover:text-indigo-700 transition-colors">
                            {docente.nombre} {docente.apellido}
                          </div>
                          {docente.titulo && (
                            <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                              {docente.titulo}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="font-semibold text-gray-700">
                          {docente.tipoDocumento ||
                            docente.tipodocumento ||
                            "DNI"}
                          :
                        </span>{" "}
                        {docente.numDocumento || docente.numdocumento}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="font-medium text-gray-800">
                          {docente.correo}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {docente.telefono}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded-lg uppercase ${
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
                          {/* BOTÓN PARA ASIGNAR CARGA ACADÉMICA */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDocenteAsignar(docente);
                            }}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 bg-emerald-50 rounded-lg transition-colors"
                            title="Asignar Curso"
                          >
                            <BookPlus size={18} />
                          </button>

                          {/* BOTÓN EDITAR */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditar(docente);
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
                                solicitarHabilitacion(docente);
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
                                solicitarInhabilitacion(docente);
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

      {/* Modal de Creación/Edición */}
      {mostrarModal && (
        <DocenteModal
          docenteEditar={docenteEditar}
          onClose={() => setMostrarModal(false)}
          onSuccess={cargarDocentes}
        />
      )}

      {/* MODAL DE PERFIL */}
      {docenteVer && (
        <DocentePerfilModal
          docente={docenteVer}
          onClose={() => setDocenteVer(null)}
          onAsignar={() => {
            setDocenteVer(null);
            setDocenteAsignar(docenteVer);
          }}
          onConfigurarPermisos={(grupo) => {
            setGrupoPermisosEditar(grupo);
          }}
          onInhabilitar={() => {
            setDocenteVer(null);
            solicitarInhabilitacion(docenteVer);
          }}
          onHabilitar={() => {
            setDocenteVer(null);
            solicitarHabilitacion(docenteVer);
          }}
        />
      )}

      {/* NUEVO MODAL DE ASIGNACIÓN */}
      {docenteAsignar && (
        <AsignarDocenteModal
          docente={docenteAsignar}
          onClose={() => setDocenteAsignar(null)}
          onSuccess={() => {
            setDocenteAsignar(null);
            cargarDocentes();
          }}
        />
      )}

      {/* MODAL DE PERMISOS */}
      {grupoPermisosEditar && (
        <PermisosDocenteModal
          docente={docenteVer}
          grupo={grupoPermisosEditar}
          onClose={() => setGrupoPermisosEditar(null)}
          onSuccess={() => {
            cargarDocentes();
          }}
        />
      )}

      {/* Modales de Confirmación */}
      {docenteInhabilitar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
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
                className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors shadow"
              >
                Sí, inhabilitar
              </button>
            </div>
          </div>
        </div>
      )}

      {docenteHabilitar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¿Habilitar Docente?
              </h3>
              <p className="text-gray-600">
                Estás a punto de re-habilitar a{" "}
                <span className="font-bold text-gray-800">
                  {docenteHabilitar.nombre} {docenteHabilitar.apellido}
                </span>
                . Volverá a tener acceso al sistema.
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
