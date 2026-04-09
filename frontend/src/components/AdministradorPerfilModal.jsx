import {
  X,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle,
  Shield,
  ShieldCheck,
  Key,
  BookOpen,
} from "lucide-react";

export default function AdministradorPerfilModal({
  admin,
  onClose,
  onEdit,
  onInhabilitar,
  onHabilitar,
}) {
  if (!admin) {
    return null;
  }

  const esInactivo = admin.estado === false;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        {/* Header adaptado al azul/indigo */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-md shadow-inner uppercase">
              {admin.nombre?.charAt(0)}
              {admin.apellido?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {admin.nombre} {admin.apellido}
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold tracking-wider uppercase ml-2 flex items-center gap-1">
                  <ShieldCheck size={12} /> Staff
                </span>
              </h2>
              <p className="text-indigo-100 flex items-center gap-2 mt-1">
                <CreditCard size={16} />
                {admin.tipodocumento || "DNI"}:{" "}
                {admin.numdocumento || admin.numDocumento}
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
                    <span className="break-all font-medium text-gray-800">
                      {admin.correo}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-indigo-500 shrink-0" />
                    <span>{admin.telefono}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="text-indigo-500 shrink-0 mt-0.5"
                    />
                    <span>{admin.direccion || "No registrada"}</span>
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
                    {esInactivo ? "Inactivo (Acceso Bloqueado)" : "Activo"}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
                  <Shield size={22} className="text-indigo-600" />
                  Nivel de Acceso y Privilegios
                </h3>

                <div className="space-y-6">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Este perfil pertenece al grupo de{" "}
                    <strong>Staff Administrativo</strong>. Cuenta con
                    credenciales de acceso global a la plataforma CONIT, lo que
                    le permite gestionar procesos críticos del sistema.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100/50">
                      <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-2">
                        <Key size={16} /> Gestión de Usuarios
                      </div>
                      <p className="text-xs text-gray-500">
                        Control total sobre creación, edición y estado de
                        cuentas de alumnos, docentes y otros administradores.
                      </p>
                    </div>

                    <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100/50">
                      <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-2">
                        <BookOpen size={16} /> Gestión Académica
                      </div>
                      <p className="text-xs text-gray-500">
                        Capacidad para crear cursos, asignar cargas académicas a
                        docentes y matricular alumnos.
                      </p>
                    </div>
                  </div>

                  {esInactivo && (
                    <div className="mt-4 bg-red-50 p-4 rounded-lg border border-red-100 flex gap-3">
                      <div className="text-red-500 shrink-0 mt-0.5">
                        <X size={20} />
                      </div>
                      <p className="text-sm text-red-700">
                        Actualmente este usuario tiene el{" "}
                        <strong>acceso revocado</strong>. No podrá iniciar
                        sesión en la plataforma hasta que su cuenta sea
                        re-habilitada.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0 flex flex-wrap justify-between items-center gap-4">
          <p className="text-sm font-medium text-gray-500">
            Acciones rápidas del administrador
          </p>

          <div className="flex items-center gap-3">
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
