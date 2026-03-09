import { useEffect, useMemo, useRef, useState } from "react";
import { getCursosDocente, getAlumnosByCurso, guardarNotas } from "../services/docenteService";

function hoyTexto() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function toNumberOrNaN(v) {
  if (v === "" || v === null || v === undefined) return NaN;
  const n = Number(v);
  return Number.isNaN(n) ? NaN : n;
}

function validateNota(v) {
  if (v === "" || v === null || v === undefined) return { ok: false, msg: "Obligatorio" };
  const n = Number(v);
  if (Number.isNaN(n)) return { ok: false, msg: "Solo números" };
  if (n < 0 || n > 20) return { ok: false, msg: "Debe ser 0 a 20" };
  return { ok: true, msg: "" };
}

function promedio3(n1, n2, n3) {
  if ([n1, n2, n3].some((x) => Number.isNaN(x))) return "—";
  return ((n1 + n2 + n3) / 3).toFixed(1);
}

export default function RegistroNotas() {
  const [cursos, setCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);

  // selección
  const [cursoId, setCursoId] = useState("");
  const [query, setQuery] = useState("");
  const [openSug, setOpenSug] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef(null);

  // draft: ✅ CLAVE REAL = idmatricula
  const [draft, setDraft] = useState({}); // { [idmatricula]: {nota1,nota2,nota3} }
  const [original, setOriginal] = useState({});
  const [saving, setSaving] = useState(false);

  // modal notas
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAlumno, setModalAlumno] = useState(null);
  const [modalNotas, setModalNotas] = useState({ nota1: "", nota2: "", nota3: "" });
  const [modalTouched, setModalTouched] = useState({ nota1: false, nota2: false, nota3: false });

  // modal boleta
  const [boletaOpen, setBoletaOpen] = useState(false);
  const [boletaAlumno, setBoletaAlumno] = useState(null);

  useEffect(() => {
    getCursosDocente().then((data) => setCursos(data || []));
  }, []);

  // ✅ Cargar alumnos + armar draft por idmatricula
  useEffect(() => {
    if (!cursoId) return;

    getAlumnosByCurso(cursoId).then((data) => {
      const list = data || [];
      setAlumnos(list);

      const base = {};
      list.forEach((a) => {
        const key = a.idmatricula; // ✅
        base[key] = {
          nota1: a.nota1 ?? "",
          nota2: a.nota2 ?? "",
          nota3: a.nota3 ?? "",
        };
      });

      setDraft(base);
      setOriginal(base);
    });
  }, [cursoId]);

  const cursoSeleccionado = useMemo(() => {
    return cursos.find((c) => String(c.id) === String(cursoId)) || null;
  }, [cursos, cursoId]);

  // sugerencias tipo google
  const sugerencias = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cursos.slice(0, 6);
    return cursos.filter((c) => c.nombre.toLowerCase().includes(q)).slice(0, 8);
  }, [query, cursos]);

  const seleccionarCurso = (c) => {
    setCursoId(String(c.id));
    setQuery(c.nombre);
    setOpenSug(false);
    setHighlight(0);
  };

  const onKeyDown = (e) => {
    if (!openSug) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, sugerencias.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const pick = sugerencias[highlight];
      if (pick) seleccionarCurso(pick);
    }
    if (e.key === "Escape") setOpenSug(false);
  };

  // ===== Validación global =====
  const erroresPorAlumno = useMemo(() => {
    const errs = {};
    alumnos.forEach((a) => {
      const key = a.idmatricula;
      const row = draft[key] || { nota1: "", nota2: "", nota3: "" };

      const v1 = validateNota(row.nota1);
      const v2 = validateNota(row.nota2);
      const v3 = validateNota(row.nota3);

      if (!v1.ok || !v2.ok || !v3.ok) {
        errs[key] = {
          nota1: v1.ok ? "" : v1.msg,
          nota2: v2.ok ? "" : v2.msg,
          nota3: v3.ok ? "" : v3.msg,
        };
      }
    });
    return errs;
  }, [draft, alumnos]);

  const tieneErrores = useMemo(() => Object.keys(erroresPorAlumno).length > 0, [erroresPorAlumno]);

  // ===== Modal Notas =====
  const abrirModalNotas = (alumno) => {
    setModalAlumno(alumno);

    setModalNotas({
      nota1: alumno?.nota1 ?? "",
      nota2: alumno?.nota2 ?? "",
      nota3: alumno?.nota3 ?? "",
    });

    setModalTouched({ nota1: false, nota2: false, nota3: false });
    setModalOpen(true);
  };

  const cerrarModalNotas = () => {
    setModalOpen(false);
    setModalAlumno(null);
    setModalNotas({ nota1: "", nota2: "", nota3: "" });
    setModalTouched({ nota1: false, nota2: false, nota3: false });
  };

  const modalErrors = useMemo(() => {
    return {
      nota1: validateNota(modalNotas.nota1),
      nota2: validateNota(modalNotas.nota2),
      nota3: validateNota(modalNotas.nota3),
    };
  }, [modalNotas]);

  const modalHasErrors = !modalErrors.nota1.ok || !modalErrors.nota2.ok || !modalErrors.nota3.ok;

  const modalProm = useMemo(() => {
    const n1 = toNumberOrNaN(modalNotas.nota1);
    const n2 = toNumberOrNaN(modalNotas.nota2);
    const n3 = toNumberOrNaN(modalNotas.nota3);
    return promedio3(n1, n2, n3);
  }, [modalNotas]);

  // ✅ ESTE ES EL GUARDADO REAL EN SUPABASE
  const guardarModalNotas = async () => {
    try {
      if (!modalAlumno) return;

      setModalTouched({ nota1: true, nota2: true, nota3: true });
      if (modalHasErrors) return;

      setSaving(true);

      const idmatricula = Number(modalAlumno.idmatricula);

      await guardarNotas(modalAlumno.idmatricula, {
        1: Number(modalNotas.nota1),
        2: Number(modalNotas.nota2),
        3: Number(modalNotas.nota3),
      });

      // ✅ actualizar tabla en memoria (alumnos)
      setAlumnos((prev) =>
        prev.map((a) =>
          Number(a.idmatricula) === idmatricula
            ? {
                ...a,
                nota1: Number(modalNotas.nota1),
                nota2: Number(modalNotas.nota2),
                nota3: Number(modalNotas.nota3),
              }
            : a
        )
      );

      // ✅ actualizar draft por idmatricula (clave real)
      setDraft((prev) => ({
        ...prev,
        [idmatricula]: {
          nota1: modalNotas.nota1,
          nota2: modalNotas.nota2,
          nota3: modalNotas.nota3,
        },
      }));

      // ✅ también actualiza original para que al volver no “reviva” lo viejo
      setOriginal((prev) => ({
        ...prev,
        [idmatricula]: {
          nota1: modalNotas.nota1,
          nota2: modalNotas.nota2,
          nota3: modalNotas.nota3,
        },
      }));

      cerrarModalNotas();
      alert("Notas guardadas correctamente ✅");
    } catch (e) {
      console.error("❌ Error guardando en Supabase:", e);
      alert("Error al guardar (mira Console)");
    } finally {
      setSaving(false);
    }
  };

  // ===== Modal Boleta =====
  const abrirBoleta = (alumno) => {
    setBoletaAlumno(alumno);
    setBoletaOpen(true);
  };

  const cerrarBoleta = () => {
    setBoletaOpen(false);
    setBoletaAlumno(null);
  };

  const boletaNotas = useMemo(() => {
    if (!boletaAlumno) return { nota1: "—", nota2: "—", nota3: "—", promedio: "—" };
    const key = boletaAlumno.idmatricula;
    const row = draft[key] || { nota1: "", nota2: "", nota3: "" };

    const n1 = validateNota(row.nota1).ok ? row.nota1 : "—";
    const n2 = validateNota(row.nota2).ok ? row.nota2 : "—";
    const n3 = validateNota(row.nota3).ok ? row.nota3 : "—";

    const pn1 = toNumberOrNaN(n1 === "—" ? "" : n1);
    const pn2 = toNumberOrNaN(n2 === "—" ? "" : n2);
    const pn3 = toNumberOrNaN(n3 === "—" ? "" : n3);

    return { nota1: n1, nota2: n2, nota3: n3, promedio: promedio3(pn1, pn2, pn3) };
  }, [boletaAlumno, draft]);

  return (
    <div className="space-y-6">
      {/* Header + buscador */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-bold">Registro de Notas</h2>

        <div className="mt-4 max-w-xl">
          <label className="block text-sm font-semibold mb-2">Buscar curso</label>

          <div className="relative">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenSug(true);
                setHighlight(0);
              }}
              onFocus={() => setOpenSug(true)}
              onBlur={() => setTimeout(() => setOpenSug(false), 150)}
              onKeyDown={onKeyDown}
              className="w-full border rounded px-3 py-2"
              placeholder="Escribe el nombre del curso..."
            />

            {openSug && sugerencias.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow overflow-hidden">
                {sugerencias.map((c, idx) => (
                  <button
                    type="button"
                    key={c.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => seleccionarCurso(c)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                      idx === highlight ? "bg-gray-100" : ""
                    }`}
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

          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">O seleccionar desde lista</div>
            <select
              value={cursoId}
              onChange={(e) => {
                const val = e.target.value;
                setCursoId(val);

                if (!val) {
                  setAlumnos([]);
                  setDraft({});
                  setOriginal({});
                  setQuery("");
                } else {
                  const found = cursos.find((c) => String(c.id) === String(val));
                  if (found) setQuery(found.nombre);
                }
              }}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">-- Selecciona un curso --</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} (Grupo {c.grupo})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">Alumnos del curso</h3>
            {cursoSeleccionado && (
              <p className="text-sm text-gray-500">
                {cursoSeleccionado.nombre} • Grupo {cursoSeleccionado.grupo} • {cursoSeleccionado.horario}
              </p>
            )}

            {cursoId && (
              <p className={`text-xs mt-1 ${tieneErrores ? "text-red-600" : "text-gray-500"}`}>
                {tieneErrores
                  ? "Hay notas inválidas o incompletas. Corrige antes de guardar."
                  : "Todas las notas están completas."}
              </p>
            )}
          </div>
        </div>

        {!cursoId ? (
          <div className="mt-4 text-gray-500">Selecciona un curso para ver y registrar notas.</div>
        ) : alumnos.length === 0 ? (
          <div className="mt-4 text-gray-500">No hay alumnos registrados para este curso.</div>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="min-w-[1100px] w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Alumno</th>
                  <th className="py-2 text-left">Nota 1</th>
                  <th className="py-2 text-left">Nota 2</th>
                  <th className="py-2 text-left">Nota 3</th>
                  <th className="py-2 text-left">Promedio</th>
                  <th className="py-2 text-left">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {alumnos.map((a) => {
                  const key = a.idmatricula; // ✅
                  const row = draft[key] || { nota1: "", nota2: "", nota3: "" };
                  const e = erroresPorAlumno[key] || { nota1: "", nota2: "", nota3: "" };

                  const n1 = toNumberOrNaN(row.nota1);
                  const n2 = toNumberOrNaN(row.nota2);
                  const n3 = toNumberOrNaN(row.nota3);

                  const prom = promedio3(n1, n2, n3);

                  return (
                    <tr key={key} className="border-b">
                      <td className="py-2">{a.nombre}</td>

                      <td className="py-2">
                        <CellRead value={row.nota1} error={e.nota1} />
                      </td>
                      <td className="py-2">
                        <CellRead value={row.nota2} error={e.nota2} />
                      </td>
                      <td className="py-2">
                        <CellRead value={row.nota3} error={e.nota3} />
                      </td>

                      <td className="py-2 font-semibold">{prom}</td>

                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirModalNotas(a)}
                            className="bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-black text-sm"
                          >
                            Registrar notas
                          </button>

                          <button
                            onClick={() => abrirBoleta(a)}
                            className="border px-3 py-1.5 rounded hover:bg-gray-50 text-sm"
                          >
                            Boleta
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <p className="text-xs text-gray-500 mt-2">
              Regla: todas las notas deben estar completas (0-20) antes de guardar.
            </p>
          </div>
        )}
      </div>

      {/* ===== MODAL NOTAS ===== */}
      {modalOpen && modalAlumno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={cerrarModalNotas} />

          <div className="relative bg-white w-[95%] max-w-lg rounded shadow-lg p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Registrar notas</h3>
                <p className="text-sm text-gray-600">{modalAlumno.nombre}</p>
              </div>

              <button
                onClick={cerrarModalNotas}
                className="border rounded px-2 py-1 hover:bg-gray-50"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FieldNota
                label="Nota 1"
                value={modalNotas.nota1}
                touched={modalTouched.nota1}
                validation={modalErrors.nota1}
                onChange={(v) => setModalNotas((p) => ({ ...p, nota1: v }))}
                onBlur={() => setModalTouched((p) => ({ ...p, nota1: true }))}
              />
              <FieldNota
                label="Nota 2"
                value={modalNotas.nota2}
                touched={modalTouched.nota2}
                validation={modalErrors.nota2}
                onChange={(v) => setModalNotas((p) => ({ ...p, nota2: v }))}
                onBlur={() => setModalTouched((p) => ({ ...p, nota2: true }))}
              />
              <FieldNota
                label="Nota 3"
                value={modalNotas.nota3}
                touched={modalTouched.nota3}
                validation={modalErrors.nota3}
                onChange={(v) => setModalNotas((p) => ({ ...p, nota3: v }))}
                onBlur={() => setModalTouched((p) => ({ ...p, nota3: true }))}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm">
                Promedio: <span className="font-bold">{modalProm}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={cerrarModalNotas} className="border px-3 py-2 rounded hover:bg-gray-50">
                  Cancelar
                </button>
                <button
                  onClick={guardarModalNotas}
                  disabled={modalHasErrors || saving}
                  className={`px-4 py-2 rounded text-white ${
                    modalHasErrors || saving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>

            {modalHasErrors && (
              <p className="text-xs text-red-600 mt-3">
                Completa correctamente las 3 notas (0-20) para guardar.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===== MODAL BOLETA ===== */}
      {boletaOpen && boletaAlumno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={cerrarBoleta} />

          <div className="relative bg-white w-[95%] max-w-xl rounded shadow-lg p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Boleta de notas</h3>
                <p className="text-sm text-gray-600">
                  {boletaAlumno.nombre} • {hoyTexto()}
                </p>
              </div>

              <button onClick={cerrarBoleta} className="border rounded px-2 py-1 hover:bg-gray-50" aria-label="Cerrar">
                ✕
              </button>
            </div>

            <div className="mt-4 border rounded p-4 space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500">Curso</div>
                <div className="font-semibold">{cursoSeleccionado ? cursoSeleccionado.nombre : "—"}</div>
                {cursoSeleccionado && (
                  <div className="text-sm text-gray-600">
                    Grupo {cursoSeleccionado.grupo} • {cursoSeleccionado.horario}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <BoletaBox label="Nota 1" value={boletaNotas.nota1} />
                <BoletaBox label="Nota 2" value={boletaNotas.nota2} />
                <BoletaBox label="Nota 3" value={boletaNotas.nota3} />
                <BoletaBox label="Promedio" value={boletaNotas.promedio} strong />
              </div>

              <div className="text-xs text-gray-500">
                * PDF real se hará luego en backend. Por ahora puedes usar “Imprimir”.
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => window.print()} className="border px-3 py-2 rounded hover:bg-gray-50">
                Imprimir
              </button>
              <button onClick={cerrarBoleta} className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-black">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CellRead({ value, error }) {
  const show = value === "" ? "—" : value;
  return (
    <div>
      <div className={`inline-block px-2 py-1 rounded ${error ? "bg-red-50 text-red-700" : "bg-gray-50"}`}>
        {show}
      </div>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
}

function FieldNota({ label, value, onChange, onBlur, touched, validation }) {
  const invalid = touched && !validation.ok;
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        type="number"
        min="0"
        max="20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full rounded px-3 py-2 border ${invalid ? "border-red-500 bg-red-50" : "border-gray-300"}`}
        placeholder="0 - 20"
      />
      {invalid && <div className="text-xs text-red-600 mt-1">{validation.msg}</div>}
    </div>
  );
}

function BoletaBox({ label, value, strong }) {
  return (
    <div className="border rounded p-3 bg-gray-50">
      <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
      <div className={`${strong ? "text-lg font-bold" : "text-base font-semibold"} mt-1`}>{value}</div>
    </div>
  );
}