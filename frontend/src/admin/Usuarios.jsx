import { useState, useEffect } from "react";
import {
  obtenerUsuario,
  inhabilitarUsuario,
  habilitarUsuario,
} from "../services/usuario.service";
import UsuarioModal from "../components/UsuarioModal";
import toast from "react-hot-toast";
import {
  Search,
  Edit2,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Key,
} from "lucide-react";

export default function Usuarios() {
  const [busqueda, setBusqueda] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [usuarioInhabilitar, setUsuarioInhabilitar] = useState(null);
  const [usuarioHabilitar, setUsuarioHabilitar] = useState(null);

  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);
      const data = await obtenerUsuario();
      setUsuarios(data);
    } catch (error) {
      toast.error("Error al cargar los usuarios");
      console.error("Error al cargar los usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const solicitarInhabilitacion = (usuario) => setUsuarioInhabilitar(usuario);
  const confirmarInhabilitacion = async () => {
    try {
      await inhabilitarUsuario(usuarioInhabilitar.id);
      toast.success("Usuario inhabilitado exitosamente");
      setUsuarioInhabilitar(null);
      cargarUsuarios();
    } catch (error) {
      toast.error("Error al inhabilitar el usuario");
      console.error("Error al inhabilitar el usuario:", error);
    }
  };

  const solicitarHabilitacion = (usuario) => setUsuarioHabilitar(usuario);
  const confirmarHabilitacion = async () => {
    try {
      await habilitarUsuario(usuarioHabilitar.id);
      toast.success("Usuario habilitado exitosamente");
      setUsuarioHabilitar(null);
      cargarUsuarios();
    } catch (error) {
      toast.error("Error al habilitar el usuario");
      console.error("Error al habilitar el usuario:", error);
    }
  };

  const handleEditar = (usuario) => {
    setUsuarioEditar(usuario);
    setMostrarModal(true);
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termino = busqueda.toLowerCase();
    const correo = (usuario.correo || "").toLowerCase();
    const rol = (usuario.rol || "").toLowerCase();
    return correo.includes(termino) || rol.includes(termino);
  });

  const getRolBadgeColor = (rol) => {
    switch (rol?.toUpperCase()) {
      case "ADMIN":
      case "ADMINISTRADOR":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "DOCENTE":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "ALUMNO":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 rounded-xl flex items-center justify-between px-8 text-white shadow">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Shield size={28} /> Control de Credenciales
          </h2>
          <p className="text-sm opacity-90 mt-2">
            Administra los correos de acceso, contraseñas, roles y estado de las
            cuentas.
          </p>
        </div>
        {/* El botón de crear fue eliminado, ya que se crean desde sus respectivos módulos */}
      </div>

      {/* Contenedor de búsqueda y tabla */}
      <div className="bg-white p-6 rounded-xl shadow">
        {/* BUSCADOR */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por correo o rol..."
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
                <th className="px-6 py-4">Credenciales</th>
                <th className="px-6 py-4">Rol en Sistema</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500 font-medium"
                  >
                    Cargando datos...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500 font-medium"
                  >
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => {
                  const esInactivo = usuario.estado === false;
                  const textoEstado = esInactivo ? "BLOQUEADO" : "ACTIVO";

                  return (
                    <tr
                      key={usuario.id}
                      className={`transition-colors ${
                        esInactivo
                          ? "bg-gray-50 opacity-75"
                          : "hover:bg-indigo-50/60"
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            esInactivo
                              ? "bg-gray-200 text-gray-500"
                              : "bg-indigo-100 text-indigo-600"
                          }`}
                        >
                          <Key size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-sm">
                            {usuario.correo}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-lg border ${getRolBadgeColor(
                            usuario.rol,
                          )}`}
                        >
                          {usuario.rol || "N/A"}
                        </span>
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
                            onClick={() => handleEditar(usuario)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 bg-indigo-50 rounded-lg transition-colors"
                            title="Editar Credenciales"
                          >
                            <Edit2 size={18} />
                          </button>

                          {esInactivo ? (
                            <button
                              onClick={() => solicitarHabilitacion(usuario)}
                              className="p-2 text-green-600 hover:bg-green-100 bg-green-50 rounded-lg transition-colors"
                              title="Desbloquear Acceso"
                            >
                              <CheckCircle size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => solicitarInhabilitacion(usuario)}
                              className="p-2 text-red-600 hover:bg-red-100 bg-red-50 rounded-lg transition-colors"
                              title="Bloquear Acceso"
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
        <UsuarioModal
          usuarioEditar={usuarioEditar}
          onClose={() => setMostrarModal(false)}
          onSuccess={cargarUsuarios}
        />
      )}

      {/* Modal Inhabilitar */}
      {usuarioInhabilitar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¿Bloquear Acceso?
              </h3>
              <p className="text-gray-600 text-sm">
                Estás a punto de revocar el acceso al sistema para la cuenta{" "}
                <span className="font-bold text-gray-800 block mt-1">
                  {usuarioInhabilitar.correo}
                </span>
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setUsuarioInhabilitar(null)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarInhabilitacion}
                className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors shadow"
              >
                Sí, bloquear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Habilitar */}
      {usuarioHabilitar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¿Desbloquear Acceso?
              </h3>
              <p className="text-gray-600 text-sm">
                Estás a punto de re-habilitar el acceso al sistema para la
                cuenta{" "}
                <span className="font-bold text-gray-800 block mt-1">
                  {usuarioHabilitar.correo}
                </span>
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setUsuarioHabilitar(null)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarHabilitacion}
                className="px-4 py-2 bg-green-600 text-white font-medium hover:bg-green-700 rounded-lg transition-colors shadow"
              >
                Sí, desbloquear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
