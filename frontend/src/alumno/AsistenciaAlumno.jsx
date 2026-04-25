import { useEffect, useState } from "react";
import api from "../api";

export default function AsistenciaAlumno() {
  const [grupos, setGrupos] = useState([]);
  const [asistencias, setAsistencias] = useState({});

  const [estado, setEstado] = useState({});
  const [observacion, setObservacion] = useState({});
  const [tipoJustificacion, setTipoJustificacion] = useState({});

  const idalumno = Number(localStorage.getItem("idalumno"));
  console.log("ID ALUMNO:", idalumno);
  const hoy = new Date().toISOString().split("T")[0];

  const [modalOpen, setModalOpen] = useState(false);
const [historialModal, setHistorialModal] = useState([]);
const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

const [configActiva, setConfigActiva] = useState({});

const [archivo, setArchivo] = useState({});

  /* ========================= */
  /* CARGAR GRUPOS DEL ALUMNO */
  /* ========================= */
  const cargarGrupos = async () => {
    try {
      const res = await api.get(`/grupo/alumno/${idalumno}`);
      setGrupos(res.data);
    } catch (err) {
      console.log("Error cargando grupos", err);
    }
  };

  /* ========================= */
  /* VERIFICAR CONFIGURACIÓN ASISTENCIA */
  /* ========================= */

  const verificarConfig = async (idgrupo) => {
    try {
      const res = await api.get(`/asistencia-configuracion/activo/${idgrupo}`);

      setConfigActiva(prev => ({
        ...prev,
        [idgrupo]: res.data ? true : false
      }));

    } catch (err) {
      console.log("Error config", err);
    }
  };

  /* ========================= */
  /* CARGAR ASISTENCIAS */
  /* ========================= */
  const cargarAsistencias = async () => {
    try {
      const res = await api.get(`/asistencia/alumno/${idalumno}`);
      
      // 🔥 agrupar por grupo
      const mapa = {};
      res.data.forEach(a => {
        if (!mapa[a.idgrupo]) mapa[a.idgrupo] = [];
        mapa[a.idgrupo].push(a);
      });

      setAsistencias(mapa);

    } catch (err) {
      console.log("Error asistencia", err);
    }
  };

  useEffect(() => {
    cargarGrupos();
    cargarAsistencias();
  }, []);

  useEffect(() => {
  grupos.forEach(g => verificarConfig(g.id));
}, [grupos]);

  /* ========================= */
  /* GUARDAR */
  /* ========================= */
const guardar = async (idgrupo) => {
  try {

    const formData = new FormData();

    formData.append("idalumno", String(idalumno));
    formData.append("idgrupo", String(idgrupo));
    formData.append("estado", estado[idgrupo]);
    formData.append("observacion", observacion[idgrupo] || "");
    formData.append(
      "tipo_justificacion",
      estado[idgrupo] === "presente"
        ? ""
        : tipoJustificacion[idgrupo] || ""
    );

    if (archivo[idgrupo]) {
      formData.append("file", archivo[idgrupo]);
    }

    await api.post("/asistencia", formData); // 🚨 SIN headers

    alert("✅ Asistencia registrada");

    cargarAsistencias();

  } catch (err) {
    console.log(err);
    alert("❌ Error al registrar");
  }
};

   /* ========================= */
  /* ABRIR MODAL */
  /* ========================= */

  const verHistorialCompleto = async (idgrupo) => {
  try {
    const res = await api.get(`/asistencia/historial/${idalumno}/${idgrupo}`);

    setHistorialModal(res.data);
    setGrupoSeleccionado(idgrupo);
    setModalOpen(true);

  } catch (err) {
    console.log("Error cargando historial completo", err);
    // 👇 abre igual para probar
  setHistorialModal([]);
  setGrupoSeleccionado(idgrupo);
  setModalOpen(true);
  }
};

  return (
    <div className="w-full min-h-screen bg-gray-100 p-8">

      <div className="max-w-7xl mx-auto space-y-6">

        <h2 className="text-2xl font-bold">
          📅 Asistencia del Alumno
        </h2>

        {grupos.map(g => {
          const historial = asistencias[g.id] || [];

          const yaMarcoHoy = historial.some(
            a => a.fecha?.split("T")[0] === hoy
          );

          return (
            <div
              key={g.id}
              className="bg-white p-6 rounded-2xl shadow border space-y-5"
            >

              {/* 🔥 INFO */}
              <div className="grid grid-cols-3 gap-6">

                <div>
                  <p className="text-xs text-gray-400">Curso</p>
                  <p className="font-semibold text-lg">
                    {g.nombrecurso}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Grupo</p>
                  <p className="font-semibold text-lg">
                    {g.nombregrupo}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Horario</p>
                  <p className="font-semibold text-lg">
                    {g.horario || "No definido"}
                  </p>
                </div>

              </div>

              {/* 🔥 MARCAR */}
              <div className="border-t pt-4">

                <p className="mb-2 font-medium">
                  Hoy: {hoy}
                </p>

                {!configActiva[g.id] ? (
                  <p className="text-red-500 font-semibold">
                    ⛔ Asistencia no disponible en este horario
                  </p>

                ) : yaMarcoHoy ? (
                  <p className="text-green-600 font-semibold">
                    ✔ Ya registraste asistencia
                  </p>

                ) : (
                  <div className="space-y-4">

                    {/* ESTADO */}
                    <div className="flex gap-4">
                      {["presente", "tardanza", "falta"].map(e => (
                        <button
                          key={e}
                          onClick={() =>
                            setEstado(prev => ({ ...prev, [g.id]: e }))
                          }
                          className={`px-4 py-2 rounded-xl border ${
                            estado[g.id] === e
                              ? "bg-indigo-600 text-white"
                              : "bg-white"
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>

                    {(estado[g.id] === "tardanza" ||
                      estado[g.id] === "falta") && (
                      <div className="space-y-3">

                        <select
                          value={tipoJustificacion[g.id] || ""}
                          onChange={e =>
                            setTipoJustificacion(prev => ({
                              ...prev,
                              [g.id]: e.target.value,
                            }))
                          }
                          className="w-full border p-3 rounded-xl"
                        >
                          <option value="">Tipo justificación</option>
                          <option value="justificada">Justificada</option>
                          <option value="no justificada">No justificada</option>
                        </select>

                        {/* 🔥 OBSERVACIÓN */}
                        {tipoJustificacion[g.id] === "justificada" && (
                          <>
                            <textarea
                              placeholder="Escribe tu justificación..."
                              className="w-full border p-3 rounded-xl"
                              value={observacion[g.id] || ""}
                              onChange={e =>
                                setObservacion(prev => ({
                                  ...prev,
                                  [g.id]: e.target.value,
                                }))
                              }
                            />

                            {/* 🔥 INPUT FILE */}
                            <input
                              type="file"
                              onChange={(e) =>
                                setArchivo(prev => ({
                                  ...prev,
                                  [g.id]: e.target.files[0],
                                }))
                              }
                              className="w-full"
                            />
                          </>
                        )}

                      </div>
                    )}

                    <button
                      onClick={() => guardar(g.id)}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-xl"
                    >
                      Guardar asistencia
                    </button>

                  </div>
                )}

              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => verHistorialCompleto(g.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                >
                  Ver historial completo
                </button>
              </div>

              {/* 📊 HISTORIAL */}
              <div>
                <h4 className="font-semibold mb-2">Historial</h4>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2">Fecha</th>
                      <th className="p-2">Estado</th>
                      <th className="p-2">Obs</th>
                    </tr>
                  </thead>

                  <tbody>
                    {historial
                      .filter(a => a.fecha?.split("T")[0] === hoy)
                      .map(a => (
                      <tr key={a.id} className="border-t">
                        <td className="p-2">
                          {a.fecha?.split("T")[0]}
                        </td>
                        <td className="p-2">{a.estado}</td>
                        <td className="p-2">
                          {a.observacion || "-"}
                        </td>
                        <td className="p-2">
                          {a.archivo_url ? (
                            <a
                              href={a.archivo_url}
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              📎 Ver archivo
                            </a>
                          ) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>

            </div>
          );
        })}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          
          <div className="bg-white w-full max-w-3xl rounded-2xl p-6">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                📊 Historial completo (Grupo {grupoSeleccionado})
              </h3>

              <button
                onClick={() => setModalOpen(false)}
                className="text-red-500 font-bold"
              >
                X
              </button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Fecha</th>
                  <th className="p-2">Estado</th>
                  <th className="p-2">Justificación</th>
                  <th className="p-2">Obs</th>
                </tr>
              </thead>

              <tbody>
                {historialModal.map(a => (
                  <tr key={`${a.id}-${a.fecha}`} className="border-t">
                    <td className="p-2">
                      {a.fecha?.split("T")[0]}
                    </td>
                    <td className="p-2">{a.estado}</td>
                    <td className="p-2">
                      {a.tipo_justificacion || "-"}
                    </td>
                    <td className="p-2">
                      {a.observacion || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      )}
    </div>
  );

  
}