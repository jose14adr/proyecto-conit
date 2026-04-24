import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import XLSX from "xlsx-js-style";
import autoTable from "jspdf-autotable";
import {
  getCursoById,
  getAlumnosByCurso,
  guardarAsistenciaCurso,
  getAsistenciaCursoPorFecha,
  crearTarea,
  getTareasByCurso,
  marcarTareaRevisada,
  deleteTarea,
  moverTareaOrden,
  getModulosByCurso,
  crearModulo,
  actualizarModulo,
  deleteModulo,
  moverModulo,
  moverSubModulo,
  moverSubModuloOrden,
  getLeccionesByModulo,
  crearLeccion,
  actualizarLeccion,
  deleteLeccion,
  moverLeccion,
  moverLeccionOrden,
  getMaterialesByLeccion,
  addMaterialLeccion,
  actualizarMaterialLeccion,
  deleteMaterialLeccion,
  moverMaterialLeccion,
  moverMaterialOrden,
  getMaterialLeccionDownloadUrl,
  getEntregasByTarea,
  guardarNotaEntregaYRegistro,
  getEvaluacionesTareaDisponiblesByGrupo,
  asignarEvaluacionATarea,
  crearExamen,
  getExamenesByLeccion,
  getExamenDetalle,
  getEvaluacionesExamenDisponiblesByGrupo,
  asignarEvaluacionAExamen,
  deleteExamen,
  actualizarExamen,
  getSesionesVivoByCurso,
  crearSesionVivo,
} from "../services/docenteService";

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

//Dndkit
function SortableModuloItem({ modulo, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(modulo.id),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
    zIndex: isDragging ? 30 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute right-4 top-4 z-20 cursor-grab active:cursor-grabbing rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-slate-500 shadow-sm hover:bg-slate-50"
        title="Arrastrar módulo"
      >
        ⋮⋮
      </div>

      {children}
    </div>
  );
}

function SortableTareaItem({ tarea, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `tarea-${tarea.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
    zIndex: isDragging ? 30 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute right-4 top-4 z-20 cursor-grab active:cursor-grabbing rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-slate-500 shadow-sm hover:bg-slate-50"
        title="Arrastrar tarea"
      >
        ⋮⋮
      </div>

      {children}
    </div>
  );
}

//===================================
//Arrastrar lección y submódulo
//===================================
function SortableSubModuloItem({ submodulo, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `submodulo-${submodulo.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
    zIndex: isDragging ? 30 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute right-4 top-4 z-20 cursor-grab active:cursor-grabbing rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-slate-500 shadow-sm hover:bg-slate-50"
        title="Arrastrar submódulo"
      >
        ⋮⋮
      </div>

      {children}
    </div>
  );
}

function SortableLeccionItem({ leccion, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `leccion-${leccion.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
    zIndex: isDragging ? 30 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute right-4 top-4 z-20 cursor-grab active:cursor-grabbing rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-slate-500 shadow-sm hover:bg-slate-50"
        title="Arrastrar lección"
      >
        ⋮⋮
      </div>

      {children}
    </div>
  );
}

//Arrastrar materiales
function SortableMaterialItem({ material, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `material-${material.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
    zIndex: isDragging ? 30 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute right-4 top-4 z-20 cursor-grab active:cursor-grabbing rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-slate-500 shadow-sm hover:bg-slate-50"
        title="Arrastrar material"
      >
        ⋮⋮
      </div>

      {children}
    </div>
  );
}

//VIMEO
const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;

  const regExp =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/i;

  const match = url.match(regExp);
  if (!match?.[1]) return null;

  return `https://www.youtube.com/embed/${match[1]}`;
};

const getVimeoEmbedUrl = (url) => {
  if (!url) return null;

  const match = url.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/i);

  if (!match?.[1]) return null;

  return `https://player.vimeo.com/video/${match[1]}`;
};

const getEmbedVideoUrl = (url) => {
  return getYoutubeEmbedUrl(url) || getVimeoEmbedUrl(url) || null;
};

