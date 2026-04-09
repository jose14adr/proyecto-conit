import { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Loader2,
  Edit2,
  BookPlus,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { obtenerMatriculasPorAlumno } from "../services/matricula.service";
import toast from "react-hot-toast";

export default function AlumnoPerfilModal({
  alumno,
  onClose,
  onEdit,
  onMatricular,
  onInhabilitar,
  onHabilitar,
}) {
  const [matriculas, setMatriculas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarMatriculas = async () => {
      setIsLoading(true);
      try {
        const data = await obtenerMatriculasPorAlumno(alumno.id);
        setMatriculas(data);
      } catch (error) {
        console.error("Error al cargar matriculas del alumno", error);
        toast.error("Error al cargar cursos matriculados");
      } finally {
        setIsLoading(false);
      }
    };

    cargarMatriculas();
  }, [alumno.id]);

  if (!alumno) {
    return null;
  }

  const esInactivo = alumno.estado === false;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-md shadow-inner">
              {alumno.nombre?.charAt(0)}
              {alumno.apellido?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {" "}
                {alumno.nombre} {alumno.apellido}
              </h2>
              <p className="text-indigo-100 flex items-center gap-2 mt-1">
                <CreditCard size={16} />
                {alumno.tipoDocumento || "DNI"}:{" "}
                {alumno.numDocumento || alumno.numdocumento}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Datos Personales */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">
                  Información de Contacto
                </h3>

                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <Mail
                      size={18}
                      className="text-indigo-500 shrink-0 mt-0.5"
                    />
                    <span className="break-all">{alumno.correo}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-indigo-500 shrink-0" />
                    <span>{alumno.telefono}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="text-indigo-500 shrink-0 mt-0.5"
                    />
                    <span>{alumno.direccion || "No registrada"}</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500 block mb-2 font-medium">
                    Estado en el sistema:
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase inline-block ${
                      esInactivo
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {esInactivo ? "Inactivo" : "Activo"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cursos Matriculados */}
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <BookOpen size={20} className="text-indigo-600" />
                  Cursos Matriculados
                </h3>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Loader2
                      size={32}
                      className="animate-spin mb-3 text-indigo-500"
                    />
                    <p>Cargando información académica...</p>
                  </div>
                ) : matriculas.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    Este alumno aún no tiene cursos registrados.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matriculas.map((matricula) => (
                      <div
                        key={matricula.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-colors gap-3"
                      >
                        <div>
                          <h4 className="font-bold text-gray-800">
                            {matricula.grupo?.curso?.nombrecurso ||
                              matricula.observacion ||
                              "Curso Desconocido"}
                          </h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded inline-block">
                              Grupo: {matricula.grupo?.nombregrupo || "N/A"}
                            </span>
                            {matricula.grupo?.horario && (
                              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded inline-block">
                                Horario: {matricula.grupo.horario}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span
                            className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase ${
                              matricula.estado === "pendiente"
                                ? "bg-yellow-100 text-yellow-700"
                                : matricula.estado === "activo"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {matricula.estado || "Inscrito"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Panel de acciones */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0 flex flex-wrap justify-between items-center gap-4">
          <p className="text-sm font-medium text-gray-500">
            Acciones rápidas del alumno
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onMatricular}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-semibold transition-colors border border-emerald-100"
            >
              <BookPlus size={18} />
              <span className="hidden sm:inline">Matricular</span>
            </button>

            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold transition-colors border border-indigo-100"
            >
              <Edit2 size={18} />
              <span className="hidden sm:inline">Editar Perfil</span>
            </button>

            {esInactivo ? (
              <button
                onClick={onHabilitar}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200 rounded-lg font-semibold transition-all border border-transparent"
              >
                <CheckCircle size={18} />
                <span className="hidden sm:inline">Habilitar</span>
              </button>
            ) : (
              <button
                onClick={onInhabilitar}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-lg font-semibold transition-all border border-transparent"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">Inhabilitar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
