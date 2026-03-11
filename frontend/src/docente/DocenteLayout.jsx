import { Outlet, Link, useNavigate } from "react-router-dom"
import { logout } from "../services/auth.service"

function DocenteLayout() {

  const navigate = useNavigate()

  const handleLogout = () => {
    logout()                 // elimina el token
    navigate("/login")       // redirige al login
  }

  return (
    <div className="flex min-h-screen">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6 flex flex-col justify-between">
        
        <div>
          <h2 className="text-2xl font-bold mb-6">Panel Docente</h2>

          <nav className="flex flex-col gap-3">
            <Link to="/docente/perfil" className="hover:text-gray-300">Mi Perfil</Link> 
            <Link to="/docente/cursos" className="hover:text-gray-300">Mis Cursos</Link>
            <Link to="/docente/tareas" className="hover:text-gray-300">Tareas</Link>
            <Link to="/docente/notas" className="hover:text-gray-300">Registro de Notas</Link>
            <Link to="/docente/aprobados" className="hover:text-gray-300">Lista de Aprobados</Link>
            <Link to="/docente/horario" className="hover:text-gray-300">Horario</Link>
          </nav>
        </div>

        {/* Botón cerrar sesión */}
        <button
          onClick={handleLogout}
          className="mt-10 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition"
        >
          Cerrar sesión
        </button>

      </div>

      {/* Contenido dinámico */}
      <div className="flex-1 p-8 bg-gray-100">
        <Outlet />
      </div>

    </div>
  )
}

export default DocenteLayout