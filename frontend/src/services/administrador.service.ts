import api from "./api";

export const obtenerPerfilAdministrador = async () => {
    const response = await api.get("/administrador/perfil");
    return response.data;
}

export const obtenerAdministradores = async () => {
  const response = await api.get("/administrador");
  return response.data;
};

export const crearAdministrador = async (data: any) => {
  const response = await api.post("/administrador", data);
  return response.data;
};

export const actualizarAdministrador = async (id: number, data: any) => {
  const response = await api.put(`/administrador/${id}`, data);
  return response.data;
};

export const inhabilitarAdministrador = async (id: number) => {
  const response = await api.delete(`/administrador/${id}`);
  return response.data;
};

export const habilitarAdministrador = async (id: number) => {
  const response = await api.patch(`/administrador/${id}/habilitar`);
  return response.data;
};