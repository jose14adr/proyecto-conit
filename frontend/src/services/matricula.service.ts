import api from "./api";

export const matricularAlumno = async (
  alumnoId: number,
  grupoId: number,
  nombreCurso: string,
) => {
  const response = await api.post("/matricula", {
    alumnoId,
    grupoId,
    nombreCurso,
  });
  return response.data;
};

export const obtenerMatriculasPorAlumno = async (alumnoId: number) => {
  const response = await api.get(`/matricula/alumno/${alumnoId}`);
  return response.data;
};
