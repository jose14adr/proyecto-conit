import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getCursoById,
  getAlumnosByCurso,
  getMaterialesCurso,
  addMaterialCurso,
  guardarAsistenciaCurso,
  getAsistenciaCursoPorFecha,
} from "../services/docenteService";

function CursoDetalleDocente() {
  const { id } = useParams();

  const [curso, setCurso] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== Insertar PDF =====

  const exportarPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Reporte de Asistencia", 14, 15);

  doc.setFontSize(11);
  doc.text(`Curso: ${curso?.nombre || ""}`, 14, 22);
  doc.text(`Fecha: ${fechaAsistencia}`, 14, 28);

  const rows = alumnos.map((a) => {
    const asistencia = asistenciaMap[a.idalumno] || {};

    return [
      `${a.nombre} ${a.apellido}`,
      a.numdocumento || "-",
      asistencia.estado || "Sin registro",
      asistencia.tipo_justificacion || "-",
      asistencia.observacion || "-"
    ];
  });

  autoTable(doc, {
    startY: 35,
    head: [["Alumno", "DNI", "Estado", "Justificación", "Observación"]],
    body: rows
  });

  doc.save(`asistencia_${curso?.nombre}_${fechaAsistencia}.pdf`);
};

  // ===== Materiales =====
  const [materiales, setMateriales] = useState([]);
  const [tipoMaterial, setTipoMaterial] = useState("silabo");
  const [tituloMaterial, setTituloMaterial] = useState("");
  const [urlVideo, setUrlVideo] = useState("");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [msgMaterial, setMsgMaterial] = useState("");
  const archivoInputRef = useRef(null);

  // ===== Asistencia =====
  const hoy = new Date().toISOString().slice(0, 10);
  const [fechaAsistencia, setFechaAsistencia] = useState(hoy);
  const [asistenciaMap, setAsistenciaMap] = useState({});

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        const [cursoData, alumnosData, materialesData, asistenciaData] =
          await Promise.all([
            getCursoById(id),
            getAlumnosByCurso(id),
            getMaterialesCurso(id),
            getAsistenciaCursoPorFecha(id, hoy),
          ]);

        setCurso(cursoData);
        setAlumnos(alumnosData || []);
        setMateriales(materialesData || []);

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
  }, [id]);

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

  const handleSeleccionArchivo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoSeleccionado(file);
  };

  const handleGuardarMaterial = async () => {
    try {
      setMsgMaterial("");

      if (!tituloMaterial.trim()) {
        return alert("Ingresa un título para el material.");
      }

      if (tipoMaterial === "url_video") {
        if (!urlVideo.trim()) {
          return alert("Ingresa la URL del video.");
        }

        const nuevo = await addMaterialCurso(Number(id), {
          titulo: tituloMaterial,
          tipo: "url_video",
          video_url: urlVideo,
        });

        setMateriales((prev) => [nuevo, ...prev]);
      } else {
        if (!archivoSeleccionado) {
          return alert("Selecciona un archivo o video.");
        }

        const nuevo = await addMaterialCurso(Number(id), {
          titulo: tituloMaterial,
          tipo: tipoMaterial,
          file: archivoSeleccionado,
        });

        setMateriales((prev) => [nuevo, ...prev]);
      }

      setTituloMaterial("");
      setUrlVideo("");
      setArchivoSeleccionado(null);
      if (archivoInputRef.current) archivoInputRef.current.value = "";

      setMsgMaterial("✅ Material cargado correctamente");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo cargar el material");
    }
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

  const ausentes = alumnos.filter((a) => {
    const key = a.idalumno || a.id;
    return asistenciaMap[key]?.estado === "falta";
  });

  const tardanzas = alumnos.filter((a) => {
    const key = a.idalumno || a.id;
    return asistenciaMap[key]?.estado === "tardanza";
  });

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow text-gray-500">
        Cargando curso...
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="bg-white p-4 rounded shadow text-red-600">
        Curso no encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold">{curso.nombre}</h2>
        <p className="text-gray-600">
          Grupo {curso.grupo} • {curso.horario}
        </p>
      </div>

      {/* Materiales */}
      <div className="bg-white p-6 rounded shadow space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-4">Materiales del curso</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">Título</label>
              <input
                value={tituloMaterial}
                onChange={(e) => setTituloMaterial(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                placeholder="Ej. Semana 1 - Introducción"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Tipo</label>
              <select
                value={tipoMaterial}
                onChange={(e) => setTipoMaterial(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="silabo">Sílabo</option>
                <option value="archivo">Archivo</option>
                <option value="video">Video</option>
                <option value="url_video">URL de video</option>
              </select>
            </div>
          </div>

          {tipoMaterial === "url_video" ? (
            <div className="mt-4">
              <label className="block font-semibold mb-2">URL del video</label>
              <input
                value={urlVideo}
                onChange={(e) => setUrlVideo(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                placeholder="https://..."
              />
            </div>
          ) : (
            <div className="mt-4">
              <label className="block font-semibold mb-2">
                Archivo / Video
              </label>

              <button
                type="button"
                onClick={() => archivoInputRef.current?.click()}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
              >
                Seleccionar archivo
              </button>

              <input
                ref={archivoInputRef}
                type="file"
                className="hidden"
                accept={
                  tipoMaterial === "video"
                    ? "video/*"
                    : ".pdf,.ppt,.pptx,.doc,.docx,.zip,.rar"
                }
                onChange={handleSeleccionArchivo}
              />

              {archivoSeleccionado && (
                <p className="text-sm text-gray-600 mt-2">
                  Archivo seleccionado: {archivoSeleccionado.name}
                </p>
              )}
            </div>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={handleGuardarMaterial}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Guardar material
            </button>
          </div>

          {msgMaterial && (
            <p className="text-sm text-gray-700 mt-3">{msgMaterial}</p>
          )}
        </div>

        <div className="border-t pt-5">
          <h4 className="font-semibold text-lg mb-3">Listado de materiales</h4>

          {materiales.length === 0 ? (
            <p className="text-gray-500">No hay materiales cargados.</p>
          ) : (
            <div className="space-y-3">
              {materiales.map((m) => (
                <div
                  key={m.id}
                  className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-gray-800">{m.titulo}</div>
                    <div className="text-sm text-gray-500">
                      Tipo: {m.tipo}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Cargado: {m.fecha_carga || m.created_at || "-"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {m.video_url && (
                      <a
                        href={m.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded border hover:bg-gray-50 text-sm"
                      >
                        Ver video
                      </a>
                    )}

                    {m.archivo_url && (
                      <a
                        href={m.archivo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded border hover:bg-gray-50 text-sm"
                      >
                        Ver archivo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Asistencia */}
      <div className="bg-white p-6 rounded shadow space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Asistencia</h3>
            <p className="text-sm text-gray-500">
              Presente, tardanza o falta por alumno
            </p>
          </div>

          <div>
            <label className="block font-semibold mb-2">Fecha</label>
            <input
              type="date"
              value={fechaAsistencia}
              onChange={async (e) => {
                const nuevaFecha = e.target.value;
                setFechaAsistencia(nuevaFecha);
                await cargarAsistenciaPorFecha(nuevaFecha);
              }}
              className="border rounded px-3 py-2"
            />
          </div>
        </div>

        {alumnos.length === 0 ? (
          <p className="text-gray-500">No hay alumnos en este curso.</p>
        ) : (
          <div className="overflow-auto">
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
                {alumnos.map((a) => {
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
                            <span className="text-xs text-gray-400">Sin foto</span>
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
                            <option value="injustificada">Injustificada</option>
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Guardar asistencia
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-bold mb-4">Ausentes</h3>

          {ausentes.length === 0 ? (
            <p className="text-gray-500">No hay alumnos ausentes.</p>
          ) : (
            <div className="space-y-3">
              {ausentes.map((a) => {
                const key = a.idalumno || a.id;
                const info = asistenciaMap[key] || {};
                return (
                  <div key={key} className="border rounded-lg p-3">
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

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-bold mb-4">Tardanzas</h3>

          {tardanzas.length === 0 ? (
            <p className="text-gray-500">No hay tardanzas.</p>
          ) : (
            <div className="space-y-3">
              {tardanzas.map((a) => {
                const key = a.idalumno || a.id;
                const info = asistenciaMap[key] || {};
                return (
                  <div key={key} className="border rounded-lg p-3">
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

      {/* Reporte */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Reporte de asistencia</h3>
            <p className="text-sm text-gray-500">
              Exportar listado de alumnos en PDF
            </p>
          </div>

          <button
            type="button"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={exportarPDF}
          >
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default CursoDetalleDocente;