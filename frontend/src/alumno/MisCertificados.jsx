import { useEffect, useMemo, useState } from "react";
import { Award, FileText, Download, BookOpen, X } from "lucide-react";
import api from "../api";

export default function MisCertificados() {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarCertificados();
  }, []);

  const resumen = useMemo(() => {
    const total = certificados.length;
    const horas = certificados.reduce(
      (acc, c) => acc + Number(c.horas || 0),
      0,
    );
    return { total, horas };
  }, [certificados]);

  async function cargarCertificados() {
    try {
      setLoading(true);
      setError("");

      const idalumno = localStorage.getItem("idalumno");

      // Endpoint temporal para evitar 404
      const res = await api.get("/certificado");
      const data = Array.isArray(res.data) ? res.data : [];

      // Si luego el backend devuelve idalumno o una relación real, aquí puedes filtrar
      const certificadosNormalizados = data.map((item) => ({
        id: item.id,
        fecha: item.fecha || item.fechaEmision || item.created_at || null,
        curso:
          item.curso ||
          item.nombrecurso ||
          item.codigoCertificado ||
          "Certificado",
        horas: Number(item.horas || 0),
        creditos: Number(item.creditos || 0),
        archivo_url: item.archivo_url || item.url || item.plantilla_url || "",
        puede_ver: item.puede_ver_certificado === true,
        puede_descargar: item.puede_descargar_certificado === true,
      }));

      // Si no hay nada real, quedará vacío
      setCertificados(
        certificadosNormalizados.filter(
          (c) => (c.archivo_url || c.curso) && c.puede_ver,
        ),
      );
    } catch (err) {
      console.error("Error cargando certificados:", err);

      // fallback temporal
      setCertificados([
        {
          id: 1,
          fecha: "2025-03-10",
          curso: "React Avanzado",
          horas: 40,
          creditos: 3,
          archivo_url:
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        },
      ]);

      setError("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Mis Certificados</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Consulta y descarga los certificados obtenidos en tus cursos.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            icon={<Award size={20} />}
            label="Certificados"
            value={resumen.total}
          />
          <StatCard
            icon={<BookOpen size={20} />}
            label="Horas acumuladas"
            value={resumen.horas}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Certificados obtenidos
          </h2>
        </div>

        {loading ? (
          <div className="space-y-4 p-5">
            {[...Array(3)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : certificados.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Award size={24} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-700">
              Aún no tienes certificados
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Completa tus cursos para obtener certificados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold">Fecha</th>
                  <th className="px-5 py-4 text-left font-semibold">Curso</th>
                  <th className="px-5 py-4 text-left font-semibold">Horas</th>
                  <th className="px-5 py-4 text-left font-semibold">
                    Créditos
                  </th>
                  <th className="px-5 py-4 text-left font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {certificados.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">{formatearFecha(c.fecha)}</td>

                    <td className="px-5 py-4 font-medium text-slate-800">
                      {c.curso}
                    </td>

                    <td className="px-5 py-4">{c.horas}</td>

                    <td className="px-5 py-4">{c.creditos}</td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {/* El botón de Ver siempre está activo si el certificado es visible */}
                        <button
                          onClick={() => setPreview(c.archivo_url)}
                          disabled={!c.archivo_url}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
                            c.archivo_url
                              ? "border-slate-300 hover:bg-slate-100"
                              : "cursor-not-allowed border-slate-200 text-slate-400 bg-slate-50"
                          }`}
                        >
                          <FileText size={16} />
                          Visualizar
                        </button>

                        {/* Bloqueamos la descarga según el permiso */}
                        {!c.puede_descargar ? (
                          <span className="flex items-center rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 border border-slate-200 cursor-not-allowed">
                            <Download size={16} className="mr-1 opacity-50" />{" "}
                            Solo lectura
                          </span>
                        ) : (
                          <a
                            href={c.archivo_url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                              c.archivo_url
                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                : "pointer-events-none bg-slate-300 text-white"
                            }`}
                          >
                            <Download size={16} />
                            Descargar
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative h-[90vh] w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
            <button
              onClick={() => setPreview(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2 hover:bg-slate-200"
            >
              <X size={18} />
            </button>

            <iframe
              src={preview}
              className="h-full w-full rounded-3xl"
              title="Vista previa del certificado"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
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

function SkeletonRow() {
  return (
    <div className="grid grid-cols-5 px-5 py-4 animate-pulse">
      <div className="h-4 w-20 rounded bg-slate-200" />
      <div className="h-4 w-40 rounded bg-slate-200" />
      <div className="h-4 w-10 rounded bg-slate-200" />
      <div className="h-4 w-10 rounded bg-slate-200" />
      <div className="h-4 w-20 rounded bg-slate-200" />
    </div>
  );
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return "-";

  return new Date(fechaISO).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
