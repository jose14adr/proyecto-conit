import { X, BookOpen, MapPin, Phone, Mail, CreditCard } from "lucide-react";

export default function AlumnoPerfilModal({ alumno, onClose }) {
  if (!alumno) return null;

  // ⚠️ SIMULACIÓN: Aquí luego conectaremos los cursos reales que vengan del backend
  const cursosMatriculados = alumno.cursos || [
    { id: 1, nombre: "Desarrollo Web con React", nivel: "Intermedio", progreso: "En curso" },
    { id: 2, nombre: "Inglés para Programadores", nivel: "Básico", progreso: "Completado" }
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-md shadow-inner">
              {alumno.nombre.charAt(0)}{alumno.apellido.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{alumno.nombre} {alumno.apellido}</h2>
              <p className="text-indigo-100 flex items-center gap-2 mt-1">
                <CreditCard size={16} />
                {alumno.tipoDocumento || 'DNI'}: {alumno.numDocumento || alumno.numdocumento}
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

        {/* BODY (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* COLUMNA IZQUIERDA: Datos Personales */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">
                  Información de Contacto
                </h3>
                
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                    <span className="break-all">{alumno.correo}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-indigo-500 shrink-0" />
                    <span>+51 {alumno.telefono}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                    <span>{alumno.direccion || "No registrada"}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500 block mb-1">Estado en Sistema:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                    alumno.estado !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {alumno.estado !== false ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Cursos Matriculados */}
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                  <BookOpen size={20} className="text-indigo-600" />
                  Cursos Matriculados
                </h3>

                {cursosMatriculados.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    Este alumno aún no tiene cursos registrados.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cursosMatriculados.map((curso, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-colors">
                        <div>
                          <h4 className="font-bold text-gray-800">{curso.nombre}</h4>
                          <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                            Nivel: {curso.nivel}
                          </span>
                        </div>
                        <div>
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                            curso.progreso === 'En curso' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {curso.progreso}
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
      </div>
    </div>
  );
}