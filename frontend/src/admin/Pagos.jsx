import { useState, useEffect, useMemo } from "react";
import { obtenerPagos, obtenerPensiones } from "../services/pago.service";
import toast from "react-hot-toast";
import {
  Search,
  FileText,
  FileSpreadsheet,
  FileDown,
  Calendar,
  AlertCircle,
  CheckCircle,
  CreditCard,
  RotateCcw,
  Loader2,
  X,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style";

const formatearNombreAlumno = (alumno) => {
  if (!alumno) return "Alumno Desconocido";

  const data = Array.isArray(alumno) ? alumno[0] : alumno;
  if (!data) return "Alumno Desconocido";

  const nombre = data.nombre || data.nombres || "";
  const apellido = data.apellido || data.apellidos || "";

  return `${nombre} ${apellido}`.trim() || "Alumno Desconocido";
};

const extraerNombreCurso = (matricula) => {
  if (!matricula) return "Curso Desconocido";

  const mat = Array.isArray(matricula) ? matricula[0] : matricula;
  const grupo = mat?.grupo
    ? Array.isArray(mat.grupo)
      ? mat.grupo[0]
      : mat.grupo
    : null;

  const curso = grupo?.curso
    ? Array.isArray(grupo.curso)
      ? grupo.curso[0]
      : grupo.curso
    : null;

  return curso?.nombrecurso || mat?.curso?.nombrecurso || "Curso Desconocido";
};

const obtenerCssVar = (nombre, fallback) => {
  if (typeof window === "undefined") return fallback;

  const valor = getComputedStyle(document.documentElement)
    .getPropertyValue(nombre)
    .trim();

  return valor || fallback;
};

const hexToRgb = (hex) => {
  const limpio = hex.replace("#", "");

  if (limpio.length !== 6) return [52, 76, 146];

  return [
    parseInt(limpio.substring(0, 2), 16),
    parseInt(limpio.substring(2, 4), 16),
    parseInt(limpio.substring(4, 6), 16),
  ];
};

const hexSinNumeral = (hex) => hex.replace("#", "").toUpperCase();

export default function Pagos() {
  const [activeTab, setActiveTab] = useState("pagos");
  const [busqueda, setBusqueda] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [historialPagos, setHistorialPagos] = useState([]);
  const [alumnosDeuda, setAlumnosDeuda] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalExportacion, setModalExportacion] = useState({
    abierto: false,
    tipo: null,
    nombreArchivo: "reporte_pagos",
  });

  const cargarDatosFinancieros = async () => {
    try {
      setIsLoading(true);

      const [dataPagos, dataPensiones] = await Promise.all([
        obtenerPagos(),
        obtenerPensiones(),
      ]);

      const pagosFormateados = dataPagos.map((p) => {
        const mat = Array.isArray(p.matricula) ? p.matricula[0] : p.matricula;

        return {
          id: p.id,
          fecha: p.fechapago?.split("T")[0] || "Sin fecha",
          alumno: formatearNombreAlumno(mat?.alumno),
          curso: extraerNombreCurso(mat),
          tipopago: p.tipopago || "N/A",
          total: parseFloat(p.preciofinal) || 0,
          estado: p.estado || "Pagado",
        };
      });

      const hoy = new Date();

      const deudasFormateadas = dataPensiones
        .filter((p) => p.estado === "PENDIENTE")
        .map((d) => {
          const mat = Array.isArray(d.matricula) ? d.matricula[0] : d.matricula;

          const fechaVencimiento = new Date(d.fecha_vencimiento);
          const diasAtraso = Math.max(
            0,
            Math.floor((hoy - fechaVencimiento) / (1000 * 60 * 60 * 24))
          );

          return {
            id: d.id,
            alumno: formatearNombreAlumno(mat?.alumno),
            curso: mat?.curso?.nombrecurso || extraerNombreCurso(mat),
            cuota: d.numero_cuota,
            vencimiento: d.fecha_vencimiento?.split("T")[0] || "Sin fecha",
            monto: parseFloat(d.monto) || 0,
            diasAtraso,
          };
        });

      setHistorialPagos(pagosFormateados);
      setAlumnosDeuda(deudasFormateadas);
    } catch (error) {
      toast.error("Error al cargar los datos financieros");
      console.error("Error al cargar finanzas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosFinancieros();
  }, []);

  const pagosFiltrados = useMemo(() => {
    return historialPagos.filter((pago) => {
      const termino = busqueda.toLowerCase();

      const coincideBusqueda =
        pago.alumno.toLowerCase().includes(termino) ||
        pago.curso.toLowerCase().includes(termino);

      const coincideInicio = dateRange.start
        ? pago.fecha >= dateRange.start
        : true;

      const coincideFin = dateRange.end ? pago.fecha <= dateRange.end : true;

      return coincideBusqueda && coincideInicio && coincideFin;
    });
  }, [historialPagos, busqueda, dateRange]);

  const totalIngresos = useMemo(() => {
    return pagosFiltrados.reduce((acc, pago) => acc + Number(pago.total || 0), 0);
  }, [pagosFiltrados]);

  const totalDeuda = useMemo(() => {
    return alumnosDeuda.reduce((acc, deuda) => acc + Number(deuda.monto || 0), 0);
  }, [alumnosDeuda]);

  const abrirModalExportacion = (tipo) => {
    setModalExportacion({
      abierto: true,
      tipo,
      nombreArchivo: "reporte_pagos",
    });
  };

  const confirmarExportacion = () => {
    const { tipo, nombreArchivo } = modalExportacion;

    if (!nombreArchivo.trim()) {
      toast.error("El nombre del archivo no puede estar vacío");
      return;
    }

    if (tipo === "pdf") {
      exportarPDF(nombreArchivo);
    } else if (tipo === "excel") {
      exportarExcel(nombreArchivo);
    } else if (tipo === "csv") {
      exportarCSV(nombreArchivo);
    }

    setModalExportacion({ ...modalExportacion, abierto: false });
  };

  const exportarPDF = (nombreArchivo) => {
    try {
      const colorPrincipal = obtenerCssVar("--color-primary", "#344C92");
      const doc = new jsPDF();

      doc.text("Reporte de Ingresos", 14, 20);

      const columnas = ["ID", "Fecha", "Alumno", "Curso", "Tipo", "Total (S/)"];

      const filas = pagosFiltrados.map((p) => [
        p.id,
        p.fecha,
        p.alumno,
        p.curso,
        p.tipopago,
        p.total.toFixed(2),
      ]);

      autoTable(doc, {
        startY: 30,
        head: [columnas],
        body: filas,
        headStyles: { fillColor: hexToRgb(colorPrincipal) },
      });

      doc.save(`${nombreArchivo}.pdf`);
      toast.success("PDF generado exitosamente");
    } catch (error) {
      toast.error("Error al generar PDF");
      console.error("Error al generar PDF", error);
    }
  };

  const exportarExcel = (nombreArchivo) => {
    try {
      const colorPrincipal = obtenerCssVar("--color-primary", "#344C92");

      const datos = [
        ["ID", "FECHA", "ALUMNO", "CURSO", "TIPO DE PAGO", "TOTAL"],
        ...pagosFiltrados.map((p) => [
          p.id,
          p.fecha,
          p.alumno,
          p.curso,
          p.tipopago,
          p.total,
        ]),
      ];

      const hoja = XLSX.utils.aoa_to_sheet(datos);
      const rango = XLSX.utils.decode_range(hoja["!ref"]);

      for (let c = rango.s.c; c <= rango.e.c; ++c) {
        const celda = XLSX.utils.encode_cell({ r: 0, c });

        if (hoja[celda]) {
          hoja[celda].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: hexSinNumeral(colorPrincipal) } },
          };
        }
      }

      const libro = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(libro, hoja, "Pagos");
      XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);

      toast.success("Excel generado exitosamente");
    } catch (error) {
      toast.error("Error al generar Excel");
      console.error("Error al generar Excel:", error);
    }
  };

  const exportarCSV = (nombreArchivo) => {
    const cabeceras = "ID,Fecha,Alumno,Curso,Tipo de Pago,Total\n";

    const filas = pagosFiltrados
      .map(
        (p) =>
          `${p.id},${p.fecha},"${p.alumno}","${p.curso}",${p.tipopago},${p.total}`
      )
      .join("\n");

    const enlace = document.createElement("a");

    enlace.href = "data:text/csv;charset=utf-8," + encodeURI(cabeceras + filas);
    enlace.download = `${nombreArchivo}.csv`;
    enlace.click();

    toast.success("CSV descargado exitosamente");
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setDateRange({ start: "", end: "" });
    toast.success("Filtros restablecidos");
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
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/80 backdrop-blur">
              <CreditCard size={16} />
              Administración financiera
            </div>

            <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight md:text-3xl">
              Gestión de Pagos
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-white/75">
              Administra el historial de ingresos y haz seguimiento a la
              morosidad.
            </p>
          </div>

          {activeTab === "pagos" && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <span className="text-sm font-semibold text-white/85">
                Exportar:
              </span>

              <ExportButton
                icon={FileDown}
                label="CSV"
                tone="neutral"
                onClick={() => abrirModalExportacion("csv")}
              />

              <ExportButton
                icon={FileSpreadsheet}
                label="EXCEL"
                tone="green"
                onClick={() => abrirModalExportacion("excel")}
              />

              <ExportButton
                icon={FileText}
                label="PDF"
                tone="red"
                onClick={() => abrirModalExportacion("pdf")}
              />
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      </section>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Pagos encontrados"
          value={pagosFiltrados.length}
          subtitle="Registros con los filtros actuales"
          icon={CheckCircle}
          tone="primary"
        />

        <MetricCard
          title="Ingresos filtrados"
          value={`S/ ${totalIngresos.toFixed(2)}`}
          subtitle="Suma total de pagos visibles"
          icon={CreditCard}
          tone="secondary"
        />

        <MetricCard
          title="Deuda pendiente"
          value={`S/ ${totalDeuda.toFixed(2)}`}
          subtitle={`${alumnosDeuda.length} alumno(s) con mora`}
          icon={AlertCircle}
          tone="danger"
        />
      </div>

      {/* Contenedor Principal */}
      <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-background)]">
          <button
            onClick={() => setActiveTab("pagos")}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-8 py-4 text-sm font-bold transition-colors ${
              activeTab === "pagos"
                ? "border-[var(--color-primary)] bg-[var(--color-card)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-muted-text)] hover:bg-[var(--color-card)] hover:text-[var(--color-text)]"
            }`}
          >
            <CheckCircle size={18} />
            Historial de Pagos
          </button>

          <button
            onClick={() => setActiveTab("deudas")}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-8 py-4 text-sm font-bold transition-colors ${
              activeTab === "deudas"
                ? "border-red-500 bg-[var(--color-card)] text-red-600"
                : "border-transparent text-[var(--color-muted-text)] hover:bg-[var(--color-card)] hover:text-[var(--color-text)]"
            }`}
          >
            <AlertCircle size={18} />
            Alumnos Morosos
          </button>
        </div>

        <div className="p-6">
          {/* Buscador y filtros */}
          {activeTab === "pagos" && (
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-md">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-text)]"
                  size={20}
                />

                <input
                  type="text"
                  placeholder="Buscar por alumno o curso..."
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 pl-12 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted-text)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <div className="flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-2 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2 px-2 text-[var(--color-muted-text)]">
                    <Calendar size={18} />
                    <span className="text-sm font-semibold">Rango</span>
                  </div>

                  <input
                    type="date"
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />

                  <span className="hidden font-bold text-[var(--color-muted-text)] sm:block">
                    -
                  </span>

                  <input
                    type="date"
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                  />
                </div>

                <button
                  onClick={limpiarFiltros}
                  disabled={!busqueda && !dateRange.start && !dateRange.end}
                  className="group flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-sm font-bold text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-background)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                  title="Limpiar todos los filtros"
                >
                  <RotateCcw
                    size={18}
                    className="transition-transform group-hover:rotate-[-45deg]"
                  />
                  Limpiar
                </button>
              </div>
            </div>
          )}

          {/* Tabla */}
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead className="border-b border-[var(--color-border)] bg-[var(--color-background)] text-xs font-bold uppercase tracking-wider text-[var(--color-muted-text)]">
                  {activeTab === "pagos" ? (
                    <tr>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Alumno</th>
                      <th className="px-6 py-4">Curso</th>
                      <th className="px-6 py-4 text-center">Tipo de Pago</th>
                      <th className="px-6 py-4 text-right">Monto</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-6 py-4">Alumno</th>
                      <th className="px-6 py-4">Curso</th>
                      <th className="px-6 py-4 text-center">N° Cuota</th>
                      <th className="px-6 py-4">Vencimiento</th>
                      <th className="px-6 py-4 text-right">Deuda</th>
                      <th className="px-6 py-4 text-center">Atraso</th>
                    </tr>
                  )}
                </thead>

                <tbody className="divide-y divide-[var(--color-border)]">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center font-medium text-[var(--color-muted-text)]"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <Loader2
                            size={20}
                            className="animate-spin text-[var(--color-primary)]"
                          />
                          Cargando registros financieros...
                        </div>
                      </td>
                    </tr>
                  ) : activeTab === "pagos" ? (
                    pagosFiltrados.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-12 text-center font-medium text-[var(--color-muted-text)]"
                        >
                          No se encontraron pagos con los filtros actuales.
                        </td>
                      </tr>
                    ) : (
                      pagosFiltrados.map((pago) => (
                        <tr
                          key={pago.id}
                          className="transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]"
                        >
                          <td className="px-6 py-4 text-sm text-[var(--color-muted-text)]">
                            {pago.fecha}
                          </td>

                          <td className="px-6 py-4 font-black text-[var(--color-text)]">
                            {pago.alumno}
                          </td>

                          <td className="px-6 py-4 text-sm text-[var(--color-muted-text)]">
                            {pago.curso}
                          </td>

                          <td className="px-6 py-4 text-center text-sm text-[var(--color-muted-text)]">
                            {pago.tipopago}
                          </td>

                          <td className="px-6 py-4 text-right font-black text-[var(--color-primary)]">
                            S/ {pago.total.toFixed(2)}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className="rounded-xl bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                              {pago.estado}
                            </span>
                          </td>
                        </tr>
                      ))
                    )
                  ) : alumnosDeuda.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center font-medium text-[var(--color-muted-text)]"
                      >
                        ¡Excelente! No hay alumnos con pagos atrasados.
                      </td>
                    </tr>
                  ) : (
                    alumnosDeuda.map((deuda) => (
                      <tr
                        key={deuda.id}
                        className="bg-red-50/40 transition-colors hover:bg-red-50"
                      >
                        <td className="px-6 py-4 font-black text-[var(--color-text)]">
                          {deuda.alumno}
                        </td>

                        <td className="px-6 py-4 text-sm text-[var(--color-muted-text)]">
                          {deuda.curso}
                        </td>

                        <td className="px-6 py-4 text-center text-sm font-semibold text-[var(--color-muted-text)]">
                          Cuota {deuda.cuota}
                        </td>

                        <td className="px-6 py-4 text-sm text-[var(--color-muted-text)]">
                          {deuda.vencimiento}
                        </td>

                        <td className="px-6 py-4 text-right font-black text-red-600">
                          S/ {deuda.monto.toFixed(2)}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="rounded-xl bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
                            {deuda.diasAtraso} días
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de exportación */}
      {modalExportacion.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl animate-fadeIn">
            <div
              className="flex items-center justify-between p-5 text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
              }}
            >
              <h3 className="flex items-center gap-2 text-lg font-black">
                <FileText size={20} />
                Guardar archivo como...
              </h3>

              <button
                type="button"
                onClick={() =>
                  setModalExportacion({
                    ...modalExportacion,
                    abierto: false,
                  })
                }
                className="rounded-full p-2 transition hover:bg-white/20"
                title="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <label className="mb-2 block text-sm font-bold text-[var(--color-text)]">
                Nombre del archivo:
              </label>

              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] py-3 pl-4 pr-16 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
                  value={modalExportacion.nombreArchivo}
                  onChange={(e) =>
                    setModalExportacion({
                      ...modalExportacion,
                      nombreArchivo: e.target.value,
                    })
                  }
                  onKeyDown={(e) => e.key === "Enter" && confirmarExportacion()}
                />

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 font-bold text-[var(--color-muted-text)]">
                  .{modalExportacion.tipo}
                </div>
              </div>

              <p className="mt-2 text-xs text-[var(--color-muted-text)]">
                El archivo se guardará en tu carpeta de Descargas
                predeterminada.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-background)] px-6 py-4">
              <button
                onClick={() =>
                  setModalExportacion({
                    ...modalExportacion,
                    abierto: false,
                  })
                }
                className="rounded-xl px-4 py-2 text-sm font-bold text-[var(--color-text)] transition hover:bg-[var(--color-card)]"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarExportacion}
                className="rounded-xl bg-[var(--color-button-primary)] px-4 py-2 text-sm font-bold text-[var(--color-button-primary-text)] shadow-sm transition hover:brightness-95"
              >
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExportButton({ icon: Icon, label, tone = "neutral", onClick }) {
  const toneClass =
    tone === "green"
      ? "text-green-600"
      : tone === "red"
      ? "text-red-600"
      : "text-slate-700";

  return (
    <button
      onClick={onClick}
      className={`flex w-16 flex-col items-center justify-center rounded-2xl bg-white p-2 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-slate-100 active:scale-95 ${toneClass}`}
      title={`Exportar ${label}`}
    >
      <Icon size={20} />
      <span className="mt-1 text-[11px] font-black tracking-wide">{label}</span>
    </button>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, tone = "primary" }) {
  const tones = {
    primary: {
      accent: "var(--color-primary)",
      bg: "color-mix(in srgb, var(--color-primary) 14%, transparent)",
    },
    secondary: {
      accent: "var(--color-secondary)",
      bg: "color-mix(in srgb, var(--color-secondary) 16%, transparent)",
    },
    danger: {
      accent: "#dc2626",
      bg: "rgba(220, 38, 38, 0.1)",
    },
  };

  const selected = tones[tone] || tones.primary;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm transition hover:shadow-md">
      <div
        className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full"
        style={{ backgroundColor: selected.bg }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--color-muted-text)]">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-black tracking-tight text-[var(--color-text)]">
            {value}
          </h3>

          <p className="mt-2 text-sm text-[var(--color-muted-text)]">
            {subtitle}
          </p>
        </div>

        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{ backgroundColor: selected.accent }}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}