function VideoEmbed({ url }) {
  const embedUrl = getEmbedVideoUrl(url);

  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm inline-flex"
      >
        Ver video
      </a>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-black">
      <iframe
        src={embedUrl}
        title="Video del material"
        className="w-full h-[220px] md:h-[380px]"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function CursoDetalleDocente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permisos, setPermisos] = useState({
    control_total: false,
    gestionar_contenido: false,
    gestionar_tareas: false,
    gestionar_examenes: false,
    gestionar_sesiones: false,
    tomar_asistencia: false,
    gestionar_calificaciones: false,
  });

  // ==============================
  // Tabs
  // ==============================
  const [tabActiva, setTabActiva] = useState("resumen");

  // ==============================
  // Fecha actual
  // ==============================
  const hoy = new Date().toISOString().slice(0, 10);

  // ==============================
  // Asistencia
  // ==============================
  const [fechaAsistencia, setFechaAsistencia] = useState(hoy);
  const [asistenciaMap, setAsistenciaMap] = useState({});

  //Filtrado asistencia
  const [busquedaAsistencia, setBusquedaAsistencia] = useState("");
  const [filtroAsistencia, setFiltroAsistencia] = useState("todos");

  // ==============================
  // Tareas
  // ==============================
  const [mostrarFormTarea, setMostrarFormTarea] = useState(false);
  const [guardandoTarea, setGuardandoTarea] = useState(false);
  const [cargandoTareas, setCargandoTareas] = useState(false);
  const [tareas, setTareas] = useState([]);
  const [tareasOrdenadas, setTareasOrdenadas] = useState([]);
  const [tareasAbiertas, setTareasAbiertas] = useState({});

  const [modalEntregaOpen, setModalEntregaOpen] = useState(false);
  const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);

  const [formTarea, setFormTarea] = useState({
    titulo: "",
    descripcion: "",
    fechaInicio: "",
    fechaLimite: "",
    tipoEntrega: "",
    tipoApoyo: "ninguno",
    textoApoyo: "",
    archivoApoyo: null,
    videoApoyo: null,
    calificable: false,
  });

  const [moduloDestinoTarea, setModuloDestinoTarea] = useState(null);

  // ==============================
  // Módulos / Lecciones / Materiales
  // ==============================
  const [modulos, setModulos] = useState([]);
  const [modulosOrdenados, setModulosOrdenados] = useState([]);
  const [cargandoModulos, setCargandoModulos] = useState(false);

  const [mostrarFormModulo, setMostrarFormModulo] = useState(false);
  const [guardandoModulo, setGuardandoModulo] = useState(false);
  const [formModulo, setFormModulo] = useState({
    titulo: "",
    descripcion: "",
  });

  const [mostrarFormSubModulo, setMostrarFormSubModulo] = useState({});
  const [guardandoSubModulo, setGuardandoSubModulo] = useState(false);
  const [formSubModulo, setFormSubModulo] = useState({});

  const [mostrarLecciones, setMostrarLecciones] = useState({});
  const [mostrarFormLeccion, setMostrarFormLeccion] = useState({});
  const [guardandoLeccion, setGuardandoLeccion] = useState(false);
  const [formLeccion, setFormLeccion] = useState({});

  const [mostrarMateriales, setMostrarMateriales] = useState({});
  const [mostrarFormMaterial, setMostrarFormMaterial] = useState({});
  const [guardandoMaterial, setGuardandoMaterial] = useState(false);
  const [formMaterial, setFormMaterial] = useState({});
  const [subidaMaterialProgress, setSubidaMaterialProgress] = useState({});
  const [subidaMaterialEstado, setSubidaMaterialEstado] = useState({});
  const [notificacionesVideo, setNotificacionesVideo] = useState([]);

  // ==============================
  // EXAMENES
  // ==============================
  const [mostrarFormExamen, setMostrarFormExamen] = useState({});
  const [guardandoExamen, setGuardandoExamen] = useState(false);
  const [formExamen, setFormExamen] = useState({});
  const [configExamenOpen, setConfigExamenOpen] = useState(false);
  const [examenConfigActual, setExamenConfigActual] = useState(null);
  const [evaluacionesExamenDisponibles, setEvaluacionesExamenDisponibles] =
    useState([]);
  const [evaluacionSeleccionadaExamen, setEvaluacionSeleccionadaExamen] =
    useState("");
  const [cargandoConfigExamen, setCargandoConfigExamen] = useState(false);
  const [guardandoConfigExamen, setGuardandoConfigExamen] = useState(false);
  const [examenEditandoId, setExamenEditandoId] = useState(null);
  const [leccionExamenEditandoId, setLeccionExamenEditandoId] = useState(null);

  //Sensores de arrastrado
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ==============================
  // Edición
  // ==============================
  const [editandoModuloId, setEditandoModuloId] = useState(null);
  const [formEditarModulo, setFormEditarModulo] = useState({
    titulo: "",
    descripcion: "",
  });

  const [editandoLeccionId, setEditandoLeccionId] = useState(null);
  const [formEditarLeccion, setFormEditarLeccion] = useState({
    titulo: "",
    descripcion: "",
  });

  const [editandoMaterialId, setEditandoMaterialId] = useState(null);
  const [formEditarMaterial, setFormEditarMaterial] = useState({
    titulo: "",
    tipo: "texto",
    contenido_texto: "",
    video_url: "",
    enlace_url: "",
  });

  const [tareaDetalle, setTareaDetalle] = useState(null);
  const [entregasTarea, setEntregasTarea] = useState([]);
  const [cargandoDetalleTarea, setCargandoDetalleTarea] = useState(false);
  const [guardandoNotaEntrega, setGuardandoNotaEntrega] = useState({});

  // ==============================
  //Asignar notas a una tarea
  // ==============================

  const [configTareaOpen, setConfigTareaOpen] = useState(false);
  const [tareaConfigActual, setTareaConfigActual] = useState(null);
  const [evaluacionesTareaDisponibles, setEvaluacionesTareaDisponibles] =
    useState([]);
  const [evaluacionSeleccionadaTarea, setEvaluacionSeleccionadaTarea] =
    useState("");
  const [cargandoConfigTarea, setCargandoConfigTarea] = useState(false);
  const [guardandoConfigTarea, setGuardandoConfigTarea] = useState(false);

  // ==============================
  // SESIONES EN VIVO
  // ==============================
  const [sesionesVivo, setSesionesVivo] = useState([]);
  const [cargandoSesionesVivo, setCargandoSesionesVivo] = useState(false);
  const [mostrarFormSesionVivo, setMostrarFormSesionVivo] = useState(false);
  const [guardandoSesionVivo, setGuardandoSesionVivo] = useState(false);
  const [formSesionVivo, setFormSesionVivo] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    duracion: 60,
  });

  // ==============================
  // CARGAR SESIONES EN VIVO
  // ==============================

  const cargarSesionesVivoCurso = async () => {
    try {
      setCargandoSesionesVivo(true);
      const data = await getSesionesVivoByCurso(Number(id));
      setSesionesVivo(data || []);
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudieron cargar las sesiones en vivo.");
    } finally {
      setCargandoSesionesVivo(false);
    }
  };

  const handleChangeSesionVivo = (e) => {
    const { name, value } = e.target;

    setFormSesionVivo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const limpiarFormSesionVivo = () => {
    setFormSesionVivo({
      titulo: "",
      descripcion: "",
      fecha: "",
      duracion: 60,
    });
  };

  const guardarSesionVivoCurso = async (e) => {
    e.preventDefault();

    try {
      if (!formSesionVivo.titulo.trim()) {
        return alert("Ingresa el título de la sesión en vivo.");
      }

      if (!formSesionVivo.fecha) {
        return alert("Selecciona la fecha y hora de la sesión.");
      }

      if (!formSesionVivo.duracion || Number(formSesionVivo.duracion) <= 0) {
        return alert("La duración debe ser mayor a 0.");
      }

      setGuardandoSesionVivo(true);

      await crearSesionVivo({
        idcurso: Number(id),
        titulo: formSesionVivo.titulo,
        descripcion: formSesionVivo.descripcion,
        fecha: formSesionVivo.fecha,
        duracion: Number(formSesionVivo.duracion),
      });

      limpiarFormSesionVivo();
      setMostrarFormSesionVivo(false);
      await cargarSesionesVivoCurso();
      alert("Sesión en vivo creada correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo crear la sesión en vivo.");
    } finally {
      setGuardandoSesionVivo(false);
    }
  };

  const formatearFechaSesion = (fecha) => {
    if (!fecha) return "-";

    const value = new Date(fecha);
    if (Number.isNaN(value.getTime())) return fecha;

    return value.toLocaleString("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ==============================
  // PDF
  // ==============================
  const exportarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Reporte de Asistencia", 14, 15);

    doc.setFontSize(11);
    doc.text(`Curso: ${curso?.nombre || ""}`, 14, 22);
    doc.text(`Fecha: ${fechaAsistencia}`, 14, 28);

    const rows = alumnos.map((a) => {
      const key = a.idalumno || a.id;
      const asistencia = asistenciaMap[key] || {};

      return [
        `${a.nombre || ""} ${a.apellido || ""}`.trim(),
        a.numdocumento || "-",
        asistencia.estado || "Sin registro",
        asistencia.tipo_justificacion || "-",
        asistencia.observacion || "-",
      ];
    });

    autoTable(doc, {
      startY: 35,
      head: [["Alumno", "DNI", "Estado", "Justificación", "Observación"]],
      body: rows,
    });

    doc.save(`asistencia_${curso?.nombre || "curso"}_${fechaAsistencia}.pdf`);
  };

  //==============================
  //Exportar Excel
  //==============================
  const exportarExcel = () => {
    const totalAlumnos = alumnosFiltradosAsistencia.length;
    const totalPresentes = alumnosFiltradosAsistencia.filter((a) => {
      const key = a.idalumno || a.id;
      return asistenciaMap[key]?.estado === "presente";
    }).length;

    const totalTardanzas = alumnosFiltradosAsistencia.filter((a) => {
      const key = a.idalumno || a.id;
      return asistenciaMap[key]?.estado === "tardanza";
    }).length;

    const totalFaltas = alumnosFiltradosAsistencia.filter((a) => {
      const key = a.idalumno || a.id;
      return asistenciaMap[key]?.estado === "falta";
    }).length;

    const totalSinRegistro = alumnosFiltradosAsistencia.filter((a) => {
      const key = a.idalumno || a.id;
      return !asistenciaMap[key]?.estado;
    }).length;

    const wsData = [
      ["REPORTE DE ASISTENCIA"],
      [""],
      ["DATOS DEL CURSO"],
      ["Curso", curso?.nombre || ""],
      ["Grupo", curso?.grupo || "Sin grupo"],
      ["Horario", curso?.horario || "Sin horario"],
      ["Fecha consultada", fechaAsistencia],
      [""],
      ["RESUMEN"],
      ["Total alumnos", totalAlumnos],
      ["Presentes", totalPresentes],
      ["Tardanzas", totalTardanzas],
      ["Faltas", totalFaltas],
      ["Sin registro", totalSinRegistro],
      [""],
      ["DETALLE DE ASISTENCIA"],
      ["N°", "Alumno", "DNI", "Estado", "Justificación", "Observación"],
      ...alumnosFiltradosAsistencia.map((a, index) => {
        const key = a.idalumno || a.id;
        const asistencia = asistenciaMap[key] || {};

        return [
          index + 1,
          `${a.nombre || ""} ${a.apellido || ""}`.trim(),
          a.numdocumento || "-",
          asistencia.estado || "Sin registro",
          asistencia.tipo_justificacion || "-",
          asistencia.observacion || "-",
        ];
      }),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
      { s: { r: 8, c: 0 }, e: { r: 8, c: 5 } },
      { s: { r: 15, c: 0 }, e: { r: 15, c: 5 } },
    ];

    ws["!cols"] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 35 },
    ];

    const borderAll = {
      top: { style: "thin", color: { rgb: "D1D5DB" } },
      bottom: { style: "thin", color: { rgb: "D1D5DB" } },
      left: { style: "thin", color: { rgb: "D1D5DB" } },
      right: { style: "thin", color: { rgb: "D1D5DB" } },
    };

    const styleTitle = {
      font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1E3A8A" } },
      alignment: { horizontal: "center", vertical: "center" },
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
      alignment: { horizontal: "center", vertical: "center" },
      border: borderAll,
    };

    const styleCell = {
      border: borderAll,
      alignment: { vertical: "center", wrapText: true },
    };

    const styleCentered = {
      border: borderAll,
      alignment: { horizontal: "center", vertical: "center" },
    };

    // Título
    ws["A1"].s = styleTitle;

    // Secciones
    ws["A3"].s = styleSection;
    ws["A9"].s = styleSection;
    ws["A16"].s = styleSection;

    // Datos del curso
    ["A4", "A5", "A6", "A7"].forEach((cell) => {
      if (ws[cell]) ws[cell].s = styleLabel;
    });
    ["B4", "B5", "B6", "B7"].forEach((cell) => {
      if (ws[cell]) ws[cell].s = styleValue;
    });

    // Resumen
    ["A10", "A11", "A12", "A13", "A14"].forEach((cell) => {
      if (ws[cell]) ws[cell].s = styleLabel;
    });
    ["B10", "B11", "B12", "B13", "B14"].forEach((cell) => {
      if (ws[cell]) ws[cell].s = styleCentered;
    });

    // Encabezado tabla
    ["A17", "B17", "C17", "D17", "E17", "F17"].forEach((cell) => {
      if (ws[cell]) ws[cell].s = styleHeader;
    });

    // Filas de detalle
    for (let row = 18; row < 18 + alumnosFiltradosAsistencia.length; row++) {
      if (ws[`A${row}`]) ws[`A${row}`].s = styleCentered;
      if (ws[`B${row}`]) ws[`B${row}`].s = styleCell;
      if (ws[`C${row}`]) ws[`C${row}`].s = styleCentered;
      if (ws[`D${row}`]) ws[`D${row}`].s = styleCentered;
      if (ws[`E${row}`]) ws[`E${row}`].s = styleCentered;
      if (ws[`F${row}`]) ws[`F${row}`].s = styleCell;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");

    XLSX.writeFile(
      wb,
      `asistencia_${curso?.nombre || "curso"}_${fechaAsistencia}.xlsx`,
    );
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        const [cursoData, alumnosData, asistenciaData] = await Promise.all([
          getCursoById(id),
          getAlumnosByCurso(id),
          getAsistenciaCursoPorFecha(id, hoy),
        ]);

        setCurso(cursoData);
        setAlumnos(alumnosData || []);

        // 👇=== INICIO DEL BLOQUE A PRUEBA DE BALAS ===👇

        // 1. Buscamos los permisos en todas las rutas posibles del objeto
        let rawPermisos =
          cursoData?.grupos?.[0]?.permisos_docente ||
          cursoData?.permisos_docente ||
          cursoData?.grupo?.permisos_docente;

        console.log("🔍 DATA COMPLETA DEL CURSO:", cursoData);
        console.log("🔑 PERMISOS CRUDOS ENCONTRADOS:", rawPermisos);

        if (rawPermisos) {
          let p = rawPermisos;
          try {
            // 2. Si es string, lo parseamos. Si viene doblemente convertido, lo volvemos a parsear.
            if (typeof p === "string") p = JSON.parse(p);
            if (typeof p === "string") p = JSON.parse(p);

            console.log("✅ PERMISOS TRADUCIDOS:", p);

            // 3. Activamos la UI
            setPermisos({
              control_total: !!p.control_total,
              gestionar_contenido: !!(p.gestionar_contenido || p.control_total),
              gestionar_tareas: !!(p.gestionar_tareas || p.control_total),
              gestionar_examenes: !!(p.gestionar_examenes || p.control_total),
              gestionar_sesiones: !!(p.gestionar_sesiones || p.control_total),
              tomar_asistencia: !!(p.tomar_asistencia || p.control_total),
              gestionar_calificaciones: !!(
                p.gestionar_calificaciones || p.control_total
              ),
            });
          } catch (error) {
            console.error("❌ Error al convertir los permisos:", error);
          }
        } else {
          console.warn(
            "⚠️ ALERTA: No llegaron los permisos_docente desde el backend.",
          );
        }
        // 👆=== FIN DEL BLOQUE A PRUEBA DE BALAS ===👆

        const map = {};
        (asistenciaData || []).forEach((item) => {
          map[item.idalumno] = {
            estado: item.estado || "",
            tipo_justificacion: item.tipo_justificacion || "",
            observacion: item.observacion || "",
          };
        });
        setAsistenciaMap(map);
      } catch (error) {
        console.error(error);
        alert(error?.message || "Error cargando detalle del curso");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, hoy]);

  useEffect(() => {
    if (tabActiva === "tareas" || tabActiva === "modulos") {
      cargarTareasCurso();
    }
  }, [tabActiva, id]);

  useEffect(() => {
    if (tabActiva === "modulos") {
      cargarModulosCurso();
    }
  }, [tabActiva, id]);

  useEffect(() => {
    setModulosOrdenados(modulos || []);
  }, [modulos]);

  useEffect(() => {
    setTareasOrdenadas(tareas || []);
  }, [tareas]);

  useEffect(() => {
    if (tabActiva === "resumen") {
      cargarSesionesVivoCurso();
    }
  }, [tabActiva, id]); //Cambiar por "}, [id]);" si se quiere cargar siempre apenas entrar al detalle de curso

  const cargarTareasCurso = async () => {
    try {
      setCargandoTareas(true);
      const data = await getTareasByCurso(id);
      setTareas(data || []);
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudieron cargar las tareas");
    } finally {
      setCargandoTareas(false);
    }
  };

  const cargarModulosCurso = async () => {
    try {
      setCargandoModulos(true);

      const modulosData = await getModulosByCurso(id);

      const modulosConDetalle = await Promise.all(
        (modulosData || []).map(async (modulo) => {
          const submodulosConDetalle = await Promise.all(
            (modulo.submodulos || []).map(async (submodulo) => {
              const lecciones = await getLeccionesByModulo(submodulo.id);

              const leccionesConMateriales = await Promise.all(
                (lecciones || []).map(async (leccion) => {
                  const [materiales, examenes] = await Promise.all([
                    getMaterialesByLeccion(leccion.id),
                    getExamenesByLeccion(leccion.id),
                  ]);

                  return {
                    ...leccion,
                    materiales: materiales || [],
                    examenes: examenes || [],
                  };
                }),
              );

              return {
                ...submodulo,
                lecciones: leccionesConMateriales || [],
              };
            }),
          );

          return {
            ...modulo,
            submodulos: submodulosConDetalle || [],
          };
        }),
      );

      setModulos(modulosConDetalle);
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudieron cargar los módulos");
    } finally {
      setCargandoModulos(false);
    }
  };

  const cargarAsistenciaPorFecha = async (fecha) => {
    try {
      const data = await getAsistenciaCursoPorFecha(id, fecha);

      const map = {};
      (data || []).forEach((item) => {
        map[item.idalumno] = {
          estado: item.estado || "",
          tipo_justificacion: item.tipo_justificacion || "",
          observacion: item.observacion || "",
        };
      });

      setAsistenciaMap(map);
    } catch (error) {
      console.error(error);
      alert(error?.message || "Error cargando asistencia");
    }
  };

  const irAHoy = async () => {
    setFechaAsistencia(hoy);
    await cargarAsistenciaPorFecha(hoy);
  };

  const actualizarEstadoAsistencia = (idalumno, nuevoEstado) => {
    setAsistenciaMap((prev) => ({
      ...prev,
      [idalumno]: {
        ...(prev[idalumno] || {}),
        estado: nuevoEstado,
        tipo_justificacion:
          nuevoEstado === "tardanza" || nuevoEstado === "falta"
            ? prev[idalumno]?.tipo_justificacion || ""
            : "",
        observacion: prev[idalumno]?.observacion || "",
      },
    }));
  };

  const actualizarJustificacion = (idalumno, valor) => {
    setAsistenciaMap((prev) => ({
      ...prev,
      [idalumno]: {
        ...(prev[idalumno] || {}),
        tipo_justificacion: valor,
      },
    }));
  };

  const actualizarObservacion = (idalumno, valor) => {
    setAsistenciaMap((prev) => ({
      ...prev,
      [idalumno]: {
        ...(prev[idalumno] || {}),
        observacion: valor,
      },
    }));
  };

  const guardarAsistencia = async () => {
    try {
      const payload = alumnos.map((a) => ({
        idalumno: a.idalumno || a.id,
        fecha: fechaAsistencia,
        estado: asistenciaMap[a.idalumno || a.id]?.estado || "",
        tipo_justificacion:
          asistenciaMap[a.idalumno || a.id]?.tipo_justificacion || null,
        observacion: asistenciaMap[a.idalumno || a.id]?.observacion || null,
      }));

      const incompletos = payload.filter((p) => !p.estado);
      if (incompletos.length > 0) {
        return alert("Todos los alumnos deben tener estado de asistencia.");
      }

      await guardarAsistenciaCurso(Number(id), payload);
      alert("Asistencia guardada correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo guardar la asistencia");
    }
  };

  const handleChangeTarea = (e) => {
    const { name, value, type, checked } = e.target;

    setFormTarea((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "tipoApoyo") {
        next.textoApoyo = "";
        next.archivoApoyo = null;
        next.videoApoyo = null;
      }

      return next;
    });
  };

  const handleFileChangeTarea = (e) => {
    const { name, files } = e.target;

    setFormTarea((prev) => ({
      ...prev,
      [name]: files?.[0] || null,
    }));
  };

  const limpiarFormTarea = () => {
    setFormTarea({
      titulo: "",
      descripcion: "",
      fechaInicio: "",
      fechaLimite: "",
      tipoEntrega: "",
      tipoApoyo: "ninguno",
      textoApoyo: "",
      archivoApoyo: null,
      videoApoyo: null,
      calificable: false,
    });
    setModuloDestinoTarea(null);
  };

  const abrirFormTareaDesdeModulo = (modulo) => {
    setModuloDestinoTarea(modulo);
    setMostrarFormTarea(true);
    setTabActiva("tareas");
  };

  const guardarTareaCurso = async (e) => {
    e.preventDefault();

    try {
      if (!formTarea.titulo.trim()) {
        return alert("Ingresa el título de la tarea.");
      }

      if (!formTarea.descripcion.trim()) {
        return alert("Ingresa la descripción de la tarea.");
      }

      if (!formTarea.fechaInicio || !formTarea.fechaLimite) {
        return alert("Completa la fecha de inicio y la fecha límite.");
      }

      if (!formTarea.tipoEntrega) {
        return alert("Selecciona el tipo de entrega.");
      }

      setGuardandoTarea(true);

      await crearTarea({
        cursoId: curso?.id ?? null,
        grupoId: curso?.idgrupo ?? null,
        titulo: formTarea.titulo,
        descripcion: formTarea.descripcion,
        fechaInicio: formTarea.fechaInicio,
        fechaLimite: formTarea.fechaLimite,
        tipoEntrega: formTarea.tipoEntrega,
        tipoApoyo: formTarea.tipoApoyo,
        textoApoyo: formTarea.textoApoyo,
        archivoApoyo: formTarea.archivoApoyo,
        videoApoyo: formTarea.videoApoyo,
        calificable: formTarea.calificable,
        idmodulo: moduloDestinoTarea?.id ?? null,
      });

      alert("Tarea creada correctamente ✅");
      limpiarFormTarea();
      setMostrarFormTarea(false);
      await cargarTareasCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "Error al crear la tarea");
    } finally {
      setGuardandoTarea(false);
    }
  };

  const cambiarEstadoRevision = async (tarea) => {
    try {
      const nuevoEstado = !tarea.revisada;

      await marcarTareaRevisada(tarea.id, nuevoEstado);

      setTareas((prev) =>
        prev.map((item) =>
          item.id === tarea.id ? { ...item, revisada: nuevoEstado } : item,
        ),
      );
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo actualizar el estado de la tarea");
    }
  };

  const eliminarTareaCurso = async (tareaId) => {
    const confirmado = window.confirm(
      "¿Seguro que deseas eliminar esta tarea?",
    );
    if (!confirmado) return;

    try {
      await deleteTarea(tareaId);
      setTareas((prev) => prev.filter((item) => item.id !== tareaId));

      setTareasAbiertas((prev) => {
        const copia = { ...prev };
        delete copia[tareaId];
        return copia;
      });

      alert("Tarea eliminada correctamente");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo eliminar la tarea");
    }
  };

  const toggleTarea = (tareaId) => {
    setTareasAbiertas((prev) => ({
      ...prev,
      [tareaId]: !prev[tareaId],
    }));
  };

  // ==============================
  // MÓDULOS
  // ==============================
  const handleChangeModulo = (e) => {
    const { name, value } = e.target;
    setFormModulo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const guardarModuloCurso = async (e) => {
    e.preventDefault();

    try {
      if (!formModulo.titulo.trim()) {
        return alert("Ingresa el título del módulo.");
      }

      setGuardandoModulo(true);

      await crearModulo({
        cursoId: Number(id),
        titulo: formModulo.titulo,
        descripcion: formModulo.descripcion,
      });

      setFormModulo({ titulo: "", descripcion: "" });
      setMostrarFormModulo(false);
      await cargarModulosCurso();
      alert("Módulo creado correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo crear el módulo");
    } finally {
      setGuardandoModulo(false);
    }
  };

  const eliminarModuloCurso = async (moduloId) => {
    const confirmado = window.confirm(
      "¿Seguro que deseas eliminar este módulo?",
    );
    if (!confirmado) return;

    try {
      await deleteModulo(moduloId);
      await cargarModulosCurso();
      alert("Módulo eliminado correctamente");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo eliminar el módulo");
    }
  };

  const moverModuloCurso = async (moduloId, direccion) => {
    try {
      await moverModulo(moduloId, direccion);
      await cargarModulosCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo mover el módulo");
    }
  };

  const persistirOrdenModulos = async (listaAnterior, listaNueva) => {
    try {
      const trabajo = [...listaAnterior];

      for (let nuevoIndex = 0; nuevoIndex < listaNueva.length; nuevoIndex++) {
        const idActual = Number(listaNueva[nuevoIndex].id);
        let indexActualEnTrabajo = trabajo.findIndex(
          (item) => Number(item.id) === idActual,
        );

        while (indexActualEnTrabajo > nuevoIndex) {
          await moverModulo(idActual, "arriba");

          const temp = trabajo[indexActualEnTrabajo - 1];
          trabajo[indexActualEnTrabajo - 1] = trabajo[indexActualEnTrabajo];
          trabajo[indexActualEnTrabajo] = temp;

          indexActualEnTrabajo--;
        }

        while (indexActualEnTrabajo < nuevoIndex) {
          await moverModulo(idActual, "abajo");

          const temp = trabajo[indexActualEnTrabajo + 1];
          trabajo[indexActualEnTrabajo + 1] = trabajo[indexActualEnTrabajo];
          trabajo[indexActualEnTrabajo] = temp;

          indexActualEnTrabajo++;
        }
      }

      await cargarModulosCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo reordenar los módulos");
      await cargarModulosCurso();
    }
  };

  //Movimientos de módulos
  const handleDragEndModulos = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = modulosOrdenados.findIndex(
      (item) => String(item.id) === String(active.id),
    );
    const newIndex = modulosOrdenados.findIndex(
      (item) => String(item.id) === String(over.id),
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const listaAnterior = [...modulosOrdenados];
    const nuevaLista = arrayMove(modulosOrdenados, oldIndex, newIndex);

    setModulosOrdenados(nuevaLista);
    await persistirOrdenModulos(listaAnterior, nuevaLista);
  };

  const iniciarEdicionModulo = (modulo) => {
    setEditandoModuloId(modulo.id);
    setFormEditarModulo({
      titulo: modulo.titulo || "",
      descripcion: modulo.descripcion || "",
    });
  };

  const cancelarEdicionModulo = () => {
    setEditandoModuloId(null);
    setFormEditarModulo({
      titulo: "",
      descripcion: "",
    });
  };

  const handleDragEndSubmodulos = async (event, modulo) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const submodulos = modulo.submodulos || [];

    const oldIndex = submodulos.findIndex(
      (item) => `submodulo-${item.id}` === String(active.id),
    );
    const newIndex = submodulos.findIndex(
      (item) => `submodulo-${item.id}` === String(over.id),
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const nuevaLista = arrayMove(submodulos, oldIndex, newIndex);

    setModulos((prev) =>
      prev.map((m) =>
        Number(m.id) === Number(modulo.id)
          ? { ...m, submodulos: nuevaLista }
          : m,
      ),
    );

    try {
      await moverSubModuloOrden(nuevaLista);
      await cargarModulosCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo reordenar los submódulos");
      await cargarModulosCurso();
    }
  };

  const handleDragEndLecciones = async (event, moduloId, submodulo) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const lecciones = submodulo.lecciones || [];

    const oldIndex = lecciones.findIndex(
      (item) => `leccion-${item.id}` === String(active.id),
    );
    const newIndex = lecciones.findIndex(
      (item) => `leccion-${item.id}` === String(over.id),
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const nuevaLista = arrayMove(lecciones, oldIndex, newIndex);

    setModulos((prev) =>
      prev.map((m) =>
        Number(m.id) === Number(moduloId)
          ? {
              ...m,
              submodulos: (m.submodulos || []).map((s) =>
                Number(s.id) === Number(submodulo.id)
                  ? { ...s, lecciones: nuevaLista }
                  : s,
              ),
            }
          : m,
      ),
    );

    try {
      await moverLeccionOrden(nuevaLista);
      await cargarModulosCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo reordenar las lecciones");
      await cargarModulosCurso();
    }
  };

  const handleDragEndTareas = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tareasOrdenadas.findIndex(
      (item) => `tarea-${item.id}` === String(active.id),
    );
    const newIndex = tareasOrdenadas.findIndex(
      (item) => `tarea-${item.id}` === String(over.id),
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const nuevaLista = arrayMove(tareasOrdenadas, oldIndex, newIndex);

    setTareasOrdenadas(nuevaLista);

    try {
      await moverTareaOrden(nuevaLista);
      await cargarTareasCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo reordenar las tareas");
      await cargarTareasCurso();
    }
  };

  const guardarEdicionModulo = async (moduloId) => {
    try {
      if (!formEditarModulo.titulo.trim()) {
        return alert("Ingresa el título del módulo.");
      }

      await actualizarModulo(moduloId, {
        titulo: formEditarModulo.titulo,
        descripcion: formEditarModulo.descripcion,
      });

      cancelarEdicionModulo();
      await cargarModulosCurso();
      alert("Módulo actualizado correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo actualizar el módulo");
    }
  };

  //Submódulos
  const toggleFormSubModulo = (moduloId) => {
    setMostrarFormSubModulo((prev) => ({
      ...prev,
      [moduloId]: !prev[moduloId],
    }));

    setFormSubModulo((prev) => ({
      ...prev,
      [moduloId]: prev[moduloId] || {
        titulo: "",
        descripcion: "",
      },
    }));
  };

  const handleChangeSubModulo = (moduloId, e) => {
    const { name, value } = e.target;

    setFormSubModulo((prev) => ({
      ...prev,
      [moduloId]: {
        ...(prev[moduloId] || {}),
        [name]: value,
      },
    }));
  };

  //Submódulos

  const guardarSubModuloCurso = async (e, moduloPadreId) => {
    e.preventDefault();

    try {
      const data = formSubModulo[moduloPadreId] || {};

      if (!data.titulo?.trim()) {
        return alert("Ingresa el título del submódulo.");
      }

      setGuardandoSubModulo(true);

      await crearModulo({
        cursoId: Number(id),
        titulo: data.titulo,
        descripcion: data.descripcion,
        idpadre: moduloPadreId,
      });

      setFormSubModulo((prev) => ({
        ...prev,
        [moduloPadreId]: {
          titulo: "",
          descripcion: "",
        },
      }));

      setMostrarFormSubModulo((prev) => ({
        ...prev,
        [moduloPadreId]: false,
      }));

      await cargarModulosCurso();
      alert("Submódulo creado correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo crear el submódulo");
    } finally {
      setGuardandoSubModulo(false);
    }
  };

  //Mover material
  const handleDragEndMateriales = async (
    event,
    moduloId,
    submoduloId,
    leccion,
  ) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const materiales = leccion.materiales || [];

    const oldIndex = materiales.findIndex(
      (item) => `material-${item.id}` === String(active.id),
    );
    const newIndex = materiales.findIndex(
      (item) => `material-${item.id}` === String(over.id),
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const nuevaLista = arrayMove(materiales, oldIndex, newIndex);

    setModulos((prev) =>
      prev.map((m) =>
        Number(m.id) === Number(moduloId)
          ? {
              ...m,
              submodulos: (m.submodulos || []).map((s) =>
                Number(s.id) === Number(submoduloId)
                  ? {
                      ...s,
                      lecciones: (s.lecciones || []).map((l) =>
                        Number(l.id) === Number(leccion.id)
                          ? { ...l, materiales: nuevaLista }
                          : l,
                      ),
                    }
                  : s,
              ),
            }
          : m,
      ),
    );

    try {
      await moverMaterialOrden(nuevaLista);
      await cargarModulosCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo reordenar los materiales");
      await cargarModulosCurso();
    }
  };

  const moverSubModuloCurso = async (submoduloId, direccion) => {
    try {
      await moverSubModulo(submoduloId, direccion);
      await cargarModulosCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo mover el submódulo");
    }
  };

  // ==============================
  // LECCIONES
  // ==============================
  const toggleLeccionesModulo = (moduloId) => {
    setMostrarLecciones((prev) => ({
      ...prev,
      [moduloId]: !prev[moduloId],
    }));
  };

  const toggleFormLeccion = (moduloId) => {
    setMostrarFormLeccion((prev) => ({
      ...prev,
      [moduloId]: !prev[moduloId],
    }));

    setFormLeccion((prev) => ({
      ...prev,
      [moduloId]: prev[moduloId] || {
        titulo: "",
        descripcion: "",
      },
    }));
  };

  const handleChangeLeccion = (moduloId, e) => {
    const { name, value } = e.target;

    setFormLeccion((prev) => ({
      ...prev,
      [moduloId]: {
        ...(prev[moduloId] || {}),
        [name]: value,
      },
    }));
  };

  const guardarLeccionCurso = async (e, moduloId) => {
    e.preventDefault();

    try {
      const data = formLeccion[moduloId] || {};

      if (!data.titulo?.trim()) {
        return alert("Ingresa el título de la lección.");
      }

      setGuardandoLeccion(true);

      await crearLeccion({
        moduloId,
        titulo: data.titulo,
        descripcion: data.descripcion,
      });

      setFormLeccion((prev) => ({
        ...prev,
        [moduloId]: {
          titulo: "",
          descripcion: "",
        },
      }));

      setMostrarFormLeccion((prev) => ({
        ...prev,
        [moduloId]: false,
      }));

      await cargarModulosCurso();
      alert("Lección creada correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo crear la lección");
    } finally {
      setGuardandoLeccion(false);
    }
  };

  const eliminarLeccionCurso = async (leccionId) => {
    const confirmado = window.confirm(
      "¿Seguro que deseas eliminar esta lección?",
    );
    if (!confirmado) return;

    try {
      await deleteLeccion(leccionId);
      await cargarModulosCurso();
      alert("Lección eliminada correctamente");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo eliminar la lección");
    }
  };

  const moverLeccionCurso = async (leccionId, direccion) => {
    try {
      await moverLeccion(leccionId, direccion);
      await cargarModulosCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo mover la lección");
    }
  };

  const iniciarEdicionLeccion = (leccion) => {
    setEditandoLeccionId(leccion.id);
    setFormEditarLeccion({
      titulo: leccion.titulo || "",
      descripcion: leccion.descripcion || "",
    });
  };

  const cancelarEdicionLeccion = () => {
    setEditandoLeccionId(null);
    setFormEditarLeccion({
      titulo: "",
      descripcion: "",
    });
  };

  const guardarEdicionLeccion = async (leccionId) => {
    try {
      if (!formEditarLeccion.titulo.trim()) {
        return alert("Ingresa el título de la lección.");
      }

      await actualizarLeccion(leccionId, {
        titulo: formEditarLeccion.titulo,
        descripcion: formEditarLeccion.descripcion,
      });

      cancelarEdicionLeccion();
      await cargarModulosCurso();
      alert("Lección actualizada correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo actualizar la lección");
    }
  };

  // ==============================
  // MATERIALES
  // ==============================
  const toggleMaterialesLeccion = (leccionId) => {
    setMostrarMateriales((prev) => ({
      ...prev,
      [leccionId]: !prev[leccionId],
    }));
  };

  const toggleFormMaterial = (leccionId) => {
    setMostrarFormMaterial((prev) => ({
      ...prev,
      [leccionId]: !prev[leccionId],
    }));

    setFormMaterial((prev) => ({
      ...prev,
      [leccionId]: prev[leccionId] || {
        titulo: "",
        tipo: "texto",
        contenido_texto: "",
        video_url: "",
        enlace_url: "",
        file: null,
      },
    }));
  };

  const handleChangeMaterial = (leccionId, e) => {
    const { name, value } = e.target;

    setFormMaterial((prev) => ({
      ...prev,
      [leccionId]: {
        ...(prev[leccionId] || {}),
        [name]: value,
      },
    }));
  };

  const handleFileMaterial = (leccionId, e) => {
    const file = e.target.files?.[0] || null;

    if (file && file.size > 20 * 1024 * 1024) {
      alert("El archivo supera el límite permitido de 20 MB.");
      return;
    }

    setFormMaterial((prev) => ({
      ...prev,
      [leccionId]: {
        ...(prev[leccionId] || {}),
        file,
      },
    }));
  };

  const guardarMaterialCurso = async (e, leccionId) => {
    e.preventDefault();

    try {
      const data = formMaterial[leccionId] || {};

      if (!data.titulo?.trim()) {
        return alert("Ingresa el título del material.");
      }

      if (!data.tipo) {
        return alert("Selecciona el tipo de material.");
      }

      if (data.tipo === "texto" && !data.contenido_texto?.trim()) {
        return alert("Ingresa el contenido del material.");
      }

      if (data.tipo === "url_video" && !data.video_url?.trim()) {
        return alert("Ingresa la URL del video.");
      }

      if (data.tipo === "enlace" && !data.enlace_url?.trim()) {
        return alert("Ingresa el enlace.");
      }

      if ((data.tipo === "archivo" || data.tipo === "video") && !data.file) {
        return alert("Selecciona un archivo.");
      }

      // CASO VIDEO: se lanza en segundo plano y se libera la UI
      if (data.tipo === "video") {
        subirVideoEnSegundoPlano(leccionId, data);

        setFormMaterial((prev) => ({
          ...prev,
          [leccionId]: {
            titulo: "",
            tipo: "texto",
            contenido_texto: "",
            video_url: "",
            enlace_url: "",
            file: null,
          },
        }));

        setMostrarFormMaterial((prev) => ({
          ...prev,
          [leccionId]: false,
        }));

        return;
      }

      // Resto de materiales: flujo normal
      setGuardandoMaterial(true);

      setSubidaMaterialEstado((prev) => ({
        ...prev,
        [leccionId]:
          data.tipo === "video" ? "Subiendo video..." : "Subiendo archivo...",
      }));

      setSubidaMaterialProgress((prev) => ({
        ...prev,
        [leccionId]: 0,
      }));

      await addMaterialLeccion(leccionId, {
        titulo: data.titulo,
        tipo: data.tipo,
        contenido_texto: data.contenido_texto,
        video_url: data.tipo === "url_video" ? data.video_url : null,
        enlace_url: data.tipo === "enlace" ? data.enlace_url : null,
        file: data.tipo === "archivo" ? data.file : null,
        onProgress: (percent) => {
          setSubidaMaterialProgress((prev) => ({
            ...prev,
            [leccionId]: percent,
          }));

          if (percent >= 100) {
            setSubidaMaterialEstado((prev) => ({
              ...prev,
              [leccionId]: "Procesando archivo...",
            }));
          }
        },
      });

      setFormMaterial((prev) => ({
        ...prev,
        [leccionId]: {
          titulo: "",
          tipo: "texto",
          contenido_texto: "",
          video_url: "",
          enlace_url: "",
          file: null,
        },
      }));

      setMostrarFormMaterial((prev) => ({
        ...prev,
        [leccionId]: false,
      }));

      await cargarModulosCurso();
      alert("Material agregado correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo agregar el material");
    } finally {
      setGuardandoMaterial(false);

      setTimeout(() => {
        setSubidaMaterialProgress((prev) => ({
          ...prev,
          [leccionId]: 0,
        }));
        setSubidaMaterialEstado((prev) => ({
          ...prev,
          [leccionId]: "",
        }));
      }, 1200);
    }
  };

  const abrirArchivoMaterial = async (material) => {
    try {
      if (material.object_key) {
        const url = await getMaterialLeccionDownloadUrl(material.object_key);
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }

      if (material.archivo_url) {
        window.open(material.archivo_url, "_blank", "noopener,noreferrer");
        return;
      }

      throw new Error("El material no tiene una ruta válida.");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo abrir el archivo.");
    }
  };

  const eliminarMaterialCurso = async (materialId) => {
    const confirmado = window.confirm(
      "¿Seguro que deseas eliminar este material?",
    );
    if (!confirmado) return;

    try {
      await deleteMaterialLeccion(materialId);
      await cargarModulosCurso();
      alert("Material eliminado correctamente");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo eliminar el material");
    }
  };

  const moverMaterialCurso = async (materialId, direccion) => {
    try {
      await moverMaterialLeccion(materialId, direccion);
      await cargarModulosCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo mover el material");
    }
  };

  const iniciarEdicionMaterial = (material) => {
    setEditandoMaterialId(material.id);
    setFormEditarMaterial({
      titulo: material.titulo || "",
      tipo: material.tipo || "texto",
      contenido_texto: material.contenido_texto || "",
      video_url: material.video_url || "",
      enlace_url: material.enlace_url || "",
    });
  };

  const cancelarEdicionMaterial = () => {
    setEditandoMaterialId(null);
    setFormEditarMaterial({
      titulo: "",
      tipo: "texto",
      contenido_texto: "",
      video_url: "",
      enlace_url: "",
    });
  };

  const guardarEdicionMaterial = async (materialId) => {
    try {
      if (!formEditarMaterial.titulo.trim()) {
        return alert("Ingresa el título del material.");
      }

      if (
        formEditarMaterial.tipo === "texto" &&
        !formEditarMaterial.contenido_texto.trim()
      ) {
        return alert("Ingresa el contenido del material.");
      }

      if (
        formEditarMaterial.tipo === "url_video" &&
        !formEditarMaterial.video_url.trim()
      ) {
        return alert("Ingresa la URL del video.");
      }

      if (
        formEditarMaterial.tipo === "enlace" &&
        !formEditarMaterial.enlace_url.trim()
      ) {
        return alert("Ingresa el enlace.");
      }

      await actualizarMaterialLeccion(materialId, {
        titulo: formEditarMaterial.titulo,
        tipo: formEditarMaterial.tipo,
        contenido_texto:
          formEditarMaterial.tipo === "texto"
            ? formEditarMaterial.contenido_texto
            : null,
        video_url:
          formEditarMaterial.tipo === "url_video"
            ? formEditarMaterial.video_url
            : null,
        enlace_url:
          formEditarMaterial.tipo === "enlace"
            ? formEditarMaterial.enlace_url
            : null,
      });

      cancelarEdicionMaterial();
      await cargarModulosCurso();
      alert("Material actualizado correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo actualizar el material");
    }
  };

  const abrirDetalleTarea = async (tarea) => {
    try {
      setCargandoDetalleTarea(true);
      const data = await getEntregasByTarea(tarea.id);
      setTareaDetalle(tarea);
      setEntregasTarea(data?.entregas || []);
      setTareasAbiertas((prev) => ({
        ...prev,
        [tarea.id]: true,
      }));
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo cargar el detalle de la tarea");
    } finally {
      setCargandoDetalleTarea(false);
    }
  };

  const esperarVideoDisponible = async (leccionId, intentos = 12) => {
    for (let i = 0; i < intentos; i++) {
      const materiales = await getMaterialesByLeccion(leccionId);
      const hayProcesando = materiales.some(
        (m) =>
          m.tipo === "video" &&
          m.estado_video &&
          !["available", "listo"].includes(m.estado_video),
      );

      if (!hayProcesando) {
        await cargarModulosCurso();
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    await cargarModulosCurso();
  };

  const crearIdNotificacion = () =>
    `video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const actualizarNotificacionVideo = (id, patch) => {
    setNotificacionesVideo((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const eliminarNotificacionVideo = (id) => {
    setNotificacionesVideo((prev) => prev.filter((item) => item.id !== id));
  };

  const esperarVideoListoEnSegundoPlano = async (
    leccionId,
    materialId,
    notificacionId,
    intentosMax = 40,
  ) => {
    let intentos = 0;

    const intervalo = setInterval(async () => {
      try {
        intentos += 1;

        const materiales = await getMaterialesByLeccion(leccionId);
        const material = (materiales || []).find(
          (m) => Number(m.id) === Number(materialId),
        );

        if (!material) {
          if (intentos >= intentosMax) {
            clearInterval(intervalo);
            actualizarNotificacionVideo(notificacionId, {
              estado: "warning",
              mensaje: "No se encontró el video para verificar su estado.",
            });
          }
          return;
        }

        const estado = (material.estado_video || "").toLowerCase();

        if (estado === "available" || estado === "listo") {
          clearInterval(intervalo);

          actualizarNotificacionVideo(notificacionId, {
            estado: "success",
            mensaje: "Video cargado correctamente ✅",
            progreso: 100,
          });

          await cargarModulosCurso();

          setTimeout(() => {
            eliminarNotificacionVideo(notificacionId);
          }, 5000);
          return;
        }

        if (intentos >= intentosMax) {
          clearInterval(intervalo);
          actualizarNotificacionVideo(notificacionId, {
            estado: "info",
            mensaje:
              "El video sigue procesándose en Vimeo. Revisa en unos minutos.",
          });
        }
      } catch (error) {
        clearInterval(intervalo);
        actualizarNotificacionVideo(notificacionId, {
          estado: "error",
          mensaje: "Error verificando el estado del video.",
        });
      }
    }, 8000);
  };

  const subirVideoEnSegundoPlano = async (leccionId, data) => {
    const notificacionId = crearIdNotificacion();

    setNotificacionesVideo((prev) => [
      {
        id: notificacionId,
        leccionId,
        titulo: data.titulo,
        estado: "uploading",
        mensaje: "Subiendo video...",
        progreso: 0,
      },
      ...prev,
    ]);

    try {
      const material = await addMaterialLeccion(leccionId, {
        titulo: data.titulo,
        tipo: data.tipo,
        contenido_texto: data.contenido_texto,
        video_url: null,
        enlace_url: null,
        file: data.file,
        onProgress: (percent) => {
          actualizarNotificacionVideo(notificacionId, {
            progreso: percent,
            estado: percent >= 100 ? "processing" : "uploading",
            mensaje:
              percent >= 100
                ? "Procesando video en Vimeo..."
                : "Subiendo video...",
          });
        },
      });

      await cargarModulosCurso();

      const estado = (material?.estado_video || "").toLowerCase();

      if (estado === "available" || estado === "listo") {
        actualizarNotificacionVideo(notificacionId, {
          estado: "success",
          mensaje: "Video cargado correctamente ✅",
          progreso: 100,
        });

        setTimeout(() => {
          eliminarNotificacionVideo(notificacionId);
        }, 5000);

        return;
      }

      actualizarNotificacionVideo(notificacionId, {
        estado: "processing",
        mensaje: "Video subido. Vimeo lo está procesando...",
        progreso: 100,
      });

      await esperarVideoListoEnSegundoPlano(
        leccionId,
        material.id,
        notificacionId,
      );
    } catch (error) {
      console.error(error);
      actualizarNotificacionVideo(notificacionId, {
        estado: "error",
        mensaje: error?.message || "No se pudo subir el video.",
      });
    }
  };

  const cerrarDetalleTarea = () => {
    setTareaDetalle(null);
    setEntregasTarea([]);
  };

  const actualizarNotaLocalEntrega = (idmatricula, valor) => {
    setEntregasTarea((prev) =>
      prev.map((item) =>
        item.idmatricula === idmatricula ? { ...item, nota: valor } : item,
      ),
    );
  };

  const guardarNotaEntrega = async (fila) => {
    try {
      setGuardandoNotaEntrega((prev) => ({
        ...prev,
        [fila.idmatricula]: true,
      }));

      await guardarNotaEntregaYRegistro({
        tareaId: tareaDetalle.id,
        idmatricula: fila.idmatricula,
        nota: fila.nota,
      });

      alert("Nota guardada correctamente ✅");

      const data = await getEntregasByTarea(tareaDetalle.id);
      setEntregasTarea(data?.entregas || []);
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo guardar la nota");
    } finally {
      setGuardandoNotaEntrega((prev) => ({
        ...prev,
        [fila.idmatricula]: false,
      }));
    }
  };

  const abrirConfigTarea = async (tarea) => {
    try {
      if (!curso?.idgrupo) {
        alert("Este curso no tiene grupo asociado.");
        return;
      }

      if (!tarea.calificable) {
        alert("Esta tarea no está marcada como calificable.");
        return;
      }

      setCargandoConfigTarea(true);
      setTareaConfigActual(tarea);
      setConfigTareaOpen(true);

      const data = await getEvaluacionesTareaDisponiblesByGrupo(
        curso.idgrupo,
        tarea.id,
      );
      setEvaluacionesTareaDisponibles(data || []);

      const evaluacionActual = (data || []).find(
        (ev) => Number(ev.idtarea) === Number(tarea.id),
      );

      setEvaluacionSeleccionadaTarea(
        evaluacionActual ? String(evaluacionActual.id) : "",
      );
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo abrir la configuración de la tarea.");
      setConfigTareaOpen(false);
      setTareaConfigActual(null);
      setEvaluacionesTareaDisponibles([]);
      setEvaluacionSeleccionadaTarea("");
    } finally {
      setCargandoConfigTarea(false);
    }
  };

  const cerrarConfigTarea = () => {
    setConfigTareaOpen(false);
    setTareaConfigActual(null);
    setEvaluacionesTareaDisponibles([]);
    setEvaluacionSeleccionadaTarea("");
  };

  const guardarConfiguracionTarea = async () => {
    try {
      if (!tareaConfigActual?.id) {
        alert("No se encontró la tarea a configurar.");
        return;
      }

      if (!evaluacionSeleccionadaTarea) {
        alert("Selecciona una evaluación de tipo tarea.");
        return;
      }

      setGuardandoConfigTarea(true);

      await asignarEvaluacionATarea({
        tareaId: tareaConfigActual.id,
        evaluacionId: Number(evaluacionSeleccionadaTarea),
        grupoId: curso?.idgrupo,
      });

      await cargarTareasCurso();

      alert("La tarea fue vinculada correctamente a la evaluación ✅");
      cerrarConfigTarea();
    } catch (error) {
      console.error(error);
      alert(
        error?.message || "No se pudo guardar la configuración de la tarea.",
      );
    } finally {
      setGuardandoConfigTarea(false);
    }
  };

  const TIPOS_PREGUNTA_CON_OPCIONES = ["unica", "multiple"];
  const TIPOS_PREGUNTA_TEXTO = ["texto_corto", "texto_largo"];
  const TIPOS_PREGUNTA_SIN_OPCIONES = [
    "texto_corto",
    "texto_largo",
    "numerica",
    "archivo",
  ];

  const obtenerDefaultsPorTipoPregunta = (tipo) => {
    switch (tipo) {
      case "texto_corto":
        return {
          max_caracteres: 50,
          permitir_decimales: true,
          tamano_max_mb: 10,
          extensiones_permitidas: "",
          texto_placeholder: "Escribe una respuesta corta",
        };
      case "texto_largo":
        return {
          max_caracteres: 200,
          permitir_decimales: true,
          tamano_max_mb: 10,
          extensiones_permitidas: "",
          texto_placeholder: "Escribe una respuesta más extensa",
        };
      case "numerica":
        return {
          max_caracteres: null,
          permitir_decimales: true,
          tamano_max_mb: 10,
          extensiones_permitidas: "",
          texto_placeholder: "Ingresa un número",
        };
      case "archivo":
        return {
          max_caracteres: null,
          permitir_decimales: true,
          tamano_max_mb: 10,
          extensiones_permitidas: "pdf,jpg,png,doc,docx",
          texto_placeholder: "Sube tu archivo",
        };
      default:
        return {
          max_caracteres: null,
          permitir_decimales: true,
          tamano_max_mb: 10,
          extensiones_permitidas: "",
          texto_placeholder: "",
        };
    }
  };

  const crearPreguntaVacia = (tipo = "unica") => ({
    enunciado: "",
    puntaje: 1,
    tipo_pregunta: tipo,
    respuesta_texto: "",
    texto_placeholder: obtenerDefaultsPorTipoPregunta(tipo).texto_placeholder,
    max_caracteres: obtenerDefaultsPorTipoPregunta(tipo).max_caracteres,
    permitir_decimales: obtenerDefaultsPorTipoPregunta(tipo).permitir_decimales,
    tamano_max_mb: obtenerDefaultsPorTipoPregunta(tipo).tamano_max_mb,
    extensiones_permitidas:
      obtenerDefaultsPorTipoPregunta(tipo).extensiones_permitidas,
    opciones: TIPOS_PREGUNTA_CON_OPCIONES.includes(tipo)
      ? [
          { texto: "", es_correcta: false },
          { texto: "", es_correcta: false },
          { texto: "", es_correcta: false },
          { texto: "", es_correcta: false },
        ]
      : [],
  });

  const crearExamenVacio = () => ({
    id: null,
    titulo: "",
    descripcion: "",
    duracion_minutos: 30,
    intentos_permitidos: 1,
    nota_maxima: 20,
    preguntas: [crearPreguntaVacia()],
  });

  const normalizarPreguntaExamen = (pregunta = {}) => {
    const tipo = pregunta.tipo_pregunta || "unica";
    const defaults = obtenerDefaultsPorTipoPregunta(tipo);

    return {
      id: pregunta.id || null,
      enunciado: pregunta.enunciado || "",
      puntaje: Number(pregunta.puntaje || 1),
      tipo_pregunta: tipo,
      respuesta_texto: pregunta.respuesta_texto || "",
      texto_placeholder:
        pregunta.texto_placeholder !== undefined &&
        pregunta.texto_placeholder !== null
          ? pregunta.texto_placeholder
          : defaults.texto_placeholder,
      max_caracteres:
        pregunta.max_caracteres !== undefined &&
        pregunta.max_caracteres !== null
          ? Number(pregunta.max_caracteres)
          : defaults.max_caracteres,
      permitir_decimales:
        pregunta.permitir_decimales !== undefined &&
        pregunta.permitir_decimales !== null
          ? !!pregunta.permitir_decimales
          : defaults.permitir_decimales,
      tamano_max_mb:
        pregunta.tamano_max_mb !== undefined && pregunta.tamano_max_mb !== null
          ? Number(pregunta.tamano_max_mb)
          : defaults.tamano_max_mb,
      extensiones_permitidas:
        pregunta.extensiones_permitidas !== undefined &&
        pregunta.extensiones_permitidas !== null
          ? pregunta.extensiones_permitidas
          : defaults.extensiones_permitidas,
      opciones: TIPOS_PREGUNTA_CON_OPCIONES.includes(tipo)
        ? (pregunta.opciones || []).length > 0
          ? (pregunta.opciones || []).map((opcion) => ({
              id: opcion.id || null,
              texto: opcion.texto || "",
              es_correcta: !!opcion.es_correcta,
            }))
          : crearPreguntaVacia(tipo).opciones
        : [],
    };
  };

  const toggleFormExamen = (leccionId) => {
    const estabaAbierto = !!mostrarFormExamen[leccionId];

    if (estabaAbierto) {
      setMostrarFormExamen((prev) => ({
        ...prev,
        [leccionId]: false,
      }));
      setFormExamen((prev) => ({
        ...prev,
        [leccionId]: crearExamenVacio(),
      }));
      setExamenEditandoId(null);
      setLeccionExamenEditandoId(null);
      return;
    }

    setMostrarFormExamen((prev) => ({
      ...prev,
      [leccionId]: true,
    }));

    setFormExamen((prev) => ({
      ...prev,
      [leccionId]: prev[leccionId] || crearExamenVacio(),
    }));

    setExamenEditandoId(null);
    setLeccionExamenEditandoId(null);
  };

  const cancelarEdicionExamen = (leccionId) => {
    setExamenEditandoId(null);
    setLeccionExamenEditandoId(null);
    setMostrarFormExamen((prev) => ({
      ...prev,
      [leccionId]: false,
    }));
    setFormExamen((prev) => ({
      ...prev,
      [leccionId]: crearExamenVacio(),
    }));
  };

  const handleChangeExamen = (leccionId, field, value) => {
    setFormExamen((prev) => ({
      ...prev,
      [leccionId]: {
        ...(prev[leccionId] || crearExamenVacio()),
        [field]: value,
      },
    }));
  };

  const handleChangePreguntaExamen = (
    leccionId,
    preguntaIndex,
    field,
    value,
  ) => {
    setFormExamen((prev) => {
      const actual = prev[leccionId] || crearExamenVacio();
      const preguntas = [...(actual.preguntas || [])];
      const preguntaActual = preguntas[preguntaIndex] || crearPreguntaVacia();

      if (field === "tipo_pregunta") {
        const tipoNuevo = value;
        const defaults = obtenerDefaultsPorTipoPregunta(tipoNuevo);

        preguntas[preguntaIndex] = {
          ...preguntaActual,
          tipo_pregunta: tipoNuevo,
          texto_placeholder: defaults.texto_placeholder,
          max_caracteres: defaults.max_caracteres,
          permitir_decimales: defaults.permitir_decimales,
          tamano_max_mb: defaults.tamano_max_mb,
          extensiones_permitidas: defaults.extensiones_permitidas,
          respuesta_texto:
            tipoNuevo === "numerica" || TIPOS_PREGUNTA_TEXTO.includes(tipoNuevo)
              ? preguntaActual.respuesta_texto || ""
              : "",
          opciones: TIPOS_PREGUNTA_CON_OPCIONES.includes(tipoNuevo)
            ? (preguntaActual.opciones || []).length >= 2
              ? preguntaActual.opciones
              : crearPreguntaVacia(tipoNuevo).opciones
            : [],
        };
      } else {
        preguntas[preguntaIndex] = {
          ...preguntaActual,
          [field]: value,
        };
      }

      return {
        ...prev,
        [leccionId]: {
          ...actual,
          preguntas,
        },
      };
    });
  };

  const handleChangeOpcionExamen = (
    leccionId,
    preguntaIndex,
    opcionIndex,
    field,
    value,
  ) => {
    setFormExamen((prev) => {
      const actual = prev[leccionId] || crearExamenVacio();
      const preguntas = [...(actual.preguntas || [])];
      const pregunta = {
        ...(preguntas[preguntaIndex] || crearPreguntaVacia()),
      };
      const opciones = [...(pregunta.opciones || [])];

      if (field === "es_correcta") {
        if (pregunta.tipo_pregunta === "unica") {
          pregunta.opciones = opciones.map((op, idx) => ({
            ...op,
            es_correcta: idx === opcionIndex,
          }));
        } else {
          pregunta.opciones = opciones.map((op, idx) =>
            idx === opcionIndex ? { ...op, es_correcta: !!value } : op,
          );
        }
      } else {
        pregunta.opciones = opciones.map((op, idx) =>
          idx === opcionIndex ? { ...op, [field]: value } : op,
        );
      }

      preguntas[preguntaIndex] = pregunta;

      return {
        ...prev,
        [leccionId]: {
          ...actual,
          preguntas,
        },
      };
    });
  };

  const agregarOpcion = (leccionId, preguntaIndex) => {
    setFormExamen((prev) => {
      const actual = prev[leccionId] || crearExamenVacio();
      const preguntas = [...(actual.preguntas || [])];
      const pregunta = {
        ...(preguntas[preguntaIndex] || crearPreguntaVacia()),
      };

      if (!TIPOS_PREGUNTA_CON_OPCIONES.includes(pregunta.tipo_pregunta)) {
        return prev;
      }

      pregunta.opciones = [
        ...(pregunta.opciones || []),
        { texto: "", es_correcta: false },
      ];

      preguntas[preguntaIndex] = pregunta;

      return {
        ...prev,
        [leccionId]: {
          ...actual,
          preguntas,
        },
      };
    });
  };

  const quitarOpcion = (leccionId, preguntaIndex, opcionIndex) => {
    setFormExamen((prev) => {
      const actual = prev[leccionId] || crearExamenVacio();
      const preguntas = [...(actual.preguntas || [])];
      const pregunta = {
        ...(preguntas[preguntaIndex] || crearPreguntaVacia()),
      };

      if (!TIPOS_PREGUNTA_CON_OPCIONES.includes(pregunta.tipo_pregunta)) {
        return prev;
      }

      const opciones = [...(pregunta.opciones || [])];
      opciones.splice(opcionIndex, 1);

      pregunta.opciones =
        opciones.length >= 2
          ? opciones
          : [
              { texto: "", es_correcta: false },
              { texto: "", es_correcta: false },
            ];

      preguntas[preguntaIndex] = pregunta;

      return {
        ...prev,
        [leccionId]: {
          ...actual,
          preguntas,
        },
      };
    });
  };

  const agregarPreguntaExamen = (leccionId) => {
    setFormExamen((prev) => {
      const actual = prev[leccionId] || crearExamenVacio();

      return {
        ...prev,
        [leccionId]: {
          ...actual,
          preguntas: [...(actual.preguntas || []), crearPreguntaVacia()],
        },
      };
    });
  };

  const eliminarPreguntaExamen = (leccionId, preguntaIndex) => {
    setFormExamen((prev) => {
      const actual = prev[leccionId] || crearExamenVacio();
      const preguntas = [...(actual.preguntas || [])];

      preguntas.splice(preguntaIndex, 1);

      return {
        ...prev,
        [leccionId]: {
          ...actual,
          preguntas: preguntas.length ? preguntas : [crearPreguntaVacia()],
        },
      };
    });
  };

  const validarPreguntaExamen = (pregunta) => {
    if (!pregunta?.enunciado?.trim()) {
      return "Cada pregunta debe tener enunciado.";
    }

    const tipo = pregunta.tipo_pregunta || "unica";

    if (tipo === "texto_corto") {
      if (!pregunta.respuesta_texto?.trim()) {
        return "Las preguntas de texto corto deben tener una respuesta de referencia.";
      }
      if (Number(pregunta.max_caracteres || 50) > 50) {
        return "Texto corto solo permite hasta 50 caracteres.";
      }
      return null;
    }

    if (tipo === "texto_largo") {
      if (!pregunta.respuesta_texto?.trim()) {
        return "Las preguntas de texto largo deben tener una respuesta de referencia.";
      }
      if (Number(pregunta.max_caracteres || 200) > 200) {
        return "Texto largo solo permite hasta 200 caracteres.";
      }
      return null;
    }

    if (tipo === "numerica") {
      if (
        pregunta.respuesta_texto === null ||
        pregunta.respuesta_texto === undefined ||
        String(pregunta.respuesta_texto).trim() === ""
      ) {
        return "Las preguntas numéricas deben tener una respuesta numérica de referencia.";
      }

      const valor = String(pregunta.respuesta_texto).trim();
      const regex = pregunta.permitir_decimales ? /^-?\d+(\.\d+)?$/ : /^-?\d+$/;

      if (!regex.test(valor)) {
        return pregunta.permitir_decimales
          ? "La respuesta de referencia debe ser un número válido."
          : "La respuesta de referencia debe ser un número entero.";
      }

      return null;
    }

    if (tipo === "archivo") {
      if (Number(pregunta.tamano_max_mb || 0) <= 0) {
        return "Las preguntas de archivo deben tener un tamaño máximo válido.";
      }
      return null;
    }

    const opcionesCompletas = (pregunta.opciones || []).filter((op) =>
      op.texto?.trim(),
    );

    if (
      opcionesCompletas.length < 2 ||
      opcionesCompletas.length !== (pregunta.opciones || []).length
    ) {
      return "Las preguntas de opciones deben tener al menos 2 opciones completas.";
    }

    const correctas = (pregunta.opciones || []).filter(
      (op) => op.es_correcta,
    ).length;

    if (tipo === "unica" && correctas !== 1) {
      return "Las preguntas de opción única deben tener exactamente una respuesta correcta.";
    }

    if (tipo === "multiple" && correctas < 1) {
      return "Las preguntas de opción múltiple deben tener al menos una respuesta correcta.";
    }

    return null;
  };

  const guardarExamenLeccion = async (e, leccionId) => {
    e.preventDefault();

    try {
      const data = formExamen[leccionId] || crearExamenVacio();

      if (!data?.titulo?.trim()) {
        return alert("Ingresa el título del examen.");
      }

      if (!data.preguntas?.length) {
        return alert("Agrega al menos una pregunta.");
      }

      const errorPregunta = data.preguntas
        .map(validarPreguntaExamen)
        .find(Boolean);

      if (errorPregunta) {
        return alert(errorPregunta);
      }

      setGuardandoExamen(true);

      const payload = {
        leccionId,
        grupoId: curso?.idgrupo,
        titulo: data.titulo,
        descripcion: data.descripcion,
        duracion_minutos: Number(data.duracion_minutos || 30),
        intentos_permitidos: Number(data.intentos_permitidos || 1),
        nota_maxima: Number(data.nota_maxima || 20),
        preguntas: data.preguntas.map((pregunta) => ({
          enunciado: pregunta.enunciado,
          puntaje: Number(pregunta.puntaje || 1),
          tipo_pregunta: pregunta.tipo_pregunta || "unica",
          respuesta_texto:
            TIPOS_PREGUNTA_TEXTO.includes(pregunta.tipo_pregunta) ||
            pregunta.tipo_pregunta === "numerica"
              ? pregunta.respuesta_texto || null
              : null,
          texto_placeholder: pregunta.texto_placeholder || null,
          max_caracteres:
            pregunta.tipo_pregunta === "texto_corto"
              ? Number(pregunta.max_caracteres || 50)
              : pregunta.tipo_pregunta === "texto_largo"
                ? Number(pregunta.max_caracteres || 200)
                : null,
          permitir_decimales:
            pregunta.tipo_pregunta === "numerica"
              ? !!pregunta.permitir_decimales
              : true,
          tamano_max_mb:
            pregunta.tipo_pregunta === "archivo"
              ? Number(pregunta.tamano_max_mb || 10)
              : 10,
          extensiones_permitidas:
            pregunta.tipo_pregunta === "archivo"
              ? pregunta.extensiones_permitidas || null
              : null,
          opciones: TIPOS_PREGUNTA_CON_OPCIONES.includes(pregunta.tipo_pregunta)
            ? (pregunta.opciones || []).map((opcion) => ({
                texto: opcion.texto,
                es_correcta: !!opcion.es_correcta,
              }))
            : [],
        })),
      };

      if (data.id) {
        await actualizarExamen(data.id, payload);
        alert("Examen actualizado correctamente ✅");
      } else {
        await crearExamen(payload);
        alert("Examen creado correctamente ✅");
      }

      setExamenEditandoId(null);
      setLeccionExamenEditandoId(null);
      setMostrarFormExamen((prev) => ({
        ...prev,
        [leccionId]: false,
      }));
      setFormExamen((prev) => ({
        ...prev,
        [leccionId]: crearExamenVacio(),
      }));

      await cargarModulosCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo crear o actualizar el examen");
    } finally {
      setGuardandoExamen(false);
    }
  };

  const cargarExamenParaEdicion = async (examen, leccionId) => {
    try {
      setGuardandoExamen(true);

      const detalle = await getExamenDetalle(examen.id);

      setFormExamen((prev) => ({
        ...prev,
        [leccionId]: {
          id: detalle.id,
          titulo: detalle.titulo || "",
          descripcion: detalle.descripcion || "",
          duracion_minutos: Number(detalle.duracion_minutos || 30),
          intentos_permitidos: Number(detalle.intentos_permitidos || 1),
          nota_maxima: Number(detalle.nota_maxima || 20),
          preguntas:
            (detalle.preguntas || []).length > 0
              ? detalle.preguntas.map(normalizarPreguntaExamen)
              : [crearPreguntaVacia()],
        },
      }));

      setExamenEditandoId(Number(examen.id));
      setLeccionExamenEditandoId(Number(leccionId));
      setMostrarFormExamen((prev) => ({
        ...prev,
        [leccionId]: true,
      }));
    } catch (error) {
      console.error("Error al cargar examen:", error);
      alert(error?.message || "No se pudo cargar el examen para edición.");
    } finally {
      setGuardandoExamen(false);
    }
  };

  const abrirConfigExamen = async (examen) => {
    try {
      if (!curso?.idgrupo) {
        alert("Este curso no tiene grupo asociado.");
        return;
      }

      setCargandoConfigExamen(true);
      setExamenConfigActual(examen);
      setConfigExamenOpen(true);

      const data = await getEvaluacionesExamenDisponiblesByGrupo(
        curso.idgrupo,
        examen.id,
      );
      setEvaluacionesExamenDisponibles(data || []);

      const evaluacionActual = (data || []).find(
        (ev) => Number(ev.idexamen) === Number(examen.id),
      );

      setEvaluacionSeleccionadaExamen(
        evaluacionActual ? String(evaluacionActual.id) : "",
      );
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo abrir la configuración del examen.");
      setConfigExamenOpen(false);
      setExamenConfigActual(null);
      setEvaluacionesExamenDisponibles([]);
      setEvaluacionSeleccionadaExamen("");
    } finally {
      setCargandoConfigExamen(false);
    }
  };

  const cerrarConfigExamen = () => {
    setConfigExamenOpen(false);
    setExamenConfigActual(null);
    setEvaluacionesExamenDisponibles([]);
    setEvaluacionSeleccionadaExamen("");
  };

  const guardarConfiguracionExamen = async () => {
    try {
      if (!examenConfigActual?.id) {
        alert("No se encontró el examen a configurar.");
        return;
      }

      if (!evaluacionSeleccionadaExamen) {
        alert("Selecciona una evaluación de tipo examen.");
        return;
      }

      setGuardandoConfigExamen(true);

      await asignarEvaluacionAExamen({
        examenId: examenConfigActual.id,
        evaluacionId: Number(evaluacionSeleccionadaExamen),
        grupoId: curso?.idgrupo,
      });

      await cargarModulosCurso();

      alert("El examen fue vinculado correctamente a la evaluación ✅");
      cerrarConfigExamen();
    } catch (error) {
      console.error(error);
      alert(
        error?.message || "No se pudo guardar la configuración del examen.",
      );
    } finally {
      setGuardandoConfigExamen(false);
    }
  };

  const eliminarExamenLeccion = async (examenId) => {
    const confirmado = window.confirm(
      "¿Seguro que deseas eliminar este examen?",
    );
    if (!confirmado) return;

    try {
      await deleteExamen(examenId);
      await cargarModulosCurso();
      alert("Examen eliminado correctamente");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo eliminar el examen");
    }
  };

  const alumnosFiltradosAsistencia = alumnos.filter((a) => {
    const key = a.idalumno || a.id;
    const asistencia = asistenciaMap[key] || {};

    const texto =
      `${a.nombre || ""} ${a.apellido || ""} ${a.numdocumento || ""}`
        .toLowerCase()
        .trim();

    const coincideBusqueda = texto.includes(
      busquedaAsistencia.toLowerCase().trim(),
    );

    let coincideEstado = true;

    if (filtroAsistencia === "presente") {
      coincideEstado = asistencia.estado === "presente";
    } else if (filtroAsistencia === "tardanza") {
      coincideEstado = asistencia.estado === "tardanza";
    } else if (filtroAsistencia === "falta") {
      coincideEstado = asistencia.estado === "falta";
    } else if (filtroAsistencia === "sin_registro") {
      coincideEstado = !asistencia.estado;
    }

    return coincideBusqueda && coincideEstado;
  });

  const ausentes = alumnos.filter((a) => {
    const key = a.idalumno || a.id;
    return asistenciaMap[key]?.estado === "falta";
  });

  const tardanzas = alumnos.filter((a) => {
    const key = a.idalumno || a.id;
    return asistenciaMap[key]?.estado === "tardanza";
  });

  const presentes = alumnos.filter((a) => {
    const key = a.idalumno || a.id;
    return asistenciaMap[key]?.estado === "presente";
  });

  const tareasRevisadas = tareas.filter((t) => t.revisada).length;
  const tareasPendientes = tareas.filter((t) => !t.revisada).length;

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(`${fecha}T00:00:00`);
    return d.toLocaleDateString("es-PE");
  };

  const obtenerEstadoVencimiento = (fechaLimite) => {
    if (!fechaLimite) return null;

    const hoyDate = new Date();
    hoyDate.setHours(0, 0, 0, 0);

    const limite = new Date(`${fechaLimite}T00:00:00`);
    const diff = Math.ceil((limite - hoyDate) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return { label: "Vencida", className: "bg-red-100 text-red-700" };
    }

    if (diff <= 2) {
      return {
        label: "Vence pronto",
        className: "bg-orange-100 text-orange-700",
      };
    }

    return { label: "Activa", className: "bg-sky-100 text-sky-700" };
  };

  const obtenerIndicadorEvaluacionTarea = (tarea) => {
    if (!tarea.calificable) {
      return null;
    }

    const nombreEvaluacion =
      tarea.evaluacion_nombre ||
      tarea.nombre_evaluacion ||
      tarea.evaluacion?.nombre ||
      "";

    if (nombreEvaluacion) {
      return {
        texto: `Evaluación asignada: ${nombreEvaluacion}`,
        clase: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    }

    return {
      texto: "Sin evaluación asignada",
      clase: "border-amber-200 bg-amber-50 text-amber-700",
    };
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow text-gray-500">
        Cargando curso...
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow text-red-600">
        Curso no encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-slate-50/80 min-h-screen p-1">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 text-white p-6 md:p-8 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.65)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-blue-400/20 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <button
              type="button"
              onClick={() => navigate("/docente/cursos")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100 backdrop-blur hover:bg-white/15 transition"
            >
              ← Volver a Mis Cursos
            </button>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-blue-300/30 bg-blue-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-100">
                Panel del docente
              </span>
              <span className="inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                Curso activo
              </span>
            </div>

            <p className="mt-4 text-sm font-medium text-blue-200">
              Detalle del curso
            </p>

            <h2 className="mt-2 text-3xl md:text-5xl font-black tracking-tight leading-tight">
              {curso.nombre || "Curso sin nombre"}
            </h2>

            <p className="mt-3 text-sm md:text-base text-slate-200 max-w-2xl">
              Administra módulos, tareas, asistencia y materiales desde una
              vista más clara, moderna y profesional.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">
                  Grupo
                </p>
                <p className="mt-1 font-semibold text-white">
                  {curso.grupo || "Sin grupo"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">
                  Horario
                </p>
                <p className="mt-1 font-semibold text-white">
                  {curso.horario || "Sin horario"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-300">
                  Alumnos
                </p>
                <p className="mt-1 font-semibold text-white">
                  {alumnos.length}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 xl:max-w-md xl:justify-end">
            {permisos.gestionar_contenido && (
              <button onClick={() => setTabActiva("modulos")} className="...">
                Gestionar módulos
              </button>
            )}

            {permisos.tomar_asistencia && (
              <button
                onClick={() => setTabActiva("asistencia")}
                className="..."
              >
                Tomar asistencia
              </button>
            )}

            {permisos.gestionar_tareas && (
              <button onClick={() => setTabActiva("tareas")} className="...">
                Crear tarea
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.25)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_-18px_rgba(15,23,42,0.35)]">
          <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-blue-500 to-cyan-400" />
          <p className="text-sm font-medium text-slate-500">Alumnos</p>
          <h3 className="mt-3 text-4xl font-black tracking-tight text-slate-900">
            {alumnos.length}
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Total registrados en este curso
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.25)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_-18px_rgba(15,23,42,0.35)]">
          <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-violet-500 to-fuchsia-400" />
          <p className="text-sm font-medium text-slate-500">Módulos</p>
          <h3 className="mt-3 text-4xl font-black tracking-tight text-slate-900">
            {modulos.length}
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Estructura académica del curso
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-[24px] border border-red-100 bg-gradient-to-br from-white to-red-50 p-5 shadow-[0_12px_35px_-18px_rgba(239,68,68,0.18)] transition hover:-translate-y-1">
          <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-400" />
          <p className="text-sm font-medium text-red-500">Ausentes</p>
          <h3 className="mt-3 text-4xl font-black tracking-tight text-red-600">
            {ausentes.length}
          </h3>
          <p className="mt-2 text-sm text-red-400">
            Alumnos con falta registrada
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-[24px] border border-amber-100 bg-gradient-to-br from-white to-amber-50 p-5 shadow-[0_12px_35px_-18px_rgba(245,158,11,0.2)] transition hover:-translate-y-1">
          <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-amber-500 to-yellow-400" />
          <p className="text-sm font-medium text-amber-600">Tardanzas</p>
          <h3 className="mt-3 text-4xl font-black tracking-tight text-amber-600">
            {tardanzas.length}
          </h3>
          <p className="mt-2 text-sm text-amber-400">
            Seguimiento de puntualidad
          </p>
        </div>
      </div>

      <div className="sticky top-3 z-20 rounded-[24px] border border-slate-200/80 bg-white/85 p-3 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.25)] backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "resumen", label: "Resumen", show: true },
            {
              key: "asistencia",
              label: "Asistencia",
              show: permisos.tomar_asistencia,
            },
            {
              key: "tareas",
              label: "Tareas",
              show:
                permisos.gestionar_tareas || permisos.gestionar_calificaciones,
            },
            {
              key: "modulos",
              label: "Módulos",
              show: permisos.gestionar_contenido || permisos.gestionar_examenes,
            },
          ]
            .filter((tab) => tab.show)
            .map((tab) => {
              const active = tabActiva === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTabActiva(tab.key)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-slate-900 text-white shadow-lg"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
        </div>
      </div>

      {tabActiva === "resumen" && (
        <div className="space-y-6">
          <div className="bg-white/95 p-6 rounded-[24px] shadow-[0_18px_40px_-24px_rgba(15,23,42,0.25)] border border-slate-200/70">
            <h3 className="text-xl font-bold mb-4">Información general</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-gray-500 mb-1">Curso</p>
                <p className="font-semibold text-gray-900">
                  {curso.nombre || "Sin nombre"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-gray-500 mb-1">Grupo</p>
                <p className="font-semibold text-gray-900">
                  {curso.grupo || "Sin grupo"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-gray-500 mb-1">Horario</p>
                <p className="font-semibold text-gray-900">
                  {curso.horario || "Sin horario"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 p-6 rounded-[24px] shadow-[0_18px_40px_-24px_rgba(15,23,42,0.25)] border border-slate-200/70">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Sesiones en vivo</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Programa clases en vivo con Google Meet para este curso.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarFormSesionVivo((prev) => !prev)}
                className="rounded-2xl bg-violet-600 px-4 py-2 text-white font-semibold hover:bg-violet-700 transition"
              >
                {mostrarFormSesionVivo ? "Cancelar" : "+ Crear sesión en vivo"}
              </button>
            </div>

            {mostrarFormSesionVivo && (
              <form
                onSubmit={guardarSesionVivoCurso}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6 mt-6"
              >
                <div>
                  <label className="block font-semibold mb-2">Título</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formSesionVivo.titulo}
                    onChange={handleChangeSesionVivo}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="Ej. Clase en vivo - Introducción"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="duracion"
                    value={formSesionVivo.duracion}
                    onChange={handleChangeSesionVivo}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formSesionVivo.descripcion}
                    onChange={handleChangeSesionVivo}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="Descripción breve de la sesión"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">
                    Fecha y hora
                  </label>
                  <input
                    type="datetime-local"
                    name="fecha"
                    value={formSesionVivo.fecha}
                    onChange={handleChangeSesionVivo}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={guardandoSesionVivo}
                    className="rounded-2xl bg-emerald-600 px-5 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 transition shadow-lg"
                  >
                    {guardandoSesionVivo
                      ? "Creando sesión..."
                      : "Guardar sesión"}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6">
              {cargandoSesionesVivo ? (
                <p className="text-sm text-gray-500">
                  Cargando sesiones en vivo...
                </p>
              ) : sesionesVivo.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-center">
                  <p className="text-gray-700 font-medium">
                    Aún no hay sesiones en vivo programadas.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Crea una sesión para que tus alumnos puedan unirse a la
                    clase.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sesionesVivo.map((sesion) => (
                    <div
                      key={sesion.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="text-lg font-bold text-slate-800">
                            {sesion.titulo}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            {sesion.descripcion || "Sin descripción"}
                          </p>

                          <div className="mt-3 space-y-1 text-sm text-slate-600">
                            <p>
                              <span className="font-semibold">Fecha:</span>{" "}
                              {formatearFechaSesion(sesion.fecha)}
                            </p>
                            <p>
                              <span className="font-semibold">Duración:</span>{" "}
                              {sesion.duracion} min
                            </p>
                            <p>
                              <span className="font-semibold">Estado:</span>{" "}
                              {sesion.estado || "programada"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <a
                            href={sesion.link_reunion}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition"
                          >
                            Unirse a la sesión
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/95 p-6 rounded-[24px] shadow-[0_18px_40px_-24px_rgba(15,23,42,0.25)] border border-slate-200/70">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Sesiones en vivo</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Programa clases en vivo con Google Meet para este curso.
                </p>
              </div>

              {permisos.gestionar_sesiones && (
                <button
                  type="button"
                  onClick={() => setMostrarFormSesionVivo((prev) => !prev)}
                  className="rounded-2xl bg-violet-600 px-4 py-2 text-white font-semibold hover:bg-violet-700 transition"
                >
                  {mostrarFormSesionVivo
                    ? "Cancelar"
                    : "+ Crear sesión en vivo"}
                </button>
              )}
            </div>

            {mostrarFormSesionVivo && (
              <form
                onSubmit={guardarSesionVivoCurso}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6 mt-6"
              >
                <div>
                  <label className="block font-semibold mb-2">Título</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formSesionVivo.titulo}
                    onChange={handleChangeSesionVivo}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="Ej. Clase en vivo - Introducción"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="duracion"
                    value={formSesionVivo.duracion}
                    onChange={handleChangeSesionVivo}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formSesionVivo.descripcion}
                    onChange={handleChangeSesionVivo}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="Descripción breve de la sesión"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">
                    Fecha y hora
                  </label>
                  <input
                    type="datetime-local"
                    name="fecha"
                    value={formSesionVivo.fecha}
                    onChange={handleChangeSesionVivo}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={guardandoSesionVivo}
                    className="rounded-2xl bg-emerald-600 px-5 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 transition shadow-lg"
                  >
                    {guardandoSesionVivo
                      ? "Creando sesión..."
                      : "Guardar sesión"}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6">
              {cargandoSesionesVivo ? (
                <p className="text-sm text-gray-500">
                  Cargando sesiones en vivo...
                </p>
              ) : sesionesVivo.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-center">
                  <p className="text-gray-700 font-medium">
                    Aún no hay sesiones en vivo programadas.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Crea una sesión para que tus alumnos puedan unirse a la
                    clase.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sesionesVivo.map((sesion) => (
                    <div
                      key={sesion.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="text-lg font-bold text-slate-800">
                            {sesion.titulo}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            {sesion.descripcion || "Sin descripción"}
                          </p>

                          <div className="mt-3 space-y-1 text-sm text-slate-600">
                            <p>
                              <span className="font-semibold">Fecha:</span>{" "}
                              {formatearFechaSesion(sesion.fecha)}
                            </p>
                            <p>
                              <span className="font-semibold">Duración:</span>{" "}
                              {sesion.duracion} min
                            </p>
                            <p>
                              <span className="font-semibold">Estado:</span>{" "}
                              {sesion.estado || "programada"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <a
                            href={sesion.link_reunion}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition"
                          >
                            Unirse a la sesión
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/95 p-6 rounded-[24px] shadow-[0_18px_40px_-24px_rgba(15,23,42,0.25)] border border-slate-200/70">
              <h3 className="text-lg font-bold mb-4">Presentes</h3>
              {presentes.length === 0 ? (
                <p className="text-gray-500">
                  No hay alumnos marcados como presentes.
                </p>
              ) : (
                <div className="space-y-3">
                  {presentes.map((a) => {
                    const key = a.idalumno || a.id;
                    return (
                      <div key={key} className="border rounded-xl p-3">
                        <div className="font-medium">
                          {a.nombre} {a.apellido}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {a.numdocumento || "-"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white/95 p-6 rounded-[24px] shadow-[0_18px_40px_-24px_rgba(15,23,42,0.25)] border border-slate-200/70">
              <h3 className="text-lg font-bold mb-4">Ausentes</h3>
              {ausentes.length === 0 ? (
                <p className="text-gray-500">No hay alumnos ausentes.</p>
              ) : (
                <div className="space-y-3">
                  {ausentes.map((a) => {
                    const key = a.idalumno || a.id;
                    const info = asistenciaMap[key] || {};
                    return (
                      <div key={key} className="border rounded-xl p-3">
                        <div className="font-medium">
                          {a.nombre} {a.apellido}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {a.numdocumento || "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {info.tipo_justificacion || "Sin clasificación"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white/95 p-6 rounded-[24px] shadow-[0_18px_40px_-24px_rgba(15,23,42,0.25)] border border-slate-200/70">
              <h3 className="text-lg font-bold mb-4">Tardanzas</h3>
              {tardanzas.length === 0 ? (
                <p className="text-gray-500">No hay tardanzas.</p>
              ) : (
                <div className="space-y-3">
                  {tardanzas.map((a) => {
                    const key = a.idalumno || a.id;
                    const info = asistenciaMap[key] || {};
                    return (
                      <div key={key} className="border rounded-xl p-3">
                        <div className="font-medium">
                          {a.nombre} {a.apellido}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {a.numdocumento || "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {info.tipo_justificacion || "Sin clasificación"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tabActiva === "asistencia" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Asistencia</h3>
              <p className="text-sm text-gray-500">
                Registrar y consultar asistencia por fecha
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div>
                <label className="block font-semibold mb-2">
                  Consultar fecha
                </label>
                <input
                  type="date"
                  value={fechaAsistencia}
                  onChange={(e) => setFechaAsistencia(e.target.value)}
                  className="border rounded-xl px-3 py-2"
                />
              </div>

              <button
                type="button"
                onClick={() => cargarAsistenciaPorFecha(fechaAsistencia)}
                className="bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-800"
              >
                Buscar
              </button>

              <button
                type="button"
                onClick={irAHoy}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
              >
                Hoy
              </button>

              <button
                type="button"
                onClick={exportarPDF}
                className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700"
              >
                Exportar PDF
              </button>

              <button
                type="button"
                onClick={exportarExcel}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700"
              >
                Exportar Excel
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl px-4 py-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">
                  Buscar alumno
                </label>
                <input
                  type="text"
                  value={busquedaAsistencia}
                  onChange={(e) => setBusquedaAsistencia(e.target.value)}
                  placeholder="Nombre, apellido o DNI..."
                  className="w-full border rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Filtrar estado
                </label>
                <select
                  value={filtroAsistencia}
                  onChange={(e) => setFiltroAsistencia(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2"
                >
                  <option value="todos">Todos</option>
                  <option value="presente">Presentes</option>
                  <option value="tardanza">Tardanzas</option>
                  <option value="falta">Faltas</option>
                  <option value="sin_registro">Sin registro</option>
                </select>
              </div>
            </div>
            Mostrando asistencia correspondiente a la fecha:{" "}
            <span className="font-semibold">{fechaAsistencia}</span>
          </div>

          {alumnosFiltradosAsistencia.length === 0 ? (
            <p className="text-gray-500">
              No se encontraron alumnos con ese filtro.
            </p>
          ) : (
            <div className="overflow-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left min-w-[1100px]">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-3 px-2">Foto</th>
                    <th className="py-3 px-2">Alumno</th>
                    <th className="py-3 px-2">DNI</th>
                    <th className="py-3 px-2">Presente</th>
                    <th className="py-3 px-2">Tardanza</th>
                    <th className="py-3 px-2">Falta</th>
                    <th className="py-3 px-2">Justificación</th>
                    <th className="py-3 px-2">Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosFiltradosAsistencia.map((a) => {
                    const key = a.idalumno || a.id;
                    const asistencia = asistenciaMap[key] || {};

                    return (
                      <tr key={key} className="border-b align-top">
                        <td className="py-3 px-2">
                          <div className="w-12 h-12 rounded-full overflow-hidden border bg-gray-50 flex items-center justify-center">
                            {a.foto_url ? (
                              <img
                                src={a.foto_url}
                                alt={a.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-gray-400">
                                Sin foto
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-2">
                          <div className="font-medium">
                            {a.nombre} {a.apellido}
                          </div>
                        </td>

                        <td className="py-3 px-2">{a.numdocumento || "-"}</td>

                        <td className="py-3 px-2">
                          <input
                            type="radio"
                            name={`asistencia-${key}`}
                            checked={asistencia.estado === "presente"}
                            onChange={() =>
                              actualizarEstadoAsistencia(key, "presente")
                            }
                          />
                        </td>

                        <td className="py-3 px-2">
                          <input
                            type="radio"
                            name={`asistencia-${key}`}
                            checked={asistencia.estado === "tardanza"}
                            onChange={() =>
                              actualizarEstadoAsistencia(key, "tardanza")
                            }
                          />
                        </td>

                        <td className="py-3 px-2">
                          <input
                            type="radio"
                            name={`asistencia-${key}`}
                            checked={asistencia.estado === "falta"}
                            onChange={() =>
                              actualizarEstadoAsistencia(key, "falta")
                            }
                          />
                        </td>

                        <td className="py-3 px-2">
                          {(asistencia.estado === "tardanza" ||
                            asistencia.estado === "falta") && (
                            <select
                              value={asistencia.tipo_justificacion || ""}
                              onChange={(e) =>
                                actualizarJustificacion(key, e.target.value)
                              }
                              className="border rounded px-2 py-1 text-sm"
                            >
                              <option value="">Seleccione</option>
                              <option value="justificada">Justificada</option>
                              <option value="injustificada">
                                Injustificada
                              </option>
                            </select>
                          )}
                        </td>

                        <td className="py-3 px-2">
                          <input
                            value={asistencia.observacion || ""}
                            onChange={(e) =>
                              actualizarObservacion(key, e.target.value)
                            }
                            className="border rounded px-2 py-1 text-sm w-full"
                            placeholder="Opcional"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={guardarAsistencia}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
            >
              Guardar asistencia
            </button>
          </div>
        </div>
      )}

      {tabActiva === "tareas" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Tareas del curso</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Crea tareas directamente para este curso y administra su
                  seguimiento.
                </p>
              </div>

              {permisos.gestionar_tareas && (
                <button
                  type="button"
                  onClick={() => setMostrarFormTarea((prev) => !prev)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                >
                  {mostrarFormTarea ? "Cancelar" : "Nueva tarea"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border bg-slate-50 p-4">
                <p className="text-sm text-gray-500">Total de tareas</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {tareas.length}
                </p>
              </div>

              <div className="rounded-2xl border bg-amber-50 p-4">
                <p className="text-sm text-amber-700">Pendientes</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {tareasPendientes}
                </p>
              </div>

              <div className="rounded-2xl border bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">Revisadas</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {tareasRevisadas}
                </p>
              </div>
            </div>

            {moduloDestinoTarea && (
              <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
                Creando tarea para el módulo:{" "}
                <span className="font-semibold">
                  {moduloDestinoTarea.titulo}
                </span>
              </div>
            )}

            {mostrarFormTarea && (
              <form
                onSubmit={guardarTareaCurso}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6"
              >
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">Título</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formTarea.titulo}
                    onChange={handleChangeTarea}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="Ej. Tarea semana 1"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="inline-flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="calificable"
                      checked={formTarea.calificable}
                      onChange={handleChangeTarea}
                      className="h-4 w-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        Tarea calificada
                      </p>
                      <p className="text-sm text-gray-500">
                        Si la marcas, esta tarea podrá usarse en el registro de
                        notas.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formTarea.descripcion}
                    onChange={handleChangeTarea}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 min-h-[120px]"
                    placeholder="Describe la actividad a realizar"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={formTarea.fechaInicio}
                    onChange={handleChangeTarea}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    name="fechaLimite"
                    value={formTarea.fechaLimite}
                    onChange={handleChangeTarea}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Tipo de entrega
                  </label>
                  <select
                    name="tipoEntrega"
                    value={formTarea.tipoEntrega}
                    onChange={handleChangeTarea}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    required
                  >
                    <option value="">Seleccione</option>
                    <option value="archivo">Archivo</option>
                    <option value="texto">Texto</option>
                    <option value="link">Link</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Material de apoyo
                  </label>
                  <select
                    name="tipoApoyo"
                    value={formTarea.tipoApoyo}
                    onChange={handleChangeTarea}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="ninguno">Ninguno</option>
                    <option value="texto">Texto</option>
                    <option value="archivo">Archivo</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                {formTarea.tipoApoyo === "texto" && (
                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-2">
                      Texto de apoyo
                    </label>
                    <textarea
                      name="textoApoyo"
                      value={formTarea.textoApoyo}
                      onChange={handleChangeTarea}
                      className="border rounded-xl px-3 py-2 w-full min-h-[100px]"
                      placeholder="Agrega instrucciones o contenido de apoyo"
                    />
                  </div>
                )}

                {formTarea.tipoApoyo === "archivo" && (
                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-2">
                      Archivo de apoyo
                    </label>
                    <input
                      type="file"
                      name="archivoApoyo"
                      onChange={handleFileChangeTarea}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                )}

                {formTarea.tipoApoyo === "video" && (
                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-2">
                      Video de apoyo
                    </label>
                    <input
                      type="file"
                      name="videoApoyo"
                      accept="video/*"
                      onChange={handleFileChangeTarea}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={guardandoTarea}
                    className="rounded-2xl bg-emerald-600 px-5 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 transition shadow-lg"
                  >
                    {guardandoTarea ? "Guardando..." : "Guardar tarea"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white/95 p-6 rounded-[24px] shadow-[0_18px_40px_-24px_rgba(15,23,42,0.25)] border border-slate-200/70">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Listado de tareas</h4>

              <button
                type="button"
                onClick={cargarTareasCurso}
                className="text-sm px-3 py-2 rounded-xl border hover:bg-gray-50"
              >
                Recargar
              </button>
            </div>

            {cargandoTareas ? (
              <p className="text-gray-500">Cargando tareas...</p>
            ) : tareas.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center">
                <p className="text-gray-700 font-medium">
                  No hay tareas registradas
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Crea la primera tarea de este curso desde el botón “Nueva
                  tarea”.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndTareas}
              >
                <SortableContext
                  items={tareasOrdenadas.map((t) => `tarea-${t.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {tareasOrdenadas.map((tarea) => {
                      const abierta = !!tareasAbiertas[tarea.id];
                      const estadoFecha = obtenerEstadoVencimiento(
                        tarea.fecha_limite,
                      );
                      const indicadorEvaluacion =
                        obtenerIndicadorEvaluacionTarea(tarea);

                      return (
                        <SortableTareaItem key={tarea.id} tarea={tarea}>
                          <div
                            className={`overflow-hidden rounded-2xl border shadow-sm transition ${
                              tarea.revisada
                                ? "border-emerald-200 bg-emerald-50/60"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <div
                              type="button"
                              onClick={() => {
                                if (abierta) {
                                  toggleTarea(tarea.id);
                                  cerrarDetalleTarea();
                                } else {
                                  toggleTarea(tarea.id);
                                  abrirDetalleTarea(tarea);
                                }
                              }}
                              className="w-full text-left px-4 pr-16 py-4 hover:bg-black/5 transition"
                            >
                              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h5 className="text-lg font-bold text-gray-800">
                                      {tarea.titulo}
                                    </h5>

                                    {tarea.revisada ? (
                                      <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1">
                                        Revisada
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1">
                                        Pendiente
                                      </span>
                                    )}

                                    {estadoFecha && (
                                      <span
                                        className={`inline-flex items-center rounded-full text-xs font-semibold px-3 py-1 ${estadoFecha.className}`}
                                      >
                                        {estadoFecha.label}
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                                    <span>
                                      <strong>Inicio:</strong>{" "}
                                      {formatearFecha(tarea.fecha_inicio)}
                                    </span>
                                    <span>
                                      <strong>Límite:</strong>{" "}
                                      {formatearFecha(tarea.fecha_limite)}
                                    </span>
                                  </div>

                                  {indicadorEvaluacion && (
                                    <div className="mt-3">
                                      <span
                                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${indicadorEvaluacion.clase}`}
                                      >
                                        {indicadorEvaluacion.texto}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  {tarea.calificable && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        abrirConfigTarea(tarea);
                                      }}
                                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
                                      title="Configurar nota de la tarea"
                                    >
                                      <Settings className="w-4 h-4" />
                                    </button>
                                  )}

                                  <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1">
                                    {tarea.tipo_entrega || "Sin tipo"}
                                  </span>

                                  <span className="text-lg text-gray-500">
                                    {abierta ? "▲" : "▼"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {abierta && (
                              <div className="border-t bg-white px-4 py-4 md:px-5 md:py-5 space-y-4">
                                <div>
                                  <p className="text-sm font-semibold text-gray-700 mb-2">
                                    Descripción
                                  </p>
                                  <div className="rounded-xl border bg-gray-50 p-3 text-sm text-gray-700">
                                    {tarea.descripcion || "Sin descripción"}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="rounded-xl border bg-gray-50 p-3">
                                    <p className="text-gray-500">
                                      Tipo de entrega
                                    </p>
                                    <p className="font-medium text-gray-800">
                                      {tarea.tipo_entrega || "-"}
                                    </p>
                                  </div>

                                  <div className="rounded-xl border bg-gray-50 p-3">
                                    <p className="text-gray-500">
                                      Tipo de apoyo
                                    </p>
                                    <p className="font-medium text-gray-800 capitalize">
                                      {tarea.tipo_apoyo || "ninguno"}
                                    </p>
                                  </div>
                                </div>

                                {(tarea.texto_apoyo ||
                                  tarea.archivo_apoyo_url ||
                                  tarea.video_apoyo_url) && (
                                  <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-2">
                                      Material de apoyo
                                    </p>

                                    {tarea.texto_apoyo && (
                                      <div className="rounded-xl border bg-gray-50 p-3 text-sm text-gray-700 mb-3 whitespace-pre-line">
                                        {tarea.texto_apoyo}
                                      </div>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                      {tarea.archivo_apoyo_url && (
                                        <a
                                          href={tarea.archivo_apoyo_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                        >
                                          Ver archivo de apoyo
                                        </a>
                                      )}

                                      {tarea.video_apoyo_url && (
                                        <a
                                          href={tarea.video_apoyo_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                        >
                                          Ver video de apoyo
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {tarea.calificable && (
                                  <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-4">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                      <div>
                                        <p className="text-sm font-semibold text-violet-800">
                                          Configuración de nota de la tarea
                                        </p>
                                        <p className="text-xs text-violet-700 mt-1">
                                          Vincula esta tarea con una evaluación
                                          del tipo tarea.
                                        </p>
                                      </div>

                                      {indicadorEvaluacion && (
                                        <div className="mt-3">
                                          <span
                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${indicadorEvaluacion.clase}`}
                                          >
                                            {indicadorEvaluacion.texto}
                                          </span>
                                        </div>
                                      )}

                                      {permisos.gestionar_calificaciones &&
                                        tarea.calificable && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              abrirConfigTarea(tarea);
                                            }}
                                            className="..."
                                          >
                                            <Settings className="w-4 h-4" />
                                          </button>
                                        )}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <p className="text-sm font-semibold text-gray-700 mb-2">
                                    Entregas de alumnos
                                  </p>

                                  {cargandoDetalleTarea &&
                                  tareaDetalle?.id === tarea.id ? (
                                    <p className="text-sm text-gray-500">
                                      Cargando entregas...
                                    </p>
                                  ) : tareaDetalle?.id === tarea.id ? (
                                    entregasTarea.length === 0 ? (
                                      <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                                        No hay alumnos ni entregas registradas
                                        para esta tarea.
                                      </div>
                                    ) : (
                                      <div className="overflow-auto rounded-2xl border border-gray-200">
                                        <table className="w-full min-w-[900px] text-sm">
                                          <thead className="bg-gray-50">
                                            <tr className="border-b">
                                              <th className="px-3 py-3 text-left">
                                                Alumno
                                              </th>
                                              <th className="px-3 py-3 text-left">
                                                Fecha
                                              </th>
                                              <th className="px-3 py-3 text-left">
                                                Hora
                                              </th>
                                              <th className="px-3 py-3 text-left">
                                                Entrega
                                              </th>
                                              <th className="px-3 py-3 text-left">
                                                Nota
                                              </th>
                                              <th className="px-3 py-3 text-left">
                                                Acción
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {entregasTarea.map((fila) => {
                                              const fechaEntrega =
                                                fila.fecha_entrega
                                                  ? new Date(fila.fecha_entrega)
                                                  : null;

                                              return (
                                                <tr
                                                  key={fila.idmatricula}
                                                  className="border-b align-middle"
                                                >
                                                  <td className="px-3 py-3">
                                                    <div className="font-medium text-gray-800">
                                                      {fila.nombre}{" "}
                                                      {fila.apellido}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                      DNI:{" "}
                                                      {fila.numdocumento || "-"}
                                                    </div>
                                                  </td>

                                                  <td className="px-3 py-3">
                                                    {fechaEntrega
                                                      ? fechaEntrega.toLocaleDateString(
                                                          "es-PE",
                                                        )
                                                      : "—"}
                                                  </td>

                                                  <td className="px-3 py-3">
                                                    {fechaEntrega
                                                      ? fechaEntrega.toLocaleTimeString(
                                                          "es-PE",
                                                          {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                          },
                                                        )
                                                      : "—"}
                                                  </td>

                                                  <td className="px-3 py-3">
                                                    {fila.entrego ? (
                                                      <div className="flex flex-wrap gap-2">
                                                        {fila.archivo_url && (
                                                          <a
                                                            href={
                                                              fila.archivo_url
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                                                          >
                                                            Ver archivo
                                                          </a>
                                                        )}

                                                        {fila.comentario && (
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              setEntregaSeleccionada(
                                                                {
                                                                  alumno: `${fila.nombre} ${fila.apellido}`,
                                                                  contenido:
                                                                    fila.comentario,
                                                                  tipo: "texto",
                                                                },
                                                              );
                                                              setModalEntregaOpen(
                                                                true,
                                                              );
                                                            }}
                                                            className="inline-flex items-center rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100"
                                                          >
                                                            Ver texto
                                                          </button>
                                                        )}

                                                        {fila.enlace_url && (
                                                          <a
                                                            href={
                                                              fila.enlace_url
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                                                          >
                                                            Abrir enlace
                                                          </a>
                                                        )}

                                                        {!fila.archivo_url &&
                                                          !fila.comentario &&
                                                          !fila.enlace_url && (
                                                            <span className="inline-flex rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-semibold">
                                                              Entregado
                                                            </span>
                                                          )}
                                                      </div>
                                                    ) : (
                                                      <span className="inline-flex rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-semibold">
                                                        No entregó
                                                      </span>
                                                    )}
                                                  </td>

                                                  <td className="px-3 py-3">
                                                    <input
                                                      type="number"
                                                      min="0"
                                                      max="20"
                                                      step="0.01"
                                                      value={fila.nota ?? ""}
                                                      onChange={(e) =>
                                                        actualizarNotaLocalEntrega(
                                                          fila.idmatricula,
                                                          e.target.value,
                                                        )
                                                      }
                                                      className="w-24 rounded-xl border px-3 py-2"
                                                      placeholder="0-20"
                                                    />
                                                  </td>

                                                  <td className="px-3 py-3">
                                                    <button
                                                      type="button"
                                                      disabled={
                                                        !!guardandoNotaEntrega[
                                                          fila.idmatricula
                                                        ]
                                                      }
                                                      onClick={() =>
                                                        guardarNotaEntrega(fila)
                                                      }
                                                      className="rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
                                                    >
                                                      {guardandoNotaEntrega[
                                                        fila.idmatricula
                                                      ]
                                                        ? "Guardando..."
                                                        : "Guardar"}
                                                    </button>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    )
                                  ) : (
                                    <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                                      Abre esta tarea para cargar entregas y
                                      calificaciones.
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-wrap justify-end gap-2 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => cambiarEstadoRevision(tarea)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium ${
                                      tarea.revisada
                                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    }`}
                                  >
                                    {tarea.revisada
                                      ? "Marcar como pendiente"
                                      : "Marcar como revisada"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => eliminarTareaCurso(tarea.id)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </SortableTareaItem>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}

      {tabActiva === "modulos" && (
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 md:p-7 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)]">
            <div className="mb-6 rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-5 md:p-6">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold tracking-wide">
                      Estructura académica
                    </span>
                    <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold">
                      {modulos.length} módulo{modulos.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                    Módulos del curso
                  </h3>

                  <p className="text-sm md:text-base text-slate-500 mt-2">
                    Organiza el curso por módulos, submódulos, lecciones y
                    materiales en una vista más clara, moderna y profesional.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={cargarModulosCurso}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Recargar
                  </button>

                  {permisos.gestionar_contenido && (
                    <button
                      type="button"
                      onClick={() => setMostrarFormModulo((prev) => !prev)}
                      className="rounded-2xl bg-slate-900 text-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 transition shadow-lg"
                    >
                      {mostrarFormModulo ? "Cancelar" : "+ Crear módulo"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {mostrarFormModulo && (
              <form
                onSubmit={guardarModuloCurso}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 md:p-6 mb-6"
              >
                <div>
                  <label className="block font-semibold mb-2">
                    Título del módulo
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formModulo.titulo}
                    onChange={handleChangeModulo}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="Ej. Módulo 1 - Introducción"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    name="descripcion"
                    value={formModulo.descripcion}
                    onChange={handleChangeModulo}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="Descripción breve del módulo"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={guardandoModulo}
                    className="rounded-2xl bg-emerald-600 px-5 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 transition shadow-lg"
                  >
                    {guardandoModulo ? "Guardando..." : "Guardar módulo"}
                  </button>
                </div>
              </form>
            )}

            {cargandoModulos ? (
              <p className="text-gray-500">Cargando módulos...</p>
            ) : modulos.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-gradient-to-br from-white to-slate-50 p-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white text-2xl shadow-lg">
                  📚
                </div>
                <p className="text-lg font-bold text-slate-800">
                  No hay módulos registrados
                </p>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  Crea el primer módulo para comenzar a estructurar el curso con
                  submódulos, lecciones y materiales.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndModulos}
              >
                <SortableContext
                  items={modulosOrdenados.map((m) => String(m.id))}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-5">
                    {modulosOrdenados.map((modulo, index) => {
                      const abierto = !!mostrarLecciones[modulo.id];
                      const tareasDelModulo = tareas.filter(
                        (t) => Number(t.idmodulo) === Number(modulo.id),
                      );

                      return (
                        <SortableModuloItem key={modulo.id} modulo={modulo}>
                          <div className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.22)] transition hover:shadow-[0_24px_50px_-24px_rgba(15,23,42,0.30)]">
                            <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-blue-600 via-violet-500 to-cyan-400" />
                            <div className="px-5 md:px-6 py-5 bg-gradient-to-r from-slate-50 via-white to-blue-50/70 border-b border-slate-200">
                              <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center rounded-full bg-blue-600 text-white text-xs font-bold px-3 py-1.5 shadow-sm">
                                      Módulo {index + 1}
                                    </span>

                                    <h4 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                                      {modulo.titulo}
                                    </h4>
                                  </div>

                                  {modulo.descripcion && (
                                    <p className="text-sm md:text-base text-slate-500 mt-3 max-w-3xl">
                                      {modulo.descripcion}
                                    </p>
                                  )}

                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-semibold">
                                      {modulo.submodulos?.length || 0} submódulo
                                      {(modulo.submodulos?.length || 0) === 1
                                        ? ""
                                        : "s"}
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-violet-100 text-violet-700 px-3 py-1 text-xs font-semibold">
                                      {tareasDelModulo.length} tarea
                                      {tareasDelModulo.length === 1 ? "" : "s"}
                                    </span>
                                  </div>

                                  {tareasDelModulo.length > 0 && (
                                    <div className="mt-5">
                                      <p className="text-sm font-semibold text-slate-600 mb-3">
                                        Tareas vinculadas al módulo
                                      </p>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {tareasDelModulo.map((tarea) => (
                                          <div
                                            key={tarea.id}
                                            className="rounded-2xl border border-violet-200 bg-gradient-to-br from-white to-violet-50 p-4"
                                          >
                                            <div className="flex items-start justify-between gap-3">
                                              <div>
                                                <div className="font-semibold text-slate-800">
                                                  {tarea.titulo}
                                                </div>
                                                <div className="text-slate-500 text-xs mt-1">
                                                  Límite:{" "}
                                                  {formatearFecha(
                                                    tarea.fecha_limite,
                                                  )}
                                                </div>
                                              </div>

                                              <span className="inline-flex rounded-full bg-violet-100 text-violet-700 px-3 py-1 text-[11px] font-semibold">
                                                {tarea.tipo_entrega || "Tarea"}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleFormSubModulo(modulo.id)
                                    }
                                    className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm"
                                  >
                                    + Submódulo
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirFormTareaDesdeModulo(modulo)
                                    }
                                    className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition shadow-sm"
                                  >
                                    + Tarea
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleLeccionesModulo(modulo.id)
                                    }
                                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                                  >
                                    {abierto ? "Ocultar" : "Ver contenido"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => iniciarEdicionModulo(modulo)}
                                    className="inline-flex items-center justify-center rounded-2xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition"
                                  >
                                    Editar
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      eliminarModuloCurso(modulo.id)
                                    }
                                    className="inline-flex items-center justify-center rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>

                              {mostrarFormSubModulo[modulo.id] && (
                                <form
                                  onSubmit={(e) =>
                                    guardarSubModuloCurso(e, modulo.id)
                                  }
                                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 border-t pt-5"
                                >
                                  <div>
                                    <label className="block font-semibold mb-2">
                                      Título del submódulo
                                    </label>
                                    <input
                                      type="text"
                                      name="titulo"
                                      value={
                                        formSubModulo[modulo.id]?.titulo || ""
                                      }
                                      onChange={(e) =>
                                        handleChangeSubModulo(modulo.id, e)
                                      }
                                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                      placeholder="Ej. Submódulo 1.1"
                                    />
                                  </div>

                                  <div>
                                    <label className="block font-semibold mb-2">
                                      Descripción
                                    </label>
                                    <input
                                      type="text"
                                      name="descripcion"
                                      value={
                                        formSubModulo[modulo.id]?.descripcion ||
                                        ""
                                      }
                                      onChange={(e) =>
                                        handleChangeSubModulo(modulo.id, e)
                                      }
                                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                      placeholder="Descripción breve"
                                    />
                                  </div>

                                  <div className="md:col-span-2 flex justify-end">
                                    <button
                                      type="submit"
                                      disabled={guardandoSubModulo}
                                      className="rounded-2xl bg-emerald-600 px-5 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 transition shadow-lg"
                                    >
                                      {guardandoSubModulo
                                        ? "Guardando..."
                                        : "Guardar submódulo"}
                                    </button>
                                  </div>
                                </form>
                              )}

                              {editandoModuloId === modulo.id && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 border-t pt-5">
                                  <div>
                                    <label className="block font-semibold mb-2">
                                      Editar título
                                    </label>
                                    <input
                                      type="text"
                                      value={formEditarModulo.titulo}
                                      onChange={(e) =>
                                        setFormEditarModulo((prev) => ({
                                          ...prev,
                                          titulo: e.target.value,
                                        }))
                                      }
                                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                    />
                                  </div>

                                  <div>
                                    <label className="block font-semibold mb-2">
                                      Editar descripción
                                    </label>
                                    <input
                                      type="text"
                                      value={formEditarModulo.descripcion}
                                      onChange={(e) =>
                                        setFormEditarModulo((prev) => ({
                                          ...prev,
                                          descripcion: e.target.value,
                                        }))
                                      }
                                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                    />
                                  </div>

                                  <div className="md:col-span-2 flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={cancelarEdicionModulo}
                                      className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                                    >
                                      Cancelar
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        guardarEdicionModulo(modulo.id)
                                      }
                                      className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
                                    >
                                      Guardar cambios
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {abierto && (
                              <div className="p-5 space-y-4">
                                {modulo.submodulos?.length === 0 ? (
                                  <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-center">
                                    <p className="text-gray-700 font-medium">
                                      Este módulo no tiene submódulos
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                      Agrega el primer submódulo para empezar a
                                      organizar sesiones y materiales.
                                    </p>
                                  </div>
                                ) : (
                                  <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={(event) =>
                                      handleDragEndSubmodulos(event, modulo)
                                    }
                                  >
                                    <SortableContext
                                      items={(modulo.submodulos || []).map(
                                        (s) => `submodulo-${s.id}`,
                                      )}
                                      strategy={verticalListSortingStrategy}
                                    >
                                      {(modulo.submodulos || []).map(
                                        (submodulo, idxSub) => (
                                          <SortableSubModuloItem
                                            key={submodulo.id}
                                            submodulo={submodulo}
                                          >
                                            <div className="relative ml-0 md:ml-6 rounded-[24px] border border-slate-200 bg-slate-50/80 overflow-hidden">
                                              <div className="px-4 md:px-5 py-4 bg-white border-b border-slate-200">
                                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pr-16">
                                                  <div>
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                      <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5">
                                                        Submódulo {index + 1}.
                                                        {idxSub + 1}
                                                      </span>

                                                      <h5 className="text-lg font-bold text-slate-800">
                                                        {submodulo.titulo}
                                                      </h5>
                                                    </div>

                                                    {submodulo.descripcion && (
                                                      <p className="text-sm text-slate-500 mt-2">
                                                        {submodulo.descripcion}
                                                      </p>
                                                    )}
                                                  </div>

                                                  <div className="flex flex-wrap gap-2">
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        toggleFormLeccion(
                                                          submodulo.id,
                                                        )
                                                      }
                                                      className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm"
                                                    >
                                                      + Lección
                                                    </button>

                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        iniciarEdicionModulo(
                                                          submodulo,
                                                        )
                                                      }
                                                      className="inline-flex items-center justify-center rounded-2xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition"
                                                    >
                                                      Editar
                                                    </button>

                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        eliminarModuloCurso(
                                                          submodulo.id,
                                                        )
                                                      }
                                                      className="inline-flex items-center justify-center rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
                                                    >
                                                      Eliminar
                                                    </button>
                                                  </div>
                                                </div>

                                                {mostrarFormLeccion[
                                                  submodulo.id
                                                ] && (
                                                  <form
                                                    onSubmit={(e) =>
                                                      guardarLeccionCurso(
                                                        e,
                                                        submodulo.id,
                                                      )
                                                    }
                                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 border-t pt-5"
                                                  >
                                                    <div>
                                                      <label className="block font-semibold mb-2">
                                                        Título de la lección
                                                      </label>
                                                      <input
                                                        type="text"
                                                        name="titulo"
                                                        value={
                                                          formLeccion[
                                                            submodulo.id
                                                          ]?.titulo || ""
                                                        }
                                                        onChange={(e) =>
                                                          handleChangeLeccion(
                                                            submodulo.id,
                                                            e,
                                                          )
                                                        }
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                                        placeholder="Ej. Lección 1 - Introducción"
                                                      />
                                                    </div>

                                                    <div>
                                                      <label className="block font-semibold mb-2">
                                                        Descripción
                                                      </label>
                                                      <input
                                                        type="text"
                                                        name="descripcion"
                                                        value={
                                                          formLeccion[
                                                            submodulo.id
                                                          ]?.descripcion || ""
                                                        }
                                                        onChange={(e) =>
                                                          handleChangeLeccion(
                                                            submodulo.id,
                                                            e,
                                                          )
                                                        }
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                                        placeholder="Descripción breve"
                                                      />
                                                    </div>

                                                    <div className="md:col-span-2 flex justify-end">
                                                      <button
                                                        type="submit"
                                                        disabled={
                                                          guardandoLeccion
                                                        }
                                                        className="rounded-2xl bg-emerald-600 px-5 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 transition shadow-lg"
                                                      >
                                                        {guardandoLeccion
                                                          ? "Guardando..."
                                                          : "Guardar lección"}
                                                      </button>
                                                    </div>
                                                  </form>
                                                )}
                                              </div>

                                              <div className="p-4 space-y-4">
                                                {submodulo.lecciones?.length ===
                                                0 ? (
                                                  <p className="text-sm text-gray-500">
                                                    Este submódulo no tiene
                                                    lecciones.
                                                  </p>
                                                ) : (
                                                  <DndContext
                                                    sensors={sensors}
                                                    collisionDetection={
                                                      closestCenter
                                                    }
                                                    onDragEnd={(event) =>
                                                      handleDragEndLecciones(
                                                        event,
                                                        modulo.id,
                                                        submodulo,
                                                      )
                                                    }
                                                  >
                                                    <SortableContext
                                                      items={(
                                                        submodulo.lecciones ||
                                                        []
                                                      ).map(
                                                        (l) =>
                                                          `leccion-${l.id}`,
                                                      )}
                                                      strategy={
                                                        verticalListSortingStrategy
                                                      }
                                                    >
                                                      {(
                                                        submodulo.lecciones ||
                                                        []
                                                      ).map(
                                                        (
                                                          leccion,
                                                          idxLeccion,
                                                        ) => {
                                                          const abiertaMateriales =
                                                            !!mostrarMateriales[
                                                              leccion.id
                                                            ];
                                                          const formMat =
                                                            formMaterial[
                                                              leccion.id
                                                            ] || {
                                                              titulo: "",
                                                              tipo: "texto",
                                                              contenido_texto:
                                                                "",
                                                              video_url: "",
                                                              enlace_url: "",
                                                              file: null,
                                                            };

                                                          return (
                                                            <SortableLeccionItem
                                                              key={leccion.id}
                                                              leccion={leccion}
                                                            >
                                                              <div className="relative ml-0 md:ml-8 rounded-[20px] border border-white bg-white overflow-hidden shadow-sm">
                                                                <div className="px-4 py-4 bg-white">
                                                                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pr-16">
                                                                    <div>
                                                                      <div className="flex items-center gap-3 flex-wrap">
                                                                        <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5">
                                                                          Lección{" "}
                                                                          {index +
                                                                            1}
                                                                          .
                                                                          {idxSub +
                                                                            1}
                                                                          .
                                                                          {idxLeccion +
                                                                            1}
                                                                        </span>

                                                                        <h5 className="text-lg font-bold text-slate-800">
                                                                          {
                                                                            leccion.titulo
                                                                          }
                                                                        </h5>
                                                                      </div>

                                                                      {leccion.descripcion && (
                                                                        <p className="text-sm text-slate-500 mt-2">
                                                                          {
                                                                            leccion.descripcion
                                                                          }
                                                                        </p>
                                                                      )}
                                                                    </div>

                                                                    <div className="flex flex-wrap gap-2">
                                                                      <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                          toggleFormMaterial(
                                                                            leccion.id,
                                                                          )
                                                                        }
                                                                        className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
                                                                      >
                                                                        +
                                                                        Material
                                                                      </button>

                                                                      <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                          toggleFormExamen(
                                                                            leccion.id,
                                                                          )
                                                                        }
                                                                        disabled={
                                                                          !!examenEditandoId &&
                                                                          Number(
                                                                            leccionExamenEditandoId,
                                                                          ) !==
                                                                            Number(
                                                                              leccion.id,
                                                                            )
                                                                        }
                                                                        className="px-3 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 text-sm disabled:opacity-50"
                                                                      >
                                                                        {mostrarFormExamen[
                                                                          leccion
                                                                            .id
                                                                        ]
                                                                          ? "Cerrar examen"
                                                                          : "+ Examen"}
                                                                      </button>

                                                                      <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                          toggleMaterialesLeccion(
                                                                            leccion.id,
                                                                          )
                                                                        }
                                                                        className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                                                      >
                                                                        {abiertaMateriales
                                                                          ? "Ocultar materiales"
                                                                          : "Ver materiales"}
                                                                      </button>

                                                                      <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                          iniciarEdicionLeccion(
                                                                            leccion,
                                                                          )
                                                                        }
                                                                        className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                                                      >
                                                                        Editar
                                                                      </button>

                                                                      <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                          eliminarLeccionCurso(
                                                                            leccion.id,
                                                                          )
                                                                        }
                                                                        className="px-3 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                                                                      >
                                                                        Eliminar
                                                                      </button>
                                                                    </div>
                                                                  </div>

                                                                  {leccion
                                                                    .examenes
                                                                    ?.length >
                                                                    0 && (
                                                                    <div className="mt-4 space-y-3">
                                                                      <p className="text-sm font-semibold text-slate-700">
                                                                        Exámenes
                                                                        de la
                                                                        lección
                                                                      </p>

                                                                      {leccion.examenes
                                                                        .filter(
                                                                          (
                                                                            examen,
                                                                          ) => {
                                                                            if (
                                                                              examenEditandoId &&
                                                                              Number(
                                                                                leccionExamenEditandoId,
                                                                              ) ===
                                                                                Number(
                                                                                  leccion.id,
                                                                                )
                                                                            ) {
                                                                              return (
                                                                                Number(
                                                                                  examen.id,
                                                                                ) ===
                                                                                Number(
                                                                                  examenEditandoId,
                                                                                )
                                                                              );
                                                                            }
                                                                            return true;
                                                                          },
                                                                        )
                                                                        .map(
                                                                          (
                                                                            examen,
                                                                            idxExamen,
                                                                          ) => (
                                                                            <div
                                                                              key={
                                                                                examen.id
                                                                              }
                                                                              className={`rounded-2xl border p-4 ${
                                                                                Number(
                                                                                  examen.id,
                                                                                ) ===
                                                                                Number(
                                                                                  examenEditandoId,
                                                                                )
                                                                                  ? "border-amber-300 bg-amber-50"
                                                                                  : "border-violet-200 bg-violet-50"
                                                                              }`}
                                                                            >
                                                                              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                                                <div>
                                                                                  <div className="flex flex-wrap items-center gap-2">
                                                                                    <span className="inline-flex rounded-full bg-violet-100 text-violet-700 px-3 py-1 text-xs font-semibold">
                                                                                      Examen{" "}
                                                                                      {idxExamen +
                                                                                        1}
                                                                                    </span>

                                                                                    <h6 className="font-bold text-slate-800">
                                                                                      {
                                                                                        examen.titulo
                                                                                      }
                                                                                    </h6>

                                                                                    {Number(
                                                                                      examen.id,
                                                                                    ) ===
                                                                                      Number(
                                                                                        examenEditandoId,
                                                                                      ) && (
                                                                                      <span className="inline-flex rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold">
                                                                                        Editando
                                                                                        ahora
                                                                                      </span>
                                                                                    )}
                                                                                  </div>

                                                                                  {examen.descripcion && (
                                                                                    <p className="text-sm text-slate-500 mt-2">
                                                                                      {
                                                                                        examen.descripcion
                                                                                      }
                                                                                    </p>
                                                                                  )}

                                                                                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                                                    <span className="inline-flex rounded-full bg-white border px-3 py-1 text-slate-700">
                                                                                      {examen.total_preguntas ||
                                                                                        0}{" "}
                                                                                      preguntas
                                                                                    </span>
                                                                                    <span className="inline-flex rounded-full bg-white border px-3 py-1 text-slate-700">
                                                                                      {examen.duracion_minutos ||
                                                                                        30}{" "}
                                                                                      min
                                                                                    </span>
                                                                                    <span className="inline-flex rounded-full bg-white border px-3 py-1 text-slate-700">
                                                                                      {examen.intentos_permitidos ||
                                                                                        1}{" "}
                                                                                      intento(s)
                                                                                    </span>
                                                                                    <span
                                                                                      className={`inline-flex rounded-full border px-3 py-1 ${
                                                                                        examen.evaluacion_nombre
                                                                                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                                          : "border-amber-200 bg-amber-50 text-amber-700"
                                                                                      }`}
                                                                                    >
                                                                                      {examen.evaluacion_nombre
                                                                                        ? `Evaluación asignada: ${examen.evaluacion_nombre}`
                                                                                        : "Sin evaluación asignada"}
                                                                                    </span>
                                                                                  </div>
                                                                                </div>

                                                                                <div className="flex flex-wrap gap-2">
                                                                                  <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                      abrirConfigExamen(
                                                                                        examen,
                                                                                      )
                                                                                    }
                                                                                    className="rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                                                                                  >
                                                                                    Configurar
                                                                                    nota
                                                                                  </button>

                                                                                  <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                      cargarExamenParaEdicion(
                                                                                        examen,
                                                                                        leccion.id,
                                                                                      )
                                                                                    }
                                                                                    disabled={
                                                                                      guardandoExamen
                                                                                    }
                                                                                    className="rounded-2xl bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-200 disabled:opacity-60"
                                                                                  >
                                                                                    {Number(
                                                                                      examen.id,
                                                                                    ) ===
                                                                                    Number(
                                                                                      examenEditandoId,
                                                                                    )
                                                                                      ? "Editando..."
                                                                                      : "Editar examen"}
                                                                                  </button>

                                                                                  <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                      eliminarExamenLeccion(
                                                                                        examen.id,
                                                                                      )
                                                                                    }
                                                                                    className="rounded-2xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
                                                                                  >
                                                                                    Eliminar
                                                                                  </button>
                                                                                </div>
                                                                              </div>
                                                                            </div>
                                                                          ),
                                                                        )}
                                                                    </div>
                                                                  )}

                                                                  {mostrarFormExamen[
                                                                    leccion.id
                                                                  ] && (
                                                                    <form
                                                                      onSubmit={(
                                                                        e,
                                                                      ) =>
                                                                        guardarExamenLeccion(
                                                                          e,
                                                                          leccion.id,
                                                                        )
                                                                      }
                                                                      className="mt-5 border-t pt-5 space-y-5"
                                                                    >
                                                                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                                                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                                          <div>
                                                                            <p className="text-sm font-semibold text-amber-800">
                                                                              {examenEditandoId
                                                                                ? `Editando examen: ${formExamen[leccion.id]?.titulo || "Sin título"}`
                                                                                : "Creando nuevo examen"}
                                                                            </p>
                                                                            <p className="text-xs text-amber-700 mt-1">
                                                                              {examenEditandoId
                                                                                ? "Mientras editas este examen, los demás exámenes de la lección se ocultan para evitar confusión."
                                                                                : "Define la configuración general y luego agrega las preguntas."}
                                                                            </p>
                                                                          </div>

                                                                          <div className="flex flex-wrap gap-2">
                                                                            <button
                                                                              type="button"
                                                                              onClick={() =>
                                                                                cancelarEdicionExamen(
                                                                                  leccion.id,
                                                                                )
                                                                              }
                                                                              className="rounded-2xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                                                                            >
                                                                              Cancelar
                                                                            </button>
                                                                          </div>
                                                                        </div>
                                                                      </div>

                                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div>
                                                                          <label className="block font-semibold mb-2">
                                                                            Título
                                                                            del
                                                                            examen
                                                                          </label>
                                                                          <input
                                                                            type="text"
                                                                            value={
                                                                              formExamen[
                                                                                leccion
                                                                                  .id
                                                                              ]
                                                                                ?.titulo ||
                                                                              ""
                                                                            }
                                                                            onChange={(
                                                                              e,
                                                                            ) =>
                                                                              handleChangeExamen(
                                                                                leccion.id,
                                                                                "titulo",
                                                                                e
                                                                                  .target
                                                                                  .value,
                                                                              )
                                                                            }
                                                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                                                            placeholder="Ej. Examen parcial"
                                                                          />
                                                                        </div>

                                                                        <div>
                                                                          <label className="block font-semibold mb-2">
                                                                            Descripción
                                                                          </label>
                                                                          <input
                                                                            type="text"
                                                                            value={
                                                                              formExamen[
                                                                                leccion
                                                                                  .id
                                                                              ]
                                                                                ?.descripcion ||
                                                                              ""
                                                                            }
                                                                            onChange={(
                                                                              e,
                                                                            ) =>
                                                                              handleChangeExamen(
                                                                                leccion.id,
                                                                                "descripcion",
                                                                                e
                                                                                  .target
                                                                                  .value,
                                                                              )
                                                                            }
                                                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                                                            placeholder="Descripción breve"
                                                                          />
                                                                        </div>

                                                                        <div>
                                                                          <label className="block font-semibold mb-2">
                                                                            Duración
                                                                            (minutos)
                                                                          </label>
                                                                          <input
                                                                            type="number"
                                                                            min="1"
                                                                            value={
                                                                              formExamen[
                                                                                leccion
                                                                                  .id
                                                                              ]
                                                                                ?.duracion_minutos ||
                                                                              30
                                                                            }
                                                                            onChange={(
                                                                              e,
                                                                            ) =>
                                                                              handleChangeExamen(
                                                                                leccion.id,
                                                                                "duracion_minutos",
                                                                                e
                                                                                  .target
                                                                                  .value,
                                                                              )
                                                                            }
                                                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                                                          />
                                                                        </div>

                                                                        <div>
                                                                          <label className="block font-semibold mb-2">
                                                                            Intentos
                                                                            permitidos
                                                                          </label>
                                                                          <input
                                                                            type="number"
                                                                            min="1"
                                                                            value={
                                                                              formExamen[
                                                                                leccion
                                                                                  .id
                                                                              ]
                                                                                ?.intentos_permitidos ||
                                                                              1
                                                                            }
                                                                            onChange={(
                                                                              e,
                                                                            ) =>
                                                                              handleChangeExamen(
                                                                                leccion.id,
                                                                                "intentos_permitidos",
                                                                                e
                                                                                  .target
                                                                                  .value,
                                                                              )
                                                                            }
                                                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                                                          />
                                                                        </div>
                                                                      </div>

                                                                      <div className="space-y-4">
                                                                        {(
                                                                          formExamen[
                                                                            leccion
                                                                              .id
                                                                          ]
                                                                            ?.preguntas ||
                                                                          []
                                                                        ).map(
                                                                          (
                                                                            pregunta,
                                                                            preguntaIndex,
                                                                          ) => (
                                                                            <div
                                                                              key={
                                                                                preguntaIndex
                                                                              }
                                                                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4"
                                                                            >
                                                                              <div className="flex items-center justify-between gap-3">
                                                                                <h6 className="font-bold text-slate-800">
                                                                                  Pregunta{" "}
                                                                                  {preguntaIndex +
                                                                                    1}
                                                                                </h6>

                                                                                <button
                                                                                  type="button"
                                                                                  onClick={() =>
                                                                                    eliminarPreguntaExamen(
                                                                                      leccion.id,
                                                                                      preguntaIndex,
                                                                                    )
                                                                                  }
                                                                                  className="rounded-xl bg-red-100 text-red-700 px-3 py-2 text-sm hover:bg-red-200"
                                                                                >
                                                                                  Eliminar
                                                                                </button>
                                                                              </div>

                                                                              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                                                                <div className="md:col-span-3">
                                                                                  <label className="block font-semibold mb-2">
                                                                                    Enunciado
                                                                                  </label>
                                                                                  <input
                                                                                    type="text"
                                                                                    value={
                                                                                      pregunta.enunciado ||
                                                                                      ""
                                                                                    }
                                                                                    onChange={(
                                                                                      e,
                                                                                    ) =>
                                                                                      handleChangePreguntaExamen(
                                                                                        leccion.id,
                                                                                        preguntaIndex,
                                                                                        "enunciado",
                                                                                        e
                                                                                          .target
                                                                                          .value,
                                                                                      )
                                                                                    }
                                                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                                                                    placeholder="Escribe la pregunta"
                                                                                  />
                                                                                </div>

                                                                                <div>
                                                                                  <label className="block font-semibold mb-2">
                                                                                    Puntaje
                                                                                  </label>
                                                                                  <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    step="0.01"
                                                                                    value={
                                                                                      pregunta.puntaje ||
                                                                                      1
                                                                                    }
                                                                                    onChange={(
                                                                                      e,
                                                                                    ) =>
                                                                                      handleChangePreguntaExamen(
                                                                                        leccion.id,
                                                                                        preguntaIndex,
                                                                                        "puntaje",
                                                                                        e
                                                                                          .target
                                                                                          .value,
                                                                                      )
                                                                                    }
                                                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                                                                  />
                                                                                </div>

                                                                                <div className="md:col-span-2">
                                                                                  <label className="block font-semibold mb-2">
                                                                                    Tipo
                                                                                    de
                                                                                    pregunta
                                                                                  </label>
                                                                                  <select
                                                                                    value={
                                                                                      pregunta.tipo_pregunta ||
                                                                                      "unica"
                                                                                    }
                                                                                    onChange={(
                                                                                      e,
                                                                                    ) =>
                                                                                      handleChangePreguntaExamen(
                                                                                        leccion.id,
                                                                                        preguntaIndex,
                                                                                        "tipo_pregunta",
                                                                                        e
                                                                                          .target
                                                                                          .value,
                                                                                      )
                                                                                    }
                                                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                                                                  >
                                                                                    <option value="unica">
                                                                                      Marcar
                                                                                      una
                                                                                      sola
                                                                                      opción
                                                                                    </option>
                                                                                    <option value="multiple">
                                                                                      Marcar
                                                                                      varias
                                                                                      opciones
                                                                                    </option>
                                                                                    <option value="texto_corto">
                                                                                      Texto
                                                                                      corto
                                                                                    </option>
                                                                                    <option value="texto_largo">
                                                                                      Texto
                                                                                      largo
                                                                                    </option>
                                                                                    <option value="numerica">
                                                                                      Respuesta
                                                                                      numérica
                                                                                    </option>
                                                                                    <option value="archivo">
                                                                                      Subir
                                                                                      archivo
                                                                                    </option>
                                                                                  </select>
                                                                                </div>
                                                                              </div>

                                                                              {TIPOS_PREGUNTA_TEXTO.includes(
                                                                                pregunta.tipo_pregunta,
                                                                              ) && (
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                  <div>
                                                                                    <label className="block font-semibold mb-2">
                                                                                      Respuesta
                                                                                      de
                                                                                      referencia
                                                                                    </label>
                                                                                    <textarea
                                                                                      value={
                                                                                        pregunta.respuesta_texto ||
                                                                                        ""
                                                                                      }
                                                                                      maxLength={
                                                                                        pregunta.tipo_pregunta ===
                                                                                        "texto_corto"
                                                                                          ? 50
                                                                                          : 200
                                                                                      }
                                                                                      onChange={(
                                                                                        e,
                                                                                      ) =>
                                                                                        handleChangePreguntaExamen(
                                                                                          leccion.id,
                                                                                          preguntaIndex,
                                                                                          "respuesta_texto",
                                                                                          e
                                                                                            .target
                                                                                            .value,
                                                                                        )
                                                                                      }
                                                                                      className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                                                                      placeholder="Escribe la respuesta esperada"
                                                                                    />
                                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                                      Máximo{" "}
                                                                                      {pregunta.tipo_pregunta ===
                                                                                      "texto_corto"
                                                                                        ? 50
                                                                                        : 200}{" "}
                                                                                      caracteres
                                                                                    </p>
                                                                                  </div>

                                                                                  <div>
                                                                                    <label className="block font-semibold mb-2">
                                                                                      Placeholder
                                                                                      para
                                                                                      el
                                                                                      alumno
                                                                                    </label>
                                                                                    <input
                                                                                      type="text"
                                                                                      value={
                                                                                        pregunta.texto_placeholder ||
                                                                                        ""
                                                                                      }
                                                                                      onChange={(
                                                                                        e,
                                                                                      ) =>
                                                                                        handleChangePreguntaExamen(
                                                                                          leccion.id,
                                                                                          preguntaIndex,
                                                                                          "texto_placeholder",
                                                                                          e
                                                                                            .target
                                                                                            .value,
                                                                                        )
                                                                                      }
                                                                                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                                                                      placeholder="Ej. Escribe tu respuesta aquí"
                                                                                    />
                                                                                  </div>
                                                                                </div>
                                                                              )}

                                                                              {pregunta.tipo_pregunta ===
                                                                                "numerica" && (
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                  <div>
                                                                                    <label className="block font-semibold mb-2">
                                                                                      Respuesta
                                                                                      numérica
                                                                                      correcta
                                                                                    </label>
                                                                                    <input
                                                                                      type="text"
                                                                                      value={
                                                                                        pregunta.respuesta_texto ||
                                                                                        ""
                                                                                      }
                                                                                      onChange={(
                                                                                        e,
                                                                                      ) =>
                                                                                        handleChangePreguntaExamen(
                                                                                          leccion.id,
                                                                                          preguntaIndex,
                                                                                          "respuesta_texto",
                                                                                          e.target.value.replace(
                                                                                            /[^\d.-]/g,
                                                                                            "",
                                                                                          ),
                                                                                        )
                                                                                      }
                                                                                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                                                                      placeholder="Ej. 25 o 25.5"
                                                                                    />
                                                                                  </div>

                                                                                  <div className="flex items-end">
                                                                                    <label className="inline-flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 cursor-pointer w-full">
                                                                                      <input
                                                                                        type="checkbox"
                                                                                        checked={
                                                                                          !!pregunta.permitir_decimales
                                                                                        }
                                                                                        onChange={(
                                                                                          e,
                                                                                        ) =>
                                                                                          handleChangePreguntaExamen(
                                                                                            leccion.id,
                                                                                            preguntaIndex,
                                                                                            "permitir_decimales",
                                                                                            e
                                                                                              .target
                                                                                              .checked,
                                                                                          )
                                                                                        }
                                                                                        className="h-4 w-4"
                                                                                      />
                                                                                      <div>
                                                                                        <p className="font-semibold text-gray-800">
                                                                                          Permitir
                                                                                          decimales
                                                                                        </p>
                                                                                        <p className="text-sm text-gray-500">
                                                                                          Si
                                                                                          lo
                                                                                          desactivas,
                                                                                          solo
                                                                                          se
                                                                                          aceptarán
                                                                                          enteros.
                                                                                        </p>
                                                                                      </div>
                                                                                    </label>
                                                                                  </div>
                                                                                </div>
                                                                              )}

                                                                              {pregunta.tipo_pregunta ===
                                                                                "archivo" && (
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                  <div>
                                                                                    <label className="block font-semibold mb-2">
                                                                                      Tamaño
                                                                                      máximo
                                                                                      (MB)
                                                                                    </label>
                                                                                    <input
                                                                                      type="number"
                                                                                      min="1"
                                                                                      value={
                                                                                        pregunta.tamano_max_mb ||
                                                                                        10
                                                                                      }
                                                                                      onChange={(
                                                                                        e,
                                                                                      ) =>
                                                                                        handleChangePreguntaExamen(
                                                                                          leccion.id,
                                                                                          preguntaIndex,
                                                                                          "tamano_max_mb",
                                                                                          e
                                                                                            .target
                                                                                            .value,
                                                                                        )
                                                                                      }
                                                                                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                                                                    />
                                                                                  </div>

                                                                                  <div>
                                                                                    <label className="block font-semibold mb-2">
                                                                                      Extensiones
                                                                                      permitidas
                                                                                    </label>
                                                                                    <input
                                                                                      type="text"
                                                                                      value={
                                                                                        pregunta.extensiones_permitidas ||
                                                                                        ""
                                                                                      }
                                                                                      onChange={(
                                                                                        e,
                                                                                      ) =>
                                                                                        handleChangePreguntaExamen(
                                                                                          leccion.id,
                                                                                          preguntaIndex,
                                                                                          "extensiones_permitidas",
                                                                                          e
                                                                                            .target
                                                                                            .value,
                                                                                        )
                                                                                      }
                                                                                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                                                                      placeholder="pdf,jpg,png,doc,docx"
                                                                                    />
                                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                                      Separadas
                                                                                      por
                                                                                      coma,
                                                                                      sin
                                                                                      punto.
                                                                                    </p>
                                                                                  </div>

                                                                                  <div className="md:col-span-2">
                                                                                    <label className="block font-semibold mb-2">
                                                                                      Texto
                                                                                      de
                                                                                      ayuda
                                                                                    </label>
                                                                                    <input
                                                                                      type="text"
                                                                                      value={
                                                                                        pregunta.texto_placeholder ||
                                                                                        ""
                                                                                      }
                                                                                      onChange={(
                                                                                        e,
                                                                                      ) =>
                                                                                        handleChangePreguntaExamen(
                                                                                          leccion.id,
                                                                                          preguntaIndex,
                                                                                          "texto_placeholder",
                                                                                          e
                                                                                            .target
                                                                                            .value,
                                                                                        )
                                                                                      }
                                                                                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                                                                                      placeholder="Ej. Sube tu informe en PDF"
                                                                                    />
                                                                                  </div>
                                                                                </div>
                                                                              )}

                                                                              {TIPOS_PREGUNTA_CON_OPCIONES.includes(
                                                                                pregunta.tipo_pregunta,
                                                                              ) && (
                                                                                <>
                                                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                    {(
                                                                                      pregunta.opciones ||
                                                                                      []
                                                                                    ).map(
                                                                                      (
                                                                                        opcion,
                                                                                        opcionIndex,
                                                                                      ) => (
                                                                                        <div
                                                                                          key={
                                                                                            opcionIndex
                                                                                          }
                                                                                          className={`rounded-2xl border p-4 ${
                                                                                            opcion.es_correcta
                                                                                              ? "border-emerald-300 bg-emerald-50"
                                                                                              : "border-slate-200 bg-white"
                                                                                          }`}
                                                                                        >
                                                                                          <label className="block font-semibold mb-2">
                                                                                            Opción{" "}
                                                                                            {opcionIndex +
                                                                                              1}
                                                                                          </label>

                                                                                          <input
                                                                                            type="text"
                                                                                            value={
                                                                                              opcion.texto ||
                                                                                              ""
                                                                                            }
                                                                                            onChange={(
                                                                                              e,
                                                                                            ) =>
                                                                                              handleChangeOpcionExamen(
                                                                                                leccion.id,
                                                                                                preguntaIndex,
                                                                                                opcionIndex,
                                                                                                "texto",
                                                                                                e
                                                                                                  .target
                                                                                                  .value,
                                                                                              )
                                                                                            }
                                                                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 mb-3"
                                                                                            placeholder={`Texto de la opción ${opcionIndex + 1}`}
                                                                                          />

                                                                                          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                                                                                            <input
                                                                                              type={
                                                                                                pregunta.tipo_pregunta ===
                                                                                                "multiple"
                                                                                                  ? "checkbox"
                                                                                                  : "radio"
                                                                                              }
                                                                                              name={`correcta-${leccion.id}-${preguntaIndex}`}
                                                                                              checked={
                                                                                                !!opcion.es_correcta
                                                                                              }
                                                                                              onChange={(
                                                                                                e,
                                                                                              ) =>
                                                                                                handleChangeOpcionExamen(
                                                                                                  leccion.id,
                                                                                                  preguntaIndex,
                                                                                                  opcionIndex,
                                                                                                  "es_correcta",
                                                                                                  e
                                                                                                    .target
                                                                                                    .checked,
                                                                                                )
                                                                                              }
                                                                                            />
                                                                                            {pregunta.tipo_pregunta ===
                                                                                            "multiple"
                                                                                              ? "Marcar como correcta"
                                                                                              : "Respuesta correcta"}
                                                                                          </label>

                                                                                          <button
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                              quitarOpcion(
                                                                                                leccion.id,
                                                                                                preguntaIndex,
                                                                                                opcionIndex,
                                                                                              )
                                                                                            }
                                                                                            className="rounded-xl bg-red-100 text-red-700 px-3 py-2 text-sm hover:bg-red-200 mt-3"
                                                                                          >
                                                                                            Eliminar
                                                                                            opción
                                                                                          </button>
                                                                                        </div>
                                                                                      ),
                                                                                    )}
                                                                                  </div>

                                                                                  <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                      agregarOpcion(
                                                                                        leccion.id,
                                                                                        preguntaIndex,
                                                                                      )
                                                                                    }
                                                                                    className="rounded-xl bg-blue-100 text-blue-700 px-4 py-2 text-sm hover:bg-blue-200"
                                                                                  >
                                                                                    Añadir
                                                                                    opción
                                                                                  </button>
                                                                                </>
                                                                              )}
                                                                            </div>
                                                                          ),
                                                                        )}
                                                                      </div>

                                                                      <div className="flex flex-wrap justify-between gap-3">
                                                                        <button
                                                                          type="button"
                                                                          onClick={() =>
                                                                            agregarPreguntaExamen(
                                                                              leccion.id,
                                                                            )
                                                                          }
                                                                          className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                                                                        >
                                                                          +
                                                                          Agregar
                                                                          pregunta
                                                                        </button>

                                                                        <button
                                                                          type="submit"
                                                                          disabled={
                                                                            guardandoExamen
                                                                          }
                                                                          className="rounded-2xl bg-violet-600 px-5 py-3 text-white font-semibold hover:bg-violet-700 disabled:opacity-60"
                                                                        >
                                                                          {guardandoExamen
                                                                            ? "Guardando..."
                                                                            : examenEditandoId
                                                                              ? "Guardar cambios"
                                                                              : "Guardar examen"}
                                                                        </button>
                                                                      </div>
                                                                    </form>
                                                                  )}

                                                                  {mostrarFormMaterial[
                                                                    leccion.id
                                                                  ] && (
                                                                    <form
                                                                      onSubmit={(
                                                                        e,
                                                                      ) =>
                                                                        guardarMaterialCurso(
                                                                          e,
                                                                          leccion.id,
                                                                        )
                                                                      }
                                                                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 border-t pt-5"
                                                                    >
                                                                      <div>
                                                                        <label className="block font-semibold mb-2">
                                                                          Título
                                                                          del
                                                                          material
                                                                        </label>
                                                                        <input
                                                                          type="text"
                                                                          value={
                                                                            formMat.titulo
                                                                          }
                                                                          name="titulo"
                                                                          onChange={(
                                                                            e,
                                                                          ) =>
                                                                            handleChangeMaterial(
                                                                              leccion.id,
                                                                              e,
                                                                            )
                                                                          }
                                                                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                                                          placeholder="Ej. PDF de introducción"
                                                                        />
                                                                      </div>

                                                                      <div>
                                                                        <label className="block font-semibold mb-2">
                                                                          Tipo
                                                                        </label>
                                                                        <select
                                                                          value={
                                                                            formMat.tipo
                                                                          }
                                                                          name="tipo"
                                                                          onChange={(
                                                                            e,
                                                                          ) =>
                                                                            handleChangeMaterial(
                                                                              leccion.id,
                                                                              e,
                                                                            )
                                                                          }
                                                                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                                                        >
                                                                          <option value="texto">
                                                                            Texto
                                                                          </option>
                                                                          <option value="archivo">
                                                                            Archivo
                                                                          </option>
                                                                          <option value="video">
                                                                            Video
                                                                          </option>
                                                                          <option value="url_video">
                                                                            URL
                                                                            de
                                                                            video
                                                                          </option>
                                                                          <option value="enlace">
                                                                            Enlace
                                                                          </option>
                                                                        </select>
                                                                      </div>

                                                                      {formMat.tipo ===
                                                                        "texto" && (
                                                                        <div className="md:col-span-2">
                                                                          <label className="block font-semibold mb-2">
                                                                            Contenido
                                                                          </label>
                                                                          <textarea
                                                                            name="contenido_texto"
                                                                            value={
                                                                              formMat.contenido_texto
                                                                            }
                                                                            onChange={(
                                                                              e,
                                                                            ) =>
                                                                              handleChangeMaterial(
                                                                                leccion.id,
                                                                                e,
                                                                              )
                                                                            }
                                                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 min-h-[120px]"
                                                                            placeholder="Escribe el contenido de la lección"
                                                                          />
                                                                        </div>
                                                                      )}

                                                                      {formMat.tipo ===
                                                                        "url_video" && (
                                                                        <div className="md:col-span-2">
                                                                          <label className="block font-semibold mb-2">
                                                                            URL
                                                                            del
                                                                            video
                                                                          </label>
                                                                          <input
                                                                            type="text"
                                                                            name="video_url"
                                                                            value={
                                                                              formMat.video_url
                                                                            }
                                                                            onChange={(
                                                                              e,
                                                                            ) =>
                                                                              handleChangeMaterial(
                                                                                leccion.id,
                                                                                e,
                                                                              )
                                                                            }
                                                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                                                            placeholder="https://vimeo.com/123456789"
                                                                          />
                                                                        </div>
                                                                      )}

                                                                      {formMat.tipo ===
                                                                        "enlace" && (
                                                                        <div className="md:col-span-2">
                                                                          <label className="block font-semibold mb-2">
                                                                            Enlace
                                                                          </label>
                                                                          <input
                                                                            type="text"
                                                                            name="enlace_url"
                                                                            value={
                                                                              formMat.enlace_url
                                                                            }
                                                                            onChange={(
                                                                              e,
                                                                            ) =>
                                                                              handleChangeMaterial(
                                                                                leccion.id,
                                                                                e,
                                                                              )
                                                                            }
                                                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                                                            placeholder="https://..."
                                                                          />
                                                                        </div>
                                                                      )}

                                                                      {(formMat.tipo ===
                                                                        "archivo" ||
                                                                        formMat.tipo ===
                                                                          "video") && (
                                                                        <div className="md:col-span-2">
                                                                          <label className="block font-semibold mb-2">
                                                                            Archivo
                                                                          </label>
                                                                          <input
                                                                            type="file"
                                                                            onChange={(
                                                                              e,
                                                                            ) =>
                                                                              handleFileMaterial(
                                                                                leccion.id,
                                                                                e,
                                                                              )
                                                                            }
                                                                            accept={
                                                                              formMat.tipo ===
                                                                              "video"
                                                                                ? "video/*"
                                                                                : ".pdf,.ppt,.pptx,.doc,.docx,.zip,.rar"
                                                                            }
                                                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                                                          />

                                                                          {formMat.file && (
                                                                            <p className="text-sm text-gray-500 mt-2">
                                                                              Archivo
                                                                              seleccionado:{" "}
                                                                              {
                                                                                formMat
                                                                                  .file
                                                                                  .name
                                                                              }
                                                                            </p>
                                                                          )}
                                                                        </div>
                                                                      )}

                                                                      {subidaMaterialEstado[
                                                                        leccion
                                                                          .id
                                                                      ] && (
                                                                        <div className="md:col-span-2 space-y-2">
                                                                          <div className="flex items-center justify-between text-sm">
                                                                            <span className="text-gray-700 font-medium">
                                                                              {
                                                                                subidaMaterialEstado[
                                                                                  leccion
                                                                                    .id
                                                                                ]
                                                                              }
                                                                            </span>

                                                                            {(subidaMaterialProgress[
                                                                              leccion
                                                                                .id
                                                                            ] ||
                                                                              0) <
                                                                              100 && (
                                                                              <span className="text-gray-600">
                                                                                {Math.round(
                                                                                  subidaMaterialProgress[
                                                                                    leccion
                                                                                      .id
                                                                                  ] ||
                                                                                    0,
                                                                                )}

                                                                                %
                                                                              </span>
                                                                            )}
                                                                          </div>

                                                                          {(subidaMaterialProgress[
                                                                            leccion
                                                                              .id
                                                                          ] ||
                                                                            0) <
                                                                          100 ? (
                                                                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                                              <div
                                                                                className="h-full bg-blue-600 transition-all duration-200"
                                                                                style={{
                                                                                  width: `${subidaMaterialProgress[leccion.id] || 0}%`,
                                                                                }}
                                                                              />
                                                                            </div>
                                                                          ) : (
                                                                            <div className="flex items-center gap-2 text-amber-600 text-sm">
                                                                              <span className="animate-spin w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full"></span>
                                                                              Procesando
                                                                              en
                                                                              Vimeo...
                                                                            </div>
                                                                          )}
                                                                        </div>
                                                                      )}

                                                                      <div className="md:col-span-2 flex justify-end">
                                                                        <button
                                                                          type="submit"
                                                                          disabled={
                                                                            guardandoMaterial
                                                                          }
                                                                          className="rounded-2xl bg-emerald-600 px-5 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 transition shadow-lg"
                                                                        >
                                                                          {guardandoMaterial
                                                                            ? formMat.tipo ===
                                                                              "video"
                                                                              ? "Subiendo video..."
                                                                              : "Guardando..."
                                                                            : "Guardar material"}
                                                                        </button>
                                                                      </div>
                                                                    </form>
                                                                  )}

                                                                  {editandoLeccionId ===
                                                                    leccion.id && (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 border-t pt-5">
                                                                      <div>
                                                                        <label className="block font-semibold mb-2">
                                                                          Editar
                                                                          título
                                                                        </label>
                                                                        <input
                                                                          type="text"
                                                                          value={
                                                                            formEditarLeccion.titulo
                                                                          }
                                                                          onChange={(
                                                                            e,
                                                                          ) =>
                                                                            setFormEditarLeccion(
                                                                              (
                                                                                prev,
                                                                              ) => ({
                                                                                ...prev,
                                                                                titulo:
                                                                                  e
                                                                                    .target
                                                                                    .value,
                                                                              }),
                                                                            )
                                                                          }
                                                                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                                                        />
                                                                      </div>

                                                                      <div>
                                                                        <label className="block font-semibold mb-2">
                                                                          Editar
                                                                          descripción
                                                                        </label>
                                                                        <input
                                                                          type="text"
                                                                          value={
                                                                            formEditarLeccion.descripcion
                                                                          }
                                                                          onChange={(
                                                                            e,
                                                                          ) =>
                                                                            setFormEditarLeccion(
                                                                              (
                                                                                prev,
                                                                              ) => ({
                                                                                ...prev,
                                                                                descripcion:
                                                                                  e
                                                                                    .target
                                                                                    .value,
                                                                              }),
                                                                            )
                                                                          }
                                                                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                                                        />
                                                                      </div>

                                                                      <div className="md:col-span-2 flex justify-end gap-2">
                                                                        <button
                                                                          type="button"
                                                                          onClick={
                                                                            cancelarEdicionLeccion
                                                                          }
                                                                          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                                                                        >
                                                                          Cancelar
                                                                        </button>

                                                                        <button
                                                                          type="button"
                                                                          onClick={() =>
                                                                            guardarEdicionLeccion(
                                                                              leccion.id,
                                                                            )
                                                                          }
                                                                          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                                                                        >
                                                                          Guardar
                                                                          cambios
                                                                        </button>
                                                                      </div>
                                                                    </div>
                                                                  )}
                                                                </div>

                                                                {abiertaMateriales && (
                                                                  <div className="border-t bg-gray-50 p-4">
                                                                    {leccion
                                                                      .materiales
                                                                      ?.length ===
                                                                    0 ? (
                                                                      <p className="text-sm text-gray-500">
                                                                        No hay
                                                                        materiales
                                                                        en esta
                                                                        lección.
                                                                      </p>
                                                                    ) : (
                                                                      <div className="space-y-3">
                                                                        <DndContext
                                                                          sensors={
                                                                            sensors
                                                                          }
                                                                          collisionDetection={
                                                                            closestCenter
                                                                          }
                                                                          onDragEnd={(
                                                                            event,
                                                                          ) =>
                                                                            handleDragEndMateriales(
                                                                              event,
                                                                              modulo.id,
                                                                              submodulo.id,
                                                                              leccion,
                                                                            )
                                                                          }
                                                                        >
                                                                          <SortableContext
                                                                            items={(
                                                                              leccion.materiales ||
                                                                              []
                                                                            ).map(
                                                                              (
                                                                                m,
                                                                              ) =>
                                                                                `material-${m.id}`,
                                                                            )}
                                                                            strategy={
                                                                              verticalListSortingStrategy
                                                                            }
                                                                          >
                                                                            {(
                                                                              leccion.materiales ||
                                                                              []
                                                                            ).map(
                                                                              (
                                                                                material,
                                                                                idxMaterial,
                                                                              ) => (
                                                                                <SortableMaterialItem
                                                                                  key={
                                                                                    material.id
                                                                                  }
                                                                                  material={
                                                                                    material
                                                                                  }
                                                                                >
                                                                                  <div className="relative ml-0 md:ml-10 rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                                                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pr-16">
                                                                                      <div>
                                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                                          <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5">
                                                                                            Material{" "}
                                                                                            {idxMaterial +
                                                                                              1}
                                                                                          </span>

                                                                                          <span className="inline-flex items-center rounded-full bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 uppercase">
                                                                                            {
                                                                                              material.tipo
                                                                                            }
                                                                                          </span>
                                                                                        </div>

                                                                                        <h6 className="font-bold text-slate-800 mt-2 text-base">
                                                                                          {
                                                                                            material.titulo
                                                                                          }
                                                                                        </h6>

                                                                                        {material.tipo ===
                                                                                          "video" &&
                                                                                          material.estado_video && (
                                                                                            <div className="mt-2">
                                                                                              {material.estado_video ===
                                                                                                "available" ||
                                                                                              material.estado_video ===
                                                                                                "listo" ? (
                                                                                                <span className="inline-flex rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">
                                                                                                  Video
                                                                                                  disponible
                                                                                                </span>
                                                                                              ) : (
                                                                                                <span className="inline-flex rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold">
                                                                                                  Procesando
                                                                                                  video...
                                                                                                </span>
                                                                                              )}
                                                                                            </div>
                                                                                          )}

                                                                                        {material.contenido_texto && (
                                                                                          <p className="text-sm text-gray-500 mt-2 whitespace-pre-line">
                                                                                            {
                                                                                              material.contenido_texto
                                                                                            }
                                                                                          </p>
                                                                                        )}

                                                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                                                          {(material.object_key ||
                                                                                            material.archivo_url) && (
                                                                                            <button
                                                                                              type="button"
                                                                                              onClick={() =>
                                                                                                abrirArchivoMaterial(
                                                                                                  material,
                                                                                                )
                                                                                              }
                                                                                              className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                                                                            >
                                                                                              Ver
                                                                                              archivo
                                                                                            </button>
                                                                                          )}

                                                                                          {material.video_url && (
                                                                                            <div className="mt-3 w-full">
                                                                                              <VideoEmbed
                                                                                                url={
                                                                                                  material.video_url
                                                                                                }
                                                                                              />
                                                                                            </div>
                                                                                          )}

                                                                                          {material.enlace_url && (
                                                                                            <a
                                                                                              href={
                                                                                                material.enlace_url
                                                                                              }
                                                                                              target="_blank"
                                                                                              rel="noreferrer"
                                                                                              className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                                                                            >
                                                                                              Abrir
                                                                                              enlace
                                                                                            </a>
                                                                                          )}
                                                                                        </div>
                                                                                      </div>

                                                                                      <div className="flex flex-wrap gap-2">
                                                                                        <button
                                                                                          type="button"
                                                                                          onClick={() =>
                                                                                            iniciarEdicionMaterial(
                                                                                              material,
                                                                                            )
                                                                                          }
                                                                                          className="inline-flex items-center justify-center rounded-2xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition"
                                                                                        >
                                                                                          Editar
                                                                                        </button>

                                                                                        <button
                                                                                          type="button"
                                                                                          onClick={() =>
                                                                                            eliminarMaterialCurso(
                                                                                              material.id,
                                                                                            )
                                                                                          }
                                                                                          className="inline-flex items-center justify-center rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition"
                                                                                        >
                                                                                          Eliminar
                                                                                        </button>
                                                                                      </div>
                                                                                    </div>

                                                                                    {editandoMaterialId ===
                                                                                      material.id && (
                                                                                      <div className="mt-4 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                        <div>
                                                                                          <label className="block font-semibold mb-2">
                                                                                            Editar
                                                                                            título
                                                                                          </label>
                                                                                          <input
                                                                                            type="text"
                                                                                            value={
                                                                                              formEditarMaterial.titulo
                                                                                            }
                                                                                            onChange={(
                                                                                              e,
                                                                                            ) =>
                                                                                              setFormEditarMaterial(
                                                                                                (
                                                                                                  prev,
                                                                                                ) => ({
                                                                                                  ...prev,
                                                                                                  titulo:
                                                                                                    e
                                                                                                      .target
                                                                                                      .value,
                                                                                                }),
                                                                                              )
                                                                                            }
                                                                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                                                                          />
                                                                                        </div>

                                                                                        <div>
                                                                                          <label className="block font-semibold mb-2">
                                                                                            Tipo
                                                                                          </label>
                                                                                          <select
                                                                                            value={
                                                                                              formEditarMaterial.tipo
                                                                                            }
                                                                                            onChange={(
                                                                                              e,
                                                                                            ) =>
                                                                                              setFormEditarMaterial(
                                                                                                (
                                                                                                  prev,
                                                                                                ) => ({
                                                                                                  ...prev,
                                                                                                  tipo: e
                                                                                                    .target
                                                                                                    .value,
                                                                                                }),
                                                                                              )
                                                                                            }
                                                                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                                                                          >
                                                                                            <option value="texto">
                                                                                              Texto
                                                                                            </option>
                                                                                            <option value="url_video">
                                                                                              URL
                                                                                              de
                                                                                              video
                                                                                            </option>
                                                                                            <option value="enlace">
                                                                                              Enlace
                                                                                            </option>
                                                                                          </select>
                                                                                        </div>

                                                                                        {formEditarMaterial.tipo ===
                                                                                          "texto" && (
                                                                                          <div className="md:col-span-2">
                                                                                            <label className="block font-semibold mb-2">
                                                                                              Contenido
                                                                                            </label>
                                                                                            <textarea
                                                                                              value={
                                                                                                formEditarMaterial.contenido_texto
                                                                                              }
                                                                                              onChange={(
                                                                                                e,
                                                                                              ) =>
                                                                                                setFormEditarMaterial(
                                                                                                  (
                                                                                                    prev,
                                                                                                  ) => ({
                                                                                                    ...prev,
                                                                                                    contenido_texto:
                                                                                                      e
                                                                                                        .target
                                                                                                        .value,
                                                                                                  }),
                                                                                                )
                                                                                              }
                                                                                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 min-h-[120px]"
                                                                                            />
                                                                                          </div>
                                                                                        )}

                                                                                        {formEditarMaterial.tipo ===
                                                                                          "url_video" && (
                                                                                          <div className="md:col-span-2">
                                                                                            <label className="block font-semibold mb-2">
                                                                                              URL
                                                                                              del
                                                                                              video
                                                                                            </label>
                                                                                            <input
                                                                                              type="text"
                                                                                              value={
                                                                                                formEditarMaterial.video_url
                                                                                              }
                                                                                              onChange={(
                                                                                                e,
                                                                                              ) =>
                                                                                                setFormEditarMaterial(
                                                                                                  (
                                                                                                    prev,
                                                                                                  ) => ({
                                                                                                    ...prev,
                                                                                                    video_url:
                                                                                                      e
                                                                                                        .target
                                                                                                        .value,
                                                                                                  }),
                                                                                                )
                                                                                              }
                                                                                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                                                                            />
                                                                                          </div>
                                                                                        )}

                                                                                        {formEditarMaterial.tipo ===
                                                                                          "enlace" && (
                                                                                          <div className="md:col-span-2">
                                                                                            <label className="block font-semibold mb-2">
                                                                                              Enlace
                                                                                            </label>
                                                                                            <input
                                                                                              type="text"
                                                                                              value={
                                                                                                formEditarMaterial.enlace_url
                                                                                              }
                                                                                              onChange={(
                                                                                                e,
                                                                                              ) =>
                                                                                                setFormEditarMaterial(
                                                                                                  (
                                                                                                    prev,
                                                                                                  ) => ({
                                                                                                    ...prev,
                                                                                                    enlace_url:
                                                                                                      e
                                                                                                        .target
                                                                                                        .value,
                                                                                                  }),
                                                                                                )
                                                                                              }
                                                                                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                                                                            />
                                                                                          </div>
                                                                                        )}

                                                                                        <div className="md:col-span-2 flex justify-end gap-2">
                                                                                          <button
                                                                                            type="button"
                                                                                            onClick={
                                                                                              cancelarEdicionMaterial
                                                                                            }
                                                                                            className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                                                                                          >
                                                                                            Cancelar
                                                                                          </button>

                                                                                          <button
                                                                                            type="button"
                                                                                            onClick={() =>
                                                                                              guardarEdicionMaterial(
                                                                                                material.id,
                                                                                              )
                                                                                            }
                                                                                            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
                                                                                          >
                                                                                            Guardar
                                                                                            cambios
                                                                                          </button>
                                                                                        </div>
                                                                                      </div>
                                                                                    )}
                                                                                  </div>
                                                                                </SortableMaterialItem>
                                                                              ),
                                                                            )}
                                                                          </SortableContext>
                                                                        </DndContext>
                                                                      </div>
                                                                    )}
                                                                  </div>
                                                                )}
                                                              </div>
                                                            </SortableLeccionItem>
                                                          );
                                                        },
                                                      )}
                                                    </SortableContext>
                                                  </DndContext>
                                                )}
                                              </div>
                                            </div>
                                          </SortableSubModuloItem>
                                        ),
                                      )}
                                    </SortableContext>
                                  </DndContext>
                                )}
                              </div>
                            )}
                          </div>
                        </SortableModuloItem>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}

      {notificacionesVideo.length > 0 && (
        <div className="fixed top-4 right-4 z-[80] space-y-3 w-[340px]">
          {notificacionesVideo.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border shadow-lg p-4 bg-white ${
                item.estado === "success"
                  ? "border-emerald-200"
                  : item.estado === "error"
                    ? "border-red-200"
                    : item.estado === "warning"
                      ? "border-amber-200"
                      : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">
                    {item.titulo || "Video"}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{item.mensaje}</p>
                </div>

                <button
                  type="button"
                  onClick={() => eliminarNotificacionVideo(item.id)}
                  className="text-xs rounded-lg border px-2 py-1 hover:bg-slate-50"
                >
                  ✕
                </button>
              </div>

              {(item.estado === "uploading" ||
                item.estado === "processing") && (
                <div className="mt-3">
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.estado === "processing"
                          ? "bg-amber-500"
                          : "bg-blue-600"
                      }`}
                      style={{ width: `${item.progreso || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {item.estado === "processing"
                      ? "El video ya se subió. Vimeo lo está procesando."
                      : `${Math.round(item.progreso || 0)}% completado`}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {configTareaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            onClick={cerrarConfigTarea}
          />

          <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">
                    Configurar nota de tarea
                  </h3>
                  <p className="text-sm text-slate-200 mt-1">
                    {tareaConfigActual?.titulo || "Tarea seleccionada"}
                  </p>
                </div>

                <button
                  onClick={cerrarConfigTarea}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {cargandoConfigTarea ? (
                <p className="text-slate-500">
                  Cargando evaluaciones disponibles...
                </p>
              ) : (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Tarea</p>
                    <p className="text-base font-semibold text-slate-800 mt-1">
                      {tareaConfigActual?.titulo || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Seleccionar evaluación de tipo tarea
                    </label>

                    <select
                      value={evaluacionSeleccionadaTarea}
                      onChange={(e) =>
                        setEvaluacionSeleccionadaTarea(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">-- Selecciona una evaluación --</option>
                      {evaluacionesTareaDisponibles.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.nombre} ({Number(ev.porcentaje || 0)}%)
                          {Number(ev.idtarea) === Number(tareaConfigActual?.id)
                            ? " · actualmente vinculada"
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {evaluacionesTareaDisponibles.length === 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      No hay evaluaciones de tipo tarea disponibles para este
                      grupo. Primero configúralas en Registro de Notas.
                    </div>
                  )}

                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Solo se muestran evaluaciones activas del tipo tarea. Al
                    guardar, esta tarea quedará vinculada a la evaluación
                    seleccionada.
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                      onClick={cerrarConfigTarea}
                      className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Cancelar
                    </button>

                    <button
                      onClick={guardarConfiguracionTarea}
                      disabled={
                        guardandoConfigTarea ||
                        evaluacionesTareaDisponibles.length === 0
                      }
                      className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
                        guardandoConfigTarea ||
                        evaluacionesTareaDisponibles.length === 0
                          ? "bg-slate-400 cursor-not-allowed"
                          : "bg-violet-600 hover:bg-violet-700"
                      }`}
                    >
                      {guardandoConfigTarea
                        ? "Guardando..."
                        : "Guardar asignación"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {modalEntregaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setModalEntregaOpen(false)}
          />

          <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Entrega del alumno</h3>
                  <p className="text-sm text-slate-200 mt-1">
                    {entregaSeleccionada?.alumno || ""}
                  </p>
                </div>

                <button
                  onClick={() => setModalEntregaOpen(false)}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 whitespace-pre-line text-sm text-slate-700 max-h-[420px] overflow-auto">
                {entregaSeleccionada?.contenido || "Sin contenido"}
              </div>
            </div>
          </div>
        </div>
      )}

      {configExamenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            onClick={cerrarConfigExamen}
          />

          <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-900 via-violet-800 to-fuchsia-700 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">
                    Configurar nota de examen
                  </h3>
                  <p className="text-sm text-violet-100 mt-1">
                    {examenConfigActual?.titulo || "Examen seleccionado"}
                  </p>
                </div>

                <button
                  onClick={cerrarConfigExamen}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {cargandoConfigExamen ? (
                <p className="text-slate-500">
                  Cargando evaluaciones disponibles...
                </p>
              ) : (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Examen</p>
                    <p className="text-base font-semibold text-slate-800 mt-1">
                      {examenConfigActual?.titulo || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Seleccionar evaluación de tipo examen
                    </label>

                    <select
                      value={evaluacionSeleccionadaExamen}
                      onChange={(e) =>
                        setEvaluacionSeleccionadaExamen(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">-- Selecciona una evaluación --</option>
                      {evaluacionesExamenDisponibles.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.nombre} ({Number(ev.porcentaje || 0)}%)
                          {Number(ev.idexamen) ===
                          Number(examenConfigActual?.id)
                            ? " · actualmente vinculada"
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {evaluacionesExamenDisponibles.length === 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      No hay evaluaciones de tipo examen disponibles para este
                      grupo. Primero configúralas en Registro de Notas.
                    </div>
                  )}

                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Solo se muestran evaluaciones activas del tipo examen.
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                      onClick={cerrarConfigExamen}
                      className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Cancelar
                    </button>

                    <button
                      onClick={guardarConfiguracionExamen}
                      disabled={
                        guardandoConfigExamen ||
                        evaluacionesExamenDisponibles.length === 0
                      }
                      className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
                        guardandoConfigExamen ||
                        evaluacionesExamenDisponibles.length === 0
                          ? "bg-slate-400 cursor-not-allowed"
                          : "bg-violet-600 hover:bg-violet-700"
                      }`}
                    >
                      {guardandoConfigExamen
                        ? "Guardando..."
                        : "Guardar asignación"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CursoDetalleDocente;
