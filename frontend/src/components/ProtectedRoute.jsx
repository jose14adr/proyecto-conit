import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const usuarioStr = localStorage.getItem("usuario");

  // 1. Si no hay token, redirigimos inmediatamente
  if (!token || !usuarioStr) {
    return <Navigate to="/login" replace />;
  }

  let userRole = null;
  let hasParsingError = false;

  // 2. Usamos el try/catch SOLO para la lógica de JavaScript (sin JSX)
  try {
    const usuario = JSON.parse(usuarioStr);
    userRole = usuario.rol;
  } catch (error) {
    console.error("Error validando el acceso:", error);
    hasParsingError = true;
  }

  // 3. Manejamos el error fuera del catch
  if (hasParsingError) {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    return <Navigate to="/login" replace />;
  }

  // 4. Validamos los roles fuera del try
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn(
      `Acceso denegado. Rol actual: ${userRole}. Se requiere:`,
      allowedRoles
    );

    // Lo expulsamos amablemente hacia SU propio panel
    if (userRole === "ADMINISTRADOR" || userRole === "ADMIN") {
      return <Navigate to="/admin" replace />;
    } else if (userRole === "DOCENTE") {
      return <Navigate to="/docente" replace />;
    } else if (userRole === "ALUMNO") {
      return <Navigate to="/alumno" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  // 5. Si tiene el token y su rol coincide, renderizamos la ruta
  return <Outlet />;
}