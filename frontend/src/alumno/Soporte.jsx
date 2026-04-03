import { useEffect, useMemo, useState } from "react";
import {
  LifeBuoy,
  Plus,
  Search,
  Paperclip,
  X,
  Send,
  Clock3,
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  Eye,
} from "lucide-react";
import api from "../api";

export default function Soporte() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [archivos, setArchivos] = useState([]);

  const [form, setForm] = useState({
    asunto: "",
    mensaje: "",
    prioridad: "MEDIA",
  });

  useEffect(() => {
    cargarTickets();
  }, []);

  const ticketsFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return tickets;

    return tickets.filter((ticket) => {
      const asunto = (ticket.asunto || "").toLowerCase();
      const mensaje = (ticket.mensaje || "").toLowerCase();
      const estado = (ticket.estado || "").toLowerCase();

      return (
        asunto.includes(texto) ||
        mensaje.includes(texto) ||
        estado.includes(texto)
      );
    });
  }, [tickets, busqueda]);

  const resumen = useMemo(() => {
    return {
      total: tickets.length,
      pendientes: tickets.filter((t) => t.estado === "PENDIENTE").length,
      proceso: tickets.filter((t) => t.estado === "EN_PROCESO").length,
      resueltos: tickets.filter((t) =>
        ["RESUELTO", "CERRADO"].includes(t.estado)
      ).length,
    };
  }, [tickets]);

  async function cargarTickets() {
    try {
      setLoading(true);
      setError("");

      const idalumno = localStorage.getItem("idalumno");
      if (!idalumno) {
        setTickets([]);
        setError("No se encontró el alumno en sesión.");
        return;
      }

      const res = await api.get(`/soporte/alumno/${idalumno}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setTickets(data);
    } catch (err) {
      console.error("Error cargando tickets:", err);
      setError("No se pudieron cargar tus tickets de soporte.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  function abrirNuevoTicket() {
    setForm({
      asunto: "",
      mensaje: "",
      prioridad: "MEDIA",
    });
    setArchivos([]);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setArchivos([]);
    setForm({
      asunto: "",
      mensaje: "",
      prioridad: "MEDIA",
    });
  }

  function handleFilesChange(e) {
    const nuevos = Array.from(e.target.files || []);
    if (!nuevos.length) return;

    setArchivos((prev) => [...prev, ...nuevos]);
  }

  function eliminarArchivo(index) {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  }

  async function subirAdjunto(file) {
    const usuarioRaw = localStorage.getItem("usuario");
    let usuarioId = null;

    if (usuarioRaw) {
      try {
        const usuario = JSON.parse(usuarioRaw);
        usuarioId = usuario?.id || null;
      } catch (error) {
        console.error("Error leyendo usuario:", error);
      }
    }

    const formData = new FormData();
    formData.append("file", file);

    if (usuarioId) {
      formData.append("usuario_id", String(usuarioId));
    }

    const res = await api.post("/multimedia/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const body = res.data || {};

    return {
      nombre_archivo: file.name,
      archivo_url: body.url || body.publicUrl || body.foto_url || "",
      tipo_mime: file.type || null,
      tamano: file.size || null,
    };
  }

  async function crearTicket(e) {
    e.preventDefault();

    if (!form.asunto.trim() || !form.mensaje.trim()) {
      alert("Completa el asunto y el mensaje.");
      return;
    }

    try {
      setGuardando(true);

      const idalumno = localStorage.getItem("idalumno");
      const usuarioRaw = localStorage.getItem("usuario");

      if (!idalumno || !usuarioRaw) {
        alert("No se encontró la sesión del alumno.");
        return;
      }

      const usuario = JSON.parse(usuarioRaw);

      const adjuntos = [];
      for (const archivo of archivos) {
        const adjunto = await subirAdjunto(archivo);
        if (adjunto.archivo_url) {
          adjuntos.push(adjunto);
        }
      }

      await api.post("/soporte", {
        asunto: form.asunto,
        mensaje: form.mensaje,
        prioridad: form.prioridad,
        estado: "PENDIENTE",
        idalumno: Number(idalumno),
        idusuario: Number(usuario.id),
        adjuntos,
      });

      cerrarModal();
      await cargarTickets();
    } catch (err) {
      console.error("Error creando ticket:", err);
      alert("No se pudo crear el ticket de soporte.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Soporte</h1>
            <p className="mt-2 text-sm text-indigo-100">
              Crea tickets de ayuda y revisa el estado de tus consultas.
            </p>
          </div>

          <button
            onClick={abrirNuevoTicket}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-slate-100"
          >
            <Plus size={18} />
            Nuevo ticket
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ResumenCard
            icon={<LifeBuoy size={20} />}
            label="Total tickets"
            value={resumen.total}
          />
          <ResumenCard
            icon={<AlertCircle size={20} />}
            label="Pendientes"
            value={resumen.pendientes}
          />
          <ResumenCard
            icon={<Clock3 size={20} />}
            label="En proceso"
            value={resumen.proceso}
          />
          <ResumenCard
            icon={<CheckCircle2 size={20} />}
            label="Resueltos"
            value={resumen.resueltos}
          />
        </div>
      </div>

      {/* BUSQUEDA */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por asunto, mensaje o estado..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
          />
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Mis tickets de soporte
          </h2>
        </div>

        {loading ? (
          <div className="space-y-4 p-5">
            {[...Array(4)].map((_, i) => (
              <SkeletonTicket key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : ticketsFiltrados.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <LifeBuoy size={24} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-700">
              No tienes tickets registrados
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Cuando necesites ayuda, crea un ticket y aparecerá aquí.
            </p>

            <button
              onClick={abrirNuevoTicket}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={16} />
              Crear ticket
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {ticketsFiltrados.map((ticket) => (
              <div
                key={ticket.id}
                className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <EstadoBadge estado={ticket.estado} />
                    <PrioridadBadge prioridad={ticket.prioridad} />
                  </div>

                  <h3 className="mt-3 text-lg font-semibold text-slate-800">
                    {ticket.asunto}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {ticket.mensaje}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>Ticket #{ticket.id}</span>
                    <span>Creado: {formatearFecha(ticket.created_at)}</span>
                    <span>
                      Adjuntos: {Array.isArray(ticket.adjuntos) ? ticket.adjuntos.length : 0}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => setTicketSeleccionado(ticket)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    Ver detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CREAR */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Nuevo ticket de soporte
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Describe tu problema y adjunta evidencia si es necesario.
                </p>
              </div>

              <button
                onClick={cerrarModal}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={crearTicket} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Asunto
                </label>
                <input
                  type="text"
                  value={form.asunto}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, asunto: e.target.value }))
                  }
                  placeholder="Ej. No puedo ingresar a mi curso"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Prioridad
                </label>
                <select
                  value={form.prioridad}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, prioridad: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Mensaje
                </label>
                <textarea
                  rows={5}
                  value={form.mensaje}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, mensaje: e.target.value }))
                  }
                  placeholder="Describe el problema con detalle..."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Adjuntos
                </label>

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 hover:bg-slate-100">
                  <Paperclip size={16} />
                  Adjuntar archivos o imágenes
                  <input
                    type="file"
                    multiple
                    onChange={handleFilesChange}
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.xlsx"
                  />
                </label>

                {archivos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {archivos.map((archivo, index) => (
                      <div
                        key={`${archivo.name}-${index}`}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <FolderOpen size={16} className="text-slate-500" />
                          <span className="truncate text-sm text-slate-700">
                            {archivo.name}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => eliminarArchivo(index)}
                          className="rounded-full p-1 text-red-500 hover:bg-red-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white ${
                    guardando
                      ? "cursor-not-allowed bg-slate-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  <Send size={16} />
                  {guardando ? "Enviando..." : "Crear ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {ticketSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <EstadoBadge estado={ticketSeleccionado.estado} />
                  <PrioridadBadge prioridad={ticketSeleccionado.prioridad} />
                </div>

                <h3 className="mt-3 text-xl font-bold text-slate-800">
                  {ticketSeleccionado.asunto}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Ticket #{ticketSeleccionado.id} • {formatearFecha(ticketSeleccionado.created_at)}
                </p>
              </div>

              <button
                onClick={() => setTicketSeleccionado(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Mensaje</p>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                  {ticketSeleccionado.mensaje}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Respuesta</p>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                  {ticketSeleccionado.respuesta || "Aún no hay respuesta del equipo de soporte."}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-700">Adjuntos</p>

              {Array.isArray(ticketSeleccionado.adjuntos) &&
              ticketSeleccionado.adjuntos.length > 0 ? (
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {ticketSeleccionado.adjuntos.map((adjunto) => (
                    <a
                      key={adjunto.id}
                      href={adjunto.archivo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Paperclip size={16} className="text-slate-500" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {adjunto.nombre_archivo}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {adjunto.tipo_mime || "Archivo"}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Este ticket no tiene adjuntos.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* COMPONENTES */

function ResumenCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span>{icon}</span>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="mt-3 text-sm text-indigo-100">{label}</p>
    </div>
  );
}

function EstadoBadge({ estado }) {
  const estilos = {
    PENDIENTE: "bg-amber-100 text-amber-700",
    EN_PROCESO: "bg-blue-100 text-blue-700",
    RESUELTO: "bg-emerald-100 text-emerald-700",
    CERRADO: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        estilos[estado] || "bg-slate-100 text-slate-700"
      }`}
    >
      {estado || "SIN ESTADO"}
    </span>
  );
}

function PrioridadBadge({ prioridad }) {
  const estilos = {
    BAJA: "bg-slate-100 text-slate-700",
    MEDIA: "bg-violet-100 text-violet-700",
    ALTA: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        estilos[prioridad] || "bg-slate-100 text-slate-700"
      }`}
    >
      Prioridad {prioridad || "MEDIA"}
    </span>
  );
}

function SkeletonTicket() {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-3 h-5 w-32 animate-pulse rounded bg-slate-200" />
      <div className="mb-2 h-5 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="mb-2 h-4 w-full animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return "-";

  return new Date(fechaISO).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}