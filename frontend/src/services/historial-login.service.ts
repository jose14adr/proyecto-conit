import api from "./api";

export const obtenerSesiones = async () => {
  const response = await api.get("/historial-login");
  return response.data;
};
