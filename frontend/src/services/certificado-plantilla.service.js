import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const construirAssetUrl = (key) =>
  `${API_URL}/certificado/plantilla/asset?key=${encodeURIComponent(key)}`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export async function obtenerPlantillaActiva() {
  const { data } = await axios.get(
    `${API_URL}/certificado/plantilla/activa`,
    { headers: authHeaders() }
  );
  return normalizarPlantilla(data);
}

export async function solicitarUploadFondoCertificado(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post(
    `${API_URL}/certificado/plantilla/upload-file`,
    formData,
    {
      headers: {
        ...authHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return {
    key: data.key,
    proxyUrl: construirAssetUrl(data.key),
    localPreviewUrl: URL.createObjectURL(file),
  };
}

export async function guardarPlantillaCertificado(payload) {
  if (payload.id) {
    const { data } = await axios.put(
      `${API_URL}/certificado/plantilla/${payload.id}`,
      payload,
      {
        headers: authHeaders(),
      }
    );
    return normalizarPlantilla(data);
  }

  const { data } = await axios.post(
    `${API_URL}/certificado/plantilla`,
    payload,
    {
      headers: authHeaders(),
    }
  );
  return normalizarPlantilla(data);
}

export async function obtenerPlantillas() {
  const { data } = await axios.get(`${API_URL}/certificado/plantilla`, {
    headers: authHeaders(),
  });
  return (data || []).map(normalizarPlantilla);
}

export async function activarPlantillaCertificado(id) {
  const { data } = await axios.put(
    `${API_URL}/certificado/plantilla/${id}/activar`,
    {},
    {
      headers: authHeaders(),
    }
  );
  return normalizarPlantilla(data);
}

export async function eliminarPlantillaCertificado(id) {
  const { data } = await axios.delete(
    `${API_URL}/certificado/plantilla/${id}`,
    {
      headers: authHeaders(),
    }
  );
  return data;
}

function normalizarElementos(configJson = []) {
  return configJson.map((el) => {
    if (el?.type === "image" && el?.imageKey) {
      return {
        ...el,
        src: construirAssetUrl(el.imageKey),
      };
    }
    return el;
  });
}

function normalizarPlantilla(data) {
  if (!data) return null;

  return {
    ...data,
    fondoTemporalUrl: data.fondoKey ? construirAssetUrl(data.fondoKey) : null,
    configJson: normalizarElementos(data.configJson || []),
  };
}