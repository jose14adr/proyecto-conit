import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Stage,
  Layer,
  Text as KonvaText,
  Image as KonvaImage,
  Rect,
} from "react-konva";
import {
  Save,
  Upload,
  Type,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Award,
  ImagePlus,
  ChevronDown,
  ChevronUp,
  FileBadge,
  Settings2,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  activarPlantillaCertificado,
  eliminarPlantillaCertificado,
  guardarPlantillaCertificado,
  obtenerPlantillaActiva,
  obtenerPlantillas,
  solicitarUploadFondoCertificado,
} from "../services/certificado-plantilla.service";

import {
  obtenerCertificadosAdmin,
  anularCertificadoAdmin,
} from "../services/certificado-admin.service";

import { obtenerAlumno } from "../services/alumno.service";
import { obtenerCurso } from "../services/curso.service";
import { obtenerCursosMatriculadosAlumno } from "../services/certificado-emision-alumno.service";

import {
  emitirCertificadoDesdePlantilla,
  getCertificadoArchivoUrl,
} from "../services/certificado-final.service";

import {
  obtenerConfigCertificadoCurso,
  guardarConfigCertificadoCurso,
} from "../services/curso-certificado-config.service";

const CAMPOS = [
  { key: "alumno", label: "Nombre del alumno" },
  { key: "curso", label: "Curso" },
  { key: "descripcion", label: "Descripción" },
  { key: "fecha", label: "Fecha" },
  { key: "horas", label: "Horas" },
  { key: "codigo", label: "Código" },
  { key: "dni", label: "DNI" },
];

const MUESTRAS = {
  alumno: "KAREM DANIELA PAREDES SANDOVAL",
  curso: "POR HABER APROBADO SATISFACTORIAMENTE EL CURSO",
  descripcion: "Diseño y desarrollo web con enfoque práctico",
  fecha: "08/04/2026",
  horas: "120 HORAS ACADÉMICAS",
  codigo: "CERT-2026-0001",
  dni: "73251708",
};

const PREVIEW_WIDTH = 920;

const crearElementosBase = () => [
  {
    id: crypto.randomUUID(),
    type: "text",
    dynamicField: "alumno",
    text: "",
    x: 560,
    y: 520,
    width: 760,
    fontSize: 62,
    color: "#111111",
    fontStyle: "italic",
    align: "center",
    locked: false,
    fontFamily: "Georgia",
  },
  {
    id: crypto.randomUUID(),
    type: "text",
    dynamicField: "curso",
    text: "",
    x: 500,
    y: 650,
    width: 820,
    fontSize: 24,
    color: "#111827",
    fontStyle: "bold",
    align: "center",
    locked: false,
    fontFamily: "Arial",
  },
  {
    id: crypto.randomUUID(),
    type: "text",
    dynamicField: "descripcion",
    text: "",
    x: 470,
    y: 705,
    width: 880,
    fontSize: 18,
    color: "#374151",
    fontStyle: "normal",
    align: "center",
    locked: false,
    fontFamily: "Arial",
  },
  {
    id: crypto.randomUUID(),
    type: "text",
    dynamicField: "horas",
    text: "",
    x: 470,
    y: 760,
    width: 880,
    fontSize: 18,
    color: "#374151",
    fontStyle: "normal",
    align: "center",
    locked: false,
    fontFamily: "Arial",
  },
  {
    id: crypto.randomUUID(),
    type: "text",
    dynamicField: "codigo",
    text: "",
    x: 130,
    y: 955,
    width: 280,
    fontSize: 16,
    color: "#374151",
    fontStyle: "bold",
    align: "left",
    locked: false,
    fontFamily: "Arial",
  },
  {
    id: crypto.randomUUID(),
    type: "text",
    dynamicField: "dni",
    text: "",
    x: 130,
    y: 985,
    width: 220,
    fontSize: 16,
    color: "#374151",
    fontStyle: "normal",
    align: "left",
    locked: false,
    fontFamily: "Arial",
  },
  {
    id: crypto.randomUUID(),
    type: "text",
    dynamicField: "fecha",
    text: "",
    x: 1030,
    y: 955,
    width: 220,
    fontSize: 18,
    color: "#374151",
    fontStyle: "normal",
    align: "center",
    locked: false,
    fontFamily: "Arial",
  },
  {
    id: crypto.randomUUID(),
    type: "qr",
    x: 1260,
    y: 900,
    width: 180,
    height: 180,
    locked: false,
  },
];

const crearTextoLibre = () => ({
  id: crypto.randomUUID(),
  type: "text",
  dynamicField: null,
  text: "Texto editable",
  x: 180,
  y: 180,
  width: 500,
  fontSize: 28,
  color: "#111827",
  fontStyle: "normal",
  align: "left",
  locked: false,
  fontFamily: "Arial",
});

const crearImagenElemento = ({ src, key, nombre = "Imagen" }) => ({
  id: crypto.randomUUID(),
  type: "image",
  name: nombre,
  src,
  imageKey: key || null,
  x: 120,
  y: 120,
  width: 180,
  height: 180,
  locked: false,
});

const crearQrPlaceholder = () => ({
  id: crypto.randomUUID(),
  type: "qr",
  x: 1260,
  y: 900,
  width: 180,
  height: 180,
  locked: false,
});

const obtenerSrcElemento = (el) => el.localPreviewUrl || el.src || null;

