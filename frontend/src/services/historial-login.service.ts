import api from "./api";

export const obtenerSesiones = async () => {
  const response = await api.get("/historial-login");
  return response.data;
};

export const cerrarSesionRemota = async (id: number) => {
  const response = await api.patch(`/historial-login/${id}/cerrar`);
  return response.data;
};
