import { useState, useEffect } from "react";
import {
  obtenerDocente,
  inhabilitarDocente,
  habilitarDocente,
} from "../services/docente.service";
import DocenteModal from "../components/DocenteModal";
import DocentePerfilModal from "../components/DocentePerfilModal";
import AsignarDocenteModal from "../components/AsignarDocenteModal";
import PermisosDocenteModal from "../components/PermisosDocenteModal";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Users,
  BookPlus,
  GraduationCap,
} from "lucide-react";

export default function Docentes() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("habilitados");
  const [docentes, setDocentes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [docenteEditar, setDocenteEditar] = useState(null);
  const [docenteInhabilitar, setDocenteInhabilitar] = useState(null);
  const [docenteHabilitar, setDocenteHabilitar] = useState(null);

  const [docenteVer, setDocenteVer] = useState(null);
  const [docenteAsignar, setDocenteAsignar] = useState(null);
  const [grupoPermisosEditar, setGrupoPermisosEditar] = useState(null);

  const cargarDocentes = async () => {
    try {
      setIsLoading(true);
      const data = await obtenerDocente();
      setDocentes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Error al cargar docentes");
      console.error("Error al cargar docentes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDocentes();
  }, []);

  const solicitarInhabilitacion = (docente) => setDocenteInhabilitar(docente);

  const confirmarInhabilitacion = async () => {
    try {
      await inhabilitarDocente(docenteInhabilitar.id);
      toast.success("Docente inhabilitado correctamente");
      setDocenteInhabilitar(null);
      cargarDocentes();
    } catch (error) {
      console.error(error);
      toast.error("Error al inhabilitar docente");
    }
  };

  const solicitarHabilitacion = (docente) => setDocenteHabilitar(docente);

  const confirmarHabilitacion = async () => {
    try {
      await habilitarDocente(docenteHabilitar.id);
      toast.success("Docente habilitado correctamente");
      setDocenteHabilitar(null);
      cargarDocentes();
    } catch (error) {
      console.error(error);
      toast.error("Error al habilitar docente");
    }
  };

  const handleEditar = (docente) => {
    setDocenteEditar(docente);
    setMostrarModal(true);
  };

  const handleNuevo = () => {
    setDocenteEditar(null);
    setMostrarModal(true);
  };

  const docentesFiltrados = docentes.filter((docente) => {
    const termino = busqueda.toLowerCase().trim();

    const nombreCompleto = `${docente.nombre || ""} ${
      docente.apellido || ""
    }`.toLowerCase();

    const documento = String(
      docente.numdocumento || docente.numDocumento || ""
    ).toLowerCase();

    const correo = String(docente.correo || "").toLowerCase();

    const coincideTexto =
      nombreCompleto.includes(termino) ||
      documento.includes(termino) ||
      correo.includes(termino);

    let coincideEstado = true;

    if (filtroEstado === "habilitados") {
      coincideEstado = docente.estado === true || docente.estado === null;
    } else if (filtroEstado === "inhabilitados") {
      coincideEstado = docente.estado === false;
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
              <GraduationCap size={16} />
              Administración académica
            </div>

            <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight md:text-3xl">
              Gestión de Docentes
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-white/75">
              Administra el registro, edición, asignación de cursos y estado del
              personal docente.
            </p>
          </div>

          <button
            onClick={handleNuevo}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-100"
          >
            <Plus size={20} />
            Nuevo Docente
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
              placeholder="Buscar por nombre, apellido, correo o documento..."
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
              {docentesFiltrados.length} docente(s)
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-background)] text-xs font-bold uppercase tracking-wider text-[var(--color-muted-text)]">
                <tr>
                  <th className="px-6 py-4">Docente</th>
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
                ) : docentesFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center font-medium text-[var(--color-muted-text)]"
                    >
                      No se encontraron docentes.
                    </td>
                  </tr>
                ) : (
                  docentesFiltrados.map((docente) => {
                    const esInactivo = docente.estado === false;
                    const textoEstado = esInactivo ? "INACTIVO" : "ACTIVO";

                    return (
                      <tr
                        key={docente.id}
                        onClick={() => setDocenteVer(docente)}
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
                              {docente.nombre?.charAt(0)}
                              {docente.apellido?.charAt(0)}
                            </div>

                            <div className="min-w-0">
                              <div className="text-sm font-bold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]">
                                {docente.nombre} {docente.apellido}
                              </div>

                              {docente.titulo && (
                                <div className="mt-1 max-w-[220px] truncate text-xs text-[var(--color-muted-text)] md:max-w-xs">
                                  {docente.titulo}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-[var(--color-muted-text)]">
                          <span className="font-semibold text-[var(--color-text)]">
                            {docente.tipoDocumento ||
                              docente.tipodocumento ||
                              "DNI"}
                            :
                          </span>{" "}
                          {docente.numDocumento || docente.numdocumento || "-"}
                        </td>

                        <td className="px-6 py-4 text-sm">
                          <div className="font-medium text-[var(--color-text)]">
                            {docente.correo || "-"}
                          </div>

                          <div className="mt-0.5 text-xs text-[var(--color-muted-text)]">
                            {docente.telefono || "-"}
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
                                setDocenteAsignar(docente);
                              }}
                              className="rounded-xl bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100"
                              title="Asignar Curso"
                            >
                              <BookPlus size={18} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditar(docente);
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
                                  solicitarHabilitacion(docente);
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
                                  solicitarInhabilitacion(docente);
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
        <DocenteModal
          docenteEditar={docenteEditar}
          onClose={() => setMostrarModal(false)}
          onSuccess={cargarDocentes}
        />
      )}

      {docenteVer && (
        <DocentePerfilModal
          docente={docenteVer}
          onClose={() => setDocenteVer(null)}
          onEdit={() => {
            setDocenteVer(null);
            handleEditar(docenteVer);
          }}
          onAsignar={() => {
            setDocenteVer(null);
            setDocenteAsignar(docenteVer);
          }}
          onConfigurarPermisos={(grupo) => {
            setGrupoPermisosEditar(grupo);
          }}
          onInhabilitar={() => {
            setDocenteVer(null);
            solicitarInhabilitacion(docenteVer);
          }}
          onHabilitar={() => {
            setDocenteVer(null);
            solicitarHabilitacion(docenteVer);
          }}
        />
      )}

      {docenteAsignar && (
        <AsignarDocenteModal
          docente={docenteAsignar}
          onClose={() => setDocenteAsignar(null)}
          onSuccess={() => {
            setDocenteAsignar(null);
            cargarDocentes();
          }}
        />
      )}

      {grupoPermisosEditar && (
        <PermisosDocenteModal
          docente={docenteVer}
          grupo={grupoPermisosEditar}
          onClose={() => setGrupoPermisosEditar(null)}
          onSuccess={() => {
            cargarDocentes();
          }}
        />
      )}

      {docenteInhabilitar && (
        <ConfirmacionModal
          tipo="danger"
          icon={AlertTriangle}
          titulo="¿Inhabilitar Docente?"
          descripcion={
            <>
              Estás a punto de inhabilitar a{" "}
              <span className="font-bold text-[var(--color-text)]">
                {docenteInhabilitar.nombre} {docenteInhabilitar.apellido}
              </span>
              . Perderá el acceso al sistema.
            </>
          }
          textoConfirmar="Sí, inhabilitar"
          onCancelar={() => setDocenteInhabilitar(null)}
          onConfirmar={confirmarInhabilitacion}
        />
      )}

      {docenteHabilitar && (
        <ConfirmacionModal
          tipo="success"
          icon={CheckCircle}
          titulo="¿Habilitar Docente?"
          descripcion={
            <>
              Estás a punto de re-habilitar a{" "}
              <span className="font-bold text-[var(--color-text)]">
                {docenteHabilitar.nombre} {docenteHabilitar.apellido}
              </span>
              . Volverá a tener acceso al sistema.
            </>
          }
          textoConfirmar="Sí, habilitar"
          onCancelar={() => setDocenteHabilitar(null)}
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