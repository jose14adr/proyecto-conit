import { useState, useEffect } from "react";
import {
  Search,
  Shield,
  Clock,
  Monitor,
  UserCheck,
  Activity,
  MapPin,
} from "lucide-react";
import { obtenerSesiones } from "../services/historial-login.service";
import toast from "react-hot-toast";

export default function ControlSesiones() {
  const [busqueda, setBusqueda] = useState("");
  const [sesiones, setSesiones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargarSesiones = async () => {
    try {
      setIsLoading(true);
      const data = await obtenerSesiones();
      setSesiones(data);
    } catch (error) {
      console.error("Error al cargar sesiones:", error);
      toast.error("Error al cargar sesiones");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarSesiones();
  }, []);

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
            Auditoría de accesos y registro de actividad de los usuarios en el
            sistema.
          </p>
        </div>
        <div className="bg-white/10 px-5 py-3 rounded-lg backdrop-blur-sm border border-white/20 flex items-center gap-3">
          <Activity size={20} className="text-emerald-400" />
          <div>
            <div className="text-xs text-slate-300 font-medium">
              Sesiones Activas
            </div>
            {/* Aquí usamos la variable sesionesActivas */}
            <div className="text-xl font-bold">{sesionesActivas}</div>
          </div>
        </div>
      </div>

      {/* Contenedor de Búsqueda y Tabla */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        {/* Buscador */}
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

        {/* Tabla de Auditoría */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Conexión</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Usamos isLoading para mostrar estado de carga */}
              {isLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-slate-500 font-medium"
                  >
                    Cargando historial de sesiones...
                  </td>
                </tr>
              ) : sesionesFiltradas.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
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
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <UserCheck size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {sesion.usuario?.nombre || "Usuario Desconocido"}
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
                        <Clock size={16} className="text-slate-400" />
                        <span className="font-medium">{sesion.fecha}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded inline-block mb-1">
                        {sesion.ip || "127.0.0.1"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1 font-medium">
                        <MapPin size={14} className="text-red-500 shrink-0" />
                        {sesion.ubicacion}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Monitor size={14} className="text-indigo-400 shrink-0" />
                        {sesion.dispositivo}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 w-fit mx-auto ${
                          sesion.estado === "ACTIVO"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${sesion.estado === "ACTIVO" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
                        ></span>
                        {sesion.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
