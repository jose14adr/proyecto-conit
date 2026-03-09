import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getCursosDocente } from "../services/docenteService"

function MisCursos() {
  const [cursos, setCursos] = useState([])

  // buscador estilo google
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    getCursosDocente().then(setCursos)
  }, [])

  const sugerencias = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return cursos
      .filter((c) => c.nombre.toLowerCase().includes(q))
      .slice(0, 8)
  }, [cursos, query])

  const renderHighlight = (text, q) => {
    const queryLower = q.trim().toLowerCase()
    if (!queryLower) return text

    const textLower = text.toLowerCase()
    const idx = textLower.indexOf(queryLower)
    if (idx === -1) return text

    const before = text.slice(0, idx)
    const match = text.slice(idx, idx + q.length)
    const after = text.slice(idx + q.length)

    return (
      <>
        {before}
        <span className="bg-yellow-200 rounded px-1">{match}</span>
        {after}
      </>
    )
  }

  const irACurso = (cursoId) => {
    // Ajusta esta ruta si tu detalle es diferente
    // Ejemplo recomendado: /docente/cursos/:id
    navigate(`/docente/cursos/${cursoId}`)
  }

  const seleccionarCurso = (curso) => {
    setQuery(curso.nombre)
    setOpen(false)
    setActiveIndex(-1)
    irACurso(curso.id)
  }

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true)
      return
    }

    if (e.key === "Escape") {
      setOpen(false)
      setActiveIndex(-1)
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (sugerencias.length === 0) return
      setActiveIndex((prev) => (prev + 1) % sugerencias.length)
      return
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (sugerencias.length === 0) return
      setActiveIndex((prev) => (prev - 1 + sugerencias.length) % sugerencias.length)
      return
    }

    if (e.key === "Enter") {
      if (!open) return
      e.preventDefault()
      const selected = activeIndex >= 0 ? sugerencias[activeIndex] : sugerencias[0]
      if (selected) seleccionarCurso(selected)
    }
  }

  useEffect(() => {
    const handler = (event) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Mis Cursos</h2>

        {/* Buscador tipo Google */}
        <div className="relative max-w-xl" ref={containerRef}>
          <label className="block font-semibold mb-2">Buscar curso</label>

          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
              setActiveIndex(-1)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Escribe el nombre del curso..."
            className="w-full border p-2 rounded"
          />

          {open && sugerencias.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow overflow-hidden">
              {sugerencias.map((c, idx) => {
                const active = idx === activeIndex
                return (
                  <button
                    key={c.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => seleccionarCurso(c)}
                    className={`w-full text-left px-3 py-2 ${
                      active ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium">{renderHighlight(c.nombre, query)}</div>
                    <div className="text-xs text-gray-500">
                      Grupo {c.grupo} • {c.horario}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Tips: ↑ ↓ para moverte • Enter para elegir • Esc para cerrar
          </p>
        </div>
      </div>

      {/* Listado completo (sin buscar) */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-bold mb-4">Listado de cursos</h3>

        {cursos.length === 0 ? (
          <p className="text-gray-500">No hay cursos cargados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cursos.map((c) => (
              <button
                key={c.id}
                onClick={() => irACurso(c.id)}
                className="text-left border rounded p-4 hover:bg-gray-50"
              >
                <div className="font-bold text-lg">{c.nombre}</div>
                <div className="text-sm text-gray-600">
                  Grupo {c.grupo} • {c.horario}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MisCursos