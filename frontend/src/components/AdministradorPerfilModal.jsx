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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl animate-fadeIn">
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between p-6 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-black uppercase shadow-inner backdrop-blur-md">
              {admin.nombre?.charAt(0)}
              {admin.apellido?.charAt(0)}
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black">
                {admin.nombre} {admin.apellido}

                <span className="ml-2 flex items-center gap-1 rounded-lg bg-white/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck size={12} />
                  Staff
                </span>
              </h2>

              <p className="mt-1 flex items-center gap-2 text-white/80">
                <CreditCard size={16} />
                {admin.tipodocumento || admin.tipoDocumento || "DNI"}:{" "}
                {admin.numdocumento || admin.numDocumento || "-"}
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
            <div className="space-y-6 md:col-span-1">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
                <h3 className="mb-4 border-b border-[var(--color-border)] pb-2 text-sm font-black uppercase tracking-wider text-[var(--color-muted-text)]">
                  Información de Contacto
                </h3>

                <div className="space-y-4 text-sm text-[var(--color-muted-text)]">
                  <div className="flex items-start gap-3">
                    <Mail
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                    />

                    <span className="break-all font-medium text-[var(--color-text)]">
                      {admin.correo || "No registrado"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone
                      size={18}
                      className="shrink-0 text-[var(--color-primary)]"
                    />

                    <span>{admin.telefono || "No registrado"}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                    />

                    <span>{admin.direccion || "No registrada"}</span>
                  </div>
                </div>

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
                    {esInactivo ? "Inactivo (Acceso Bloqueado)" : "Activo"}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="h-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
                <h3 className="mb-6 flex items-center gap-2 border-b border-[var(--color-border)] pb-4 text-lg font-black text-[var(--color-text)]">
                  <Shield size={22} className="text-[var(--color-primary)]" />
                  Nivel de Acceso y Privilegios
                </h3>

                <div className="space-y-6">
                  <p className="text-sm leading-relaxed text-[var(--color-muted-text)]">
                    Este perfil pertenece al grupo de{" "}
                    <strong className="text-[var(--color-text)]">
                      Staff Administrativo
                    </strong>
                    . Cuenta con credenciales de acceso global a la plataforma
                    CONIT, lo que le permite gestionar procesos críticos del
                    sistema.
                  </p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <PrivilegioCard
                      icon={Key}
                      title="Gestión de Usuarios"
                      text="Control total sobre creación, edición y estado de cuentas de alumnos, docentes y otros administradores."
                    />

                    <PrivilegioCard
                      icon={BookOpen}
                      title="Gestión Académica"
                      text="Capacidad para crear cursos, asignar cargas académicas a docentes y matricular alumnos."
                    />
                  </div>

                  {esInactivo && (
                    <div className="mt-4 flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                      <div className="mt-0.5 shrink-0 text-red-500">
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

        {/* Footer */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border)] bg-[var(--color-card)] px-6 py-4">
          <p className="text-sm font-semibold text-[var(--color-muted-text)]">
            Acciones rápidas del administrador
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-4 py-2 font-semibold text-[var(--color-primary)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]"
            >
              <Edit2 size={18} />
              <span className="hidden sm:inline">Editar Perfil</span>
            </button>

            {esInactivo ? (
              <button
                onClick={onHabilitar}
                className="flex items-center gap-2 rounded-xl border border-transparent bg-[var(--color-background)] px-4 py-2 font-semibold text-[var(--color-text)] transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
              >
                <CheckCircle size={18} />
                <span className="hidden sm:inline">Habilitar</span>
              </button>
            ) : (
              <button
                onClick={onInhabilitar}
                className="flex items-center gap-2 rounded-xl border border-transparent bg-[var(--color-background)] px-4 py-2 font-semibold text-[var(--color-text)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
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

function PrivilegioCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))] p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-black text-[var(--color-primary)]">
        <Icon size={16} />
        {title}
      </div>

      <p className="text-xs leading-relaxed text-[var(--color-muted-text)]">
        {text}
      </p>
    </div>
  );
}