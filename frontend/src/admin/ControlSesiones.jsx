import { useState, useEffect } from "react";
import {
  Search,
  Shield,
  Clock,
  Monitor,
  UserCheck,
  Activity,
  MapPin,
  LogOut,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  obtenerSesiones,
  cerrarSesionRemota,
} from "../services/historial-login.service";
import toast from "react-hot-toast";

export default function ControlSesiones() {
  const [busqueda, setBusqueda] = useState("");
  const [sesiones, setSesiones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sesionCerrando, setSesionCerrando] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cargarSesiones = async () => {
    try {
      setIsLoading(true);
      const data = await obtenerSesiones();
      setSesiones(data);
    } catch (error) {
      console.error("Error al cargar sesiones", error);
      toast.error("Error al cargar sesiones");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarSesiones();
  }, []);

  const confirmarCerrarSesion = async () => {
    if (!sesionCerrando) return;

    try {
      setIsSubmitting(true);
      await cerrarSesionRemota(sesionCerrando.id);
      toast.success("Sesión cerrada exitosamente");
      await cargarSesiones(); //Recargar sesiones después de cerrar
      setSesionCerrando(null);
    } catch (error) {
      console.error("Error al cerrar sesión", error);
      toast.error("Error al cerrar sesión", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sesionesFiltradas = sesiones.filter((sesion) => {
    const nombre = sesion.usuario?.nombre || "";
    const correo = sesion.usuario?.correo || "";
    const termino = busqueda.toLowerCase();

    return (
      nombre.toLowerCase().includes(termino) ||
      correo.toLowerCase().includes(termino)
    );
  });

  const sesionesActivas = sesiones.filter((s) => s.estado === "ACTIVO").length;

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8 animate-fadeIn">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 h-32 rounded-xl flex items-center justify-between px-8 text-white shadow">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Shield size={28} className="text-blue-400" /> Control de Sesiones
          </h2>
          <p className="text-sm opacity-90 mt-2">
            Auditoría de accesos, ubicaciones y registro de actividad en el
            sistema.
          </p>
        </div>
        <div className="bg-white/10 px-5 py-3 rounded-lg backdrop-blur-sm border border-white/20 flex items-center gap-3">
          <Activity size={20} className="text-emerald-400" />
          <div>
            <div className="text-xs text-slate-300 font-medium">
              Sesiones Activas
            </div>
            <div className="text-xl font-bold">{sesionesActivas}</div>
          </div>
        </div>
      </div>

      {/* Contenedor de Búsqueda y Tabla */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        {/* BUSCADOR */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              className="pl-10 border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-slate-500 transition-shadow"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* TABLA DE AUDITORÍA */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Conexión</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && sesiones.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-slate-500 font-medium"
                  >
                    <Loader2
                      size={24}
                      className="animate-spin mx-auto mb-2 text-slate-400"
                    />
                    Cargando historial de sesiones...
                  </td>
                </tr>
              ) : sesionesFiltradas.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-slate-500 font-medium"
                  >
                    No hay registros de sesiones.
                  </td>
                </tr>
              ) : (
                sesionesFiltradas.map((sesion) => (
                  <tr
                    key={sesion.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                          <UserCheck size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {sesion.usuario?.nombre || "Usuario del Sistema"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {sesion.usuario?.correo || "Sin correo"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md border border-gray-200">
                        {sesion.usuario?.rol || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock size={16} className="text-slate-400 shrink-0" />
                        <span className="font-medium">{sesion.fecha}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded inline-block mb-1.5 border border-slate-200">
                        {sesion.ip || "127.0.0.1"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1 font-medium">
                        <MapPin size={14} className="text-red-500 shrink-0" />
                        {sesion.ubicacion}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Monitor
                          size={14}
                          className="text-indigo-400 shrink-0"
                        />
                        {sesion.dispositivo}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 w-fit mx-auto shadow-sm border ${
                          sesion.estado === "ACTIVO"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >
                        {sesion.estado === "ACTIVO" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        )}
                        {sesion.estado}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {sesion.estado === "ACTIVO" ? (
                        <button
                          onClick={() => setSesionCerrando(sesion)}
                          title="Cerrar sesión remotamente"
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut size={18} />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">
                          Cerrada
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmacion de Cierre de Sesión */}
      {sesionCerrando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeIn p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              ¿Cerrar sesión remotamente?
            </h2>

            <p className="text-gray-500 text-sm mb-6 px-2">
              Estás a punto de forzar el cierre de sesión para{" "}
              <strong>
                {sesionCerrando.usuario?.nombre || "este usuario"}
              </strong>{" "}
              en el dispositivo <strong>{sesionCerrando.dispositivo}</strong>.
              Deberá volver a ingresar sus credenciales para acceder.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setSesionCerrando(null)}
                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCerrarSesion}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Procesando...
                  </>
                ) : (
                  "Sí, cerrar sesión"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
