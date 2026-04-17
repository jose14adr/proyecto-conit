import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import XLSX from "xlsx-js-style";
import autoTable from "jspdf-autotable";
import { getCursosDocente, getRegistroNotasByGrupo } from "../services/docenteService";

function ListaAprobados() {
  const [cursos, setCursos] = useState([]);
  const [query, setQuery] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [openSug, setOpenSug] = useState(false);

  const [evaluaciones, setEvaluaciones] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // filtros: TODOS | APROBADOS | RECUPERACION | DESAPROBADOS | SIN_NOTAS
  const [filtro, setFiltro] = useState("TODOS");
  const [busquedaAlumno, setBusquedaAlumno] = useState("");

  const wrapperRef = useRef(null);

  useEffect(() => {
    const cargarCursos = async () => {
      try {
        const data = await getCursosDocente();
        setCursos(data || []);
      } catch (error) {
        console.error("Error cargando cursos:", error);
        setCursos([]);
      }
    };

    cargarCursos();
  }, []);

  const cargar = async (grupoId) => {
    setLoading(true);
    try {
      const data = await getRegistroNotasByGrupo(grupoId);

      setEvaluaciones(data?.evaluaciones || []);

      const mapped = (data?.alumnos || []).map((a) => {
        const promedioNumero =
          a.faltantes > 0 || a.promedio === null || a.promedio === undefined
            ? null
            : Number(a.promedio);

        let estado = "sin_notas";
        if (a.faltantes > 0) {
          estado = "sin_notas";
        } else if (promedioNumero >= 11) {
          estado = "aprobado";
        } else if (promedioNumero >= 9) {
          estado = "recuperacion";
        } else {
          estado = "desaprobado";
        }

        return {
          idmatricula: a.idmatricula,
          idgrupo: a.idgrupo,
          nombre: `${a.nombre || ""} ${a.apellido || ""}`.trim() || "SIN NOMBRE",
          nombreSolo: a.nombre || "",
          apellidoSolo: a.apellido || "",
          numdocumento: a.numdocumento || "",
          foto_url: a.foto_url || "",
          notas: a.notas || {},
          promedio: promedioNumero,
          faltantes: a.faltantes ?? 0,
          estado,
        };
      });

      setRows(mapped);
    } catch (err) {
      console.error("Error cargando lista de aprobados:", err);
      setEvaluaciones([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cursoSeleccionado?.idgrupo) {
      setEvaluaciones([]);
      setRows([]);
      return;
    }

    cargar(cursoSeleccionado.idgrupo);
  }, [cursoSeleccionado]);

  useEffect(() => {
    const onClick = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpenSug(false);
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const sugerencias = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return cursos.filter((c) => (c.nombre || "").toLowerCase().includes(q)).slice(0, 8);
  }, [query, cursos]);

  const cursosVisibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cursos;
    return cursos.filter((c) => (c.nombre || "").toLowerCase().includes(q));
  }, [query, cursos]);

  const elegirCurso = (c) => {
    setCursoSeleccionado(c);
    setQuery(c.nombre || "");
    setOpenSug(false);
    setRows([]);
    setEvaluaciones([]);
    setFiltro("TODOS");
  };

  const limpiarCurso = () => {
    setCursoSeleccionado(null);
    setQuery("");
    setOpenSug(false);
    setRows([]);
    setEvaluaciones([]);
    setFiltro("TODOS");
  };

  const estadoAlumno = (r) => {
    switch (r.estado) {
      case "aprobado":
        return "APROBADOS";
      case "recuperacion":
        return "RECUPERACION";
      case "desaprobado":
        return "DESAPROBADOS";
      default:
        return "SIN_NOTAS";
    }
  };

  const rowsFiltradas = useMemo(() => {
    return rows.filter((r) => {
      // 🔎 filtro por texto
      const texto = `${r.nombre || ""} ${r.numdocumento || ""}`
        .toLowerCase()
        .trim();

      const coincideBusqueda = texto.includes(
        busquedaAlumno.toLowerCase().trim()
      );

      // 🎯 filtro por estado (el que ya tenías)
      const coincideEstado =
        filtro === "TODOS" || estadoAlumno(r) === filtro;

      return coincideBusqueda && coincideEstado;
    });
  }, [rows, filtro, busquedaAlumno]);

  const resumen = useMemo(() => {
    return {
      total: rows.length,
      aprobados: rows.filter((r) => r.estado === "aprobado").length,
      recuperacion: rows.filter((r) => r.estado === "recuperacion").length,
      desaprobados: rows.filter((r) => r.estado === "desaprobado").length,
      sinNotas: rows.filter((r) => r.estado === "sin_notas").length,
    };
  }, [rows]);

  const descargarPDF = () => {
    if (!cursoSeleccionado || rowsFiltradas.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // ===== ENCABEZADO TIPO BOLETA =====
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.6);
    doc.rect(10, 10, 190, 24);

    // Logo / nombre empresa
    // Si luego tienes logo en imagen, aquí lo agregamos con doc.addImage(...)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CONIT", 16, 19);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Centro de Capacitación", 16, 24);
    doc.text("Reporte académico de notas", 16, 28);

    // Caja derecha tipo comprobante
    doc.rect(145, 10, 55, 24);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("REPORTE", 172.5, 18, { align: "center" });
    doc.setFontSize(10);
    doc.text("DE NOTAS", 172.5, 24, { align: "center" });

    // ===== DATOS GENERALES =====
    let y = 42;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("CURSO:", 14, y);
    doc.text("GRUPO:", 110, y);

    doc.setFont("helvetica", "normal");
    doc.text(String(cursoSeleccionado.nombre || "-"), 32, y);
    doc.text(String(cursoSeleccionado.grupo || "-"), 126, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("HORARIO:", 14, y);
    doc.text("FILTRO:", 110, y);

    doc.setFont("helvetica", "normal");
    doc.text(String(cursoSeleccionado.horario || "-"), 35, y);
    doc.text(String(filtro || "TODOS"), 126, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("FECHA EMISIÓN:", 14, y);

    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), 43, y);

    // ===== TABLA APILADA DE ALUMNOS =====
    const head = [[
      "N°",
      "Alumno",
      "DNI",
      ...evaluaciones.map((ev) => ev.nombre),
      "Prom.",
      "Estado",
    ]];

    const body = rowsFiltradas.map((r, index) => [
      index + 1,
      r.nombre,
      r.numdocumento || "-",
      ...evaluaciones.map((ev) => r.notas?.[ev.id] ?? "—"),
      r.promedio ?? "—",
      estadoAlumno(r),
    ]);

    autoTable(doc, {
      startY: y + 8,
      head,
      body,
      margin: { left: 10, right: 10 },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        valign: "middle",
        textColor: [30, 41, 59],
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 42, halign: "left" },
        2: { cellWidth: 22 },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === body[0]?.length - 1) {
          const value = String(data.cell.raw || "");
          if (value === "APROBADOS") {
            data.cell.styles.textColor = [5, 150, 105];
            data.cell.styles.fontStyle = "bold";
          } else if (value === "RECUPERACION") {
            data.cell.styles.textColor = [217, 119, 6];
            data.cell.styles.fontStyle = "bold";
          } else if (value === "DESAPROBADOS") {
            data.cell.styles.textColor = [225, 29, 72];
            data.cell.styles.fontStyle = "bold";
          } else {
            data.cell.styles.textColor = [100, 116, 139];
          }
        }
      },
    });

    // ===== RESUMEN FINAL =====
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("RESUMEN:", 14, finalY);

    doc.setFont("helvetica", "normal");
    doc.text(`Total alumnos: ${resumen.total}`, 14, finalY + 6);
    doc.text(`Aprobados: ${resumen.aprobados}`, 60, finalY + 6);
    doc.text(`Recuperación: ${resumen.recuperacion}`, 100, finalY + 6);
    doc.text(`Desaprobados: ${resumen.desaprobados}`, 145, finalY + 6);

    // ===== PIE =====
    const footerY = doc.internal.pageSize.getHeight() - 12;
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.text(
      "Representación impresa del reporte académico de notas",
      pageWidth / 2,
      footerY,
      { align: "center" }
    );

    const nombreArchivo = `reporte_notas_${(cursoSeleccionado.nombre || "curso")
      .replace(/\s+/g, "_")
      .toLowerCase()}_grupo_${String(cursoSeleccionado.grupo || "x")
      .replace(/\s+/g, "_")
      .toLowerCase()}.pdf`;

    doc.save(nombreArchivo);
  };

    const pillEstado = (estado) => {
      const map = {
        APROBADOS:
          "bg-emerald-50 text-emerald-700 border border-emerald-200",
        RECUPERACION:
          "bg-amber-50 text-amber-700 border border-amber-200",
        DESAPROBADOS:
          "bg-rose-50 text-rose-700 border border-rose-200",
        SIN_NOTAS:
          "bg-slate-100 text-slate-600 border border-slate-200",
      };

      return map[estado] || map.SIN_NOTAS;
    };

    const descargarExcel = () => {
  if (!cursoSeleccionado || rowsFiltradas.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const fechaEmision = new Date().toLocaleDateString();

  const wsData = [
    ["REPORTE ACADÉMICO DE NOTAS"],
    [""],
    ["DATOS GENERALES"],
    ["Curso", cursoSeleccionado.nombre || "-"],
    ["Grupo", cursoSeleccionado.grupo || "-"],
    ["Horario", cursoSeleccionado.horario || "-"],
    ["Filtro aplicado", filtro || "TODOS"],
    ["Fecha de emisión", fechaEmision],
    [""],
    ["RESUMEN"],
    ["Total alumnos", resumen.total],
    ["Aprobados", resumen.aprobados],
    ["Recuperación", resumen.recuperacion],
    ["Desaprobados", resumen.desaprobados],
    ["Sin notas", resumen.sinNotas],
    [""],
    [
      "N°",
      "Alumno",
      "DNI",
      ...evaluaciones.map((ev) => `${ev.nombre} (${ev.porcentaje}%)`),
      "Promedio",
      "Estado",
    ],
    ...rowsFiltradas.map((r, index) => [
      index + 1,
      r.nombre,
      r.numdocumento || "-",
      ...evaluaciones.map((ev) => r.notas?.[ev.id] ?? "—"),
      r.promedio ?? "—",
      estadoAlumno(r) === "SIN_NOTAS" && r.faltantes > 0
        ? `SIN_NOTAS (${r.faltantes})`
        : estadoAlumno(r),
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 + evaluaciones.length } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 5 + evaluaciones.length } },
    { s: { r: 9, c: 0 }, e: { r: 9, c: 5 + evaluaciones.length } },
  ];

  ws["!cols"] = [
    { wch: 8 },
    { wch: 32 },
    { wch: 16 },
    ...evaluaciones.map(() => ({ wch: 14 })),
    { wch: 14 },
    { wch: 18 },
  ];

  const borderAll = {
    top: { style: "thin", color: { rgb: "D1D5DB" } },
    bottom: { style: "thin", color: { rgb: "D1D5DB" } },
    left: { style: "thin", color: { rgb: "D1D5DB" } },
    right: { style: "thin", color: { rgb: "D1D5DB" } },
  };

  const styleTitle = {
    font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "1E293B" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: borderAll,
  };

  const styleSection = {
    font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "2563EB" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: borderAll,
  };

  const styleLabel = {
    font: { bold: true, color: { rgb: "111827" } },
    fill: { fgColor: { rgb: "E5E7EB" } },
    border: borderAll,
  };

  const styleValue = {
    border: borderAll,
    alignment: { vertical: "center" },
  };

  const styleHeader = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "0F766E" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: borderAll,
  };

  const styleCell = {
    border: borderAll,
    alignment: { vertical: "center", wrapText: true },
  };

  const styleCentered = {
    border: borderAll,
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
  };

  if (ws["A1"]) ws["A1"].s = styleTitle;
  if (ws["A3"]) ws["A3"].s = styleSection;
  if (ws["A10"]) ws["A10"].s = styleSection;

  ["A4", "A5", "A6", "A7", "A8"].forEach((cell) => {
    if (ws[cell]) ws[cell].s = styleLabel;
  });

  ["B4", "B5", "B6", "B7", "B8"].forEach((cell) => {
    if (ws[cell]) ws[cell].s = styleValue;
  });

  ["A11", "A12", "A13", "A14", "A15"].forEach((cell) => {
    if (ws[cell]) ws[cell].s = styleLabel;
  });

  ["B11", "B12", "B13", "B14", "B15"].forEach((cell) => {
    if (ws[cell]) ws[cell].s = styleCentered;
  });

  const headerRow = 17;
  const totalCols = 6 + evaluaciones.length;

  for (let col = 0; col < totalCols; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRow - 1, c: col });
    if (ws[cellAddress]) ws[cellAddress].s = styleHeader;
  }

  const dataStartRow = 18;
  for (let row = dataStartRow; row < dataStartRow + rowsFiltradas.length; row++) {
    for (let col = 0; col < totalCols; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row - 1, c: col });
      if (!ws[cellAddress]) continue;

      if (col === 0 || col >= 2) {
        ws[cellAddress].s = styleCentered;
      } else {
        ws[cellAddress].s = styleCell;
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte Notas");

  const nombreArchivo = `reporte_notas_${(cursoSeleccionado.nombre || "curso")
    .replace(/\s+/g, "_")
    .toLowerCase()}_grupo_${String(cursoSeleccionado.grupo || "x")
    .replace(/\s+/g, "_")
    .toLowerCase()}.xlsx`;

  XLSX.writeFile(wb, nombreArchivo);
};

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-6 text-white">
          <h2 className="text-3xl font-bold">Lista de aprobados</h2>
          <p className="mt-2 text-sm text-slate-200">
            Consulta el rendimiento final por grupo, filtra resultados y descarga el reporte en PDF.
          </p>
        </div>

        <div className="p-6 space-y-5" ref={wrapperRef}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Buscar curso
            </label>

            <div className="relative">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpenSug(true);
                  setCursoSeleccionado(null);
                  setRows([]);
                  setEvaluaciones([]);
                }}
                onFocus={() => setOpenSug(true)}
                placeholder="Escribe el nombre del curso..."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />

              {query && (
                <button
                  type="button"
                  onClick={limpiarCurso}
                  className="absolute right-3 top-3 text-sm text-slate-500 hover:text-slate-800"
                  title="Limpiar"
                >
                  ✕
                </button>
              )}

              {openSug && sugerencias.length > 0 && (
                <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  {sugerencias.map((c) => (
                    <button
                      key={c.idgrupo}
                      type="button"
                      onClick={() => elegirCurso(c)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition"
                    >
                      <div className="font-semibold text-slate-800">{c.nombre}</div>
                      <div className="text-xs text-slate-500">
                        Grupo {c.grupo} {c.horario ? `• ${c.horario}` : ""}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Cursos del docente</h3>
              <span className="text-sm text-slate-500">{cursosVisibles.length} curso(s)</span>
            </div>

            {cursosVisibles.length ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {cursosVisibles.map((c, index) => {
                  const activo = Number(cursoSeleccionado?.idgrupo) === Number(c.idgrupo);

                  return (
                    <button
                      key={`${c.idgrupo ?? "g"}-${c.idcurso ?? c.id ?? index}`}
                      type="button"
                      onClick={() => elegirCurso(c)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        activo
                          ? "border-blue-300 bg-blue-50 shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-semibold text-slate-800">{c.nombre}</div>
                      <div className="mt-1 text-sm text-slate-500">
                        Grupo {c.grupo} {c.horario ? `• ${c.horario}` : ""}
                      </div>

                      {activo && (
                        <div className="mt-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          Seleccionado
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500">No se encontraron cursos con ese filtro.</p>
            )}
          </div>

          {cursoSeleccionado && (
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-slate-800">{cursoSeleccionado.nombre}</div>
                <div className="text-sm text-slate-500">
                  Grupo {cursoSeleccionado.grupo} {cursoSeleccionado.horario ? `• ${cursoSeleccionado.horario}` : ""}
                </div>
              </div>

              <button
                type="button"
                onClick={() => cargar(cursoSeleccionado.idgrupo)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Refrescar"}
              </button>
            </div>
          )}
        </div>
      </div>

      {!!cursoSeleccionado && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <ResumenCard titulo="Total" valor={resumen.total} color="slate" />
          <ResumenCard titulo="Aprobados" valor={resumen.aprobados} color="emerald" />
          <ResumenCard titulo="Recuperación" valor={resumen.recuperacion} color="amber" />
          <ResumenCard titulo="Desaprobados" valor={resumen.desaprobados} color="rose" />
          <ResumenCard titulo="Sin notas" valor={resumen.sinNotas} color="blue" />
        </section>
      )}

      {cursoSeleccionado && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-xl">
                <h3 className="text-xl font-bold text-slate-800">Reporte de alumnos</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Visualiza notas, promedio final y estado del alumno.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 xl:min-w-[780px]">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 md:col-span-1">
                  <div className="text-sm font-semibold text-blue-800">Descargar reporte</div>
                  <p className="mt-1 text-xs text-blue-700">
                    Exporta el listado visible según el filtro actual.
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={descargarPDF}
                      disabled={loading || rowsFiltradas.length === 0}
                      className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
                        loading || rowsFiltradas.length === 0
                          ? "cursor-not-allowed bg-slate-400"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      PDF
                    </button>

                    <button
                      type="button"
                      onClick={descargarExcel}
                      disabled={loading || rowsFiltradas.length === 0}
                      className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
                        loading || rowsFiltradas.length === 0
                          ? "cursor-not-allowed bg-slate-400"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      Excel
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Buscar alumno
                  </label>

                  <input
                    type="text"
                    value={busquedaAlumno}
                    onChange={(e) => setBusquedaAlumno(e.target.value)}
                    placeholder="Nombre o DNI..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Filtrar estado
                  </label>

                  <select
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="TODOS">Todos</option>
                    <option value="APROBADOS">Aprobados</option>
                    <option value="RECUPERACION">Por recuperación</option>
                    <option value="DESAPROBADOS">Desaprobados</option>
                    <option value="SIN_NOTAS">Sin notas</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-slate-500">Cargando alumnos...</div>
          ) : rowsFiltradas.length === 0 ? (
            <div className="p-6 text-slate-500">No hay alumnos para este filtro.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                      Alumno
                    </th>

                    {evaluaciones.map((ev) => (
                      <th
                        key={ev.id}
                        className="px-4 py-4 text-center text-sm font-bold text-slate-700"
                      >
                        <div>{ev.nombre}</div>
                        <div className="mt-1 text-xs font-medium text-slate-500">
                          {ev.porcentaje}%
                        </div>
                      </th>
                    ))}

                    <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                      Promedio
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                      Estado
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rowsFiltradas.map((r) => (
                    <tr
                      key={r.idmatricula}
                      className="border-b border-slate-100 transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 font-semibold text-slate-500">
                            {r.foto_url ? (
                              <img
                                src={r.foto_url}
                                alt={r.nombre}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>
                                {(r.nombreSolo?.[0] || "").toUpperCase()}
                                {(r.apellidoSolo?.[0] || "").toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="font-semibold text-slate-800">{r.nombre}</div>
                            <div className="text-xs text-slate-500">
                              DNI: {r.numdocumento || "No registrado"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {evaluaciones.map((ev) => {
                        const valor = r.notas?.[ev.id];

                        return (
                          <td key={ev.id} className="px-4 py-4 text-center">
                            <span className="inline-flex min-w-[52px] justify-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm font-medium text-slate-700">
                              {valor ?? "—"}
                            </span>
                          </td>
                        );
                      })}

                      <td className="px-4 py-4 text-center">
                        {r.faltantes > 0 ? (
                          <span className="font-semibold text-slate-400">—</span>
                        ) : (
                          <span
                            className={`font-bold ${
                              Number(r.promedio) >= 11 ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {r.promedio?.toFixed?.(2) ?? r.promedio}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${pillEstado(
                            estadoAlumno(r)
                          )}`}
                        >
                          {estadoAlumno(r) === "SIN_NOTAS" && r.faltantes > 0
                            ? `SIN_NOTAS (${r.faltantes})`
                            : estadoAlumno(r)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResumenCard({ titulo, valor, color = "slate" }) {
  const styles = {
    slate: "border-slate-200 bg-slate-50 text-slate-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles[color] || styles.slate}`}>
      <div className="text-sm font-semibold opacity-80">{titulo}</div>
      <div className="mt-2 text-3xl font-bold">{valor}</div>
    </div>
  );
}

export default ListaAprobados;