import { BookOpen, Video, Award, ArrowRight, Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GraficoProgreso from "../components/GraficoProgreso";
import api from "../api";

export default function HomePage() {
  const [ahora, setAhora] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [misCursos, setMisCursos] = useState([]);
  const [misSesiones, setMisSesiones] = useState([]);
  const [ultimoCertificado, setUltimoCertificado] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setAhora(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    cargarDashboardAlumno();
  }, []);

  const cursosActivos = useMemo(() => {
    return misCursos.filter((c) => (c.estadoCurso || "activo") === "activo");
  }, [misCursos]);

  const proximaSesion = useMemo(() => {
    const futuras = misSesiones
      .filter((s) => new Date(s.fecha).getTime() > ahora.getTime())
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    return futuras[0] || null;
  }, [misSesiones, ahora]);

  function contador(fecha) {
    const diff = new Date(fecha).getTime() - ahora.getTime();

    if (diff <= 0) return "🔴 En vivo";

    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);

    return `${horas}h ${minutos}m ${segundos}s`;
  }

  async function cargarDashboardAlumno() {
    try {
      setLoading(true);

      const idalumno = localStorage.getItem("idalumno");
      if (!idalumno) {
        setMisCursos([]);
        setMisSesiones([]);
        setUltimoCertificado(null);
        return;
      }

      let cursosNormalizados = [];

      try {
            const res = await api.get(`/matricula/alumno/${idalumno}`);
            const lista = Array.isArray(res.data) ? res.data : [];
            cursosNormalizados = normalizarCursosDesdeMatriculas(lista);
          } catch (error) {
            cursosNormalizados = [];
          }

      // 2. Fallback temporal si aún no existe endpoint de matrícula completo
      if (!cursosNormalizados.length) {
        try {
          const resCursos = await api.get("/curso");
          const listaCursos = Array.isArray(resCursos.data) ? resCursos.data : [];

          cursosNormalizados = listaCursos.map((curso) => ({
            id: curso.id,
            nombrecurso: curso.nombrecurso || curso.nombre || "Curso sin nombre",
            descripcion: curso.descripcion || "Sin descripción disponible",
            progreso: Number(curso.progreso || 0),
            estadoCurso: "activo",
            docenteNombre: extraerDocenteDesdeCurso(curso),
          }));
        } catch (error) {
          cursosNormalizados = [];
        }
      }

      setMisCursos(cursosNormalizados);

      // 3. Sesiones
      try {
        const resSesiones = await api.get("/sesion-vivo");
        const listaSesiones = Array.isArray(resSesiones.data) ? resSesiones.data : [];

        const idsCursos = new Set(cursosNormalizados.map((c) => Number(c.id)));

        const sesionesFiltradas = listaSesiones.filter((s) => {
          const cursoId = Number(s?.curso?.id || s?.idcurso || 0);
          return idsCursos.has(cursoId);
        });

        setMisSesiones(sesionesFiltradas);
      } catch (error) {
        setMisSesiones([]);
      }

      // 4. Certificado más reciente
      try {
        const resCert = await api.get(`/certificado/alumno/${idalumno}`);
        const listaCert = Array.isArray(resCert.data) ? resCert.data : [];

        const ordenados = [...listaCert].sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );

        setUltimoCertificado(ordenados[0] || null);
      } catch (error) {
        setUltimoCertificado(null);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* BIENVENIDA */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-8 text-white shadow">
        <h2 className="text-2xl font-bold">👋 Bienvenido a tu Aula Virtual</h2>
        <p className="mt-2 text-sm opacity-90">
          Sigue aprendiendo y revisa el avance de tus cursos.
        </p>
      </div>

      {/* TARJETAS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card
          title="Cursos Activos"
          value={loading ? "..." : cursosActivos.length}
          icon={<BookOpen size={28} />}
          color="bg-blue-100 text-blue-600"
        />

        <Card
          title="Sesiones"
          value={loading ? "..." : misSesiones.length}
          icon={<Video size={28} />}
          color="bg-red-100 text-red-600"
        />

        <Card
          title="Certificados"
          value={loading ? "..." : ultimoCertificado ? 1 : 0}
          icon={<Award size={28} />}
          color="bg-green-100 text-green-600"
        />
      </div>

      {/* PROXIMA SESION */}
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">📅 Próxima sesión en vivo</h3>

        {proximaSesion ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium">
                {proximaSesion.titulo || proximaSesion.curso?.nombrecurso || "Sesión"}
              </p>

              <p className="text-sm text-gray-500">
                {formatearFechaHora(proximaSesion.fecha)}
              </p>

              <p className="mt-2 text-sm font-semibold text-indigo-600">
                ⏳ Inicia en {contador(proximaSesion.fecha)}
              </p>
            </div>

            <button
              onClick={() =>
                proximaSesion.link_reunion &&
                window.open(proximaSesion.link_reunion, "_blank", "noopener,noreferrer")
              }
              className="rounded-2xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Entrar a la sesión
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No hay sesiones próximas por ahora.
          </p>
        )}
      </div>

      {/* PROGRESO DE CURSOS */}
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">📈 Progreso de tus cursos</h3>

          <button
            onClick={() => navigate("/alumno/mis-cursos")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ver todos
            <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : misCursos.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aún no tienes cursos matriculados.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {misCursos.slice(0, 3).map((curso) => (
              <GraficoProgreso
                key={curso.id}
                nombre={curso.nombrecurso}
                progreso={Number(curso.progreso || 0)}
              />
            ))}
          </div>
        )}
      </div>

      {/* CERTIFICADO */}
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">🏆 Último certificado obtenido</h3>

        {ultimoCertificado ? (
          <>
            <p className="font-medium">
              {ultimoCertificado.curso || "Certificado"}
            </p>

            <p className="text-sm text-gray-500">
              Emitido el {formatearFecha(ultimoCertificado.fechaEmision)}
            </p>

            <button
              onClick={() => navigate("/alumno/mis-certificados")}
              className="mt-3 rounded-2xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            >
              Ver certificado
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Aún no tienes certificados emitidos.
          </p>
        )}
      </div>
    </div>
  );
}

