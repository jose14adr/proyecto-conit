import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export async function obtenerCursosMatriculadosAlumno(idalumno) {
  const { data } = await axios.get(
    `${API_URL}/certificado/alumno/${idalumno}/cursos-matriculados`,
    {
      headers: authHeaders(),
    }
  );

  return data;
}