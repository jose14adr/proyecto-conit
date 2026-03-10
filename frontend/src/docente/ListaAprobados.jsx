import { useEffect, useMemo, useRef, useState } from "react";
import { getCursosDocente, getAprobadosByCurso } from "../services/docenteService";

function ListaAprobados() {
  const [cursos, setCursos] = useState([]);
  const [query, setQuery] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [openSug, setOpenSug] = useState(false);

  const [rows, setRows] = useState([]); // data final para la tabla
  const [loading, setLoading] = useState(false);

  // filtros: TODOS | APROBADOS | RECUPERACION | DESAPROBADOS | SIN_NOTAS
  const [filtro, setFiltro] = useState("TODOS");

  const wrapperRef = useRef(null);

  useEffect(() => {
    getCursosDocente().then((data) => setCursos(data || []));
  }, []);

  const cargar = async (cursoId) => {
    setLoading(true);
    try {
      const data = await getAprobadosByCurso(cursoId);

      // Normalizamos salida para UI (acepta tanto alumno plano como alumno anidado)
      const mapped = (data || []).map((x) => {
        const a = x.alumno ?? x; // soporta x.alumno o campos planos

        const nombreCompleto = `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim();

        const n1 = x.nota1 ?? null;
        const n2 = x.nota2 ?? null;
        const n3 = x.nota3 ?? null;

        let promedio = x.promedio ?? null;
        if (promedio == null && n1 != null && n2 != null && n3 != null) {
          promedio = Math.round(((Number(n1) + Number(n2) + Number(n3)) / 3) * 10) / 10;
        }

        return {
          idmatricula: x.idmatricula ?? x.id ?? null,
          idalumno: a.id ?? x.idalumno ?? null,
          nombre: nombreCompleto || "SIN NOMBRE",
          nota1: n1,
          nota2: n2,
          nota3: n3,
          promedio,
        };
      });

      setRows(mapped);
    } catch (err) {
      console.error("Error cargando aprobados:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // cuando seleccionas curso, carga desde Supabase (nota incluida)
  useEffect(() => {
    if (!cursoSeleccionado?.id) {
      setRows([]);
      return;
    }
    cargar(cursoSeleccionado.id);
  }, [cursoSeleccionado]);

  // cerrar sugerencias al click fuera
  useEffect(() => {
    const onClick = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpenSug(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // sugerencias tipo google
  const sugerencias = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return cursos.filter((c) => c.nombre.toLowerCase().includes(q)).slice(0, 8);
  }, [query, cursos]);

  // cursos visibles
  const cursosVisibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cursos;
    return cursos.filter((c) => c.nombre.toLowerCase().includes(q));
  }, [query, cursos]);

  const elegirCurso = (c) => {
    setCursoSeleccionado(c);
    setQuery(c.nombre);
    setOpenSug(false);
    setRows([]);
    setFiltro("TODOS");
  };

  const limpiarCurso = () => {
    setCursoSeleccionado(null);
    setQuery("");
    setOpenSug(false);
    setRows([]);
    setFiltro("TODOS");
  };

  const estadoAlumno = (r) => {
    const prom = r.promedio;
    if (prom == null) return "SIN_NOTAS";
    if (prom >= 11) return "APROBADOS";
    if (prom >= 8) return "RECUPERACION";
    return "DESAPROBADOS";
  };

  const rowsFiltradas = useMemo(() => {
    if (filtro === "TODOS") return rows;
    return rows.filter((r) => estadoAlumno(r) === filtro);
  }, [rows, filtro]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-bold">Lista de aprobados</h2>
        <p className="text-sm text-gray-500">
          Busca un curso, selecciónalo y gestiona aprobados/recuperación/desaprobados.
        </p>
      </div>

      {/* Buscador + lista cursos */}
      <div className="bg-white p-4 rounded shadow space-y-4" ref={wrapperRef}>
        <div>
          <label className="block font-semibold mb-2">Buscar curso</label>

          <div className="relative">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenSug(true);
                setCursoSeleccionado(null);
                setRows([]);
              }}
              onFocus={() => setOpenSug(true)}
              placeholder="Escribe el nombre del curso..."
              className="border rounded px-3 py-2 w-full"
            />

            {query && (
              <button
                type="button"
                onClick={limpiarCurso}
                className="absolute right-2 top-2 text-sm text-gray-500 hover:text-gray-800"
                title="Limpiar"
              >
                ✕
              </button>
            )}

            {openSug && sugerencias.length > 0 && (
              <div className="absolute z-10 mt-2 w-full bg-white border rounded shadow overflow-hidden">
                {sugerencias.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => elegirCurso(c)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  >
                    <div className="font-semibold">{c.nombre}</div>
                    <div className="text-xs text-gray-500">
                      Grupo {c.grupo} • {c.horario}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cursos del docente */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">Cursos del docente</h3>
            <span className="text-sm text-gray-500">{cursosVisibles.length} curso(s)</span>
          </div>

          {cursosVisibles.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cursosVisibles.map((c) => {
                const activo = cursoSeleccionado?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => elegirCurso(c)}
                    className={`text-left border rounded p-3 hover:bg-gray-50 ${
                      activo ? "border-blue-600 bg-blue-50" : ""
                    }`}
                  >
                    <div className="font-semibold">{c.nombre}</div>
                    <div className="text-sm text-gray-600">
                      Grupo {c.grupo} • {c.horario}
                    </div>
                    {activo && (
                      <div className="text-xs mt-2 text-blue-700 font-semibold">Seleccionado</div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No se encontraron cursos con ese filtro.</p>
          )}
        </div>

        {/* Detalle + refrescar */}
        {cursoSeleccionado && (
          <div className="border rounded p-3 bg-gray-50 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">{cursoSeleccionado.nombre}</div>
              <div className="text-sm text-gray-600">
                Grupo {cursoSeleccionado.grupo} • {cursoSeleccionado.horario}
              </div>
            </div>

            <button
              type="button"
              onClick={() => cargar(cursoSeleccionado.id)}
              className="border px-3 py-2 rounded hover:bg-white"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Refrescar"}
            </button>
          </div>
        )}
      </div>

      {/* Tabla */}
      {cursoSeleccionado && (
        <div className="bg-white p-4 rounded shadow space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h3 className="text-lg font-bold">Alumnos</h3>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtro:</span>
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="TODOS">Todos</option>
                <option value="APROBADOS">Aprobados</option>
                <option value="RECUPERACION">Por recuperación</option>
                <option value="DESAPROBADOS">Desaprobados</option>
                <option value="SIN_NOTAS">Sin notas</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : rowsFiltradas.length === 0 ? (
            <p className="text-gray-500">No hay alumnos para este filtro.</p>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-[900px] w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Alumno</th>
                    <th className="py-2 text-left">Nota 1</th>
                    <th className="py-2 text-left">Nota 2</th>
                    <th className="py-2 text-left">Nota 3</th>
                    <th className="py-2 text-left">Promedio</th>
                    <th className="py-2 text-left">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {rowsFiltradas.map((r) => (
                    <tr key={r.idmatricula ?? `${r.idalumno}-${r.nombre}`} className="border-b">
                      <td className="py-2">{r.nombre}</td>
                      <td className="py-2">{r.nota1 ?? "—"}</td>
                      <td className="py-2">{r.nota2 ?? "—"}</td>
                      <td className="py-2">{r.nota3 ?? "—"}</td>
                      <td className="py-2 font-semibold">{r.promedio ?? "—"}</td>
                      <td className="py-2">{estadoAlumno(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ListaAprobados;