import { Home, BookOpen, FileText, Library, LifeBuoy, Menu } from "lucide-react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useState } from "react"
import { Toaster } from "react-hot-toast"
import UserMenu from "../components/UserMenu"
import SidebarLink from "../components/SidebarLink"

export default function LayoutEstudiante() {

  const location = useLocation()
  const [sidebarOpen,setSidebarOpen] = useState(true)
  const iconSize = sidebarOpen ? 26 : 34

  function linkClass(path){

    const active = location.pathname === path

    return `flex items-center
    ${sidebarOpen ? "gap-4 justify-start" : "justify-center"}
    p-3 rounded-lg transition-all duration-300
    ${active 
    ? "bg-indigo-600 text-white shadow-lg" 
    : "hover:bg-slate-800 text-gray-300"}`
  }

  return (

    <div className="h-screen w-screen flex bg-gray-100">

      {/* SIDEBAR */}

      <aside className={`
      ${sidebarOpen ? "w-64" : "w-20"}
      bg-gradient-to-b from-slate-900 to-slate-800
      text-white flex flex-col p-5 transition-all duration-300 shadow-xl
      `}>

        {/* LOGO */}

        <div className="flex items-center justify-between mb-10">

          {sidebarOpen && (
            <h1 className="text-3xl font-extrabold tracking-wide text-indigo-400">
              CONIT
            </h1>
          )}

          <button
          onClick={()=>setSidebarOpen(!sidebarOpen)}
          className="hover:bg-slate-700 p-2 rounded-lg transition"
          >
            <Menu size={26}/>
          </button>

        </div>


        {/* MENU */}

        <nav className="space-y-3 text-base">

          <SidebarLink
  to="/alumno"
  label="Principal"
  sidebarOpen={sidebarOpen}
  active={location.pathname === "/alumno"}
  icon={<Home size={iconSize} />}
/>

<SidebarLink
  to="/alumno/mis-cursos"
  label="Mis Cursos"
  sidebarOpen={sidebarOpen}
  active={location.pathname.startsWith("/alumno/mis-cursos")}
  icon={<BookOpen size={iconSize} />}
/>

<SidebarLink
  to="/alumno/matricula"
  label="Cursos Sugeridos"
  sidebarOpen={sidebarOpen}
  active={location.pathname.startsWith("/alumno/matricula")}
  icon={<BookOpen size={iconSize} />}
/>

<SidebarLink
  to="/alumno/mis-sesiones"
  label="Mis Sesiones"
  sidebarOpen={sidebarOpen}
  active={location.pathname.startsWith("/alumno/mis-sesiones")}
  icon={<FileText size={iconSize} />}
/>

<SidebarLink
  to="/alumno/mis-certificados"
  label="Mis Certificados"
  sidebarOpen={sidebarOpen}
  active={location.pathname.startsWith("/alumno/mis-certificados")}
  icon={<FileText size={iconSize} />}
/>

<SidebarLink
  to="/alumno/recursos"
  label="Biblioteca"
  sidebarOpen={sidebarOpen}
  active={location.pathname.startsWith("/alumno/recursos")}
  icon={<Library size={iconSize} />}
/>
          <div className="flex items-center gap-4 p-3 rounded-lg text-gray-300 hover:bg-slate-800 cursor-pointer transition">

            <LifeBuoy size={26}
            className={`transition-transform duration-300 
            ${sidebarOpen ? "scale-100" : "scale-125"}`}/>
            {sidebarOpen && "Soporte"}

          </div>

        </nav>

      </aside>


      {/* CONTENIDO */}

      <div className="flex-1 flex flex-col">

        <header className="h-16 bg-white shadow flex items-center justify-between px-8">

          <h2 className="text-lg font-semibold text-gray-700">
            Aula Virtual
          </h2>

          <UserMenu />

        </header>

        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>

      </div>

      <Toaster position="top-right"/>

    </div>
  )
}