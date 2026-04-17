import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export async function obtenerCertificadosAdmin(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.dni) params.append("dni", filters.dni);
  if (filters.curso) params.append("curso", filters.curso);
  if (filters.estado) params.append("estado", filters.estado);
  if (filters.anulado) params.append("anulado", filters.anulado);

  const { data } = await axios.get(
    `${API_URL}/certificado/admin/listado?${params.toString()}`,
    {
      headers: authHeaders(),
    }
  );

  return data;
}

export async function anularCertificadoAdmin(id, payload = {}) {
  const { data } = await axios.put(
    `${API_URL}/certificado/${id}/anular`,
    payload,
    {
      headers: authHeaders(),
    }
  );

  return data;
}