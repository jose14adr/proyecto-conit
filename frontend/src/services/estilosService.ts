import api from "./api";

export const estilosService = {
  async obtenerConfiguracionPublica() {
    const { data } = await api.get("/estilos/configuracion");
    return data;
  },

  async obtenerConfiguracionAdmin() {
    const { data } = await api.get("/estilos/configuracion/admin");
    return data;
  },

  async listarColores() {
    const { data } = await api.get("/estilos/colores");
    return data;
  },

  async actualizarConfiguracion(payload: any) {
    const { data } = await api.patch("/estilos/configuracion", payload);
    return data;
  },

  async crearColor(payload: any) {
    const { data } = await api.post("/estilos/colores", payload);
    return data;
  },
};