
import { Outlet, Link } from "react-router-dom"

function DocenteLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Panel Docente</h2>

        <nav className="flex flex-col gap-3">
          <Link to="/docente/perfil" className="hover:text-gray-300">Mi Perfil</Link> 
          <Link to="/docente/cursos" className="hover:text-gray-300">Mis Cursos</Link>
          <Link to="/docente/tareas">Tareas</Link>
          <Link to="/docente/notas" className="hover:text-gray-300">Registro de Notas</Link>
          <Link to="/docente/aprobados" className="hover:text-gray-300">Lista de Aprobados</Link>
          <Link to="/docente/horario" className="hover:text-gray-300">Horario</Link>
        </nav>
      </div>

      {/* Contenido dinámico */}
      <div className="flex-1 p-8 bg-gray-100">
        <Outlet />
      </div>
    </div>
  )
}

export default DocenteLayout