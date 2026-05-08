import { useEffect, useMemo, useState } from "react";
import {
  getCursosDocente,
  getRegistroNotasByGrupo,
  guardarNotas,
  actualizarEvaluacionesGrupo,
  crearEvaluacionGrupo,
  eliminarEvaluacionGrupo,
  getTareasCalificablesByGrupo
} from "../services/docenteService";
import { verificarEmisionCertificado } from "../services/certificado-verificacion.service";
import { emitirCertificadoDesdePlantilla } from "../services/certificado-final.service";

function validarNota(valor) {
  if (valor === "" || valor === null || valor === undefined) {
    return { ok: true, empty: true, msg: "" };
  }

  const n = Number(valor);

  if (Number.isNaN(n)) {
    return { ok: false, empty: false, msg: "Solo números" };
  }

  if (n < 0 || n > 20) {
    return { ok: false, empty: false, msg: "Debe estar entre 0 y 20" };
  }

  return { ok: true, empty: false, msg: "" };
}

export default function RegistroNotas() {
  const [cursos, setCursos] = useState([]);
  const [grupoId, setGrupoId] = useState(null);

  const [evaluaciones, setEvaluaciones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAlumno, setModalAlumno] = useState(null);
  const [modalNotas, setModalNotas] = useState({});
  const [modalTouched, setModalTouched] = useState({});

  const [configOpen, setConfigOpen] = useState(false);
  const [configDraft, setConfigDraft] = useState([]);
  const [configSaving, setConfigSaving] = useState(false);

  const [tareasCalificables, setTareasCalificables] = useState([]);

  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  

  useEffect(() => {
    const cargarCursos = async () => {
      const data = await getCursosDocente();
      setCursos(data || []);
    };

    cargarCursos();
  }, []);

  useEffect(() => {
    const cargarRegistro = async () => {
      if (!grupoId) {
        setEvaluaciones([]);
        setAlumnos([]);
        return;
      }

      try {
        setLoading(true);
        const data = await getRegistroNotasByGrupo(grupoId);
        setEvaluaciones(data?.evaluaciones || []);
        setAlumnos(data?.alumnos || []);
      } catch (error) {
        console.error("Error cargando registro de notas:", error);
        setEvaluaciones([]);
        setAlumnos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarRegistro();
  }, [grupoId]);

  useEffect(() => {
  const cargarTareasCalificables = async () => {
    if (!grupoId) {
      setTareasCalificables([]);
      return;
    }

    try {
      const data = await getTareasCalificablesByGrupo(grupoId);
      setTareasCalificables(data || []);
    } catch (error) {
      console.error("Error cargando tareas calificables:", error);
      setTareasCalificables([]);
    }
  };

  cargarTareasCalificables();
}, [grupoId]);

  const cursosUnicos = useMemo(() => {
    const vistos = new Set();

    return (cursos || []).filter((c, index) => {
      const key = `${c.idgrupo ?? "g"}-${c.idcurso ?? c.id ?? index}`;
      if (vistos.has(key)) return false;
      vistos.add(key);
      return true;
    });
  }, [cursos]);

  const grupoSeleccionado = useMemo(() => {
    return (
      cursosUnicos.find((c) => Number(c.idgrupo) === Number(grupoId)) || null
    );
  }, [cursosUnicos, grupoId]);

  const sumaPorcentajes = useMemo(() => {
    return (evaluaciones || []).reduce(
      (acc, ev) => acc + Number(ev.porcentaje || 0),
      0
    );
  }, [evaluaciones]);

  
  const configuracionCompleta = useMemo(() => {
    return (
      evaluaciones.length > 0 &&
      Number(sumaPorcentajes.toFixed(2)) === 100
    );
  }, [evaluaciones, sumaPorcentajes]);


  const alumnosOrdenados = useMemo(() => {
    return [...alumnos].sort((a, b) => {
      const apA = `${a.apellido || ""} ${a.nombre || ""}`.trim().toLowerCase();
      const apB = `${b.apellido || ""} ${b.nombre || ""}`.trim().toLowerCase();
      return apA.localeCompare(apB, "es");
    });
  }, [alumnos]);

  const alumnosFiltrados = useMemo(() => {
    return alumnosOrdenados.filter((a) => {
      const texto = `${a.nombre || ""} ${a.apellido || ""} ${a.numdocumento || ""}`
        .toLowerCase()
        .trim();

      const coincideBusqueda = texto.includes(busquedaAlumno.toLowerCase().trim());

      let coincideEstado = true;

      if (filtroEstado === "completos") {
        coincideEstado = a.faltantes === 0;
      } else if (filtroEstado === "pendientes") {
        coincideEstado = a.faltantes > 0;
      } else if (filtroEstado === "aprobados") {
        coincideEstado = a.faltantes === 0 && Number(a.promedio) >= 12;
      } else if (filtroEstado === "recuperacion") {
        coincideEstado =
          a.faltantes === 0 &&
          Number(a.promedio) >= 9 &&
          Number(a.promedio) < 12;
      } else if (filtroEstado === "desaprobados") {
        coincideEstado = a.faltantes === 0 && Number(a.promedio) < 9;

      }

      return coincideBusqueda && coincideEstado;
    });
  }, [alumnosOrdenados, busquedaAlumno, filtroEstado]);

  const resumen = useMemo(() => {
    const total = alumnosOrdenados.length;
    const completos = alumnosOrdenados.filter((a) => a.faltantes === 0).length;
    const incompletos = total - completos;
    const aprobados = alumnosOrdenados.filter(
      (a) => a.faltantes === 0 && Number(a.promedio) >= 11
    ).length;

    return { total, completos, incompletos, aprobados };
  }, [alumnosOrdenados]);

  const abrirModal = (alumno) => {
    const base = {};
    const touched = {};

    evaluaciones.forEach((ev) => {
      base[ev.id] =
        alumno?.notas?.[ev.id] !== undefined && alumno?.notas?.[ev.id] !== null
          ? String(alumno.notas[ev.id])
          : "";
      touched[ev.id] = false;
    });

    setModalAlumno(alumno);
    setModalNotas(base);
    setModalTouched(touched);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setModalAlumno(null);
    setModalNotas({});
    setModalTouched({});
  };

  const modalErrores = useMemo(() => {
    const errores = {};

    evaluaciones.forEach((ev) => {
      errores[ev.id] = validarNota(modalNotas[ev.id]);
    });

    return errores;
  }, [evaluaciones, modalNotas]);

  const modalTieneErrores = useMemo(() => {
    return Object.values(modalErrores).some((v) => !v.ok);
  }, [modalErrores]);

  const modalFaltantes = useMemo(() => {
    return evaluaciones.filter((ev) => {
      const valor = modalNotas[ev.id];
      return valor === "" || valor === null || valor === undefined;
    }).length;
  }, [evaluaciones, modalNotas]);

  const modalPromedio = useMemo(() => {
    if (!evaluaciones.length) return "—";
    if (modalFaltantes > 0) return "—";

    let suma = 0;

    for (const ev of evaluaciones) {
      const valor = Number(modalNotas[ev.id]);
      if (Number.isNaN(valor)) return "—";
      suma += valor * (Number(ev.porcentaje || 0) / 100);
    }

    return suma.toFixed(2);
  }, [evaluaciones, modalNotas, modalFaltantes]);

  const refrescarDatos = async () => {
    if (!grupoId) return;

    const data = await getRegistroNotasByGrupo(grupoId);
    setEvaluaciones(data?.evaluaciones || []);
    setAlumnos(data?.alumnos || []);
  };

  const abrirConfigEvaluaciones = () => {
    if (!grupoId) {
      alert("Primero selecciona un grupo.");
      return;
    }

    if (configuracionCompleta) {
      const confirmado = window.confirm(
        "Ya existen evaluaciones configuradas y asignadas. ¿Seguro que deseas modificar lo ya configurado?"
      );

      if (!confirmado) return;
    }

    const base = (evaluaciones || []).map((ev, index) => ({
      id: ev.id,
      idgrupo: ev.idgrupo,
      nombre: ev.nombre || "",
      porcentaje: String(ev.porcentaje ?? 0),
      tipo: ev.tipo || "manual",
      idtarea: ev.idtarea ?? null,
      idexamen: ev.idexamen ?? null,
      orden: ev.orden ?? index + 1,
      activa: ev.activa ?? true,
      isNew: false,
    }));

    setConfigDraft(base);
    setConfigOpen(true);
  };

const cerrarConfigEvaluaciones = () => {
  setConfigOpen(false);
  setConfigDraft([]);
};

const cambiarEvaluacionDraft = (index, field, value) => {
  setConfigDraft((prev) =>
    prev.map((item, i) => {
      if (i !== index) return item;

      const next = { ...item, [field]: value };

      if (field === "tipo") {
        next.idtarea = null;
        next.idexamen = null;
      }

      return next;
    })
  );
};


const agregarEvaluacionDraft = () => {
  setConfigDraft((prev) => [
    ...prev,
    {
      id: `new-${Date.now()}`,
      idgrupo: grupoId,
      nombre: "",
      porcentaje: "",
      tipo: "manual",
      idtarea: null,
      idexamen: null,
      orden: prev.length + 1,
      activa: true,
      isNew: true,
    }
  ]);
};

const eliminarEvaluacionDraft = (index) => {
  setConfigDraft((prev) => prev.filter((_, i) => i !== index));
};

const totalConfigDraft = useMemo(() => {
  return (configDraft || []).reduce(
    (acc, ev) => acc + Number(ev.porcentaje || 0),
    0
  );
}, [configDraft]);

const guardarConfigEvaluaciones = async () => {
  try {
    if (!grupoId) return;

    const limpias = configDraft.map((ev, index) => ({
      ...ev,
      nombre: String(ev.nombre || "").trim(),
      porcentaje: Number(ev.porcentaje || 0),
      orden: index + 1,
    }));

    if (limpias.length === 0) {
      alert("Debe existir al menos una evaluación.");
      return;
    }

    if (limpias.some((ev) => !ev.nombre)) {
      alert("Todas las evaluaciones deben tener nombre.");
      return;
    }

    if (
      limpias.some(
        (ev) =>
          Number.isNaN(ev.porcentaje) ||
          ev.porcentaje < 0 ||
          ev.porcentaje > 100
      )
    ) {
      alert("Cada porcentaje debe estar entre 0 y 100.");
      return;
    }

    const suma = limpias.reduce((acc, ev) => acc + Number(ev.porcentaje || 0), 0);
    if (Number(suma.toFixed(2)) !== 100) {
      alert("La suma de porcentajes debe ser 100%.");
      return;
    }

    setConfigSaving(true);

    const draftIds = new Set(
      limpias
        .filter((ev) => !ev.isNew)
        .map((ev) => Number(ev.id))
    );

    // antes de eliminar evaluaciones, conviene validar si tienen notas registradas
    const paraEliminar = (evaluaciones || []).filter(
      (ev) => !draftIds.has(Number(ev.id))
    );

    if (paraEliminar.length > 0) {
      const confirmado = window.confirm(
        "Vas a eliminar evaluaciones existentes. Si esas evaluaciones ya tienen notas registradas, podrían quedar desvinculadas. ¿Deseas continuar?"
      );

      if (!confirmado) {
        setConfigSaving(false);
        return;
      }
    }

    for (const ev of paraEliminar) {
      await eliminarEvaluacionGrupo(ev.id);
    }

    const existentes = limpias.filter((ev) => !ev.isNew);
    const nuevas = limpias.filter((ev) => ev.isNew);

    if (existentes.length > 0) {
      await actualizarEvaluacionesGrupo(
        existentes.map((ev, index) => ({
          id: Number(ev.id),
          idgrupo: Number(ev.idgrupo || grupoId),
          nombre: ev.nombre,
          porcentaje: Number(ev.porcentaje),
          orden: index + 1,
          tipo: ev.tipo || "manual",
          idtarea:
            ev.tipo === "tarea" && ev.idtarea ? Number(ev.idtarea) : null,
          idexamen:
            ev.tipo === "examen" && ev.idexamen ? Number(ev.idexamen) : null,
          activa: ev.activa ?? true,
        }))
      );
    }

    for (let i = 0; i < nuevas.length; i++) {
      const ev = nuevas[i];
      await crearEvaluacionGrupo({
        idgrupo: Number(grupoId),
        nombre: ev.nombre,
        porcentaje: Number(ev.porcentaje),
        tipo: ev.tipo || "manual",
        idtarea:
          ev.tipo === "tarea" && ev.idtarea ? Number(ev.idtarea) : null,
        idexamen:
          ev.tipo === "examen" && ev.idexamen ? Number(ev.idexamen) : null,
        orden: existentes.length + i + 1,
      });
    }

    await refrescarDatos();
    cerrarConfigEvaluaciones();
    alert("Configuración de evaluaciones guardada correctamente ✅");
  } catch (error) {
    console.error("Error guardando configuración:", error);
    alert(error?.message || "Ocurrió un error al guardar la configuración.");
  } finally {
    setConfigSaving(false);
  }
};


  const procesarCertificadoAutomatico = async (alumno) => {
    try {
      if (!alumno) return;

      const verificacion = await verificarEmisionCertificado({
        idalumno: Number(alumno.idalumno || alumno.id),
        idgrupo: Number(grupoId),
      });

      if (!verificacion?.emitirAhora) {
        return;
      }

      await emitirCertificadoDesdePlantilla({
        idalumno: Number(verificacion.alumno.id),
        idcurso: Number(verificacion.curso.id),
        nombreAlumno: verificacion.alumno.nombreCompleto,
        emailAlumno: verificacion.alumno.correo || "",
        dniAlumno: verificacion.alumno.dni || "",
        curso: verificacion.curso.nombre,
        descripcion:
          verificacion.curso.descripcion ||
          "Por haber aprobado satisfactoriamente el curso",
        horas:
          verificacion.curso.horas !== null &&
          verificacion.curso.horas !== undefined
            ? Number(verificacion.curso.horas)
            : undefined,
        creditos:
          verificacion.curso.creditos !== null &&
          verificacion.curso.creditos !== undefined
            ? Number(verificacion.curso.creditos)
            : undefined,
        fechaEmision: new Date().toISOString().slice(0, 10),
      });

      alert(`Certificado emitido automáticamente para ${verificacion.alumno.nombreCompleto} ✅`);
    } catch (error) {
      console.error("Error verificando/emitiendo certificado:", error);
    }
  };  

  const guardarModal = async () => {
    try {
      if (!modalAlumno) return;

      const suma = evaluaciones.reduce(
        (acc, ev) => acc + Number(ev.porcentaje || 0),
        0
      );

      if (Number(suma.toFixed(2)) !== 100) {
        alert("Los porcentajes de las evaluaciones deben sumar 100%.");
        return;
      }

      const touchedAll = {};
      evaluaciones.forEach((ev) => {
        touchedAll[ev.id] = true;
      });
      setModalTouched(touchedAll);

      if (modalTieneErrores) {
        alert("Corrige las notas inválidas antes de guardar.");
        return;
      }

      setSaving(true);
      await guardarNotas(modalAlumno.idmatricula, modalNotas);
      await refrescarDatos();
      await procesarCertificadoAutomatico(modalAlumno);
      cerrarModal();
      alert("Cambios guardados correctamente ✅");
    } catch (error) {
      console.error("Error guardando notas:", error);
      alert("Ocurrió un error al guardar las notas.");
    } finally {
      setSaving(false);
    }
  };

  
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-6 text-white">
          <h1 className="text-3xl font-bold">Registro de Notas</h1>
          <p className="mt-2 text-sm text-slate-200">
            Administra evaluaciones, revisa faltantes y registra notas por grupo.
          </p>
        </div>

        <div className="p-6">
          <div className="max-w-xl">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Selecciona un grupo
            </label>

            <select
              value={grupoId ?? ""}
              onChange={(e) =>
                setGrupoId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">-- Selecciona un grupo --</option>

              {cursosUnicos.map((c, index) => (
                <option
                  key={`${c.idgrupo ?? "g"}-${c.idcurso ?? c.id ?? index}-${index}`}
                  value={c.idgrupo ?? ""}
                >
                  {c.nombre} - Grupo {c.grupo}
                </option>
              ))}
            </select>

            {grupoSeleccionado && (
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">{grupoSeleccionado.nombre}</span>
                  {" · "}
                  Grupo {grupoSeleccionado.grupo}
                  {grupoSeleccionado.horario ? ` · ${grupoSeleccionado.horario}` : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {!!grupoId && (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <ResumenCard
            titulo="Total alumnos"
            valor={resumen.total}
            color="slate"
          />
          <ResumenCard
            titulo="Registros completos"
            valor={resumen.completos}
            color="emerald"
          />
          <ResumenCard
            titulo="Pendientes"
            valor={resumen.incompletos}
            color="amber"
          />
          <ResumenCard
            titulo="Aprobados"
            valor={resumen.aprobados}
            color="blue"
          />
        </section>
      )}

      {!!grupoId && (
        <section
          className={`rounded-2xl shadow-md border p-6 transition relative ${
            configuracionCompleta
              ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200"
              : evaluaciones.length === 0
              ? "bg-amber-50 border-amber-400 ring-2 ring-amber-200"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Configuración de evaluaciones
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                La suma actual de porcentajes debe ser 100%.
              </p>

              {!configuracionCompleta ? (
                <div className="mt-3 rounded-xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-800">
                  Debes configurar primero las evaluaciones. Cuando el total llegue a 100%, quedará marcado como configurado.
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm text-emerald-800">
                  La configuración ya fue completada. Si deseas editarla, el sistema te pedirá confirmación antes de modificarla.
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={abrirConfigEvaluaciones}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition shadow-sm ${
                  configuracionCompleta
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {configuracionCompleta ? "Editar configuración" : "Configurar evaluaciones"}
              </button>
              <div
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                  Number(sumaPorcentajes.toFixed(2)) === 100
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                Total: {sumaPorcentajes.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {evaluaciones.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-5 text-sm text-amber-800">
                No hay evaluaciones configuradas para este grupo. Debes completar esta sección antes de continuar con el proceso de notas.
              </div>
            ) : (
              evaluaciones.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 min-w-[180px]"
                >
                  <div className="text-sm font-semibold text-slate-800">
                    {ev.nombre}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {ev.porcentaje}% · {ev.tipo === "tarea" ? "Tarea" : "Manual"}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <section className="rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Alumnos del grupo</h2>
          <p className="text-sm text-slate-500 mt-1">
            {grupoId
              ? "Revisa el avance por alumno y registra notas cuando sea necesario."
              : "Selecciona un grupo para ver a los alumnos."}
          </p>

          {!!grupoId && (
            <>
              <div className="mt-3">
                {Number(sumaPorcentajes.toFixed(2)) !== 100 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Atención: los porcentajes todavía no suman 100%. El cálculo final puede no ser válido.
                  </div>
                ) : resumen.incompletos > 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Hay alumnos con notas incompletas. Completa las evaluaciones faltantes para ver el promedio final.
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Todas las evaluaciones están configuradas y los registros están completos.
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={busquedaAlumno}
                    onChange={(e) => setBusquedaAlumno(e.target.value)}
                    placeholder="Buscar por nombre, apellido o DNI..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div className="md:w-64">
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 shadow-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="todos">Todos</option>
                    <option value="completos">Con notas completas</option>
                    <option value="pendientes">Con notas pendientes</option>
                    <option value="aprobados">Aprobados</option>
                    <option value="recuperacion">Recuperación</option>
                    <option value="desaprobados">Desaprobados</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>



        {!grupoId ? (
          <div className="p-6 text-slate-500">
            Selecciona un grupo para visualizar el registro de notas.
          </div>
        ) : loading ? (
          <div className="p-6 text-slate-500">Cargando alumnos...</div>
        ) : alumnosFiltrados.length === 0 ? (
          <div className="p-6 text-slate-500">
            No se encontraron alumnos con ese filtro.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">
                    Alumno
                  </th>

                  {evaluaciones.map((ev) => (
                    <th
                      key={ev.id}
                      className="px-4 py-4 text-center text-sm font-bold text-slate-700"
                    >
                      <div>{ev.nombre}</div>
                      <div className="text-xs font-medium text-slate-500 mt-1">
                        {ev.porcentaje}%
                      </div>
                    </th>
                  ))}

                  <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                    Promedio
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {alumnosFiltrados.map((a) => (
                  <tr
                    key={a.idmatricula}
                    className="border-b border-slate-100 hover:bg-slate-50/70 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-500 font-semibold">
                          {a.foto_url ? (
                            <img
                              src={a.foto_url}
                              alt={`${a.nombre} ${a.apellido}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>
                              {(a.nombre?.[0] || "").toUpperCase()}
                              {(a.apellido?.[0] || "").toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="font-semibold text-slate-800">
                            {a.nombre} {a.apellido}
                          </div>
                          <div className="text-xs text-slate-500">
                            DNI: {a.numdocumento || "No registrado"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {evaluaciones.map((ev) => {
                      const valor = a.notas?.[ev.id];

                      return (
                        <td key={ev.id} className="px-4 py-4 text-center">
                          <span className="inline-flex min-w-[48px] justify-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm font-medium text-slate-700">
                            {valor ?? "—"}
                          </span>
                        </td>
                      );
                    })}

                    <td className="px-4 py-4 text-center">
                      {a.faltantes > 0 ? (
                        <span className="text-slate-400 font-semibold">—</span>
                      ) : (
                        <span
                          className={`font-bold ${
                            Number(a.promedio) >= 12
                              ? "text-emerald-600"
                              : Number(a.promedio) >= 9
                              ? "text-yellow-600"
                              : "text-rose-600"
                          }`}
                        >
                          {a.promedio}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      {a.faltantes > 0 ? (
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          Incompleto ({a.faltantes})
                        </span>
                      ) : Number(a.promedio) >= 12 ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Aprobado
                        </span>
                      ) : Number(a.promedio) >= 9 ? (
                        <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                          Recuperación
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                          Desaprobado
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          if (!configuracionCompleta) {
                            alert("Primero debes completar la configuración de evaluaciones al 100%.");
                            return;
                          }
                          abrirModal(a);
                        }}
                        disabled={!configuracionCompleta}
                        className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
                          !configuracionCompleta
                            ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && modalAlumno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            onClick={cerrarModal}
          />

          <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Editar notas</h3>
                  <p className="text-sm text-slate-200 mt-1">
                    {modalAlumno.nombre} {modalAlumno.apellido}
                  </p>
                </div>

                <button
                  onClick={cerrarModal}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluaciones.map((ev) => {
                  const validation = modalErrores[ev.id];
                  const invalid = modalTouched[ev.id] && !validation?.ok;

                  return (
                    <div key={ev.id}>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {ev.nombre}
                        <span className="ml-2 text-xs text-slate-500">
                          ({ev.porcentaje}%)
                        </span>
                      </label>

                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.01"
                        value={modalNotas[ev.id] ?? ""}
                        onChange={(e) =>
                          setModalNotas((prev) => ({
                            ...prev,
                            [ev.id]: e.target.value,
                          }))
                        }
                        onBlur={() =>
                          setModalTouched((prev) => ({
                            ...prev,
                            [ev.id]: true,
                          }))
                        }
                        placeholder="0 - 20"
                        className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                          invalid
                            ? "border-rose-400 bg-rose-50 focus:ring-2 focus:ring-rose-100"
                            : "border-slate-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        }`}
                      />

                      {invalid && (
                        <p className="mt-1 text-xs text-rose-600">
                          {validation.msg}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoBox
                  label="Faltantes"
                  value={modalFaltantes}
                  tone={modalFaltantes > 0 ? "amber" : "emerald"}
                />
                <InfoBox
                  label="Promedio"
                  value={modalPromedio}
                  tone={modalPromedio !== "—" && Number(modalPromedio) >= 11 ? "emerald" : "slate"}
                />
                <InfoBox
                  label="Porcentaje total"
                  value={`${sumaPorcentajes.toFixed(2)}%`}
                  tone={Number(sumaPorcentajes.toFixed(2)) === 100 ? "blue" : "amber"}
                />
              </div>

              {modalFaltantes > 0 && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Puedes guardar aunque falten notas, pero el promedio final no se mostrará hasta completar todas las evaluaciones.
                </div>
              )}

              {Number(sumaPorcentajes.toFixed(2)) !== 100 && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  La suma de porcentajes no es 100%. Ajusta la configuración de evaluaciones antes de cerrar el proceso académico.
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  onClick={cerrarModal}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>

                <button
                  onClick={guardarModal}
                  disabled={saving}
                  className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
                    saving
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {saving ? "Guardando..." : "Guardar notas"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {configOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
      onClick={cerrarConfigEvaluaciones}
    />

    <div className="relative z-10 w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Configurar evaluaciones</h3>
            <p className="text-sm text-slate-200 mt-1">
              Agrega, edita o elimina evaluaciones del grupo seleccionado. Las evaluaciones de tipo tarea se vinculan después desde la sección de tareas del curso.
            </p>
          </div>

          <button
            onClick={cerrarConfigEvaluaciones}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10 transition"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6">
        {/* TOP ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <button
            onClick={agregarEvaluacionDraft}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Agregar evaluación
          </button>

          <div
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
              Number(totalConfigDraft.toFixed(2)) === 100
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            Total actual: {totalConfigDraft.toFixed(2)}%
          </div>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                  Nombre
                </th>

                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                  Porcentaje (%)
                </th>

                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                  Tipo
                </th>

                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">
                  Orden
                </th>

                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">
                  Acción
                </th>

              </tr>
            </thead>

            <tbody>
              {configDraft.map((ev, index) => (
                <tr key={ev.id} className="border-b border-slate-100">
                  {/* NOMBRE */}
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={ev.nombre}
                      onChange={(e) =>
                        cambiarEvaluacionDraft(index, "nombre", e.target.value)
                      }
                      placeholder="Ej. Parcial, Proyecto"
                      disabled={ev.tipo === "tarea"}
                      className={`w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${
                        ev.tipo === "tarea" ? "bg-slate-100 text-slate-500" : ""
                      }`}
                    />
                  </td>

                  {/* PORCENTAJE */}
                  <td className="px-4 py-3">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={ev.porcentaje}
                        onChange={(e) =>
                          cambiarEvaluacionDraft(index, "porcentaje", e.target.value)
                        }
                        placeholder="0 - 100"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-8 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-slate-500">
                        %
                      </span>
                    </div>
                  </td>

                  {/* TIPO */}
                  <td className="px-4 py-3">
                    <select
                      value={ev.tipo}
                      onChange={(e) =>
                        cambiarEvaluacionDraft(index, "tipo", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="manual">Manual</option>
                      <option value="tarea">Tarea</option>
                      <option value="examen">Examen</option>
                    </select>
                  </td>

                  {/* ORDEN */}
                  <td className="px-4 py-3 text-center text-sm font-semibold text-slate-600">
                    {index + 1}
                  </td>

                  {/* ELIMINAR */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        const ok = window.confirm("¿Seguro que deseas eliminar esta evaluación?");
                        if (ok) eliminarEvaluacionDraft(index);
                      }}
                      className="rounded-xl border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {configDraft.some((ev) => ev.tipo === "tarea") && tareasCalificables.length === 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          No hay tareas calificables registradas para este grupo.
        </div>
      )}

        {/* VALIDACIÓN */}
        <div className="mt-5">
          {Number(totalConfigDraft.toFixed(2)) !== 100 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              La suma debe ser 100% antes de guardar.
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Configuración válida.
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            onClick={cerrarConfigEvaluaciones}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancelar
          </button>

          <button
            onClick={guardarConfigEvaluaciones}
            disabled={configSaving}
            className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
              configSaving
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {configSaving ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

function ResumenCard({ titulo, valor, color = "slate" }) {
  const styles = {
    slate: "border-slate-200 bg-slate-50 text-slate-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles[color] || styles.slate}`}>
      <div className="text-sm font-semibold opacity-80">{titulo}</div>
      <div className="mt-2 text-3xl font-bold">{valor}</div>
    </div>
  );
}

function InfoBox({ label, value, tone = "slate" }) {
  const styles = {
    slate: "border-slate-200 bg-slate-50 text-slate-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div className={`rounded-2xl border p-4 ${styles[tone] || styles.slate}`}>
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-2 text-xl font-bold">{value}</div>
    </div>
  );
}