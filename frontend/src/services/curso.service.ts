import api from "./api";

export const obtenerCursos = async () => {
  const response = await api.get("/curso");
  return response.data;
};

export const crearCurso = async (cursoData: any) => {
  const response = await api.post("/curso", cursoData);
  return response.data;
};

export const actualizarCurso = async (id: number, cursoData: any) => {
  const response = await api.patch(`/curso/${id}`, cursoData);
  return response.data;
};

export const eliminarCurso = async (id: number) => {
  const response = await api.delete(`/curso/${id}`);
  return response.data;
};

export const habilitarCurso = async (id: number) => {
  const response = await api.patch(`/curso/${id}/habilitar`);
  return response.data;
};