export default function Certificados() {
  const [plantillaId, setPlantillaId] = useState(null);
  const [nombre, setNombre] = useState("Plantilla principal");
  const [canvasWidth, setCanvasWidth] = useState(1600);
  const [canvasHeight, setCanvasHeight] = useState(1131);
  const [fondoKey, setFondoKey] = useState(null);
  const [fondoRemotoUrl, setFondoRemotoUrl] = useState(null);
  const [fondoLocalUrl, setFondoLocalUrl] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [elementos, setElementos] = useState(crearElementosBase);
  const [seleccionadoId, setSeleccionadoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [imagenesCargadas, setImagenesCargadas] = useState({});
  const [plantillas, setPlantillas] = useState([]);
  const [esPlantillaActiva, setEsPlantillaActiva] = useState(true);

  const [cursosAlumno, setCursosAlumno] = useState([]);
  const [cargandoCursosAlumno, setCargandoCursosAlumno] = useState(false);

  const [mostrarEmision, setMostrarEmision] = useState(true);
  const [mostrarConfigCurso, setMostrarConfigCurso] = useState(true);
  const [mostrarGestionPlantilla, setMostrarGestionPlantilla] = useState(false);

  const [mostrarListadoCertificados, setMostrarListadoCertificados] = useState(true);
  const [certificadosAdmin, setCertificadosAdmin] = useState([]);
  const [cargandoCertificadosAdmin, setCargandoCertificadosAdmin] = useState(false);
  const [anulandoCertificadoId, setAnulandoCertificadoId] = useState(null);

  const [permitirEmisionManual, setPermitirEmisionManual] = useState(false);

  const [filtrosCertificados, setFiltrosCertificados] = useState({
    search: "",
    dni: "",
    curso: "",
    estado: "TODOS",
    anulado: "NO",
  });

  const [emision, setEmision] = useState({
    idalumno: "",
    idgrupo: "",
    idcurso: "",
    nombreAlumno: "",
    emailAlumno: "",
    dniAlumno: "",
    curso: "",
    descripcion: "Por haber aprobado satisfactoriamente el curso",
    horas: "",
    creditos: "",
    fechaEmision: new Date().toISOString().slice(0, 10),
    codigoCertificado: "",
  });
  const [emitiendo, setEmitiendo] = useState(false);

  const [alumnos, setAlumnos] = useState([]);
  const [cursos, setCursos] = useState([]);

  const [configCurso, setConfigCurso] = useState({
    idcurso: "",
    habilitado: true,
    modoEntrega: "DESCARGA_UNICA",
    plantillaId: "",
    requiereAprobacion: true,
    notaMinima: "",
    asistenciaMinima: "",
  });
  const [guardandoConfigCurso, setGuardandoConfigCurso] = useState(false);

  const fondoPreviewSrc = fondoLocalUrl || fondoRemotoUrl || null;

  const escala = useMemo(
    () => Math.min(1, PREVIEW_WIDTH / canvasWidth),
    [canvasWidth]
  );

  const seleccionado = useMemo(
    () => elementos.find((el) => el.id === seleccionadoId) || null,
    [elementos, seleccionadoId]
  );

  const aplicarPlantillaEnEditor = (data) => {
    if (!data) {
      setPlantillaId(null);
      setNombre("Plantilla principal");
      setCanvasWidth(1600);
      setCanvasHeight(1131);
      setFondoKey(null);
      setFondoRemotoUrl(null);
      setFondoLocalUrl(null);
      setBackgroundImage(null);
      setElementos(crearElementosBase());
      setSeleccionadoId(null);
      setEsPlantillaActiva(plantillas.length === 0);
      return;
    }

    setPlantillaId(data.id);
    setNombre(data.nombre || "Plantilla principal");
    setCanvasWidth(data.canvasWidth || 1600);
    setCanvasHeight(data.canvasHeight || 1131);
    setFondoKey(data.fondoKey || null);
    setFondoRemotoUrl(data.fondoTemporalUrl || null);
    setFondoLocalUrl(null);
    setElementos(
      Array.isArray(data.configJson) && data.configJson.length
        ? data.configJson
        : crearElementosBase()
    );
    setSeleccionadoId(null);
    setEsPlantillaActiva(!!data.activa);
  };

  const prepararNuevaPlantilla = () => {
    setPlantillaId(null);
    setNombre(`Plantilla ${plantillas.length + 1}`);
    setCanvasWidth(1600);
    setCanvasHeight(1131);
    setFondoKey(null);
    setFondoRemotoUrl(null);
    setFondoLocalUrl(null);
    setBackgroundImage(null);
    setElementos(crearElementosBase());
    setSeleccionadoId(null);
    setEsPlantillaActiva(plantillas.length === 0);
  };

  const recargarPlantillas = async (idPreferido = null) => {
    const [todas, activa] = await Promise.all([
      obtenerPlantillas(),
      obtenerPlantillaActiva(),
    ]);

    setPlantillas(todas || []);

    if (idPreferido) {
      const encontrada = (todas || []).find((p) => p.id === idPreferido);
      if (encontrada) {
        aplicarPlantillaEnEditor(encontrada);
        return;
      }
    }

    if (activa) {
      aplicarPlantillaEnEditor(activa);
      return;
    }

    if (todas?.length) {
      aplicarPlantillaEnEditor(todas[0]);
      return;
    }

    prepararNuevaPlantilla();
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        const [listaAlumnos, listaCursos] = await Promise.all([
          obtenerAlumno(),
          obtenerCurso(),
        ]);

        setAlumnos(Array.isArray(listaAlumnos) ? listaAlumnos : []);
        setCursos(Array.isArray(listaCursos) ? listaCursos : []);

        await recargarPlantillas();
        await cargarCertificadosAdmin();
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar los datos del módulo");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  useEffect(() => {
    if (!fondoPreviewSrc) {
      setBackgroundImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setBackgroundImage(img);
    img.onerror = () => setBackgroundImage(null);
    img.src = fondoPreviewSrc;
  }, [fondoPreviewSrc]);

  useEffect(() => {
    const imagenes = elementos.filter((el) => el.type === "image");

    if (!imagenes.length) {
      setImagenesCargadas({});
      return;
    }

    let cancelled = false;

    const cargarImagenes = async () => {
      const resultado = {};

      await Promise.all(
        imagenes.map(
          (el) =>
            new Promise((resolve) => {
              const src = obtenerSrcElemento(el);

              if (!src) {
                resolve(null);
                return;
              }

              const img = new window.Image();
              img.crossOrigin = "anonymous";
              img.onload = () => {
                resultado[el.id] = img;
                resolve(null);
              };
              img.onerror = () => resolve(null);
              img.src = src;
            })
        )
      );

      if (!cancelled) {
        setImagenesCargadas(resultado);
      }
    };

    cargarImagenes();

    return () => {
      cancelled = true;
    };
  }, [elementos]);

  const actualizarElemento = (id, cambios) => {
    setElementos((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...cambios } : el))
    );
  };

  const actualizarSeleccionado = (cambios) => {
    if (!seleccionadoId) return;
    actualizarElemento(seleccionadoId, cambios);
  };

  const agregarCampo = (fieldKey) => {
    const campo = CAMPOS.find((item) => item.key === fieldKey);

    const nuevo = {
      id: crypto.randomUUID(),
      type: "text",
      dynamicField: fieldKey,
      text: "",
      x: 200,
      y: 200,
      width: 500,
      fontSize: 26,
      color: "#111827",
      fontStyle: "normal",
      align: "left",
      locked: false,
      fontFamily: "Arial",
    };

    setElementos((prev) => [...prev, nuevo]);
    setSeleccionadoId(nuevo.id);
    toast.success(`Campo agregado: ${campo?.label || fieldKey}`);
  };

  const agregarTextoLibre = () => {
    const nuevo = crearTextoLibre();
    setElementos((prev) => [...prev, nuevo]);
    setSeleccionadoId(nuevo.id);
  };

  const agregarQrPlaceholder = () => {
    const yaExiste = elementos.some((el) => el.type === "qr");

    if (yaExiste) {
      toast.error("Solo puede haber un QR en la plantilla");
      return;
    }

    const nuevo = crearQrPlaceholder();
    setElementos((prev) => [...prev, nuevo]);
    setSeleccionadoId(nuevo.id);
    toast.success("Placeholder QR agregado");
  };

  const duplicarSeleccionado = () => {
    if (!seleccionado) return;

    const copia = {
      ...seleccionado,
      id: crypto.randomUUID(),
      x: seleccionado.x + 24,
      y: seleccionado.y + 24,
    };

    setElementos((prev) => [...prev, copia]);
    setSeleccionadoId(copia.id);
  };

  const eliminarSeleccionado = () => {
    if (!seleccionadoId) return;
    setElementos((prev) => prev.filter((el) => el.id !== seleccionadoId));
    setSeleccionadoId(null);
  };

  const traerAlFrente = () => {
    if (!seleccionadoId) return;

    setElementos((prev) => {
      const item = prev.find((el) => el.id === seleccionadoId);
      if (!item) return prev;
      return [...prev.filter((el) => el.id !== seleccionadoId), item];
    });
  };

  const enviarAtras = () => {
    if (!seleccionadoId) return;

    setElementos((prev) => {
      const item = prev.find((el) => el.id === seleccionadoId);
      if (!item) return prev;
      return [item, ...prev.filter((el) => el.id !== seleccionadoId)];
    });
  };

  const handleSubirFondo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Subiendo fondo...", { id: "subiendo-fondo" });

      const resultado = await solicitarUploadFondoCertificado(file);

      setFondoKey(resultado.key);
      setFondoLocalUrl(resultado.localPreviewUrl);
      setFondoRemotoUrl(resultado.proxyUrl || null);

      toast.success("Fondo subido correctamente", { id: "subiendo-fondo" });
    } catch (error) {
      console.error(error);
      toast.error("No se pudo subir el fondo", { id: "subiendo-fondo" });
    } finally {
      event.target.value = "";
    }
  };

  const handleAgregarImagen = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Subiendo imagen...", { id: "subiendo-imagen" });

      const resultado = await solicitarUploadFondoCertificado(file);

      const nuevaImagen = crearImagenElemento({
        src: resultado.proxyUrl || resultado.localPreviewUrl,
        key: resultado.key,
        nombre: file.name,
      });

      nuevaImagen.localPreviewUrl = resultado.localPreviewUrl;

      setElementos((prev) => [...prev, nuevaImagen]);
      setSeleccionadoId(nuevaImagen.id);

      toast.success("Imagen agregada correctamente", {
        id: "subiendo-imagen",
      });
    } catch (error) {
      console.error(error);
      toast.error("No se pudo subir la imagen", {
        id: "subiendo-imagen",
      });
    } finally {
      event.target.value = "";
    }
  };

  const guardar = async () => {
    try {
      setGuardando(true);

      const payload = {
        id: plantillaId,
        nombre,
        activa: esPlantillaActiva,
        fondoKey,
        canvasWidth,
        canvasHeight,
        configJson: elementos,
      };

      const saved = await guardarPlantillaCertificado(payload);

      toast.success("Plantilla guardada correctamente");
      await recargarPlantillas(saved.id);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar la plantilla");
    } finally {
      setGuardando(false);
    }
  };

  const handleActivarPlantilla = async (id) => {
    try {
      await activarPlantillaCertificado(id);
      toast.success("Plantilla activada");
      await recargarPlantillas(id);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo activar la plantilla");
    }
  };

  const handleEliminarPlantilla = async (id) => {
    const plantilla = plantillas.find((p) => p.id === id);

    if (!plantilla) return;

    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar la plantilla "${plantilla.nombre}"?`
    );

    if (!confirmado) return;

    try {
      await eliminarPlantillaCertificado(id);
      toast.success("Plantilla eliminada");
      await recargarPlantillas();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar la plantilla");
    }
  };

  const handleSeleccionAlumno = async (id) => {
    const alumno = alumnos.find((a) => String(a.id) === String(id));

    setEmision((prev) => ({
      ...prev,
      idalumno: id,
      idgrupo: "",
      idcurso: "",
      nombreAlumno: alumno
        ? `${alumno.nombre || ""} ${alumno.apellido || ""}`.trim()
        : "",
      emailAlumno:
        alumno?.email || alumno?.correo || alumno?.emailAlumno || "",
      dniAlumno:
        alumno?.numdocumento || alumno?.dni || "",
      curso: "",
      descripcion: "Por haber aprobado satisfactoriamente el curso",
      horas: "",
      creditos: "",
    }));

    setCursosAlumno([]);

    if (!id) return;

    try {
      setCargandoCursosAlumno(true);

      const cursosMatriculados = await obtenerCursosMatriculadosAlumno(id);
      setCursosAlumno(Array.isArray(cursosMatriculados) ? cursosMatriculados : []);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los cursos matriculados del alumno");
    } finally {
      setCargandoCursosAlumno(false);
    }
  };

  const handleSeleccionCurso = (idgrupoSeleccionado) => {
    const cursoSeleccionado = cursosAlumno.find(
      (c) => String(c.idgrupo) === String(idgrupoSeleccionado)
    );

    setEmision((prev) => ({
      ...prev,
      idgrupo: idgrupoSeleccionado,
      idcurso: cursoSeleccionado?.idcurso ? String(cursoSeleccionado.idcurso) : "",
      curso: cursoSeleccionado?.nombrecurso || "",
      descripcion:
        cursoSeleccionado?.descripcion?.trim() ||
        "Por haber aprobado satisfactoriamente el curso",
      horas:
        cursoSeleccionado?.duracion != null
          ? String(cursoSeleccionado.duracion)
          : "",
      creditos:
        cursoSeleccionado?.creditos != null
          ? String(cursoSeleccionado.creditos)
          : "",
    }));
  };

  const handleEmitirCertificado = async () => {
    try {
      if (!emision.nombreAlumno.trim()) {
        toast.error("Selecciona o escribe el nombre del alumno");
        return;
      }

      if (!emision.curso.trim()) {
        toast.error("Selecciona o escribe el curso");
        return;
      }

      setEmitiendo(true);

      const cursoSeleccionado = cursosAlumno.find(
        (c) => String(c.idgrupo) === String(emision.idgrupo)
      );

      if (!cursoSeleccionado) {
        toast.error("Selecciona un curso");
        return;
      }

      if (!cursoSeleccionado.completo && !permitirEmisionManual) {
        toast.error("Ese curso aún no está completo");
        return;
      }

      if (!cursoSeleccionado.completo && permitirEmisionManual) {
        const confirmado = window.confirm(
          `El curso "${cursoSeleccionado.nombrecurso}" aún no está completo.\n\n¿Deseas emitir el certificado manualmente de todos modos?`
        );

        if (!confirmado) {
          return;
        }
      }

      const cert = await emitirCertificadoDesdePlantilla({
        idalumno: emision.idalumno ? Number(emision.idalumno) : undefined,
        idcurso: emision.idcurso ? Number(emision.idcurso) : undefined,
        nombreAlumno: emision.nombreAlumno,
        emailAlumno: emision.emailAlumno,
        dniAlumno: emision.dniAlumno,
        curso: emision.curso,
        descripcion: emision.descripcion,
        horas: emision.horas ? Number(emision.horas) : undefined,
        creditos: emision.creditos ? Number(emision.creditos) : undefined,
        fechaEmision: emision.fechaEmision,
        codigoCertificado: emision.codigoCertificado,
      });

      toast.success("Certificado generado correctamente");
      window.open(getCertificadoArchivoUrl(cert.id), "_blank");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo generar el certificado");
    } finally {
      setEmitiendo(false);
    }
  };

  const handleSeleccionCursoConfig = async (id) => {
    if (!id) {
      setConfigCurso({
        idcurso: "",
        habilitado: true,
        modoEntrega: "DESCARGA_UNICA",
        plantillaId: "",
        requiereAprobacion: true,
        notaMinima: "",
        asistenciaMinima: "",
      });
      return;
    }

    setConfigCurso((prev) => ({
      ...prev,
      idcurso: id,
    }));

    try {
      const config = await obtenerConfigCertificadoCurso(id);

      setConfigCurso({
        idcurso: String(id),
        habilitado: config?.habilitado ?? true,
        modoEntrega: config?.modoEntrega || "DESCARGA_UNICA",
        plantillaId:
          config?.plantillaId !== null && config?.plantillaId !== undefined
            ? String(config.plantillaId)
            : "",
        requiereAprobacion: config?.requiereAprobacion ?? true,
        notaMinima:
          config?.notaMinima !== null && config?.notaMinima !== undefined
            ? String(config.notaMinima)
            : "",
        asistenciaMinima:
          config?.asistenciaMinima !== null &&
          config?.asistenciaMinima !== undefined
            ? String(config.asistenciaMinima)
            : "",
      });
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar la configuración del curso");
    }
  };

  const cargarCertificadosAdmin = async (filters = filtrosCertificados) => {
    try {
      setCargandoCertificadosAdmin(true);
      const data = await obtenerCertificadosAdmin(filters);
      setCertificadosAdmin(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el listado de certificados");
    } finally {
      setCargandoCertificadosAdmin(false);
    }
  };

  const handleBuscarCertificados = async () => {
    await cargarCertificadosAdmin(filtrosCertificados);
  };

  const handleAnularCertificado = async (certificado) => {
    const motivo = window.prompt(
      `Motivo de anulación para el certificado ${certificado.codigoCertificado || certificado.id}:`,
      ""
    );

    if (motivo === null) return;

    try {
      setAnulandoCertificadoId(certificado.id);

      await anularCertificadoAdmin(certificado.id, {
        motivo: motivo || "",
      });

      toast.success("Certificado anulado correctamente");
      await cargarCertificadosAdmin();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo anular el certificado");
    } finally {
      setAnulandoCertificadoId(null);
    }
  };

  const handleGuardarConfigCurso = async () => {
    try {
      if (!configCurso.idcurso) {
        toast.error("Selecciona un curso");
        return;
      }

      setGuardandoConfigCurso(true);

      await guardarConfigCertificadoCurso(Number(configCurso.idcurso), {
        habilitado: configCurso.habilitado,
        modoEntrega: configCurso.modoEntrega,
        plantillaId: configCurso.plantillaId
          ? Number(configCurso.plantillaId)
          : null,
        requiereAprobacion: configCurso.requiereAprobacion,
        notaMinima:
          configCurso.notaMinima !== ""
            ? Number(configCurso.notaMinima)
            : null,
        asistenciaMinima:
          configCurso.asistenciaMinima !== ""
            ? Number(configCurso.asistenciaMinima)
            : null,
      });

      toast.success("Configuración del curso guardada");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar la configuración");
    } finally {
      setGuardandoConfigCurso(false);
    }
  };

  if (cargando) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow p-8 text-gray-500">
          Cargando módulo de certificados...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 rounded-xl flex items-center justify-between px-8 text-white shadow">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Award size={28} /> Certificados
          </h2>
          <p className="text-sm opacity-90 mt-2">
            Emite certificados y gestiona la plantilla visual.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <button
          type="button"
          onClick={() => setMostrarEmision((prev) => !prev)}
          className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
              <FileBadge size={22} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-800">
                Emitir certificado
              </h3>
              <p className="text-sm text-gray-500">
                Genera un certificado final usando la plantilla activa.
              </p>
            </div>
          </div>

          {mostrarEmision ? (
            <ChevronUp className="text-gray-500" size={22} />
          ) : (
            <ChevronDown className="text-gray-500" size={22} />
          )}
        </button>

        {mostrarEmision && (
          <div className="border-t border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Alumno
                </label>
                <select
                  value={emision.idalumno}
                  onChange={(e) => handleSeleccionAlumno(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Selecciona un alumno</option>
                  {alumnos.map((alumno) => (
                    <option key={alumno.id} value={alumno.id}>
                      {`${alumno.nombre || ""} ${alumno.apellido || ""}`.trim()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Nombre del alumno
                </label>
                <input
                  type="text"
                  value={emision.nombreAlumno}
                  onChange={(e) =>
                    setEmision((prev) => ({
                      ...prev,
                      nombreAlumno: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nombre que irá en el certificado"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Curso
                </label>

                <select
                  value={emision.idgrupo}
                  onChange={(e) => handleSeleccionCurso(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  disabled={!emision.idalumno || cargandoCursosAlumno}
                >
                  <option value="">
                    {cargandoCursosAlumno
                      ? "Cargando cursos..."
                      : "Selecciona un curso matriculado"}
                  </option>

                  {cursosAlumno.map((curso) => (
                    <option
                      key={`${curso.idgrupo}-${curso.idcurso}`}
                      value={curso.idgrupo}
                      disabled={!curso.completo && !permitirEmisionManual}
                    >
                      {curso.nombrecurso}
                      {curso.completo ? " ✅" : " — Incompleto"}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2 text-sm text-gray-700 mt-3">
                  <input
                    type="checkbox"
                    checked={permitirEmisionManual}
                    onChange={(e) => setPermitirEmisionManual(e.target.checked)}
                  />
                  Permitir emisión manual aunque el curso no esté completo
                </label>

                {emision.idgrupo &&
                  (() => {
                    const cursoSeleccionado = cursosAlumno.find(
                      (c) => String(c.idgrupo) === String(emision.idgrupo)
                    );

                    if (!cursoSeleccionado) return null;

                    return (
                      <p
                        className={`text-xs mt-2 ${
                          cursoSeleccionado.completo
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {cursoSeleccionado.completo
                          ? "Curso completo: listo para emisión."
                          : "Curso incompleto: solo puede emitirse si activas la emisión manual."}
                      </p>
                    );
                  })()}

                {emision.idalumno && !cargandoCursosAlumno && cursosAlumno.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2">
                    Este alumno no tiene cursos matriculados.
                  </p>
                )}

                {emision.idalumno &&
                  !cargandoCursosAlumno &&
                  cursosAlumno.length > 0 &&
                  !permitirEmisionManual && (
                    <p className="text-xs text-gray-500 mt-2">
                      Solo se pueden seleccionar cursos que ya estén completos. Los incompletos aparecen bloqueados.
                    </p>
                  )}

                {permitirEmisionManual && (
                  <p className="text-xs text-amber-600 mt-2">
                    Modo manual activo: también podrás emitir certificados de cursos incompletos.
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Fecha de emisión
                </label>
                <input
                  type="date"
                  value={emision.fechaEmision}
                  onChange={(e) =>
                    setEmision((prev) => ({
                      ...prev,
                      fechaEmision: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Curso a mostrar
                </label>
                <input
                  type="text"
                  value={emision.curso}
                  onChange={(e) =>
                    setEmision((prev) => ({
                      ...prev,
                      curso: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nombre que irá en el certificado"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={emision.descripcion}
                  onChange={(e) =>
                    setEmision((prev) => ({
                      ...prev,
                      descripcion: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Texto que irá en el certificado"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Horas
                </label>
                <input
                  type="number"
                  value={emision.horas}
                  onChange={(e) =>
                    setEmision((prev) => ({
                      ...prev,
                      horas: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ej. 120"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Créditos
                </label>
                <input
                  type="number"
                  value={emision.creditos}
                  onChange={(e) =>
                    setEmision((prev) => ({
                      ...prev,
                      creditos: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ej. 3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Código de certificado
                </label>
                <input
                  type="text"
                  value={emision.codigoCertificado}
                  onChange={(e) =>
                    setEmision((prev) => ({
                      ...prev,
                      codigoCertificado: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Opcional, si lo dejas vacío se genera automático"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleEmitirCertificado}
                disabled={emitiendo}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-70"
              >
                {emitiendo ? "Generando..." : "Generar certificado"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <button
          type="button"
          onClick={() => setMostrarConfigCurso((prev) => !prev)}
          className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
              <Settings2 size={22} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-800">
                Configuración de certificado por curso
              </h3>
              <p className="text-sm text-gray-500">
                Define cómo se entregará el certificado automáticamente cuando
                el curso se complete.
              </p>
            </div>
          </div>

          {mostrarConfigCurso ? (
            <ChevronUp className="text-gray-500" size={22} />
          ) : (
            <ChevronDown className="text-gray-500" size={22} />
          )}
        </button>

        {mostrarConfigCurso && (
          <div className="border-t border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Curso
                </label>
                <select
                  value={configCurso.idcurso}
                  onChange={(e) => handleSeleccionCursoConfig(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Selecciona un curso</option>
                  {cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombrecurso}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Modo de entrega
                </label>
                <select
                  value={configCurso.modoEntrega}
                  onChange={(e) =>
                    setConfigCurso((prev) => ({
                      ...prev,
                      modoEntrega: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="DESCARGA_UNICA">
                    Descarga única del alumno
                  </option>
                  <option value="EMAIL">Enviar al correo del alumno</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Plantilla
                </label>
                <select
                  value={configCurso.plantillaId}
                  onChange={(e) =>
                    setConfigCurso((prev) => ({
                      ...prev,
                      plantillaId: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Usar plantilla activa</option>
                  {plantillas.map((plantilla) => (
                    <option key={plantilla.id} value={plantilla.id}>
                      {plantilla.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Nota mínima
                </label>
                <input
                  type="number"
                  value={configCurso.notaMinima}
                  onChange={(e) =>
                    setConfigCurso((prev) => ({
                      ...prev,
                      notaMinima: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Asistencia mínima
                </label>
                <input
                  type="number"
                  value={configCurso.asistenciaMinima}
                  onChange={(e) =>
                    setConfigCurso((prev) => ({
                      ...prev,
                      asistenciaMinima: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Opcional"
                />
              </div>

              <div className="flex flex-col justify-end gap-3">
                <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!configCurso.habilitado}
                    onChange={(e) =>
                      setConfigCurso((prev) => ({
                        ...prev,
                        habilitado: e.target.checked,
                      }))
                    }
                  />
                  Certificado habilitado
                </label>

                <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!configCurso.requiereAprobacion}
                    onChange={(e) =>
                      setConfigCurso((prev) => ({
                        ...prev,
                        requiereAprobacion: e.target.checked,
                      }))
                    }
                  />
                  Requiere aprobación
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleGuardarConfigCurso}
                disabled={guardandoConfigCurso}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {guardandoConfigCurso
                  ? "Guardando..."
                  : "Guardar configuración"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <button
          type="button"
          onClick={() => setMostrarListadoCertificados((prev) => !prev)}
          className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-violet-100 text-violet-700">
              <FileBadge size={22} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-800">
                Certificados generados
              </h3>
              <p className="text-sm text-gray-500">
                Busca, filtra, abre y anula certificados emitidos.
              </p>
            </div>
          </div>

          {mostrarListadoCertificados ? (
            <ChevronUp className="text-gray-500" size={22} />
          ) : (
            <ChevronDown className="text-gray-500" size={22} />
          )}
        </button>

        {mostrarListadoCertificados && (
          <div className="border-t border-gray-100 p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Búsqueda general
                </label>
                <input
                  type="text"
                  value={filtrosCertificados.search}
                  onChange={(e) =>
                    setFiltrosCertificados((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Alumno, código, curso..."
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  DNI
                </label>
                <input
                  type="text"
                  value={filtrosCertificados.dni}
                  onChange={(e) =>
                    setFiltrosCertificados((prev) => ({
                      ...prev,
                      dni: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="DNI del alumno"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Curso
                </label>
                <input
                  type="text"
                  value={filtrosCertificados.curso}
                  onChange={(e) =>
                    setFiltrosCertificados((prev) => ({
                      ...prev,
                      curso: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nombre del curso"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Estado
                </label>
                <select
                  value={filtrosCertificados.estado}
                  onChange={(e) =>
                    setFiltrosCertificados((prev) => ({
                      ...prev,
                      estado: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="TODOS">Todos</option>
                  <option value="ENVIADO">Enviado</option>
                  <option value="PENDIENTE_EMAIL">Pendiente email</option>
                  <option value="DISPONIBLE_DESCARGA">Disponible descarga</option>
                  <option value="DESCARGADO">Descargado</option>
                  <option value="ANULADO">Anulado</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Anulado
                </label>
                <select
                  value={filtrosCertificados.anulado}
                  onChange={(e) =>
                    setFiltrosCertificados((prev) => ({
                      ...prev,
                      anulado: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="NO">Solo activos</option>
                  <option value="SI">Solo anulados</option>
                  <option value="TODOS">Todos</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleBuscarCertificados}
                className="px-5 py-2.5 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors"
              >
                Buscar
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Código</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Alumno</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">DNI</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Curso</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {cargandoCertificadosAdmin ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        Cargando certificados...
                      </td>
                    </tr>
                  ) : certificadosAdmin.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        No se encontraron certificados.
                      </td>
                    </tr>
                  ) : (
                    certificadosAdmin.map((cert) => (
                      <tr key={cert.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">{cert.codigoCertificado || "-"}</td>
                        <td className="px-4 py-3">{cert.nombreAlumno || "-"}</td>
                        <td className="px-4 py-3">{cert.dniAlumno || "-"}</td>
                        <td className="px-4 py-3">{cert.curso || "-"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              cert.estado === "ENVIADO"
                                ? "bg-emerald-100 text-emerald-700"
                                : cert.estado === "ANULADO"
                                ? "bg-rose-100 text-rose-700"
                                : cert.estado === "DESCARGADO"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {cert.estado || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {cert.fechaEmision
                            ? new Date(cert.fechaEmision).toLocaleDateString("es-PE")
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                window.open(getCertificadoArchivoUrl(cert.id), "_blank")
                              }
                              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
                            >
                              Ver
                            </button>

                            {!cert.anulado && (
                              <button
                                onClick={() => handleAnularCertificado(cert)}
                                disabled={anulandoCertificadoId === cert.id}
                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-70"
                              >
                                {anulandoCertificadoId === cert.id
                                  ? "Anulando..."
                                  : "Anular"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <button
          type="button"
          onClick={() => setMostrarGestionPlantilla((prev) => !prev)}
          className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700">
              <Award size={22} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-800">
                Gestionar plantilla de certificado
              </h3>
              <p className="text-sm text-gray-500">
                Administra plantillas guardadas y edita el diseño visual.
              </p>
            </div>
          </div>

          {mostrarGestionPlantilla ? (
            <ChevronUp className="text-gray-500" size={22} />
          ) : (
            <ChevronDown className="text-gray-500" size={22} />
          )}
        </button>

        {mostrarGestionPlantilla && (
          <div className="border-t border-gray-100 p-6 space-y-6">
            <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Plantillas guardadas
                  </h3>
                  <p className="text-sm text-gray-500">
                    Carga, activa o elimina una plantilla existente.
                  </p>
                </div>

                <button
                  onClick={prepararNuevaPlantilla}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-black transition-colors"
                >
                  Nueva plantilla
                </button>
              </div>

              {plantillas.length === 0 ? (
                <div className="text-sm text-gray-500 border border-dashed rounded-xl p-4 bg-white">
                  Aún no hay plantillas guardadas.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {plantillas.map((plantilla) => {
                    const estaSeleccionada = plantilla.id === plantillaId;

                    return (
                      <div
                        key={plantilla.id}
                        className={`rounded-xl border p-4 transition-all ${
                          estaSeleccionada
                            ? "border-indigo-500 bg-indigo-50/50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {plantilla.nombre}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {plantilla.canvasWidth} ×{" "}
                              {plantilla.canvasHeight}
                            </p>
                          </div>

                          {plantilla.activa && (
                            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-green-100 text-green-700">
                              Activa
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => aplicarPlantillaEnEditor(plantilla)}
                            className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
                          >
                            Cargar
                          </button>

                          {!plantilla.activa && (
                            <button
                              onClick={() =>
                                handleActivarPlantilla(plantilla.id)
                              }
                              className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                            >
                              Activar
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleEliminarPlantilla(plantilla.id)
                            }
                            className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={guardar}
                disabled={guardando}
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
              >
                <Save size={18} />
                {guardando ? "Guardando..." : "Guardar plantilla"}
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_320px] gap-6">
              <div className="bg-white rounded-2xl shadow p-5 space-y-5 border border-gray-100">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Nombre de plantilla
                  </label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Ancho
                    </label>
                    <input
                      type="number"
                      value={canvasWidth}
                      onChange={(e) =>
                        setCanvasWidth(Number(e.target.value) || 1600)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Alto
                    </label>
                    <input
                      type="number"
                      value={canvasHeight}
                      onChange={(e) =>
                        setCanvasHeight(Number(e.target.value) || 1131)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Fondo del certificado
                  </label>

                  <label className="w-full flex items-center justify-center gap-2 cursor-pointer border border-dashed border-indigo-300 bg-indigo-50 text-indigo-700 px-4 py-3 rounded-xl hover:bg-indigo-100 transition-colors">
                    <Upload size={18} />
                    Subir fondo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSubirFondo}
                      className="hidden"
                    />
                  </label>

                  {fondoKey && (
                    <div className="text-xs text-gray-500 break-all">
                      Fondo cargado: {fondoKey}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={agregarTextoLibre}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors"
                  >
                    <Type size={18} />
                    Agregar texto libre
                  </button>

                  <label className="w-full flex items-center justify-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                    <ImagePlus size={18} />
                    Agregar imagen
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAgregarImagen}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={agregarQrPlaceholder}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                  >
                    Agregar QR
                  </button>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-gray-700">
                      Campos dinámicos
                    </div>

                    {CAMPOS.map((campo) => (
                      <button
                        key={campo.key}
                        onClick={() => agregarCampo(campo.key)}
                        className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                      >
                        + {campo.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-5 overflow-auto border border-gray-100">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Vista previa
                    </h3>
                    <p className="text-sm text-gray-500">
                      Arrastra los elementos para moverlos.
                    </p>
                  </div>
                </div>

                <div className="overflow-auto border rounded-xl bg-gray-100 p-4">
                  <div
                    style={{
                      width: canvasWidth * escala,
                      height: canvasHeight * escala,
                    }}
                  >
                    <Stage
                      width={canvasWidth}
                      height={canvasHeight}
                      scaleX={escala}
                      scaleY={escala}
                      onMouseDown={(e) => {
                        if (e.target === e.target.getStage()) {
                          setSeleccionadoId(null);
                        }
                      }}
                      onTouchStart={(e) => {
                        if (e.target === e.target.getStage()) {
                          setSeleccionadoId(null);
                        }
                      }}
                    >
                      <Layer>
                        <Rect
                          x={0}
                          y={0}
                          width={canvasWidth}
                          height={canvasHeight}
                          fill="#ffffff"
                        />

                        {backgroundImage && (
                          <KonvaImage
                            image={backgroundImage}
                            x={0}
                            y={0}
                            width={canvasWidth}
                            height={canvasHeight}
                            listening={false}
                          />
                        )}

                        {elementos.map((el) => {
                          const selected = el.id === seleccionadoId;

                          if (el.type === "qr") {
                            return (
                              <Fragment key={el.id}>
                                {selected && (
                                  <Rect
                                    x={el.x - 8}
                                    y={el.y - 8}
                                    width={(el.width || 160) + 16}
                                    height={(el.height || 160) + 16}
                                    stroke="#2563eb"
                                    dash={[8, 5]}
                                    cornerRadius={8}
                                    listening={false}
                                  />
                                )}

                                <Rect
                                  x={el.x}
                                  y={el.y}
                                  width={el.width || 160}
                                  height={el.height || 160}
                                  fill="#ffffff"
                                  stroke="#0f172a"
                                  strokeWidth={2}
                                  dash={[10, 6]}
                                  cornerRadius={10}
                                  draggable={!el.locked}
                                  onClick={(evt) => {
                                    evt.cancelBubble = true;
                                    setSeleccionadoId(el.id);
                                  }}
                                  onTap={(evt) => {
                                    evt.cancelBubble = true;
                                    setSeleccionadoId(el.id);
                                  }}
                                  onDragEnd={(evt) =>
                                    actualizarElemento(el.id, {
                                      x: evt.target.x(),
                                      y: evt.target.y(),
                                    })
                                  }
                                />

                                <KonvaText
                                  x={el.x}
                                  y={el.y + (el.height || 160) / 2 - 22}
                                  width={el.width || 160}
                                  text={"QR\nValidación"}
                                  fontSize={22}
                                  fontStyle="bold"
                                  fontFamily="Arial"
                                  fill="#334155"
                                  align="center"
                                  listening={false}
                                />
                              </Fragment>
                            );
                          }

                          if (el.type === "image") {
                            const imagen = imagenesCargadas[el.id];

                            return (
                              <Fragment key={el.id}>
                                {selected && (
                                  <Rect
                                    x={el.x - 8}
                                    y={el.y - 8}
                                    width={(el.width || 100) + 16}
                                    height={(el.height || 100) + 16}
                                    stroke="#2563eb"
                                    dash={[8, 5]}
                                    cornerRadius={8}
                                    listening={false}
                                  />
                                )}

                                {imagen && (
                                  <KonvaImage
                                    image={imagen}
                                    x={el.x}
                                    y={el.y}
                                    width={el.width || 100}
                                    height={el.height || 100}
                                    draggable={!el.locked}
                                    onClick={(evt) => {
                                      evt.cancelBubble = true;
                                      setSeleccionadoId(el.id);
                                    }}
                                    onTap={(evt) => {
                                      evt.cancelBubble = true;
                                      setSeleccionadoId(el.id);
                                    }}
                                    onDragEnd={(evt) =>
                                      actualizarElemento(el.id, {
                                        x: evt.target.x(),
                                        y: evt.target.y(),
                                      })
                                    }
                                  />
                                )}
                              </Fragment>
                            );
                          }

                          const previewText = el.dynamicField
                            ? MUESTRAS[el.dynamicField] || el.dynamicField
                            : el.text;

                          return (
                            <Fragment key={el.id}>
                              {selected && (
                                <Rect
                                  x={el.x - 8}
                                  y={el.y - 8}
                                  width={(el.width || 300) + 16}
                                  height={Math.max(el.fontSize + 26, 44)}
                                  stroke="#2563eb"
                                  dash={[8, 5]}
                                  cornerRadius={8}
                                  listening={false}
                                />
                              )}

                              <KonvaText
                                x={el.x}
                                y={el.y}
                                width={el.width || 300}
                                text={previewText || " "}
                                fontSize={el.fontSize || 24}
                                fill={el.color || "#111827"}
                                fontStyle={el.fontStyle || "normal"}
                                fontFamily={el.fontFamily || "Arial"}
                                align={el.align || "left"}
                                draggable={!el.locked}
                                onClick={(evt) => {
                                  evt.cancelBubble = true;
                                  setSeleccionadoId(el.id);
                                }}
                                onTap={(evt) => {
                                  evt.cancelBubble = true;
                                  setSeleccionadoId(el.id);
                                }}
                                onDragEnd={(evt) =>
                                  actualizarElemento(el.id, {
                                    x: evt.target.x(),
                                    y: evt.target.y(),
                                  })
                                }
                              />
                            </Fragment>
                          );
                        })}
                      </Layer>
                    </Stage>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-5 space-y-5 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">Propiedades</h3>

                {!seleccionado ? (
                  <div className="text-sm text-gray-500">
                    Selecciona un elemento para editarlo.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={duplicarSeleccionado}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
                      >
                        <Copy size={16} />
                        Duplicar
                      </button>

                      <button
                        onClick={eliminarSeleccionado}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>

                      <button
                        onClick={traerAlFrente}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
                      >
                        <ArrowUp size={16} />
                        Al frente
                      </button>

                      <button
                        onClick={enviarAtras}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
                      >
                        <ArrowDown size={16} />
                        Atrás
                      </button>
                    </div>

                    {seleccionado.type !== "image" && seleccionado.type !== "qr" && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                          Tipo de contenido
                        </label>
                        <select
                          value={seleccionado.dynamicField || ""}
                          onChange={(e) =>
                            actualizarSeleccionado({
                              dynamicField: e.target.value || null,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="">Texto libre</option>
                          {CAMPOS.map((campo) => (
                            <option key={campo.key} value={campo.key}>
                              {campo.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {seleccionado.type !== "image" &&
                      seleccionado.type !== "qr" &&
                      !seleccionado.dynamicField && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Texto
                          </label>
                          <textarea
                            rows={3}
                            value={seleccionado.text || ""}
                            onChange={(e) =>
                              actualizarSeleccionado({ text: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                      )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                          X
                        </label>
                        <input
                          type="number"
                          value={seleccionado.x}
                          onChange={(e) =>
                            actualizarSeleccionado({
                              x: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                          Y
                        </label>
                        <input
                          type="number"
                          value={seleccionado.y}
                          onChange={(e) =>
                            actualizarSeleccionado({
                              y: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">
                          Ancho
                        </label>
                        <input
                          type="number"
                          value={seleccionado.width || 300}
                          onChange={(e) =>
                            actualizarSeleccionado({
                              width: Number(e.target.value) || 300,
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>

                      {seleccionado.type === "image" || seleccionado.type === "qr" ? (
                        <div>
                          <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Alto
                          </label>
                          <input
                            type="number"
                            value={seleccionado.height || 300}
                            onChange={(e) =>
                              actualizarSeleccionado({
                                height: Number(e.target.value) || 300,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Tamaño
                          </label>
                          <input
                            type="number"
                            value={seleccionado.fontSize || 24}
                            onChange={(e) =>
                              actualizarSeleccionado({
                                fontSize: Number(e.target.value) || 24,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                      )}
                    </div>

                    {seleccionado.type !== "image" && seleccionado.type !== "qr" && (
                      <>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Color
                          </label>
                          <input
                            type="color"
                            value={seleccionado.color || "#111827"}
                            onChange={(e) =>
                              actualizarSeleccionado({
                                color: e.target.value,
                              })
                            }
                            className="w-full h-11 border border-gray-300 rounded-lg px-2"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                              Alineación
                            </label>
                            <select
                              value={seleccionado.align || "left"}
                              onChange={(e) =>
                                actualizarSeleccionado({
                                  align: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                              <option value="left">Izquierda</option>
                              <option value="center">Centro</option>
                              <option value="right">Derecha</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-2">
                              Estilo
                            </label>
                            <select
                              value={seleccionado.fontStyle || "normal"}
                              onChange={(e) =>
                                actualizarSeleccionado({
                                  fontStyle: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                              <option value="normal">Normal</option>
                              <option value="bold">Negrita</option>
                              <option value="italic">Cursiva</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-semibold text-gray-700 block mb-2">
                            Fuente
                          </label>
                          <select
                            value={seleccionado.fontFamily || "Arial"}
                            onChange={(e) =>
                              actualizarSeleccionado({
                                fontFamily: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Times New Roman">
                              Times New Roman
                            </option>
                            <option value="Verdana">Verdana</option>
                          </select>
                        </div>
                      </>
                    )}

                    <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={!!seleccionado.locked}
                        onChange={(e) =>
                          actualizarSeleccionado({
                            locked: e.target.checked,
                          })
                        }
                      />
                      Bloquear movimiento
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}