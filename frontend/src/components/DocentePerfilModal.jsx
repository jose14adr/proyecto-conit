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
    if (!docente?.id) return;

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
    cargarCargaAcademica();
  }, [docente?.id]);

  if (!docente) return null;

  const esInactivo = docente.estado === false;

  const showMessage = (type, text) => {
    if (type === "success") toast.success(text);
    if (type === "error") toast.error(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl animate-fadeIn">
        {/* HEADER */}
        <div
          className="relative flex shrink-0 items-center justify-between overflow-hidden p-6 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
          }}
        >
          <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-black shadow-inner backdrop-blur-md">
              {docente.nombre?.charAt(0)}
              {docente.apellido?.charAt(0)}
            </div>

            <div>
              <h2 className="text-2xl font-black">
                {docente.nombre} {docente.apellido}
              </h2>

              <p className="mt-1 flex items-center gap-2 text-white/80">
                <CreditCard size={16} />
                {docente.tipoDocumento || docente.tipodocumento || "DNI"}:{" "}
                {docente.numDocumento || docente.numdocumento || "-"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 rounded-full p-2 transition hover:bg-white/20"
            title="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex shrink-0 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-card)] px-8">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-4 text-sm font-bold transition ${
              activeTab === "general"
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-muted-text)] hover:text-[var(--color-text)]"
            }`}
          >
            <User size={18} />
            Información General y Cursos
          </button>

          <button
            onClick={() => setActiveTab("documentos")}
            className={`ml-6 flex items-center gap-2 whitespace-nowrap border-b-2 py-4 text-sm font-bold transition ${
              activeTab === "documentos"
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-muted-text)] hover:text-[var(--color-text)]"
            }`}
          >
            <FileText size={18} />
            CV, Documentos e Historial
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto bg-[var(--color-background)] p-8">
          {activeTab === "general" && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 animate-fadeIn">
              {/* COLUMNA IZQUIERDA */}
              <div className="space-y-6 md:col-span-1">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
                  <h3 className="mb-4 border-b border-[var(--color-border)] pb-2 text-sm font-black uppercase tracking-wider text-[var(--color-muted-text)]">
                    Contacto
                  </h3>

                  <div className="space-y-4 text-sm text-[var(--color-muted-text)]">
                    <div className="flex items-start gap-3">
                      <Mail
                        size={18}
                        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                      />
                      <span className="break-all">
                        {docente.correo || "No registrado"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone
                        size={18}
                        className="shrink-0 text-[var(--color-primary)]"
                      />
                      <span>{docente.telefono || "No registrado"}</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin
                        size={18}
                        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                      />
                      <span>{docente.direccion || "No registrada"}</span>
                    </div>
                  </div>

                  {(docente.contacto_emergencia_nombre ||
                    docente.contacto_emergencia_telefono) && (
                    <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                      <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-[var(--color-muted-text)]">
                        Emergencia
                      </h3>

                      <div className="space-y-2 text-sm text-[var(--color-muted-text)]">
                        {docente.contacto_emergencia_nombre && (
                          <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="text-orange-400" />
                            <span className="font-semibold text-[var(--color-text)]">
                              {docente.contacto_emergencia_nombre}
                            </span>
                          </div>
                        )}

                        {docente.contacto_emergencia_telefono && (
                          <div className="flex items-center gap-2 pl-6">
                            <Phone size={14} />
                            <span>{docente.contacto_emergencia_telefono}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                    <span className="mb-2 block text-xs font-semibold text-[var(--color-muted-text)]">
                      Estado en el sistema:
                    </span>

                    <span
                      className={`inline-block rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wide ${
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
              <div className="space-y-6 md:col-span-2">
                {/* RESUMEN PROFESIONAL */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
                  <h3 className="mb-6 flex items-center gap-2 text-lg font-black text-[var(--color-text)]">
                    <Briefcase size={20} className="text-[var(--color-primary)]" />
                    Resumen Profesional
                  </h3>

                  <div className="space-y-5">
                    <InfoItem
                      icon={GraduationCap}
                      title="Grado Académico"
                      text={docente.titulo || "No registrado"}
                    />

                    <InfoItem
                      icon={Briefcase}
                      title="Experiencia"
                      text={
                        docente.experiencia ||
                        docente.perfil_profesional ||
                        "No registrada"
                      }
                    />

                    {docente.bio && (
                      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm italic text-[var(--color-muted-text)]">
                        “{docente.bio}”
                      </div>
                    )}
                  </div>
                </div>

                {/* CARGA ACADÉMICA */}
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-lg font-black text-[var(--color-text)]">
                      <BookOpen size={20} className="text-[var(--color-primary)]" />
                      Carga Académica Asignada
                    </h3>
                  </div>

                  {isLoadingCarga ? (
                    <div className="flex flex-col items-center justify-center py-8 text-[var(--color-muted-text)]">
                      <Loader2
                        size={32}
                        className="mb-3 animate-spin text-[var(--color-primary)]"
                      />
                      <p>Cargando cursos...</p>
                    </div>
                  ) : cargaAcademica.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)] px-6 py-8 text-center text-[var(--color-muted-text)]">
                      Este docente aún no tiene cursos ni grupos asignados.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cargaAcademica.map((grupo) => (
                        <div
                          key={grupo.id}
                          className="group flex flex-col justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 transition hover:border-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)] sm:flex-row sm:items-center"
                        >
                          <div>
                            <h4 className="font-black text-[var(--color-text)]">
                              {grupo.curso?.nombrecurso || "Curso Asociado"}
                            </h4>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="inline-block rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 text-xs font-semibold text-[var(--color-muted-text)]">
                                Grupo: {grupo.nombregrupo || "-"}
                              </span>

                              <span className="inline-block rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 text-xs font-semibold text-[var(--color-muted-text)]">
                                Horario: {grupo.horario || "-"}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black uppercase text-emerald-700">
                              Dictando
                            </span>

                            {onConfigurarPermisos && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onConfigurarPermisos(grupo);
                                }}
                                className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] p-2 text-[var(--color-primary)] shadow-sm transition hover:bg-[var(--color-primary)] hover:text-white"
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

          {/* DOCUMENTOS */}
          {activeTab === "documentos" && (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm animate-fadeIn">
              <div className="mb-6">
                <h3 className="text-lg font-black text-[var(--color-text)]">
                  Gestor Documental del Docente
                </h3>

                <p className="text-sm text-[var(--color-muted-text)]">
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
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-card)] px-6 py-4">
          <p className="hidden text-sm font-semibold text-[var(--color-muted-text)] md:block">
            Acciones rápidas del docente
          </p>

          <div className="flex w-full items-center gap-3 overflow-x-auto pb-1 md:w-auto md:pb-0">
            {onAsignar && (
              <button
                onClick={() => onAsignar()}
                className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                <BookPlus size={18} />
                <span>Nueva Asignación</span>
              </button>
            )}

            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-4 py-2 font-semibold text-[var(--color-primary)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]"
              >
                <Edit2 size={18} />
                <span>Editar Perfil</span>
              </button>
            )}

            {esInactivo ? (
              onHabilitar && (
                <button
                  onClick={onHabilitar}
                  className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-transparent bg-[var(--color-background)] px-4 py-2 font-semibold text-[var(--color-text)] transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                >
                  <CheckCircle size={18} />
                  <span>Habilitar</span>
                </button>
              )
            ) : (
              onInhabilitar && (
                <button
                  onClick={onInhabilitar}
                  className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-transparent bg-[var(--color-background)] px-4 py-2 font-semibold text-[var(--color-text)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 size={18} />
                  <span>Inhabilitar</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-4">
      <div className="shrink-0 rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] p-2.5 text-[var(--color-primary)]">
        <Icon size={20} />
      </div>

      <div>
        <h4 className="text-sm font-black text-[var(--color-text)]">{title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted-text)]">
          {text}
        </p>
      </div>
    </div>
  );
}