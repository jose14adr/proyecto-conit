import api from "./api";

export const obtenerAlumno = async () => {
  const response = await api.get("/alumno");
  return response.data;
};

export const crearAlumno = async (alumnoData: any) => {
  const response = await api.post("/alumno", alumnoData);
  return response.data;
};

export const actualizarAlumno = async (id: number, alumnoData: any) => {
  const response = await api.patch(`/alumno/${id}`, alumnoData);
  return response.data;
};

export const eliminarAlumno = async (id: number) => {
  const response = await api.delete(`/alumno/${id}`);
  return response.data;
};

export const habilitarAlumno = async (id: number) => {
  const response = await api.patch(`/alumno/${id}/habilitar`);
  return response.data;
};
