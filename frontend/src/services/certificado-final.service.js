import axios from "axios";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { obtenerPlantillaActiva } from "./certificado-plantilla.service";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function construirArchivoUrl(id) {
  return `${API_URL}/certificado/${id}/archivo`;
}

function construirValidacionUrl(codigo) {
  return `${API_URL}/certificado/validar/${encodeURIComponent(codigo)}`;
}

function hexToRgb(hex) {
  const normalized = String(hex || "#111827").replace("#", "").trim();
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized.padStart(6, "0").slice(0, 6);

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function mapFontFamily(fontFamily = "Arial") {
  const family = fontFamily.toLowerCase();

  if (family.includes("georgia") || family.includes("times")) {
    return "times";
  }

  if (family.includes("courier")) {
    return "courier";
  }

  return "helvetica";
}

function mapFontStyle(fontStyle = "normal") {
  const style = fontStyle.toLowerCase();
  const isBold = style.includes("bold");
  const isItalic = style.includes("italic");

  if (isBold && isItalic) return "bolditalic";
  if (isBold) return "bold";
  if (isItalic) return "italic";
  return "normal";
}

function formatFecha(fecha) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

function buildCertCode(idalumno, fecha = new Date()) {
  const year = fecha.getFullYear();
  const alumno = idalumno ? String(idalumno).padStart(4, "0") : "0000";
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CERT-${year}-${alumno}-${random}`;
}

function asMultiline(value) {
  if (Array.isArray(value)) return value.join("\n");
  return value || "";
}

function construirValores(datos, codigoFinal) {
  const fecha = datos.fechaEmision ? new Date(datos.fechaEmision) : new Date();

  return {
    alumno: datos.nombreAlumno || "",
    curso: datos.curso || "",
    descripcion: datos.descripcion || "",
    fecha: formatFecha(fecha),
    horas: datos.horas ? `${datos.horas} HORAS ACADÉMICAS` : "",
    codigo: codigoFinal || "",
    dni: datos.dniAlumno || "",
    nota_final: datos.notaFinal ? `Nota final: ${datos.notaFinal}` : "",
    detalle_notas: asMultiline(datos.detalleNotas),
    temario: asMultiline(datos.temario),
  };
}

function dataUrlToImageFormat(dataUrl) {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  if (dataUrl.startsWith("data:image/jpeg")) return "JPEG";
  if (dataUrl.startsWith("data:image/jpg")) return "JPEG";
  return "PNG";
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function urlToDataUrl(url) {
  if (!url) throw new Error("URL de asset no válida");

  const response = await fetch(url, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`No se pudo cargar el asset: ${url}`);
  }

  const blob = await response.blob();
  return blobToDataUrl(blob);
}

function drawWrappedText(doc, el, text) {
  const width = Number(el.width || 300);
  const fontSize = Number(el.fontSize || 24);
  const fontFamily = mapFontFamily(el.fontFamily || "Arial");
  const fontStyle = mapFontStyle(el.fontStyle || "normal");
  const color = hexToRgb(el.color || "#111827");
  const align = el.align || "left";

  doc.setFont(fontFamily, fontStyle);
  doc.setFontSize(fontSize);
  doc.setTextColor(color.r, color.g, color.b);

  const lines = doc.splitTextToSize(String(text), width);
  const lineHeight = fontSize * 1.2;
  const baseY = Number(el.y || 0) + fontSize;

  lines.forEach((line, index) => {
    let anchorX = Number(el.x || 0);

    if (align === "center") {
      anchorX = Number(el.x || 0) + width / 2;
    } else if (align === "right") {
      anchorX = Number(el.x || 0) + width;
    }

    doc.text(line, anchorX, baseY + index * lineHeight, {
      align,
      baseline: "alphabetic",
    });
  });
}

async function generarQrDataUrl(codigoFinal) {
  const qrUrl = construirValidacionUrl(codigoFinal);

  return QRCode.toDataURL(qrUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 220,
  });
}

function dibujarQrEnPosicion(doc, qrElement, qrDataUrl, codigoFinal) {
  const x = Number(qrElement?.x || 1260);
  const y = Number(qrElement?.y || 900);
  const width = Number(qrElement?.width || 180);
  const height = Number(qrElement?.height || 180);

  doc.addImage(qrDataUrl, "PNG", x, y, width, height);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(55, 65, 81);
  doc.text("Validación", x + width / 2, y + height + 14, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.text(codigoFinal, x + width / 2, y + height + 28, {
    align: "center",
    maxWidth: width + 30,
  });
}

async function renderizarCara(doc, plantilla, elementos, valores, codigoFinal) {
  const width = Number(plantilla.canvasWidth || 1600);
  const height = Number(plantilla.canvasHeight || 1131);

  if (plantilla.fondoTemporalUrl) {
    const fondoDataUrl = await urlToDataUrl(plantilla.fondoTemporalUrl);
    doc.addImage(
      fondoDataUrl,
      dataUrlToImageFormat(fondoDataUrl),
      0,
      0,
      width,
      height
    );
  }

  let qrDataUrlCache = null;

  for (const el of elementos) {
    if (el?.type === "image" && el?.src) {
      const imageDataUrl = await urlToDataUrl(el.src);
      doc.addImage(
        imageDataUrl,
        dataUrlToImageFormat(imageDataUrl),
        Number(el.x || 0),
        Number(el.y || 0),
        Number(el.width || 100),
        Number(el.height || 100)
      );
      continue;
    }

    if (el?.type === "qr") {
      if (!qrDataUrlCache) {
        qrDataUrlCache = await generarQrDataUrl(codigoFinal);
      }
      dibujarQrEnPosicion(doc, el, qrDataUrlCache, codigoFinal);
      continue;
    }

    if (el?.type === "text") {
      const text = el.dynamicField ? valores[el.dynamicField] || "" : el.text || "";
      if (!String(text).trim()) continue;
      drawWrappedText(doc, el, text);
    }
  }
}

async function construirPdfDesdePlantilla(plantilla, datos, codigoFinal) {
  if (!plantilla) {
    throw new Error("No hay plantilla activa");
  }

  const width = Number(plantilla.canvasWidth || 1600);
  const height = Number(plantilla.canvasHeight || 1131);
  const orientation = width >= height ? "landscape" : "portrait";

  const doc = new jsPDF({
    orientation,
    unit: "px",
    format: [width, height],
    compress: true,
  });

  const valores = construirValores(datos, codigoFinal);

  const elementosAnverso = Array.isArray(plantilla.configJson)
    ? plantilla.configJson
    : [];

  await renderizarCara(doc, plantilla, elementosAnverso, valores, codigoFinal);

  if (plantilla.dobleCara) {
    doc.addPage([width, height], orientation);

    const elementosReverso = Array.isArray(plantilla.configJsonReverso)
      ? plantilla.configJsonReverso
      : [];

    await renderizarCara(doc, plantilla, elementosReverso, valores, codigoFinal);
  }

  return doc.output("blob");
}

async function subirPdfGenerado(blob, datos, codigoFinal) {
  const formData = new FormData();
  formData.append("file", blob, `${codigoFinal}.pdf`);
  formData.append("idalumno", datos.idalumno != null ? String(datos.idalumno) : "");
  formData.append("idcurso", datos.idcurso != null ? String(datos.idcurso) : "");
  formData.append("curso", datos.curso || "");
  formData.append("horas", datos.horas != null ? String(datos.horas) : "");
  formData.append("creditos", datos.creditos != null ? String(datos.creditos) : "");
  formData.append("fechaEmision", datos.fechaEmision || "");
  formData.append("codigoCertificado", codigoFinal || "");
  formData.append("origen", datos.origen || "PLANTILLA_JSPDF");
  formData.append("emailAlumno", datos.emailAlumno || "");
  formData.append("nombreAlumno", datos.nombreAlumno || "");
  formData.append("dniAlumno", datos.dniAlumno || "");

  const { data } = await axios.post(`${API_URL}/certificado/emitir`, formData, {
    headers: {
      ...authHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}

export async function emitirCertificadoDesdePlantilla(datos) {
  const plantilla = await obtenerPlantillaActiva();

  if (!plantilla) {
    throw new Error("No hay una plantilla activa");
  }

  const fecha = datos.fechaEmision ? new Date(datos.fechaEmision) : new Date();
  const codigoFinal =
    datos.codigoCertificado?.trim() || buildCertCode(datos.idalumno, fecha);

  const pdfBlob = await construirPdfDesdePlantilla(plantilla, datos, codigoFinal);

  return subirPdfGenerado(pdfBlob, datos, codigoFinal);
}

export function getCertificadoArchivoUrl(id) {
  return construirArchivoUrl(id);
}