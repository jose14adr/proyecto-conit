import { useState, useEffect } from "react";
import {
  UserCog,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import AdministradorModal from "../components/AdministradorModal";
import AdministradorPerfilModal from "../components/AdministradorPerfilModal";
import toast from "react-hot-toast";
import {
  obtenerAdministradores,
  inhabilitarAdministrador,
  habilitarAdministrador,
} from "../services/administrador.service";

export default function Administradores() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("habilitados");
  const [administradores, setAdministradores] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [adminEditar, setAdminEditar] = useState(null);
  const [adminInhabilitar, setAdminInhabilitar] = useState(null);
  const [adminHabilitar, setAdminHabilitar] = useState(null);
  const [adminVer, setAdminVer] = useState(null);

  const cargarAdministradores = async () => {
    try {
      setIsLoading(true);

      const data = await obtenerAdministradores();
      setAdministradores(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Error al cargar administradores");
      console.error("Error al cargar administradores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarAdministradores();
  }, []);

  const solicitarInhabilitacion = (admin) => setAdminInhabilitar(admin);

  const confirmarInhabilitacion = async () => {
    try {
      await inhabilitarAdministrador(adminInhabilitar.id);

      toast.success("Administrador inhabilitado correctamente");
      setAdminInhabilitar(null);
      cargarAdministradores();
    } catch (error) {
      console.error("Error al inhabilitar administrador:", error);
      toast.error("Error al inhabilitar administrador");
    }
  };

  const solicitarHabilitacion = (admin) => setAdminHabilitar(admin);

  const confirmarHabilitacion = async () => {
    try {
      await habilitarAdministrador(adminHabilitar.id);

      toast.success("Administrador habilitado correctamente");
      setAdminHabilitar(null);
      cargarAdministradores();
    } catch (error) {
      toast.error("Error al habilitar administrador");
      console.error("Error al habilitar administrador:", error);
    }
  };

  const handleEditar = (admin) => {
    setAdminEditar(admin);
    setMostrarModal(true);
  };

  const handleNuevo = () => {
    setAdminEditar(null);
    setMostrarModal(true);
  };

  const adminsFiltrados = administradores.filter((admin) => {
    const termino = busqueda.toLowerCase().trim();

    const nombreCompleto = `${admin.nombre || ""} ${
      admin.apellido || ""
    }`.toLowerCase();

    const documento = String(
      admin.numdocumento || admin.numDocumento || ""
    ).toLowerCase();

    const correo = String(admin.correo || "").toLowerCase();

    const coincideTexto =
      nombreCompleto.includes(termino) ||
      documento.includes(termino) ||
      correo.includes(termino);

    let coincideEstado = true;

    if (filtroEstado === "habilitados") {
      coincideEstado = admin.estado === true || admin.estado === null;
    } else if (filtroEstado === "inhabilitados") {
      coincideEstado = admin.estado === false;
    }

    return coincideTexto && coincideEstado;
  });

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
              <ShieldCheck size={16} />
              Seguridad y permisos
            </div>

            <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight md:text-3xl">
              <UserCog size={30} />
              Gestión de Administradores
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-white/75">
              Administra el personal con privilegios de gestión global en el
              sistema.
            </p>
          </div>

          <button
            onClick={handleNuevo}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-100"
          >
            <Plus size={20} />
            Nuevo Admin
          </button>
        </div>

        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      </section>

      {/* Contenedor de búsqueda y tabla */}
      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-text)]"
              size={20}
            />

            <input
              type="text"
              placeholder="Buscar por nombre, correo o documento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 pl-12 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted-text)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
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
              {adminsFiltrados.length} administrador(es)
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-background)] text-xs font-bold uppercase tracking-wider text-[var(--color-muted-text)]">
                <tr>
                  <th className="px-6 py-4">Personal</th>
                  <th className="px-6 py-4">Documento</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--color-border)]">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center font-medium text-[var(--color-muted-text)]"
                    >
                      Cargando datos...
                    </td>
                  </tr>
                ) : adminsFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center font-medium text-[var(--color-muted-text)]"
                    >
                      No se encontraron administradores.
                    </td>
                  </tr>
                ) : (
                  adminsFiltrados.map((admin) => {
                    const esInactivo = admin.estado === false;
                    const textoEstado = esInactivo ? "INACTIVO" : "ACTIVO";

                    return (
                      <tr
                        key={admin.id}
                        onClick={() => setAdminVer(admin)}
                        className={`group cursor-pointer transition-colors ${
                          esInactivo
                            ? "bg-[var(--color-background)] opacity-70"
                            : "hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold uppercase transition-colors ${
                                esInactivo
                                  ? "bg-slate-200 text-slate-500"
                                  : "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white"
                              }`}
                            >
                              {admin.nombre?.charAt(0)}
                              {admin.apellido?.charAt(0)}
                            </div>

                            <div className="min-w-0">
                              <div className="text-sm font-black text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]">
                                {admin.nombre} {admin.apellido}
                              </div>

                              <p className="mt-1 text-xs text-[var(--color-muted-text)]">
                                Administrador del sistema
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-[var(--color-muted-text)]">
                          <span className="font-semibold text-[var(--color-text)]">
                            {admin.tipodocumento ||
                              admin.tipoDocumento ||
                              "DNI"}
                            :
                          </span>{" "}
                          {admin.numdocumento || admin.numDocumento || "-"}
                        </td>

                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-[var(--color-text)]">
                            {admin.correo || "-"}
                          </div>

                          <div className="mt-0.5 text-xs text-[var(--color-muted-text)]">
                            {admin.telefono || "-"}
                          </div>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditar(admin);
                              }}
                              className="rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] p-2 text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>

                            {esInactivo ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  solicitarHabilitacion(admin);
                                }}
                                className="rounded-xl bg-green-50 p-2 text-green-600 transition hover:bg-green-100"
                                title="Re-habilitar"
                              >
                                <CheckCircle size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  solicitarInhabilitacion(admin);
                                }}
                                className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                title="Inhabilitar"
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
        <AdministradorModal
          adminEditar={adminEditar}
          onClose={() => setMostrarModal(false)}
          onSuccess={cargarAdministradores}
        />
      )}

      {adminVer && (
        <AdministradorPerfilModal
          admin={adminVer}
          onClose={() => setAdminVer(null)}
          onEdit={() => {
            setAdminVer(null);
            handleEditar(adminVer);
          }}
          onInhabilitar={() => {
            setAdminVer(null);
            solicitarInhabilitacion(adminVer);
          }}
          onHabilitar={() => {
            setAdminVer(null);
            solicitarHabilitacion(adminVer);
          }}
        />
      )}

      {adminInhabilitar && (
        <ConfirmacionModal
          tipo="danger"
          icon={AlertTriangle}
          titulo="¿Inhabilitar Administrador?"
          descripcion={
            <>
              Estás a punto de inhabilitar a{" "}
              <span className="font-bold text-[var(--color-text)]">
                {adminInhabilitar.nombre} {adminInhabilitar.apellido}
              </span>
              .
            </>
          }
          textoConfirmar="Sí, inhabilitar"
          onCancelar={() => setAdminInhabilitar(null)}
          onConfirmar={confirmarInhabilitacion}
        />
      )}

      {adminHabilitar && (
        <ConfirmacionModal
          tipo="success"
          icon={CheckCircle}
          titulo="¿Habilitar Administrador?"
          descripcion={
            <>
              Estás a punto de re-habilitar a{" "}
              <span className="font-bold text-[var(--color-text)]">
                {adminHabilitar.nombre} {adminHabilitar.apellido}
              </span>
              .
            </>
          }
          textoConfirmar="Sí, habilitar"
          onCancelar={() => setAdminHabilitar(null)}
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