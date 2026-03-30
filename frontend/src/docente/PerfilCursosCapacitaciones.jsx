function PerfilCursosCapacitaciones({
  mostrarFormCursoExtra,
  setMostrarFormCursoExtra,
  nuevoCurso,
  updateNuevoCurso,
  limpiarFormCurso,
  agregarCursoExtraLocal,
  guardandoCursoExtra,
  cursosExtra,
  eliminarCursoExtra,
}) {
  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            Cursos y capacitaciones
          </p>
          <p className="text-sm text-slate-500">
            Diplomados, talleres, certificaciones y formación complementaria.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMostrarFormCursoExtra((prev) => !prev)}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          {mostrarFormCursoExtra ? "Cerrar" : "+ Agregar curso"}
        </button>
      </div>

      {/* FORMULARIO */}
      {mostrarFormCursoExtra && (
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Nombre del curso"
              value={nuevoCurso.nombre}
              onChange={(v) => updateNuevoCurso("nombre", v)}
              placeholder="Ej. Diplomado en IA"
            />

            <Field
              label="Institución"
              value={nuevoCurso.institucion}
              onChange={(v) => updateNuevoCurso("institucion", v)}
              placeholder="Ej. Universidad / Instituto"
            />

            <Field
              label="Fecha inicio"
              type="date"
              value={nuevoCurso.fechaInicio}
              onChange={(v) => updateNuevoCurso("fechaInicio", v)}
            />

            <Field
              label="Fecha fin"
              type="date"
              value={nuevoCurso.fechaFin}
              onChange={(v) => updateNuevoCurso("fechaFin", v)}
            />
          </div>

          {/* ARCHIVO */}
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-700">
              Certificado o constancia (PDF)
            </p>

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) =>
                updateNuevoCurso("archivo", e.target.files?.[0] || null)
              }
              className="mt-3 w-full rounded-xl border px-4 py-3"
            />

            {nuevoCurso.archivo && (
              <p className="mt-2 text-xs text-slate-500">
                📄 {nuevoCurso.archivo.name}
              </p>
            )}
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setMostrarFormCursoExtra(false);
                limpiarFormCurso();
              }}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-white"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={agregarCursoExtraLocal}
              disabled={guardandoCursoExtra}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {guardandoCursoExtra ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* LISTA */}
      {cursosExtra.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          No hay cursos registrados todavía.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cursosExtra.map((curso) => (
            <div
              key={curso.id}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-2">
                <div className="font-semibold text-slate-800">
                  {curso.nombre}
                </div>

                <div className="text-sm text-slate-500">
                  {curso.institucion || "Sin institución"}
                </div>

                {(curso.fecha_inicio || curso.fecha_fin) && (
                  <div className="text-xs text-slate-500">
                    {curso.fecha_inicio || "--"}{" "}
                    {curso.fecha_fin ? `a ${curso.fecha_fin}` : ""}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {curso.archivo_url ? (
                    <a
                      href={curso.archivo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      Ver certificado
                    </a>
                  ) : (
                    <span className="rounded-lg bg-amber-100 px-3 py-2 text-xs text-amber-700">
                      Sin certificado
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => eliminarCursoExtra(curso.id)}
                    className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-indigo-400 ${
          disabled ? "bg-slate-100 text-slate-500" : "bg-white"
        }`}
      />
    </div>
  );
}

export default PerfilCursosCapacitaciones;