function Card({ title, value, icon, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow hover:shadow-md transition">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
      </div>

      <div className={`rounded-lg p-3 ${color}`}>{icon}</div>
    </div>
  );
}

function normalizarCursosDesdeMatriculas(matriculas) {
  const cursosNormalizados = [];

  for (const matricula of matriculas) {
    const grupo = matricula?.grupo || null;
    const curso = matricula?.curso || grupo?.curso || null;

    if (!curso || typeof curso !== "object") continue;

    cursosNormalizados.push({
      id: curso.id,
      nombrecurso: curso.nombrecurso || curso.nombre || "Curso sin nombre",
      descripcion: curso.descripcion || "Sin descripción disponible",
      progreso: Number(curso.progreso || 0),
      estadoCurso: matricula?.estado || "activo",
      docenteNombre:
        extraerDocenteDesdeGrupo(grupo) || extraerDocenteDesdeCurso(curso),
    });
  }

  return deduplicarCursos(cursosNormalizados);
}

function deduplicarCursos(cursos) {
  const mapa = new Map();

  for (const curso of cursos) {
    if (!mapa.has(curso.id)) {
      mapa.set(curso.id, curso);
    }
  }

  return Array.from(mapa.values());
}

function extraerDocenteDesdeGrupo(grupo) {
  if (!grupo?.docente) return "";
  return [grupo.docente.nombre, grupo.docente.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function extraerDocenteDesdeCurso(curso) {
  const docente = curso?.docente || curso?.grupos?.[0]?.docente || null;
  if (!docente) return "";
  return [docente.nombre, docente.apellido].filter(Boolean).join(" ").trim();
}

function formatearFecha(fechaISO) {
  return new Date(fechaISO).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatearFechaHora(fechaISO) {
  return new Date(fechaISO).toLocaleString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}