//Definimos que le enviamos al backend para iniciar sesión
export interface LoginCredentials {
  correo: string;
  contrasenia: string;
}

//Definimos lo que responde el backend
export interface LoginResponse {
  access_token: string;
  usuario: {
    id: number; // 🔥 IMPORTANTE (lo usamos)
    correo: string;
    nombre: string;
    rol: string;
    idEmpresa: number;
  };
}

const API_URL = "http://localhost:3000";

// ================= LOGIN =================
export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Correo o contraseña incorrectos");
  }

  const data: LoginResponse = await response.json();

  // 🔹 Guardar token y usuario
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("usuario", JSON.stringify(data.usuario));

  // ================= 🔥 NUEVO: GUARDAR IDALUMNO =================
  if (data.usuario?.rol === "ALUMNO") {
    try {
      const alumnoResponse = await fetch(`${API_URL}/alumno`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (alumnoResponse.ok) {
        const alumnos = await alumnoResponse.json();

        const alumnoEncontrado = alumnos.find(
          (a: any) => Number(a.idusuario) === Number(data.usuario.id)
        );

        if (alumnoEncontrado) {
          localStorage.setItem("idalumno", String(alumnoEncontrado.id));
        }
      }
    } catch (error) {
      console.error("Error obteniendo idalumno:", error);
    }
  }

  return data;
};

// ================= LOGOUT =================
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  localStorage.removeItem("idalumno"); // 🔥 importante
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (data: { correo: string }) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Error al solicitar restablecimiento de contraseña"
    );
  }

  return response.json();
};

// ================= RESET PASSWORD =================
export const resetPassword = async (data: {
  token: string;
  contrasenia: string;
  codigoSeguridad: string;
}) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al restablecer contraseña");
  }

  return response.json();
};