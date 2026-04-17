import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export async function verificarEmisionCertificado(payload) {
  const { data } = await axios.post(
    `${API_URL}/certificado/verificar-emision`,
    payload,
    {
      headers: authHeaders(),
    }
  );

  return data;
}