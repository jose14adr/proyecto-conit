import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getCursosDocente } from "../services/docenteService"

function MisCursos() {
  // ==============================
  // Estados principales
  // ==============================
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)

  // ==============================
  // Buscador con sugerencias
  // ==============================
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef(null)
  const navigate = useNavigate()

  // ==============================
  // Cargar cursos del docente
  // ==============================
  useEffect(() => {
    const cargarCursos = async () => {
      try {
        setLoading(true)
        const data = await getCursosDocente()
        setCursos(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error al cargar cursos del docente:", error)
        setCursos([])
      } finally {
        setLoading(false)
      }
    }

    cargarCursos()
  }, [])

  // ==============================
  // Resúmenes rápidos
  // ==============================
  const totalCursos = cursos.length

  const cursosConHorario = useMemo(() => {
    return cursos.filter((c) => (c.horario || "").trim() !== "").length
  }, [cursos])

  const cursosSinHorario = useMemo(() => {
    return cursos.filter((c) => !(c.horario || "").trim()).length
  }, [cursos])

  // ==============================
  // Sugerencias del buscador
  // ==============================
  const sugerencias = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    return cursos
      .filter((c) => {
        const nombre = (c.nombre || "").toLowerCase()
        const grupo = (c.grupo || "").toLowerCase()
        const horario = (c.horario || "").toLowerCase()

        return (
          nombre.includes(q) ||
          grupo.includes(q) ||
          horario.includes(q)
        )
      })
      .slice(0, 8)
  }, [cursos, query])

  // ==============================
  // Cursos filtrados
  // ==============================
  const cursosFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cursos

    return cursos.filter((c) => {
      const nombre = (c.nombre || "").toLowerCase()
      const grupo = (c.grupo || "").toLowerCase()
      const horario = (c.horario || "").toLowerCase()

      return (
        nombre.includes(q) ||
        grupo.includes(q) ||
        horario.includes(q)
      )
    })
  }, [cursos, query])

  // ==============================
  // Resaltar coincidencias
  // ==============================
  const renderHighlight = (text, q) => {
    const safeText = text || ""
    const queryLower = q.trim().toLowerCase()

    if (!queryLower) return safeText

    const textLower = safeText.toLowerCase()
    const idx = textLower.indexOf(queryLower)

    if (idx === -1) return safeText

    const before = safeText.slice(0, idx)
    const match = safeText.slice(idx, idx + q.length)
    const after = safeText.slice(idx + q.length)

    return (
      <>
        {before}
        <span className="bg-yellow-200 text-gray-900 rounded px-1">{match}</span>
        {after}
      </>
    )
  }

  // ==============================
  // Navegación
  // ==============================
  const irACurso = (grupoId) => {
    navigate(`/docente/cursos/${grupoId}`)
  }

  const seleccionarCurso = (curso) => {
    setQuery(curso.nombre || "")
    setOpen(false)
    setActiveIndex(-1)
    irACurso(curso.idgrupo)
  }

  // ==============================
  // Navegación con teclado
  // ==============================
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

  
  // ==============================
  // Cerrar sugerencias al hacer click fuera
  // ==============================
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
      {/* ============================== */}
      {/* Hero / encabezado */}
      {/* ============================== */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white p-6 md:p-8 shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-blue-200 font-medium mb-2">
              Panel docente
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              MIS CURSOS
            </h2>
            <p className="text-sm md:text-base text-slate-200 mt-2 max-w-2xl">
              Consulta tus cursos asignados, encuéntralos rápidamente y entra al
              detalle de cada uno para gestionar contenido, tareas y organización.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-3 min-w-[140px]">
              <p className="text-xs text-slate-200">Cursos asignados</p>
              <p className="text-2xl font-bold">{totalCursos}</p>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-3 min-w-[140px]">
              <p className="text-xs text-slate-200">Con horario</p>
              <p className="text-2xl font-bold">{cursosConHorario}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* Tarjetas de resumen */}
      {/* ============================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Total de cursos</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalCursos}</h3>
          <p className="text-xs text-gray-400 mt-2">
            Cursos actualmente asignados al docente.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Cursos con horario</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{cursosConHorario}</h3>
          <p className="text-xs text-gray-400 mt-2">
            Cursos que ya muestran horario registrado.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Cursos sin horario</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{cursosSinHorario}</h3>
          <p className="text-xs text-gray-400 mt-2">
            Cursos que aún no tienen horario visible.
          </p>
        </div>
      </div>

      {/* ============================== */}
      {/* Buscador */}
      {/* ============================== */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="max-w-3xl" ref={containerRef}>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">Buscar curso</h3>
            <p className="text-sm text-gray-500 mt-1">
              Busca por nombre del curso, grupo o horario.
            </p>
          </div>

          <div className="relative">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(true)
                setActiveIndex(-1)
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Ejemplo: React, Grupo A, Lunes 19:00-21:00..."
              className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-4 text-gray-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setOpen(false)
                  setActiveIndex(-1)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 hover:text-gray-600"
              >
                Limpiar
              </button>
            )}

            {open && sugerencias.length > 0 && (
              <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                {sugerencias.map((c, idx) => {
                  const active = idx === activeIndex

                  return (
                    <button
                      key={c.idgrupo}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => seleccionarCurso(c)}
                      className={`w-full text-left px-4 py-3 transition ${
                        active ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-semibold text-gray-900">
                        {renderHighlight(c.nombre || "Curso sin nombre", query)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Grupo {renderHighlight(c.grupo || "Sin grupo", query)} •{" "}
                        {renderHighlight(c.horario || "Sin horario", query)}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Tips: ↑ ↓ para moverte • Enter para elegir • Esc para cerrar
          </p>
        </div>
      </div>

      {/* ============================== */}
      {/* Listado de cursos */}
      {/* ============================== */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Listado de cursos</h3>
            <p className="text-sm text-gray-500 mt-1">
              {query.trim()
                ? `${cursosFiltrados.length} resultado(s) encontrados`
                : "Visualiza todos tus cursos disponibles y entra al detalle."}
            </p>
          </div>

          <div className="text-sm text-gray-500">
            {query.trim() ? `Filtro actual: "${query}"` : "Sin filtros aplicados"}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-gray-200 p-5 animate-pulse"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-full">
                    <div className="h-5 w-2/3 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 w-1/2 bg-gray-100 rounded mb-2"></div>
                    <div className="h-4 w-1/3 bg-gray-100 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
                </div>
                <div className="mt-5 h-4 w-28 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : cursos.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-3xl p-10 text-center">
            <p className="text-gray-600 font-medium">No hay cursos cargados.</p>
            <p className="text-sm text-gray-500 mt-2">
              Cuando tengas cursos asignados aparecerán aquí.
            </p>
          </div>
        ) : cursosFiltrados.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-3xl p-10 text-center">
            <p className="text-gray-700 font-semibold">
              No se encontraron cursos con esa búsqueda.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Intenta con otro nombre, grupo o rango horario.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cursosFiltrados.map((c) => (
              <button
                key={c.idgrupo}
                onClick={() => irACurso(c.idgrupo)}
                className="group text-left rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1">
                        Curso
                      </span>

                      <span className="rounded-full bg-green-100 text-green-700 text-xs font-semibold px-3 py-1">
                        Activo
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-gray-900 break-words leading-snug">
                      {c.nombre || "Curso sin nombre"}
                    </h4>

                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">Grupo:</span>{" "}
                        {c.grupo || "Sin grupo"}
                      </p>

                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">Horario:</span>{" "}
                        {c.horario || "Sin horario"}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-2xl bg-slate-100 text-slate-700 px-3 py-2 text-xs font-semibold">
                    #{c.id}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="text-sm font-semibold text-blue-600 group-hover:underline">
                    Entrar al curso
                  </span>

                  <span className="text-lg text-gray-400 group-hover:text-blue-600 transition">
                    →
                  </span>
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