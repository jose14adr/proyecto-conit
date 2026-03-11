import { Home, BookOpen, FileText, Library, LifeBuoy } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import UserMenu from "../components/UserMenu"

export default function LayoutEstudiante() {
  const location = useLocation()

  return (
    <div className="h-screen w-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-8">

        <h1 className="text-2xl font-bold mb-10">
          CONIT
        </h1>

        <nav className="space-y-6 text-lg">

          <Link to="/" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <Home size={20}/>
            Principal
          </Link>

          <Link to="/mis-cursos" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <BookOpen size={20}/>
            Mis Cursos
          </Link>

          <Link to="/matricula" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <BookOpen size={20}/>Matrícula
          </Link>

          <Link to="/mis-sesiones" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <FileText size={20}/>
            Mis Sesiones
          </Link>

          <Link to="/mis-certificados" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <FileText size={20}/>
            Mis Certificados
          </Link>

          <Link to="/recursos" className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded">
            <Library size={20}/>
            Biblioteca
          </Link>

          <div className="flex items-center gap-3 hover:bg-slate-800 p-2 rounded cursor-pointer">
            <LifeBuoy size={20}/>
            Soporte
          </div>

        </nav>
      </aside>

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col">

        <header className="h-16 bg-white shadow flex items-center justify-between px-8 relative z-50">
          <h2 className="text-lg font-semibold">
            Aula Virtual
          </h2>

          <UserMenu />
        </header>

        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>

      </div>

      <Toaster position="top-right" />
    </div>
  )
}
