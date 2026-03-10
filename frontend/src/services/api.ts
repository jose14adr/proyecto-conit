import axios from "axios";

//Creamos una instancia de axios con la URL base del backend
const api = axios.create({
  baseURL: "http://localhost:3000",
});

api.interceptors.request.use(
  (config) => {
    //Buscamos el tocken en el navegador
    const token = localStorage.getItem("token");
    //Si hay token, lo agregamos a las cabeceras de la petición
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
export default api;
