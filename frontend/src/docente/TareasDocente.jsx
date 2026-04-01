import { useEffect, useState } from "react";
import { getCursosDocente, crearTarea } from "../services/docenteService";

function TareasDocente() {
  // ==============================
  // Estado principal del formulario
  // ==============================
  const [form, setForm] = useState({
    cursoId: "",
    titulo: "",
    descripcion: "",
    fechaInicio: "",
    fechaLimite: "",
    tipoEntrega: "",
    tipoApoyo: "ninguno",
    textoApoyo: "",
    archivoApoyo: null,
    videoApoyo: null,
  });

  // ==============================
  // Estado de cursos del docente
  // ==============================
  const [cursos, setCursos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // ==============================
  // Cargar cursos del docente
  // ==============================
  useEffect(() => {
    const cargarCursos = async () => {
      try {
        const data = await getCursosDocente();
        setCursos(data || []);
      } catch (error) {
        console.error("Error cargando cursos:", error);
        alert("Error al cargar cursos");
      } finally {
        setLoadingCursos(false);
      }
    };

    
    cargarCursos();
  }, []);

  // ==============================
  // Manejar cambios normales 
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "tipoApoyo") {
        next.textoApoyo = "";
        next.archivoApoyo = null;
        next.videoApoyo = null;
      }

      return next;
    });
  };

  // ==============================
  // Manejar archivos
  // ==============================
  const handleFileChange = (e) => {
    const { name, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: files[0] || null,
    }));
  };

  // ==============================
  // Guardar tarea real
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setGuardando(true);

      await crearTarea({
        cursoId: form.cursoId,
        titulo: form.titulo,
        descripcion: form.descripcion,
        fechaInicio: form.fechaInicio,
        fechaLimite: form.fechaLimite,
        tipoEntrega: form.tipoEntrega,
        tipoApoyo: form.tipoApoyo,
        textoApoyo: form.textoApoyo,
        archivoApoyo: form.archivoApoyo,
        videoApoyo: form.videoApoyo,
      });

      alert("Tarea creada correctamente ✅");

      setForm({
        cursoId: "",
        titulo: "",
        descripcion: "",
        fechaInicio: "",
        fechaLimite: "",
        tipoEntrega: "",
        tipoApoyo: "ninguno",
        textoApoyo: "",
        archivoApoyo: null,
        videoApoyo: null,
      });
    } catch (error) {
      console.error("Error al guardar tarea:", error);
      alert(error.message || "Error al guardar la tarea");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-lg md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Asignar Tareas</h1>
          <p className="mt-2 text-sm text-gray-500">
            Desde aquí el docente puede crear nuevas tareas para sus cursos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Curso */}
          <div>
            <label
              htmlFor="cursoId"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Curso
            </label>

            <select
              id="cursoId"
              name="cursoId"
              value={form.cursoId}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">
                {loadingCursos ? "Cargando cursos..." : "Selecciona un curso"}
              </option>

              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombre || curso.nombrecurso || `Curso ${curso.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div>
            <label
              htmlFor="titulo"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Título de la tarea
            </label>

            <input
              id="titulo"
              type="text"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              placeholder="Ej. Tarea de React"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="descripcion"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Descripción
            </label>

            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Describe la tarea..."
              rows="4"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Fecha y hora de inicio */}
          <div>
            <label
              htmlFor="fechaInicio"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Fecha y hora de inicio
            </label>

            <input
              id="fechaInicio"
              type="datetime-local"
              name="fechaInicio"
              value={form.fechaInicio}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Fecha límite */}
          <div>
            <label
              htmlFor="fechaLimite"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Fecha límite
            </label>

            <input
              id="fechaLimite"
              type="date"
              name="fechaLimite"
              value={form.fechaLimite}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Tipo de entrega del alumno */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Tipo de entrega del alumno
            </label>
            <p className="mb-3 text-xs text-gray-500">
              Selecciona cómo deberá entregar esta tarea el alumno.
            </p>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="tipoEntrega"
                  value="archivo"
                  checked={form.tipoEntrega === "archivo"}
                  onChange={handleChange}
                />
                <span>Archivo</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="tipoEntrega"
                  value="texto"
                  checked={form.tipoEntrega === "texto"}
                  onChange={handleChange}
                />
                <span>Texto</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="tipoEntrega"
                  value="video"
                  checked={form.tipoEntrega === "video"}
                  onChange={handleChange}
                />
                <span>Video</span>
              </label>
            </div>
          </div>

          {/* Material de apoyo del docente */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 md:p-5">
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Material de apoyo del docente
            </label>
            <p className="mb-4 text-xs text-gray-500">
              Aquí puedes agregar contenido opcional para ayudar al alumno a
              desarrollar la tarea.
            </p>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="tipoApoyo"
                  value="ninguno"
                  checked={form.tipoApoyo === "ninguno"}
                  onChange={handleChange}
                />
                <span>Ninguno</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="tipoApoyo"
                  value="archivo"
                  checked={form.tipoApoyo === "archivo"}
                  onChange={handleChange}
                />
                <span>Archivo</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="tipoApoyo"
                  value="texto"
                  checked={form.tipoApoyo === "texto"}
                  onChange={handleChange}
                />
                <span>Texto</span>
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="tipoApoyo"
                  value="video"
                  checked={form.tipoApoyo === "video"}
                  onChange={handleChange}
                />
                <span>Video</span>
              </label>
            </div>

            {form.tipoApoyo === "archivo" && (
              <div className="mt-5">
                <label
                  htmlFor="archivoApoyo"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Subir archivo de apoyo
                </label>

                <input
                  id="archivoApoyo"
                  type="file"
                  name="archivoApoyo"
                  onChange={handleFileChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700"
                />
              </div>
            )}

            {form.tipoApoyo === "texto" && (
              <div className="mt-5">
                <label
                  htmlFor="textoApoyo"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Texto de apoyo
                </label>

                <textarea
                  id="textoApoyo"
                  name="textoApoyo"
                  value={form.textoApoyo}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Escribe aquí indicaciones, recomendaciones o material de ayuda..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            )}

            {form.tipoApoyo === "video" && (
              <div className="mt-5">
                <label
                  htmlFor="videoApoyo"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Subir video de apoyo
                </label>

                <input
                  id="videoApoyo"
                  type="file"
                  name="videoApoyo"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700"
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TareasDocente;