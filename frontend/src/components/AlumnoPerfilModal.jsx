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
  Settings,
} from "lucide-react";
import { obtenerMatriculasPorAlumno } from "../services/matricula.service";
import toast from "react-hot-toast";
import PermisosCertificadoModal from "./PermisosCertificadoModal";

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
  const [certModalOpen, setCertModalOpen] = useState(null);

  useEffect(() => {
    const cargarMatriculas = async () => {
      if (!alumno?.id) return;

      setIsLoading(true);

      try {
        const data = await obtenerMatriculasPorAlumno(alumno.id);
        setMatriculas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar matriculas del alumno", error);
        toast.error("Error al cargar cursos matriculados");
      } finally {
        setIsLoading(false);
      }
    };

    cargarMatriculas();
  }, [alumno?.id]);

  if (!alumno) {
    return null;
  }

  const esInactivo = alumno.estado === false;

  const hayAcciones =
    typeof onMatricular === "function" ||
    typeof onEdit === "function" ||
    typeof onHabilitar === "function" ||
    typeof onInhabilitar === "function";

  const handleCertificadoActualizado = (
    matriculaId,
    puedeVer,
    puedeDescargar
  ) => {
    setMatriculas((prev) =>
      prev.map((m) =>
        m.id === matriculaId
          ? {
              ...m,
              puede_ver_certificado: puedeVer,
              puede_descargar_certificado: puedeDescargar,
            }
          : m
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl animate-fadeIn flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl">
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between p-6 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold shadow-inner backdrop-blur-md">
              {alumno.nombre?.charAt(0)}
              {alumno.apellido?.charAt(0)}
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                {alumno.nombre} {alumno.apellido}
              </h2>

              <p className="mt-1 flex items-center gap-2 text-white/80">
                <CreditCard size={16} />
                {alumno.tipoDocumento || "DNI"}:{" "}
                {alumno.numDocumento || alumno.numdocumento || "-"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-white/20"
            title="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-[var(--color-background)] p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Datos personales */}
            <div className="space-y-6 md:col-span-1">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
                <h3 className="mb-4 border-b border-[var(--color-border)] pb-2 text-sm font-bold uppercase tracking-wider text-[var(--color-muted-text)]">
                  Información de contacto
                </h3>

                <div className="space-y-4 text-sm text-[var(--color-muted-text)]">
                  <div className="flex items-start gap-3">
                    <Mail
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                    />
                    <span className="break-all">
                      {alumno.correo || "No registrado"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone
                      size={18}
                      className="shrink-0 text-[var(--color-primary)]"
                    />
                    <span>{alumno.telefono || "No registrado"}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                    />
                    <span>{alumno.direccion || "No registrada"}</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                  <span className="mb-2 block text-xs font-medium text-[var(--color-muted-text)]">
                    Estado en el sistema:
                  </span>

                  <span
                    className={`inline-block rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
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

            {/* Cursos matriculados */}
            <div className="md:col-span-2">
              <div className="h-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-[var(--color-text)]">
                  <BookOpen size={20} className="text-[var(--color-primary)]" />
                  Cursos Matriculados
                </h3>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-[var(--color-muted-text)]">
                    <Loader2
                      size={32}
                      className="mb-3 animate-spin text-[var(--color-primary)]"
                    />
                    <p>Cargando información académica...</p>
                  </div>
                ) : matriculas.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)] px-6 py-8 text-center text-[var(--color-muted-text)]">
                    Este alumno aún no tiene cursos registrados.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matriculas.map((matricula) => (
                      <div
                        key={matricula.id}
                        className="flex flex-col justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 transition hover:border-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)] sm:flex-row sm:items-center"
                      >
                        <div>
                          <h4 className="font-bold text-[var(--color-text)]">
                            {matricula.grupo?.curso?.nombrecurso ||
                              matricula.observacion ||
                              "Curso Desconocido"}
                          </h4>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-block rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 text-xs font-medium text-[var(--color-muted-text)]">
                              Grupo: {matricula.grupo?.nombregrupo || "N/A"}
                            </span>

                            {matricula.grupo?.horario && (
                              <span className="inline-block rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 text-xs font-medium text-[var(--color-muted-text)]">
                                Horario: {matricula.grupo.horario}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${
                              matricula.estado === "pendiente"
                                ? "bg-yellow-100 text-yellow-700"
                                : matricula.estado === "activo"
                                ? "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {matricula.estado || "Inscrito"}
                          </span>

                          <button
                            onClick={() => setCertModalOpen(matricula)}
                            className="rounded-xl border border-emerald-100 bg-emerald-50 p-2 text-emerald-600 shadow-sm transition hover:bg-emerald-100"
                            title="Configurar certificado"
                          >
                            <Settings size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-card)] px-6 py-4">
          <p className="text-sm font-medium text-[var(--color-muted-text)]">
            {hayAcciones
              ? "Acciones rápidas del alumno"
              : "Vista rápida del alumno"}
          </p>

          {hayAcciones && (
            <div className="flex flex-wrap items-center gap-3">
              {typeof onMatricular === "function" && (
                <button
                  onClick={onMatricular}
                  className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  <BookPlus size={18} />
                  <span className="hidden sm:inline">Matricular</span>
                </button>
              )}

              {typeof onEdit === "function" && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-4 py-2 font-semibold text-[var(--color-primary)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]"
                >
                  <Edit2 size={18} />
                  <span className="hidden sm:inline">Editar Perfil</span>
                </button>
              )}

              {esInactivo
                ? typeof onHabilitar === "function" && (
                    <button
                      onClick={onHabilitar}
                      className="flex items-center gap-2 rounded-xl border border-transparent bg-[var(--color-background)] px-4 py-2 font-semibold text-[var(--color-text)] transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                    >
                      <CheckCircle size={18} />
                      <span className="hidden sm:inline">Habilitar</span>
                    </button>
                  )
                : typeof onInhabilitar === "function" && (
                    <button
                      onClick={onInhabilitar}
                      className="flex items-center gap-2 rounded-xl border border-transparent bg-[var(--color-background)] px-4 py-2 font-semibold text-[var(--color-text)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                      <span className="hidden sm:inline">Inhabilitar</span>
                    </button>
                  )}
            </div>
          )}
        </div>
      </div>

      {certModalOpen && (
        <PermisosCertificadoModal
          matricula={certModalOpen}
          onClose={() => setCertModalOpen(null)}
          onSuccess={handleCertificadoActualizado}
        />
      )}
    </div>
  );
}