import { useState, useEffect } from "react";
import {
  UserCog,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import AdministradorModal from "../components/AdministradorModal";
import AdministradorPerfilModal from "../components/AdministradorPerfilModal";
import toast from "react-hot-toast";
import {
  obtenerAdministradores,
  inhabilitarAdministrador,
  habilitarAdministrador,
} from "../services/administrador.service";

export default function Administradores() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("habilitados");
  const [administradores, setAdministradores] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [adminEditar, setAdminEditar] = useState(null);
  const [adminInhabilitar, setAdminInhabilitar] = useState(null);
  const [adminHabilitar, setAdminHabilitar] = useState(null);
  const [adminVer, setAdminVer] = useState(null);

  const cargarAdministradores = async () => {
    try {
      setIsLoading(true);
      const data = await obtenerAdministradores();
      setAdministradores(data);
    } catch (error) {
      toast.error("Error al cargar administradores");
      console.error("Error al cargar administradores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarAdministradores();
  }, []);

  const solicitarInhabilitacion = (admin) => setAdminInhabilitar(admin);
  const confirmarInhabilitacion = async () => {
    try {
      await inhabilitarAdministrador(adminInhabilitar.id);
      toast.success("Administrador inhabilitado correctamente");
      setAdminInhabilitar(null);
      cargarAdministradores();
    } catch (error) {
      console.error("Error al inhabilitar administrador:", error);
      toast.error("Error al inhabilitar administrador");
    }
  };

  const solicitarHabilitacion = (admin) => setAdminHabilitar(admin);
  const confirmarHabilitacion = async () => {
    try {
      await habilitarAdministrador(adminHabilitar.id);
      toast.success("Administrador habilitado correctamente");
      setAdminHabilitar(null);
      cargarAdministradores();
    } catch (error) {
      toast.error("Error al habilitar administrador");
      console.error("Error al habilitar administrador:", error);
    }
  };

  const handleEditar = (admin) => {
    setAdminEditar(admin);
    setMostrarModal(true);
  };

  const handleNuevo = () => {
    setAdminEditar(null);
    setMostrarModal(true);
  };

  const adminsFiltrados = administradores.filter((admin) => {
    const termino = busqueda.toLowerCase();
    const nombreCompleto =
      `${admin.nombre || ""} ${admin.apellido || ""}`.toLowerCase();
    const documento = (
      admin.numdocumento ||
      admin.numDocumento ||
      ""
    ).toLowerCase();
    const correo = (admin.correo || "").toLowerCase();

    const coincideTexto =
      nombreCompleto.includes(termino) ||
      documento.includes(termino) ||
      correo.includes(termino);

    let coincideEstado = true;
    if (filtroEstado === "habilitados") {
      coincideEstado = admin.estado === true || admin.estado === null;
    } else if (filtroEstado === "inhabilitados") {
      coincideEstado = admin.estado === false;
    }

    return coincideTexto && coincideEstado;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      {/* Banner Principal adaptado al azul/indigo */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 rounded-xl flex items-center justify-between px-8 text-white shadow">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <UserCog size={28} /> Gestión de Administradores
          </h2>
          <p className="text-sm opacity-90 mt-2">
            Personal con privilegios de gestión global.
          </p>
        </div>
        <button
          onClick={handleNuevo}
          className="bg-white text-indigo-700 hover:bg-gray-100 px-5 py-2.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} /> Nuevo Admin
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o documento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow"
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
                <th className="px-6 py-4">Personal</th>
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
              ) : adminsFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500 font-medium"
                  >
                    No se encontraron administradores.
                  </td>
                </tr>
              ) : (
                adminsFiltrados.map((admin) => {
                  const esInactivo = admin.estado === false;
                  const textoEstado = esInactivo ? "INACTIVO" : "ACTIVO";

                  return (
                    <tr
                      key={admin.id}
                      onClick={() => setAdminVer(admin)}
                      className={`transition-colors cursor-pointer group ${
                        esInactivo
                          ? "bg-gray-50 opacity-75"
                          : "hover:bg-indigo-50/60"
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-4">
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center text-lg font-bold transition-colors ${
                            esInactivo
                              ? "bg-gray-200 text-gray-500"
                              : "bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white"
                          }`}
                        >
                          {admin.nombre?.charAt(0)}
                          {admin.apellido?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-sm group-hover:text-indigo-700 transition-colors">
                            {admin.nombre} {admin.apellido}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="font-semibold text-gray-700">
                          {admin.tipodocumento}:
                        </span>{" "}
                        {admin.numdocumento}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="font-medium text-gray-800">
                          {admin.correo}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {admin.telefono}
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditar(admin);
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
                                solicitarHabilitacion(admin);
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
                                solicitarInhabilitacion(admin);
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
        <AdministradorModal
          adminEditar={adminEditar}
          onClose={() => setMostrarModal(false)}
          onSuccess={cargarAdministradores}
        />
      )}

      {adminVer && (
        <AdministradorPerfilModal
          admin={adminVer}
          onClose={() => setAdminVer(null)}
          onEdit={() => {
            setAdminVer(null);
            handleEditar(adminVer);
          }}
          onInhabilitar={() => {
            setAdminVer(null);
            solicitarInhabilitacion(adminVer);
          }}
          onHabilitar={() => {
            setAdminVer(null);
            solicitarHabilitacion(adminVer);
          }}
        />
      )}

      {adminInhabilitar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¿Inhabilitar Administrador?
              </h3>
              <p className="text-gray-600">
                Estás a punto de inhabilitar a{" "}
                <span className="font-bold text-gray-800">
                  {adminInhabilitar.nombre} {adminInhabilitar.apellido}
                </span>
                .
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setAdminInhabilitar(null)}
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

      {adminHabilitar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¿Habilitar Administrador?
              </h3>
              <p className="text-gray-600">
                Estás a punto de re-habilitar a{" "}
                <span className="font-bold text-gray-800">
                  {adminHabilitar.nombre} {adminHabilitar.apellido}
                </span>
                .
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setAdminHabilitar(null)}
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
