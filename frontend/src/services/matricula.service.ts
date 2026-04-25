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

export const obtenerAlumnosPorCursoAdmin = async (idcurso: number) => {
  const response = await api.get(`/matricula/curso/${idcurso}/alumnos`);
  return response.data;
};

export const actualizarPermisosCertificado = async (idMatricula, puedeVer, puedeDescargar) => {
  const response = await api.patch(`/matricula/${idMatricula}/permisos-certificado`, {
    puedeVer,
    puedeDescargar
  });
  return response.data;
};