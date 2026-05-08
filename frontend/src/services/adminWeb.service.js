import api from "./api";

export const listarCategoriasAdminWeb = async () => {
  const response = await api.get("/admin-web/categorias");
  return response.data;
};

export const crearCategoriaAdminWeb = async (data) => {
  const response = await api.post("/admin-web/categorias", data);
  return response.data;
};

export const actualizarCategoriaAdminWeb = async (id, data) => {
  const response = await api.patch(`/admin-web/categorias/${id}`, data);
  return response.data;
};

export const eliminarCategoriaAdminWeb = async (id) => {
  const response = await api.delete(`/admin-web/categorias/${id}`);
  return response.data;
};

export const listarCursosAdminWeb = async () => {
  const response = await api.get("/admin-web/cursos");
  return response.data;
};

export const actualizarCursoWebAdmin = async (id, data) => {
  const response = await api.patch(`/admin-web/cursos/${id}/web`, data);
  return response.data;
};

export const asignarCategoriasCursoWeb = async (id, categoriasIds) => {
  const response = await api.post(`/admin-web/cursos/${id}/categorias`, {
    categoriasIds,
  });

  return response.data;
};

export const obtenerContenidoAdminWeb = async (pagina) => {
  const response = await api.get(`/admin-web/contenido/${pagina}`);
  return response.data;
};

export const actualizarContenidoAdminWeb = async (pagina, contenido, estado = true) => {
  const response = await api.patch(`/admin-web/contenido/${pagina}`, {
    contenido,
    estado,
  });

  return response.data;
};

export const listarMensajesContactoAdminWeb = async () => {
  const response = await api.get("/admin-web/contacto/mensajes");
  return response.data;
};

export const marcarMensajeContactoLeidoAdminWeb = async (id) => {
  const response = await api.patch(`/admin-web/contacto/mensajes/${id}/leido`);
  return response.data;
};

export const actualizarEstadoMensajeContactoAdminWeb = async (id, estado) => {
  const response = await api.patch(`/admin-web/contacto/mensajes/${id}/estado`, {
    estado,
  });

  return response.data;
};

export const listarMediosAdminWeb = async () => {
  const response = await api.get("/admin-web/medios");
  return response.data;
};

export const subirMedioAdminWeb = async (file, carpeta = "web") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("carpeta", carpeta);

  const response = await api.post("/admin-web/medios/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const eliminarMedioAdminWeb = async (id) => {
  const response = await api.delete(`/admin-web/medios/${id}`);
  return response.data;
};

export const listarPaginasAdminWeb = async () => {
  const response = await api.get("/admin-web/paginas");
  return response.data;
};

export const crearPaginaAdminWeb = async (data) => {
  const response = await api.post("/admin-web/paginas", data);
  return response.data;
};

export const actualizarPaginaAdminWeb = async (id, data) => {
  const response = await api.patch(`/admin-web/paginas/${id}`, data);
  return response.data;
};

export const eliminarPaginaAdminWeb = async (id) => {
  const response = await api.delete(`/admin-web/paginas/${id}`);
  return response.data;
};