import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Activity,
  ArrowRight,
  Clock,
} from "lucide-react";
import { obtenerAlumno } from "../services/alumno.service";
import { obtenerDocente } from "../services/docente.service";
import { obtenerCurso } from "../services/curso.service";
import { obtenerUsuario } from "../services/usuario.service";
import { obtenerSesiones } from "../services/historial-login.service"
import { Link } from "react-router-dom";
import AlumnoPerfilModal from "../components/AlumnoPerfilModal";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    alumnosActivos: 0,
    docentesActivos: 0,
    cursosActivos: 0,
    usuariosActivos: 0,
  });

  const [ultimosRegistros, setUltimosRegistros] = useState([]);
  const [ultimosIniciosSesion, setUltimosIniciosSesion] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        setIsLoading(true);

        const [alumnos, docentes, cursos, usuarios, sesiones] =
          await Promise.all([
            obtenerAlumno(),
            obtenerDocente(),
            obtenerCurso(),
            obtenerUsuario(),
            obtenerSesiones(),
          ]);

        setStats({
          alumnosActivos: alumnos.filter((a) => a.estado !== false).length,
          docentesActivos: docentes.filter((d) => d.estado !== false).length,
          cursosActivos: cursos.filter((c) => c.estado !== false).length,
          usuariosActivos: usuarios.filter((u) => u.estado !== false).length,
        });

        const topAlumnos = alumnos.slice(0, 5).map((alumno) => {
          const ultimoCurso =
            alumno.matriculas && alumno.matriculas.length > 0
              ? alumno.matriculas[0].grupo?.curso?.nombrecurso ||
                "Curso sin nombre"
              : "Sin cursos";
          return { ...alumno, ultimoCurso };
        });

        setUltimosRegistros(topAlumnos);
        setUltimosIniciosSesion(sesiones.slice(0, 5));
      } catch (error) {
        console.error("Error al cargar métricas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarMetricas();
  }, []);

  const cards = [
    {
      titulo: "Alumnos Activos",
      valor: stats.alumnosActivos,
      icono: <Users size={28} className="text-blue-600" />,
      bg: "bg-blue-100",
      ruta: "/admin/alumnos",
    },
    {
      titulo: "Docentes",
      valor: stats.docentesActivos,
      icono: <GraduationCap size={28} className="text-purple-600" />,
      bg: "bg-purple-100",
      ruta: "/admin/docentes",
    },
    {
      titulo: "Cursos Abiertos",
      valor: stats.cursosActivos,
      icono: <BookOpen size={28} className="text-emerald-600" />,
      bg: "bg-emerald-100",
      ruta: "/admin/cursos",
    },
    {
      titulo: "Usuarios Sistema",
      valor: stats.usuariosActivos,
      icono: <ShieldCheck size={28} className="text-orange-600" />,
      bg: "bg-orange-100",
      ruta: "/admin/usuarios",
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8 animate-fadeIn">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Panel de Control
        </h1>
        <p className="text-gray-500 mt-2 flex items-center gap-2">
          <Activity size={18} className="text-indigo-500" />
          Resumen de actividad y métricas del sistema
        </p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${card.bg}`}>{card.icono}</div>
              <Link
                to={card.ruta}
                className="text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">
                {card.titulo}
              </h3>
              <div className="text-3xl font-bold text-gray-800 mt-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  card.valor
                )}
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-500">
              {card.icono}
            </div>
          </div>
        ))}
      </div>

      {/* Sección de últimas actividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de últimos alumnos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">
              Últimos Alumnos Inscritos
            </h2>
            <Link
              to="/admin/alumnos"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Ver todos
            </Link>
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="p-8 flex justify-center h-full items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : ultimosRegistros.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay registros recientes.
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {ultimosRegistros.map((alumno) => (
                  <li
                    key={alumno.id}
                    //Hacemos que toda la fila sea clickeable
                    onClick={() => setAlumnoSeleccionado(alumno)}
                    className="px-6 py-4 hover:bg-indigo-50/50 cursor-pointer transition-colors flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {alumno.nombre.charAt(0)}
                        {alumno.apellido.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                          {alumno.nombre} {alumno.apellido}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <BookOpen size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-500 font-medium truncate max-w-[200px] md:max-w-xs">
                            {alumno.ultimoCurso}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium px-2.5 py-1 bg-green-100 text-green-700 rounded-lg hidden sm:block">
                        Nuevo
                      </span>
                      <ArrowRight
                        size={16}
                        className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Tarjeta de estado del sistema (Logs Dinámicos) */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-sm p-6 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 flex-1">
            <div className="flex items-center justify-between text-indigo-100 mb-5 border-b border-indigo-400/30 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} />
                <span className="font-medium text-sm">
                  Inicios de Sesión Recientes
                </span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {ultimosIniciosSesion.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white/10 rounded-lg p-3 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-semibold text-sm truncate pr-2">
                        {log.usuario?.nombre || "Usuario Sistema"}
                      </span>
                      <span className="text-[10px] text-indigo-200 shrink-0 flex items-center gap-1">
                        <Clock size={10} />
                        {log.fecha.split(",")[1] || log.fecha}
                      </span>
                    </div>
                    <div className="text-xs text-indigo-100 flex items-center gap-1.5 opacity-90">
                      <Activity size={12} className="text-emerald-300" />
                      <span className="truncate">
                        {log.ubicacion || log.dispositivo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative z-10 mt-auto pt-2">
            <Link
              to="/admin/sesiones"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors w-full text-left flex justify-between items-center group"
            >
              <span>Ver historial completo</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          {/* Círculos decorativos */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </div>

      {/* RENDERIZADO DEL MODAL */}
      {alumnoSeleccionado && (
        <AlumnoPerfilModal
          alumno={alumnoSeleccionado}
          onClose={() => setAlumnoSeleccionado(null)}
        />
      )}
    </div>
  );
}
