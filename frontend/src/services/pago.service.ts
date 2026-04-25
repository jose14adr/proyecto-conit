import api from "../api";

export const obtenerPagos = async () => {
  const response = await api.get("/pago/realizados");
  return response.data;
};

export const obtenerPensiones = async () => {
  const response = await api.get("/pension");
  return response.data;
};

export const generarTokenIzipay = async (
  matriculaId: number,
  precioFinal: number,
  email: string,
) => {
  const response = await api.post("/pago/izipay", {
    matricula_id: matriculaId,
    preciofinal: precioFinal,
    email: email,
  });
  return response.data;
};
