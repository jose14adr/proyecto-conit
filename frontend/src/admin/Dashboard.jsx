import { useState, useEffect } from "react";
import { Users, GraduationCap, BookOpen, ShieldCheck, Activity, ArrowRight, TrendingUp } from "lucide-react";
import { obtenerAlumno } from "../services/alumno.service";
import { obtenerDocente } from "../services/docente.service";
import { obtenerCurso } from "../services/curso.service";
import { obtenerUsuario } from "../services/usuario.service";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    alumnosActivos: 0,
    docentesActivos: 0,
    cursosActivos: 0,
    usuariosActivos: 0,
  });

  const [ultimosRegistros, setUltimosRegistros] = useState([]);

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        setIsLoading(true);

        const [alumnos, docentes, cursos, usuarios] = await Promise.all([
          obtenerAlumno(),
          obtenerDocente(),
          obtenerCurso(),
          obtenerUsuario(),
        ]);

        setStats({
          alumnosActivos: alumnos.filter(a => a.estado !== false).length,
          docentesActivos: docentes.filter(d => d.estado !== false).length,
          cursosActivos: cursos.filter(c => c.estado !== false).length,
          usuariosActivos: usuarios.filter(u => u.estado !== false).length,
        });

        setUltimosRegistros(alumnos.slice(0, 5));
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
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8 animate-fadeIn">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Panel de Control</h1>
        <p className="text-gray-500 mt-2 flex items-center gap-2">
          <Activity size={18} className="text-indigo-500" />
          Resumen de actividad y métricas del sistema
        </p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${card.bg}`}>
                {card.icono}
              </div>
              <Link to={card.ruta} className="text-gray-400 hover:text-indigo-600 transition-colors">
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">{card.titulo}</h3>
              <div className="text-3xl font-bold text-gray-800 mt-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                ) : (
                  card.valor
                )}
              </div>
            </div>
            {/* Adorno visual de fondo */}
            <div className="absolute -right-6 -bottom-6 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-500">
              {card.icono}
            </div>
          </div>
        ))}
      </div>

      {/* Sección de últimas actividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tabla de últimos registros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Últimos Alumnos Inscritos</h2>
            <Link to="/admin/alumnos" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Ver todos
            </Link>
          </div>
          
          <div className="p-0">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : ultimosRegistros.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No hay registros recientes.</div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {ultimosRegistros.map((alumno) => (
                  <li key={alumno.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {alumno.nombre.charAt(0)}{alumno.apellido.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{alumno.nombre} {alumno.apellido}</p>
                        <p className="text-xs text-gray-500">{alumno.correo}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 bg-green-100 text-green-700 rounded-lg">
                      Nuevo
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Tarjeta de estado del sistema */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-sm p-6 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-indigo-100 mb-6">
              <TrendingUp size={20} />
              <span className="font-medium text-sm">Estado del Sistema</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Todo funcionando correctamente</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
              Los servicios de base de datos, autenticación y gestión de usuarios se encuentran operativos y sincronizados.
            </p>
          </div>
          
          <div className="relative z-10">
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors w-full text-left flex justify-between items-center">
              <span>Revisar Logs</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Círculos decorativos */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>
        </div>
      </div>

    </div>
  );
}