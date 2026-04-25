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
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style";

// Nombre del alumno
const formatearNombreAlumno = (alumno) => {
  if (!alumno) return "Alumno Desconocido";

  // Extraemos el objeto real, ya sea que Supabase lo mande como Object o como Array
  const data = Array.isArray(alumno) ? alumno[0] : alumno;
  if (!data) return "Alumno Desconocido";

  // Unimos nombre y apellido
  const nombre = data.nombre || data.nombres || "";
  const apellido = data.apellido || data.apellidos || "";

  return `${nombre} ${apellido}`.trim() || "Alumno Desconocido";
};

// Nombre del curso
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

      // Mapear Pagos
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

      // Mapear Deudas (Pensiones Pendientes)
      const hoy = new Date();
      const deudasFormateadas = dataPensiones
        .filter((p) => p.estado === "PENDIENTE")
        .map((d) => {
          const mat = Array.isArray(d.matricula) ? d.matricula[0] : d.matricula;
          
          const fechaVencimiento = new Date(d.fecha_vencimiento);
          const diasAtraso = Math.max(
            0,
            Math.floor((hoy - fechaVencimiento) / (1000 * 60 * 60 * 24)),
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

  // Lógica de Filtrado
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

  const abrirModalExportacion = (tipo) => {
    setModalExportacion({
      abierto: true,
      tipo: tipo,
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

  // Funciones de Exportación
  const exportarPDF = (nombreArchivo) => {
    try {
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
        headStyles: { fillColor: [52, 76, 146] },
      });
      doc.save(`${nombreArchivo}.pdf`);
      toast.success("PDF generado exitosamente");
    } catch (error) {
      toast.error("Error al generar PDF");
      console.error("Error al generar PDF", error);
    }
  };

  const exportarExcel = (nombreArchivo) => {
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
          fill: { fgColor: { rgb: "344C92" } },
        };
      }
    }
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Pagos");
    XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
    toast.success("Excel generado exitosamente");
  };

  const exportarCSV = (nombreArchivo) => {
    const cabeceras = "ID,Fecha,Alumno,Curso,Tipo de Pago,Total\n";
    const filas = pagosFiltrados
      .map(
        (p) =>
          `${p.id},${p.fecha},"${p.alumno}","${p.curso}",${p.tipopago},${p.total}`,
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
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 rounded-xl flex items-center justify-between px-8 text-white shadow">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <CreditCard size={28} /> Gestión de Pagos
          </h2>
          <p className="text-sm opacity-90 mt-2">
            Administra el historial de ingresos y haz seguimiento a la
            morosidad.
          </p>
        </div>

        {/* Botones de Exportación ubicados en el Banner */}
        {activeTab === "pagos" && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-medium opacity-90">Exportar:</span>

            {/* Botón CSV */}
            <button
              onClick={() => abrirModalExportacion("csv")}
              className="bg-white text-gray-700 hover:bg-gray-100 p-2 flex flex-col items-center justify-center rounded-lg shadow-sm tooltip w-16 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
              title="Exportar CSV"
            >
              <FileDown size={20} />
              <span className="text-[11px] font-bold mt-1 tracking-wide">
                CSV
              </span>
            </button>

            {/* Botón Excel */}
            <button
              onClick={() => abrirModalExportacion("excel")}
              className="bg-white text-green-600 hover:bg-gray-100 p-2 flex flex-col items-center justify-center rounded-lg shadow-sm tooltip w-16 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
              title="Exportar Excel"
            >
              <FileSpreadsheet size={20} />
              <span className="text-[11px] font-bold mt-1 tracking-wide">
                EXCEL
              </span>
            </button>

            {/* Botón PDF */}
            <button
              onClick={() => abrirModalExportacion("pdf")}
              className="bg-white text-red-600 hover:bg-gray-100 p-2 flex flex-col items-center justify-center rounded-lg shadow-sm tooltip w-16 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
              title="Exportar PDF"
            >
              <FileText size={20} />
              <span className="text-[11px] font-bold mt-1 tracking-wide">
                PDF
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Contenedor Principal */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Pestañas Integradas al Estilo del Card */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button
            onClick={() => setActiveTab("pagos")}
            className={`flex items-center gap-2 px-8 py-4 text-sm font-semibold transition-colors ${
              activeTab === "pagos"
                ? "border-b-2 border-indigo-600 text-indigo-700 bg-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <CheckCircle size={18} />
            Historial de Pagos
          </button>
          <button
            onClick={() => setActiveTab("deudas")}
            className={`flex items-center gap-2 px-8 py-4 text-sm font-semibold transition-colors ${
              activeTab === "deudas"
                ? "border-b-2 border-red-600 text-red-600 bg-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <AlertCircle size={18} />
            Alumnos Morosos
          </button>
        </div>

        <div className="p-6">
          {/* BUSCADOR Y FILTROS */}
          {activeTab === "pagos" && (
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative w-full md:max-w-md">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar por alumno o curso..."
                  className="pl-10 border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
                  <Calendar className="text-gray-500 ml-2" size={18} />
                  <input
                    type="date"
                    className="bg-transparent border-none text-sm focus:outline-none focus:ring-0 p-1"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />
                  <span className="text-gray-400 font-bold">-</span>
                  <input
                    type="date"
                    className="bg-transparent border-none text-sm focus:outline-none focus:ring-0 p-1"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                  />
                </div>

                {/* Botón Restaurar */}
                <button
                  onClick={limpiarFiltros}
                  disabled={!busqueda && !dateRange.start && !dateRange.end}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                  title="Limpiar todos los filtros"
                >
                  <RotateCcw
                    size={18}
                    className="group-hover:rotate-[-45deg] transition-transform"
                  />
                  <span className="text-sm font-medium hidden sm:inline">
                    Limpiar
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider border-b">
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
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500 font-medium"
                    >
                      Cargando registros financieros...
                    </td>
                  </tr>
                ) : activeTab === "pagos" ? (
                  pagosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-gray-500 font-medium"
                      >
                        No se encontraron pagos con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    pagosFiltrados.map((pago) => (
                      <tr
                        key={pago.id}
                        className="hover:shadow-sm transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {pago.fecha}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          {pago.alumno}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {pago.curso}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-center">
                          {pago.tipopago}
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-600 text-right">
                          S/ {pago.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700">
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
                      className="px-6 py-8 text-center text-gray-500 font-medium"
                    >
                      ¡Excelente! No hay alumnos con pagos atrasados.
                    </td>
                  </tr>
                ) : (
                  alumnosDeuda.map((deuda) => (
                    <tr
                      key={deuda.id}
                      className="hover:shadow-sm transition-colors bg-red-50/30"
                    >
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {deuda.alumno}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {deuda.curso}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center font-medium">
                        Cuota {deuda.cuota}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {deuda.vencimiento}
                      </td>
                      <td className="px-6 py-4 font-bold text-red-600 text-right">
                        S/ {deuda.monto.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700">
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
      {/* MODAL DE EXPORTACIÓN  */}
      {modalExportacion.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Cabecera del Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText size={20} />
                Guardar archivo como...
              </h3>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del archivo:
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  className="w-full border border-gray-300 rounded-lg pl-4 pr-16 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow"
                  value={modalExportacion.nombreArchivo}
                  onChange={(e) =>
                    setModalExportacion({
                      ...modalExportacion,
                      nombreArchivo: e.target.value,
                    })
                  }
                  onKeyDown={(e) => e.key === "Enter" && confirmarExportacion()}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 font-medium">
                  .{modalExportacion.tipo}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                El archivo se guardará en tu carpeta de Descargas
                predeterminada.
              </p>
            </div>

            {/* Botones del Modal */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() =>
                  setModalExportacion({ ...modalExportacion, abierto: false })
                }
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExportacion}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
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
