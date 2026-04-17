import api from "./api";

export const obtenerGruposPorCurso = async (idcurso: number) => {
  const response = await api.get(`/grupo/curso/${idcurso}`);
  return response.data;
};

export const asignarDocenteAGrupo = async (
  idGrupo: number,
  idDocente: number
) => {
  const response = await api.patch(`/grupo/${idGrupo}/asignar-docente`, {
    idDocente,
  });
  return response.data;
};

export const crearGrupo = async (grupoData: any) => {
  const response = await api.post("/grupo", grupoData);
  return response.data;
};

export const cerrarGrupo = async (idGrupo: number) => {
  const response = await api.patch(`/grupo/${idGrupo}/cerrar`);
  return response.data;
};

export const actualizarEstadoGrupo = async (
  idGrupo: number,
  estado: string
) => {
  const response = await api.patch(`/grupo/${idGrupo}/estado`, {
    estado,
  });
  return response.data;
};