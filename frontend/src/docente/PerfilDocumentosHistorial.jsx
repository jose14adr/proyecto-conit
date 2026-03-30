import { useMemo, useState } from "react";
import {
  uploadPdfDocumentoDocente,
  deleteDocumentoDocente,
  addHistorialDocente,
  deleteHistorialDocente,
} from "../services/docenteService";

const TIPOS_DOCUMENTO = {
  ACADEMICOS: ["grado_academico", "titulo_profesional", "certificado_estudios"],
  EXPERIENCIA: ["sustento_experiencia"],
  CV_OTROS: ["cv", "otros"],
};

const OPCIONES_TIPO_ACADEMICO = [
  { value: "grado_academico", label: "Grado académico" },
  { value: "titulo_profesional", label: "Título profesional" },
  { value: "certificado_estudios", label: "Certificado de estudios" },
];

const OPCIONES_TIPO_HISTORIAL = [
  "Docencia",
  "Experiencia laboral",
  "Investigación",
  "Capacitación",
  "Coordinación",
  "Administración",
  "Otro",
];

function PerfilDocumentosHistorial({
  documentos = [],
  setDocumentos,
  historial = [],
  setHistorial,
  showMessage = () => {},
}) {
  const [subiendo, setSubiendo] = useState({
    academico: false,
    experiencia: false,
    cv: false,
  });

  const [tipoAcademicoSeleccionado, setTipoAcademicoSeleccionado] =
    useState("grado_academico");

  const [formHistorial, setFormHistorial] = useState({
    tipo: "Experiencia laboral",
    institucion: "",
    cargo: "",
    area: "",
    sector: "",
    fecha_inicio: "",
    fecha_fin: "",
    descripcion: "",
  });

  const [guardandoHistorial, setGuardandoHistorial] = useState(false);

  const docsAcademicos = useMemo(
    () =>
      documentos.filter((doc) =>
        TIPOS_DOCUMENTO.ACADEMICOS.includes(String(doc.tipo || "").toLowerCase())
      ),
    [documentos]
  );

  const docsExperiencia = useMemo(
    () =>
      documentos.filter((doc) =>
        TIPOS_DOCUMENTO.EXPERIENCIA.includes(String(doc.tipo || "").toLowerCase())
      ),
    [documentos]
  );

  const docsCvOtros = useMemo(
    () =>
      documentos.filter((doc) => {
        const tipo = String(doc.tipo || "").toLowerCase();
        return (
          TIPOS_DOCUMENTO.CV_OTROS.includes(tipo) &&
          !TIPOS_DOCUMENTO.ACADEMICOS.includes(tipo) &&
          !TIPOS_DOCUMENTO.EXPERIENCIA.includes(tipo)
        );
      }),
    [documentos]
  );

  const updateHistorial = (field, value) => {
    setFormHistorial((prev) => ({ ...prev, [field]: value }));
  };

  const subirDocumento = async (file, tipo, bucketKey) => {
    try {
      if (!file) return;

      setSubiendo((prev) => ({ ...prev, [bucketKey]: true }));
      const nuevoDoc = await uploadPdfDocumentoDocente(file, tipo);

      if (typeof setDocumentos === "function") {
        setDocumentos((prev) => [nuevoDoc, ...(prev || [])]);
      }

      showMessage("success", "Documento subido correctamente.");
    } catch (error) {
      console.error(error);
      showMessage("error", error?.message || "No se pudo subir el documento.");
    } finally {
      setSubiendo((prev) => ({ ...prev, [bucketKey]: false }));
    }
  };

  const eliminarDocumento = async (id) => {
    try {
      await deleteDocumentoDocente(id);

      if (typeof setDocumentos === "function") {
        setDocumentos((prev) => (prev || []).filter((doc) => doc.id !== id));
      }

      showMessage("success", "Documento eliminado correctamente.");
    } catch (error) {
      console.error(error);
      showMessage("error", error?.message || "No se pudo eliminar el documento.");
    }
  };

  const guardarHistorial = async () => {
    try {
      if (!formHistorial.tipo.trim()) {
        showMessage("error", "Selecciona el tipo de historial.");
        return;
      }

      if (!formHistorial.institucion.trim()) {
        showMessage("error", "Ingresa la institución o empresa.");
        return;
      }

      if (!formHistorial.cargo.trim()) {
        showMessage("error", "Ingresa el cargo.");
        return;
      }

      setGuardandoHistorial(true);

      const nuevo = await addHistorialDocente({
        tipo: formHistorial.tipo.trim(),
        institucion: formHistorial.institucion.trim(),
        cargo: formHistorial.cargo.trim(),
        area: formHistorial.area.trim() || null,
        sector: formHistorial.sector.trim() || null,
        fecha_inicio: formHistorial.fecha_inicio || null,
        fecha_fin: formHistorial.fecha_fin || null,
        descripcion: formHistorial.descripcion.trim() || null,
      });

      const filaUI = {
        id: nuevo.id,
        tipo: nuevo.tipo,
        desde: nuevo.fecha_inicio,
        hasta: nuevo.fecha_fin,
        detalle: nuevo.descripcion,
        institucion: nuevo.institucion,
        cargo: nuevo.cargo,
        area: nuevo.area,
        sector: nuevo.sector,
      };

      if (typeof setHistorial === "function") {
        setHistorial((prev) => [filaUI, ...(prev || [])]);
      }

      setFormHistorial({
        tipo: "Experiencia laboral",
        institucion: "",
        cargo: "",
        area: "",
        sector: "",
        fecha_inicio: "",
        fecha_fin: "",
        descripcion: "",
      });

      showMessage("success", "Historial agregado correctamente.");
    } catch (error) {
      console.error(error);
      showMessage("error", error?.message || "No se pudo guardar el historial.");
    } finally {
      setGuardandoHistorial(false);
    }
  };

  const eliminarHistorial = async (id) => {
    try {
      await deleteHistorialDocente(id);

      if (typeof setHistorial === "function") {
        setHistorial((prev) => (prev || []).filter((item) => item.id !== id));
      }

      showMessage("success", "Registro eliminado correctamente.");
    } catch (error) {
      console.error(error);
      showMessage("error", error?.message || "No se pudo eliminar el historial.");
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Grados y títulos"
        subtitle="Sube documentos que validen tu formación académica."
        action={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={tipoAcademicoSeleccionado}
              onChange={(e) => setTipoAcademicoSeleccionado(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400"
            >
              {OPCIONES_TIPO_ACADEMICO.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <UploadButton
              label={subiendo.academico ? "Subiendo..." : "Añadir documento"}
              disabled={subiendo.academico}
              onFileSelect={(file) =>
                subirDocumento(file, tipoAcademicoSeleccionado, "academico")
              }
            />
          </div>
        }
      >
        <DocumentsList
          documentos={docsAcademicos}
          emptyText="Aún no hay documentos académicos registrados."
          onDelete={eliminarDocumento}
        />
      </SectionCard>

      <SectionCard
        title="Experiencia laboral"
        subtitle="Adjunta sustentos de experiencia como certificados, constancias o contratos."
        action={
          <UploadButton
            label={subiendo.experiencia ? "Subiendo..." : "Añadir documento"}
            disabled={subiendo.experiencia}
            onFileSelect={(file) =>
              subirDocumento(file, "sustento_experiencia", "experiencia")
            }
          />
        }
      >
        <DocumentsList
          documentos={docsExperiencia}
          emptyText="No hay documentos de experiencia laboral registrados."
          onDelete={eliminarDocumento}
        />
      </SectionCard>

      <SectionCard
        title="CV y otros documentos"
        subtitle="Puedes subir tu CV u otros archivos complementarios."
        action={
          <div className="flex flex-wrap gap-2">
            <UploadButton
              label={subiendo.cv ? "Subiendo CV..." : "Subir CV"}
              disabled={subiendo.cv}
              onFileSelect={(file) => subirDocumento(file, "cv", "cv")}
            />
            <UploadButton
              label="Subir otro documento"
              disabled={subiendo.cv}
              onFileSelect={(file) => subirDocumento(file, "otros", "cv")}
            />
          </div>
        }
      >
        <DocumentsList
          documentos={docsCvOtros}
          emptyText="No hay CV ni otros documentos registrados."
          onDelete={eliminarDocumento}
        />
      </SectionCard>

      <SectionCard
        title="Historial laboral"
        subtitle="Agrega la trayectoria profesional del docente."
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SelectField
              label="Tipo"
              value={formHistorial.tipo}
              onChange={(value) => updateHistorial("tipo", value)}
              options={OPCIONES_TIPO_HISTORIAL}
            />

            <InputField
              label="Institución / Empresa"
              value={formHistorial.institucion}
              onChange={(value) => updateHistorial("institucion", value)}
              placeholder="Ej. Universidad / Empresa"
            />

            <InputField
              label="Cargo"
              value={formHistorial.cargo}
              onChange={(value) => updateHistorial("cargo", value)}
              placeholder="Ej. Docente, Coordinador"
            />

            <InputField
              label="Área"
              value={formHistorial.area}
              onChange={(value) => updateHistorial("area", value)}
              placeholder="Ej. Académica"
            />

            <InputField
              label="Sector"
              value={formHistorial.sector}
              onChange={(value) => updateHistorial("sector", value)}
              placeholder="Ej. Educación"
            />

            <InputField
              label="Fecha de inicio"
              type="date"
              value={formHistorial.fecha_inicio}
              onChange={(value) => updateHistorial("fecha_inicio", value)}
            />

            <InputField
              label="Fecha de fin"
              type="date"
              value={formHistorial.fecha_fin}
              onChange={(value) => updateHistorial("fecha_fin", value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Descripción
            </label>
            <textarea
              rows={4}
              value={formHistorial.descripcion}
              onChange={(e) => updateHistorial("descripcion", e.target.value)}
              placeholder="Describe brevemente las funciones o logros."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={guardarHistorial}
              disabled={guardandoHistorial}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardandoHistorial ? "Guardando..." : "Agregar historial"}
            </button>
          </div>

          <TimelineList historial={historial} onDelete={eliminarHistorial} />
        </div>
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, subtitle, action = null, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h4 className="text-base font-semibold text-slate-900">{title}</h4>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>

      <div className="pt-4">{children}</div>
    </div>
  );
}

function UploadButton({ label, onFileSelect, disabled = false }) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
          : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
      }`}
    >
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect?.(file);
          e.target.value = "";
        }}
      />
      {label}
    </label>
  );
}

function DocumentsList({ documentos = [], emptyText, onDelete }) {
  if (!documentos.length) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {documentos.map((doc) => (
        <div
          key={doc.id}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{doc.nombre}</p>
            <p className="mt-1 text-sm text-slate-500">{formatTipoDocumento(doc.tipo)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={doc.archivo_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Ver PDF
            </a>

            <a
              href={doc.archivo_url}
              download
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white transition hover:bg-indigo-700"
            >
              Descargar
            </a>

            <button
              type="button"
              onClick={() => onDelete?.(doc.id)}
              className="rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineList({ historial = [], onDelete }) {
  if (!historial.length) {
    return (
      <p className="text-sm text-slate-500">
        No hay historial laboral registrado todavía.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {historial.map((item) => (
        <div
          key={item.id}
          className="relative rounded-2xl border border-slate-200 bg-white p-4 pl-6"
        >
          <span className="absolute left-3 top-6 h-2.5 w-2.5 rounded-full bg-indigo-500" />

          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="font-semibold text-slate-800">
                {item.tipo || "Registro"}
              </div>

              {(item.cargo || item.institucion) && (
                <div className="mt-1 text-sm text-slate-700">
                  {[item.cargo, item.institucion].filter(Boolean).join(" - ")}
                </div>
              )}

              <div className="mt-1 text-xs text-slate-500">
                {item.desde || "--"} {item.hasta ? `a ${item.hasta}` : ""}
              </div>

              {(item.area || item.sector) && (
                <div className="mt-1 text-xs text-slate-500">
                  {[item.area, item.sector].filter(Boolean).join(" • ")}
                </div>
              )}

              {item.detalle && (
                <div className="mt-2 text-sm text-slate-600">{item.detalle}</div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDelete?.(item.id)}
              className="self-start rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-400"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function formatTipoDocumento(tipo) {
  const value = String(tipo || "").toLowerCase();

  if (value === "grado_academico") return "Grado académico";
  if (value === "titulo_profesional") return "Título profesional";
  if (value === "certificado_estudios") return "Certificado de estudios";
  if (value === "sustento_experiencia") return "Sustento de experiencia";
  if (value === "cv") return "Currículum vitae";
  if (value === "otros") return "Otro documento";

  return tipo || "Documento PDF";
}

export default PerfilDocumentosHistorial;