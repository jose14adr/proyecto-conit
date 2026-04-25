import { useEffect, useState } from "react";
import api from "../api";

export default function HistorialAcademico() {
  const [historial, setHistorial] = useState([]);
  const [openCurso, setOpenCurso] = useState(null);

  useEffect(() => {
    async function cargar() {
      const idalumno = localStorage.getItem("idalumno");
      const res = await api.get(`/examen/historial/${idalumno}`);
      setHistorial(res.data);
    }

    cargar();
  }, []);

  const calcularPromedio = (examenes) => {
    if (!examenes.length) return 0;
    const suma = examenes.reduce((acc, ex) => acc + Number(ex.nota), 0);
    return (suma / examenes.length).toFixed(1);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🎓 Historial Académico</h1>

      <div className="space-y-4">

        {historial.map((curso, index) => {
          const promedio = calcularPromedio(curso.examenes);
          const aprobado = promedio >= 11;

          return (
            <div key={index} className="bg-white rounded-xl shadow border">

              {/* HEADER */}
              <div
                onClick={() =>
                  setOpenCurso(openCurso === index ? null : index)
                }
                className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50"
              >

                {/* IZQUIERDA */}
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {openCurso === index ? "▼" : "▶"}
                  </span>

                  <div>
                    <p className="font-semibold text-lg">
                      📚 {curso.nombreCurso}
                    </p>
                    <p className="text-l text-gray-500">
                      {curso.nombreGrupo}
                    </p>
                    <p className="text-l text-gray-500">
                      {curso.horario}
                    </p>
                    <p className="text-l text-gray-500">
                      {curso.modalidad}
                    </p>
                    <p className="text-sm text-gray-500">
                      Promedio general del curso
                    </p>
                  </div>
                </div>

                {/* DERECHA */}
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {promedio}
                  </p>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      aprobado
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {aprobado ? "Aprobado" : "Desaprobado"}
                  </span>
                </div>
              </div>

              {/* DETALLE */}
              {openCurso === index && (
                <div className="border-t px-5 pb-5">

                  <table className="w-full mt-4 text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b">
                        <th className="text-left py-2">Examen</th>
                        <th>Nota</th>
                        <th>Estado</th>
                      </tr>
                    </thead>

                    <tbody>
                      {curso.examenes.map((ex) => {
                        const aprobado = ex.nota >= 11;

                        return (
                          <tr key={ex.id} className="border-b">
                            <td className="py-2">
                              🧪 {ex.titulo}
                            </td>

                            <td className="text-center font-bold">
                              {ex.nota}
                            </td>

                            <td className="text-center">
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  aprobado
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {aprobado ? "Aprobado" : "Desaprobado"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                  </table>

                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}