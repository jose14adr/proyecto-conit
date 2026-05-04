const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getBaseUrl = () => API_URL.replace(/\/$/, "");

async function request(path) {
  const response = await fetch(`${getBaseUrl()}${path}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Error al obtener datos de la web");
  }

  return response.json();
}

export async function obtenerContenidoWeb(pagina) {
  return request(`/web/contenido/${pagina}`);
}

export async function listarCursosWeb() {
  return request("/web/cursos");
}

export async function listarCursosDestacadosWeb() {
  return request("/web/cursos-destacados");
}

export async function obtenerCursoWeb(idOrSlug) {
  return request(`/web/cursos/${idOrSlug}`);
}

export async function listarCategoriasWeb() {
  return request("/web/categorias");
}

export async function listarCursosPorCategoria(slug) {
  return request(`/web/categorias/${slug}/cursos`);
}

export async function enviarMensajeContacto(data) {
  const response = await fetch(`${getBaseUrl()}/web/contacto/mensaje`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = "No se pudo enviar el mensaje";

    try {
      const errorData = await response.json();
      message = errorData?.message || message;
    } catch {
      message = await response.text();
    }

    throw new Error(message || "No se pudo enviar el mensaje");
  }

  return response.json();
}

export async function listarPaginasMenuWeb() {
  return request("/web/paginas/menu");
}

export async function obtenerPaginaWeb(slug) {
  return request(`/web/paginas/${slug}`);
}