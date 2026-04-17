import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export async function obtenerConfigCertificadoCurso(idcurso) {
  const { data } = await axios.get(
    `${API_URL}/certificado/config/curso/${idcurso}`,
    {
      headers: authHeaders(),
    }
  );

  return data;
}

export async function guardarConfigCertificadoCurso(idcurso, payload) {
  const { data } = await axios.put(
    `${API_URL}/certificado/config/curso/${idcurso}`,
    payload,
    {
      headers: authHeaders(),
    }
  );

  return data;
}