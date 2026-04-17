import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle,
  Briefcase,
  GraduationCap,
  AlertCircle,
  FileText,
  User,
  BookOpen,
  Loader2,
  BookPlus,
  Settings,
} from "lucide-react";
import PerfilDocumentosHistorial from "../docente/PerfilDocumentosHistorial";
import toast from "react-hot-toast";

import { obtenerCargaAcademicaDocente } from "../services/docente.service";

export default function DocentePerfilModal({
  docente,
  onClose,
  onEdit,
  onInhabilitar,
  onHabilitar,
  onAsignar,
  onConfigurarPermisos,
}) {
  const [activeTab, setActiveTab] = useState("general");
  const [documentos, setDocumentos] = useState([]);
  const [historial, setHistorial] = useState([]);

  const [cargaAcademica, setCargaAcademica] = useState([]);
  const [isLoadingCarga, setIsLoadingCarga] = useState(true);

  const cargarCargaAcademica = async () => {
    setIsLoadingCarga(true);
    try {
      const data = await obtenerCargaAcademicaDocente(docente.id);
      setCargaAcademica(data || []);
    } catch (error) {
      console.warn("No se pudo cargar la carga académica", error);
      setCargaAcademica(docente.grupos || []);
    } finally {
      setIsLoadingCarga(false);
    }
  };

  useEffect(() => {
    if (!docente?.id) return;
    cargarCargaAcademica();
  }, [docente.id]);

  if (!docente) return null;

  const esInactivo = docente.estado === false;

  const showMessage = (type, text) => {
    if (type === "success") toast.success(text);
    if (type === "error") toast.error(text);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-md shadow-inner uppercase">
              {docente.nombre?.charAt(0)}
              {docente.apellido?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {docente.nombre} {docente.apellido}
              </h2>
              <p className="text-indigo-100 flex items-center gap-2 mt-1">
                <CreditCard size={16} />
                {docente.tipoDocumento || docente.tipodocumento || "DNI"}:{" "}
                {docente.numDocumento || docente.numdocumento}
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

        {/* BARRA DE PESTAÑAS */}
        <div className="bg-white border-b border-gray-200 px-8 flex gap-8 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 py-4 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === "general"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <User size={18} />
            Información General y Cursos
          </button>
          <button
            onClick={() => setActiveTab("documentos")}
            className={`flex items-center gap-2 py-4 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
              activeTab === "documentos"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FileText size={18} />
            CV, Documentos e Historial
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          {activeTab === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
              {/* COLUMNA IZQUIERDA */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">
                    Contacto
                  </h3>
                  <div className="space-y-4 text-sm text-gray-600">
                    <div className="flex items-start gap-3">
                      <Mail
                        size={18}
                        className="text-indigo-500 shrink-0 mt-0.5"
                      />
                      <span className="break-all">{docente.correo}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-indigo-500 shrink-0" />
                      <span>{docente.telefono}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={18}
                        className="text-indigo-500 shrink-0 mt-0.5"
                      />
                      <span>{docente.direccion || "No registrada"}</span>
                    </div>
                  </div>

                  {(docente.contacto_emergencia_nombre ||
                    docente.contacto_emergencia_telefono) && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Emergencia
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={16} className="text-orange-400" />
                          <span className="font-medium">
                            {docente.contacto_emergencia_nombre}
                          </span>
                        </div>
                        {docente.contacto_emergencia_telefono && (
                          <div className="flex items-center gap-2 pl-6">
                            <Phone size={14} className="text-gray-400" />
                            <span>{docente.contacto_emergencia_telefono}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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

              {/* COLUMNA DERECHA */}
              <div className="md:col-span-2 space-y-6">
                {/* RESUMEN PROFESIONAL */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                    <Briefcase size={20} className="text-indigo-600" />
                    Resumen Profesional
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">
                          Grado Académico
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {docente.titulo || "No registrado"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">
                          Experiencia
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {docente.experiencia ||
                            docente.perfil_profesional ||
                            "No registrada"}
                        </p>
                      </div>
                    </div>
                    {docente.bio && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600 italic">
                        "{docente.bio}"
                      </div>
                    )}
                  </div>
                </div>

                {/* CARGA ACADÉMICA */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <BookOpen size={20} className="text-indigo-600" />
                      Carga Académica Asignada
                    </h3>
                  </div>

                  {isLoadingCarga ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <Loader2
                        size={32}
                        className="animate-spin mb-3 text-indigo-500"
                      />
                      <p>Cargando cursos...</p>
                    </div>
                  ) : cargaAcademica.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      Este docente aún no tiene cursos ni grupos asignados.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cargaAcademica.map((grupo) => (
                        <div
                          key={grupo.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-colors gap-3 group"
                        >
                          <div>
                            <h4 className="font-bold text-gray-800">
                              {grupo.curso?.nombrecurso || "Curso Asociado"}
                            </h4>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded inline-block">
                                Grupo: {grupo.nombregrupo}
                              </span>
                              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded inline-block">
                                Horario: {grupo.horario}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-bold px-3 py-1.5 rounded-full uppercase bg-emerald-100 text-emerald-700">
                              Dictando
                            </span>

                            {onConfigurarPermisos && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onConfigurarPermisos(grupo);
                                }}
                                className="p-2 text-indigo-600 hover:bg-indigo-100 bg-indigo-50 rounded-lg transition-colors border border-indigo-100 shadow-sm"
                                title="Configurar permisos del docente"
                              >
                                <Settings size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GESTOR DOCUMENTAL */}
          {activeTab === "documentos" && (
            <div className="animate-fadeIn bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800">
                  Gestor Documental del Docente
                </h3>
                <p className="text-sm text-gray-500">
                  Sube el CV, grados académicos y gestiona el historial laboral.
                </p>
              </div>
              <PerfilDocumentosHistorial
                documentos={documentos}
                setDocumentos={setDocumentos}
                historial={historial}
                setHistorial={setHistorial}
                showMessage={showMessage}
              />
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0 flex flex-wrap justify-between items-center gap-4">
          <p className="text-sm font-medium text-gray-500 hidden md:block">
            Acciones rápidas del docente
          </p>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {onAsignar && (
              <button
                onClick={() => onAsignar()}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-semibold transition-colors border border-emerald-100 whitespace-nowrap"
              >
                <BookPlus size={18} />
                <span>Nueva Asignación</span>
              </button>
            )}

            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold transition-colors border border-indigo-100 whitespace-nowrap"
            >
              <Edit2 size={18} />
              <span>Editar Perfil</span>
            </button>

            {esInactivo ? (
              <button
                onClick={onHabilitar}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200 rounded-lg font-semibold transition-all border border-transparent whitespace-nowrap"
              >
                <CheckCircle size={18} />
                <span>Habilitar</span>
              </button>
            ) : (
              <button
                onClick={onInhabilitar}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-lg font-semibold transition-all border border-transparent whitespace-nowrap"
              >
                <Trash2 size={18} />
                <span>Inhabilitar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
