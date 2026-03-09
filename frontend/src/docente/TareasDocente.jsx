import { useEffect, useState } from "react";
import { getCursosDocente } from "../services/docenteService";

function TareasDocente() {
  // ==============================
  // Estado del formulario
  // ==============================
  const [form, setForm] = useState({
    cursoId: "",
    titulo: "",
    descripcion: "",
    fechaLimite: "",
    tipoEntrega: "",
    textoBase: "",
    archivo: null,
    video: null,
  });

  // ==============================
  // Estado de cursos del docente
  // ==============================
  const [cursos, setCursos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(true);

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
  // Manejar inputs normales
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
  // Guardar tarea (por ahora prueba)
  // ==============================
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Datos de la tarea:", form);
    alert("Tarea registrada correctamente ✅");

    setForm({
      cursoId: "",
      titulo: "",
      descripcion: "",
      fechaLimite: "",
      tipoEntrega: "",
      textoBase: "",
      archivo: null,
      video: null,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-lg md:p-8">
        {/* ==============================
        Encabezado
        ============================== */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Asignar Tareas</h1>
          <p className="mt-2 text-sm text-gray-500">
            Desde aquí el docente puede crear nuevas tareas para sus cursos.
          </p>
        </div>

        {/* ==============================
        Formulario
        ============================== */}
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
                  {curso.nombre}
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

          {/* Tipo de entrega */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Tipo de entrega
            </label>

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

          {/* Campo dinámico: archivo */}
          {form.tipoEntrega === "archivo" && (
            <div>
              <label
                htmlFor="archivo"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Subir archivo
              </label>
              <input
                id="archivo"
                type="file"
                name="archivo"
                onChange={handleFileChange}
                className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700"
              />
            </div>
          )}

          {/* Campo dinámico: texto */}
          {form.tipoEntrega === "texto" && (
            <div>
              <label
                htmlFor="textoBase"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Texto de la tarea
              </label>
              <textarea
                id="textoBase"
                name="textoBase"
                value={form.textoBase}
                onChange={handleChange}
                rows="5"
                placeholder="Escribe aquí las indicaciones..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          )}

          {/* Campo dinámico: video */}
          {form.tipoEntrega === "video" && (
            <div>
              <label
                htmlFor="video"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Subir video
              </label>
              <input
                id="video"
                type="file"
                name="video"
                accept="video/*"
                onChange={handleFileChange}
                className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700"
              />
            </div>
          )}

          {/* Botón */}
          <div className="pt-2">
            <button
              type="submit"
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Guardar tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TareasDocente;