import { useState, useEffect } from "react";
import {
  obtenerUsuario,
  inhabilitarUsuario,
  habilitarUsuario,
} from "../services/usuario.service";
import UsuarioModal from "../components/UsuarioModal";
import toast from "react-hot-toast";
import {
  Search,
  Edit2,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Key,
  Users,
} from "lucide-react";

export default function Usuarios() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("habilitados");
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [usuarioInhabilitar, setUsuarioInhabilitar] = useState(null);
  const [usuarioHabilitar, setUsuarioHabilitar] = useState(null);

  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);

      const data = await obtenerUsuario();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Error al cargar los usuarios");
      console.error("Error al cargar los usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const solicitarInhabilitacion = (usuario) => setUsuarioInhabilitar(usuario);

  const confirmarInhabilitacion = async () => {
    try {
      await inhabilitarUsuario(usuarioInhabilitar.id);

      toast.success("Usuario inhabilitado exitosamente");
      setUsuarioInhabilitar(null);
      cargarUsuarios();
    } catch (error) {
      toast.error("Error al inhabilitar el usuario");
      console.error("Error al inhabilitar el usuario:", error);
    }
  };

  const solicitarHabilitacion = (usuario) => setUsuarioHabilitar(usuario);

  const confirmarHabilitacion = async () => {
    try {
      await habilitarUsuario(usuarioHabilitar.id);

      toast.success("Usuario habilitado exitosamente");
      setUsuarioHabilitar(null);
      cargarUsuarios();
    } catch (error) {
      toast.error("Error al habilitar el usuario");
      console.error("Error al habilitar el usuario:", error);
    }
  };

  const handleEditar = (usuario) => {
    setUsuarioEditar(usuario);
    setMostrarModal(true);
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termino = busqueda.toLowerCase().trim();
    const correo = (usuario.correo || "").toLowerCase();
    const rol = (usuario.rol || "").toLowerCase();

    const coincideTexto = correo.includes(termino) || rol.includes(termino);

    let coincideEstado = true;

    if (filtroEstado === "habilitados") {
      coincideEstado = usuario.estado === true || usuario.estado === null;
    } else if (filtroEstado === "inhabilitados") {
      coincideEstado = usuario.estado === false;
    }

    return coincideTexto && coincideEstado;
  });

  const getRolBadgeColor = (rol) => {
    switch (rol?.toUpperCase()) {
      case "ADMIN":
      case "ADMINISTRADOR":
        return "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)] border-[var(--color-primary)]";
      case "DOCENTE":
        return "bg-[color-mix(in_srgb,var(--color-secondary)_12%,transparent)] text-[var(--color-secondary)] border-[var(--color-secondary)]";
      case "ALUMNO":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-[var(--color-background)] text-[var(--color-muted-text)] border-[var(--color-border)]";
    }
  };

  return (
    <div className="min-h-screen space-y-8 bg-[var(--color-background)] p-8 text-[var(--color-text)]">
      {/* Banner Principal */}
      <section
        className="relative overflow-hidden rounded-3xl px-8 py-8 text-white shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
        }}
      >
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur">
              <Shield size={16} />
              Seguridad del sistema
            </div>

            <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight md:text-3xl">
              Control de Credenciales
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-white/75">
              Administra los correos de acceso, roles, contraseñas y estado de
              las cuentas del sistema.
            </p>
          </div>

          <div className="inline-flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white/85 backdrop-blur">
            <Users size={20} />
            {usuariosFiltrados.length} usuario(s)
          </div>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      </section>

      {/* Contenedor de búsqueda y tabla */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        {/* Buscador */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-text)]"
              size={20}
            />

            <input
              type="text"
              placeholder="Buscar por correo o rol..."
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 pl-12 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted-text)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm font-semibold text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] sm:w-56"
            >
              <option value="habilitados">Solo Habilitados</option>
              <option value="inhabilitados">Solo Inhabilitados</option>
              <option value="todos">Mostrar Todos</option>
            </select>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm font-semibold text-[var(--color-muted-text)]">
              {usuariosFiltrados.length} cuenta(s)
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-background)] text-xs font-bold uppercase tracking-wider text-[var(--color-muted-text)]">
                <tr>
                  <th className="px-6 py-4">Credenciales</th>
                  <th className="px-6 py-4">Rol en Sistema</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--color-border)]">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center font-medium text-[var(--color-muted-text)]"
                    >
                      Cargando datos...
                    </td>
                  </tr>
                ) : usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center font-medium text-[var(--color-muted-text)]"
                    >
                      No se encontraron usuarios.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((usuario) => {
                    const esInactivo = usuario.estado === false;
                    const textoEstado = esInactivo ? "INACTIVO" : "ACTIVO";

                    return (
                      <tr
                        key={usuario.id}
                        className={`group transition-colors ${
                          esInactivo
                            ? "bg-[var(--color-background)] opacity-70"
                            : "hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
                                esInactivo
                                  ? "bg-slate-200 text-slate-500"
                                  : "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white"
                              }`}
                            >
                              <Key size={20} />
                            </div>

                            <div className="min-w-0">
                              <div className="truncate text-sm font-black text-[var(--color-text)]">
                                {usuario.correo || "Sin correo"}
                              </div>

                              <p className="mt-1 text-xs text-[var(--color-muted-text)]">
                                ID de usuario: {usuario.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`rounded-xl border px-3 py-1.5 text-xs font-bold uppercase ${getRolBadgeColor(
                              usuario.rol
                            )}`}
                          >
                            {usuario.rol || "N/A"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold tracking-wide ${
                              esInactivo
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {textoEstado}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditar(usuario)}
                              className="rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] p-2 text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
                              title="Editar Credenciales"
                            >
                              <Edit2 size={18} />
                            </button>

                            {esInactivo ? (
                              <button
                                onClick={() => solicitarHabilitacion(usuario)}
                                className="rounded-xl bg-green-50 p-2 text-green-600 transition hover:bg-green-100"
                                title="Desbloquear Acceso"
                              >
                                <CheckCircle size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => solicitarInhabilitacion(usuario)}
                                className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                title="Bloquear Acceso"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {mostrarModal && (
        <UsuarioModal
          usuarioEditar={usuarioEditar}
          onClose={() => setMostrarModal(false)}
          onSuccess={cargarUsuarios}
        />
      )}

      {usuarioInhabilitar && (
        <ConfirmacionModal
          tipo="danger"
          icon={AlertTriangle}
          titulo="¿Bloquear Acceso?"
          descripcion={
            <>
              Estás a punto de revocar el acceso al sistema para la cuenta{" "}
              <span className="mt-1 block font-black text-[var(--color-text)]">
                {usuarioInhabilitar.correo}
              </span>
            </>
          }
          textoConfirmar="Sí, bloquear"
          onCancelar={() => setUsuarioInhabilitar(null)}
          onConfirmar={confirmarInhabilitacion}
        />
      )}

      {usuarioHabilitar && (
        <ConfirmacionModal
          tipo="success"
          icon={CheckCircle}
          titulo="¿Desbloquear Acceso?"
          descripcion={
            <>
              Estás a punto de re-habilitar el acceso al sistema para la cuenta{" "}
              <span className="mt-1 block font-black text-[var(--color-text)]">
                {usuarioHabilitar.correo}
              </span>
            </>
          }
          textoConfirmar="Sí, desbloquear"
          onCancelar={() => setUsuarioHabilitar(null)}
          onConfirmar={confirmarHabilitacion}
        />
      )}
    </div>
  );
}

function ConfirmacionModal({
  tipo,
  icon: Icon,
  titulo,
  descripcion,
  textoConfirmar,
  onCancelar,
  onConfirmar,
}) {
  const esDanger = tipo === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl">
        <div className="p-7 text-center">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              esDanger ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
            }`}
          >
            <Icon size={32} />
          </div>

          <h3 className="mb-2 text-xl font-black text-[var(--color-text)]">
            {titulo}
          </h3>

          <p className="text-[var(--color-muted-text)]">{descripcion}</p>
        </div>

        <div className="flex justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-background)] px-6 py-4">
          <button
            onClick={onCancelar}
            className="rounded-xl px-4 py-2 font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-card)]"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirmar}
            className={`rounded-xl px-4 py-2 font-semibold text-white shadow-sm transition ${
              esDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}