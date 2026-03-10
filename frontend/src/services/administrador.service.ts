import api from "./api";

export const obtenerPerfilAdministrador = async () => {
    //Como usamos la instancia de axios, ya se incluye el token en las cabeceras de la petición
    const response = await api.get("/administrador/perfil");
    return response.data;
}