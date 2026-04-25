import api from "./api";

//Obtiene la lista de docentes desde la base de datos a través del backend
export const obtenerDocente = async () => {
  const response = await api.get("/docente");
  return response.data;
};

//Registra un nuevo docente en la base de datos a través del backend
export const crearDocente = async (docenteData: any) => {
  const response = await api.post("/docente", docenteData);
  return response.data;
};

//Actualiza la información de un docente existente en la base de datos a través del backend
export const actualizarDocente = async (id: number, docenteData: any) => {
  const response = await api.patch(`/docente/${id}`, docenteData);
  return response.data;
};

//Inhabilita un docente en la base de datos a través del backend
export const inhabilitarDocente = async (id: number) => {
  const response = await api.delete(`/docente/${id}`);
  return response.data;
};

export const habilitarDocente = async (id: number) => {
  const response = await api.patch(`/docente/${id}/habilitar`);
  return response.data;
};

export const obtenerCargaAcademicaDocente = async (id: number) => {
  const response = await api.get(`/grupo/docente/${id}`);
  return response.data;
};
