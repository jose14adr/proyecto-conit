import axios from "axios"

const API = "http://localhost:3000" // cambia si usas otra URL

export const getPerfilAlumno = async () => {
  try {
    const token = localStorage.getItem("token")

    const res = await axios.get(`${API}/alumno/perfil`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return res.data
  } catch (error) {
    console.error("Error obteniendo perfil alumno:", error)
    return null
  }
}