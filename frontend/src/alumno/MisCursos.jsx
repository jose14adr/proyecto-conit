import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  GraduationCap,
  ArrowRight,
  Clock3,
  Layers3,
} from "lucide-react";
import api from "../api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop";

export default function MisCursos() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarMisCursos();
  }, []);

  const cursosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return cursos;

    return cursos.filter((curso) => {
      const nombre = (curso.nombrecurso || curso.nombre || "").toLowerCase();
      const descripcion = (curso.descripcion || "").toLowerCase();
      const docente = (curso.docenteNombre || "").toLowerCase();

      return (
        nombre.includes(texto) ||
        descripcion.includes(texto) ||
        docente.includes(texto)
      );
    });
  }, [cursos, busqueda]);

  const resumen = useMemo(() => {
    const total = cursos.length;
    const activos = cursos.filter((c) => (c.estadoCurso || "activo") === "activo").length;
    const conProgreso = cursos.filter((c) => Number(c.progreso || 0) > 0).length;
    const promedio =
      total > 0
        ? Math.round(
            cursos.reduce((acc, cur) => acc + Number(cur.progreso || 0), 0) / total
          )
        : 0;

    return { total, activos, conProgreso, promedio };
  }, [cursos]);

  const cursoDestacado = useMemo(() => {
    if (!cursos.length) return null;
    return [...cursos].sort(
      (a, b) => Number(b.progreso || 0) - Number(a.progreso || 0)
    )[0];
  }, [cursos]);

  async function cargarMisCursos() {
    try {
      setLoading(true);

      const idalumno = localStorage.getItem("idalumno");

      if (idalumno) {
        const endpoints = [
          `/matricula/alumno/${idalumno}`,
          `/matricula/${idalumno}`,
          `/alumno/${idalumno}/matriculas`,
        ];

        for (const endpoint of endpoints) {
          try {
            const res = await api.get(endpoint);
            const lista = Array.isArray(res.data) ? res.data : [];
            const cursosDesdeMatricula = normalizarCursosDesdeMatriculas(lista);

            if (cursosDesdeMatricula.length > 0) {
              setCursos(cursosDesdeMatricula);
              return;
            }
          } catch (error) {
            // seguimos intentando otros endpoints
          }
        }
      }

      // Fallback temporal si aún no está listo el endpoint de matrícula
      const resCursos = await api.get("/curso");
      const listaCursos = Array.isArray(resCursos.data) ? resCursos.data : [];

      setCursos(
        listaCursos.map((curso) => ({
          id: curso.id,
          nombrecurso: curso.nombrecurso || curso.nombre || "Curso sin nombre",
          descripcion: curso.descripcion || "Sin descripción disponible",
          imagen: curso.imagen || FALLBACK_IMAGE,
          progreso: curso.progreso || 0,
          docenteNombre: extraerDocenteDesdeCurso(curso),
          cantidadSesiones: extraerCantidadSesiones(curso),
          estadoCurso: "activo",
          grupoId: curso.idgrupo || null,
        }))
      );
    } catch (error) {
      console.error("Error al obtener cursos:", error);
      setCursos([]);
    } finally {
      setLoading(false);
    }
  }

  function abrirCurso(curso) {
    navigate(`/alumno/mis-cursos/${curso.id}`);
  }

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mis Cursos</h1>
            <p className="mt-1 text-sm text-slate-500">
              Revisa tus cursos matriculados y continúa tu aprendizaje.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar curso..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
            />
          </div>
        </div>

        {/* RESUMEN */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<BookOpen size={20} />}
            label="Total cursos"
            value={resumen.total}
          />
          <StatCard
            icon={<GraduationCap size={20} />}
            label="Activos"
            value={resumen.activos}
          />
          <StatCard
            icon={<Layers3 size={20} />}
            label="Con avance"
            value={resumen.conProgreso}
          />
          <StatCard
            icon={<Clock3 size={20} />}
            label="Promedio progreso"
            value={`${resumen.promedio}%`}
          />
        </div>

        {/* LISTA */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <SkeletonCurso key={i} />
              ))}
            </div>
          ) : cursosFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                <BookOpen size={24} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-700">
                No se encontraron cursos
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {busqueda
                  ? "Prueba con otro término de búsqueda."
                  : "Aún no tienes cursos registrados."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {cursosFiltrados.map((curso) => (
                <CursoCard key={`${curso.id}-${curso.grupoId || "g"}`} curso={curso} onOpen={abrirCurso} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PANEL DERECHO */}
      <aside className="w-full xl:w-80">
        <div className="flex h-full flex-col gap-6">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 p-6 text-white shadow-sm">
            <p className="text-sm text-indigo-100">Continuar aprendiendo</p>

            {cursoDestacado ? (
              <>
                <h3 className="mt-3 text-xl font-bold leading-tight">
                  {cursoDestacado.nombrecurso}
                </h3>

                <p className="mt-2 text-sm text-indigo-100">
                  {cursoDestacado.docenteNombre || "Curso en progreso"}
                </p>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Progreso</span>
                    <span className="font-semibold">
                      {cursoDestacado.progreso || 0}%
                    </span>
                  </div>

                  <div className="h-2.5 w-full rounded-full bg-white/25">
                    <div
                      className="h-2.5 rounded-full bg-white"
                      style={{ width: `${cursoDestacado.progreso || 0}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => abrirCurso(cursoDestacado)}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-slate-100"
                >
                  Continuar
                  <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <p className="mt-3 text-sm text-indigo-100">
                Cuando tengas cursos matriculados, verás aquí tu curso destacado.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">
              Recomendaciones
            </h3>

            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <TipItem text="Completa tu perfil para una mejor experiencia." />
              <TipItem text="Ingresa con frecuencia para continuar tu progreso." />
              <TipItem text="Revisa tus sesiones y materiales del curso." />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function CursoCard({ curso, onOpen }) {
  const nombre = curso.nombrecurso || curso.nombre || "Curso sin nombre";
  const descripcion = curso.descripcion || "Sin descripción disponible";
  const progreso = Number(curso.progreso || 0);
  const docente = curso.docenteNombre || "Docente por asignar";
  const sesiones = curso.cantidadSesiones || 0;

  return (
    <div
      onClick={() => onOpen(curso)}
      className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <img
        src={curso.imagen || FALLBACK_IMAGE}
        alt={nombre}
        className="h-44 w-full object-cover"
      />

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {curso.estadoCurso === "completado" ? "Completado" : "Activo"}
          </span>

          <span className="text-xs text-slate-500">{sesiones} sesiones</span>
        </div>

        <h3 className="line-clamp-2 text-lg font-semibold text-slate-800">
          {nombre}
        </h3>

        <p className="mt-1 text-sm text-slate-500">{docente}</p>

        <p className="mt-3 line-clamp-3 text-sm text-slate-500">
          {descripcion}
        </p>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-600">Progreso</span>
            <span className="font-semibold text-slate-800">{progreso}%</span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-slate-200">
            <div
              className="h-2.5 rounded-full bg-indigo-600 transition-all"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen(curso);
          }}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Entrar al curso
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-slate-500">{icon}</span>
        <span className="text-2xl font-bold text-slate-800">{value}</span>
      </div>
      <p className="mt-3 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function TipItem({ text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
      <p>{text}</p>
    </div>
  );
}

function SkeletonCurso() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-44 animate-pulse bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
        <div className="h-2.5 w-full animate-pulse rounded-full bg-slate-200" />
        <div className="h-11 w-full animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

function normalizarCursosDesdeMatriculas(matriculas) {
  const cursosNormalizados = [];

  for (const matricula of matriculas) {
    const grupo = matricula?.grupo || null;
    const curso =
      matricula?.curso ||
      grupo?.curso ||
      grupo?.idcurso ||
      null;

    if (!curso || typeof curso !== "object") continue;

    cursosNormalizados.push({
      id: curso.id,
      nombrecurso: curso.nombrecurso || curso.nombre || "Curso sin nombre",
      descripcion: curso.descripcion || "Sin descripción disponible",
      imagen: curso.imagen || FALLBACK_IMAGE,
      progreso: curso.progreso || 0,
      docenteNombre:
        extraerDocenteDesdeGrupo(grupo) || extraerDocenteDesdeCurso(curso),
      cantidadSesiones: extraerCantidadSesiones(curso),
      estadoCurso: matricula?.estado || "activo",
      grupoId: grupo?.id || matricula?.idgrupo || null,
    });
  }

  return deduplicarCursos(cursosNormalizados);
}

function deduplicarCursos(cursos) {
  const mapa = new Map();

  for (const curso of cursos) {
    const key = `${curso.id}-${curso.grupoId || "g"}`;
    if (!mapa.has(key)) {
      mapa.set(key, curso);
    }
  }

  return Array.from(mapa.values());
}

function extraerDocenteDesdeGrupo(grupo) {
  if (!grupo) return "";

  const docente = grupo?.docente;
  if (!docente) return "";

  return [docente.nombre, docente.apellido].filter(Boolean).join(" ").trim();
}

function extraerDocenteDesdeCurso(curso) {
  if (!curso) return "";

  const docente =
    curso?.docente ||
    curso?.grupo?.docente ||
    curso?.grupos?.[0]?.docente ||
    null;

  if (!docente) return "";

  return [docente.nombre, docente.apellido].filter(Boolean).join(" ").trim();
}

function extraerCantidadSesiones(curso) {
  if (!curso) return 0;

  if (Array.isArray(curso?.sesiones)) return curso.sesiones.length;
  if (Array.isArray(curso?.temario?.unidades)) return curso.temario.unidades.length;
  if (Array.isArray(curso?.modulos)) return curso.modulos.length;

  return 0;
}