import api from "./api";

export const obtenerGruposPorCurso = async (idcurso: number) => {
  const response = await api.get(`/grupo/curso/${idcurso}`);
  return response.data;
};

export const asignarDocenteAGrupo = async (idGrupo: number, idDocente: number, permisos?: any) => {
  const payload: any = { 
    idDocente 
  };

  if (permisos) {
    payload.permisos = permisos;
  }

  const response = await api.patch(`/grupo/${idGrupo}/asignar-docente`, payload);
  return response.data;
};

export const crearGrupo = async (grupoData: any) => {
  const response = await api.post("/grupo", grupoData);
  return response.data;
};