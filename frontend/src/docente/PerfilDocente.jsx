import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCursosDocente,
  getHorarioDocente,
  getPerfilDocente,
  updatePerfilDocente,
  getHistorialDocente,
  getGradosInstruccion,
  getDocumentosDocente,
  getCursosAdicionalesDocente,
  deleteCursoAdicionalDocente,
  createCursoAdicionalDocente,
} from "../services/docenteService";

// ===== Helpers horario =====
const parseRangeToMinutes = (range) => {
  if (!range) return { startMinutes: 0, endMinutes: 0 };

  const [ini, fin] = range.split("-").map((s) => s.trim());

  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  return { startMinutes: toMin(ini), endMinutes: toMin(fin) };
};

const minutesNow = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

const dayLabelToday = () => {
  const map = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return map[new Date().getDay()];
};

const splitNombreCompleto = (full) => {
  const clean = String(full ?? "").trim().replace(/\s+/g, " ");
  if (!clean) return { nombre: "", apellido: "" };

  const parts = clean.split(" ");
  if (parts.length === 1) return { nombre: parts[0], apellido: "" };

  const nombre = parts[0];
  const apellido = parts.slice(1).join(" ");
  return { nombre, apellido };
};

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return "";
  const hoy = new Date();
  const fn = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fn.getFullYear();
  const m = hoy.getMonth() - fn.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) edad--;
  return edad >= 0 ? edad : "";
};

function PerfilDocente() {
  // ===== Perfil base =====
  const [estado, setEstado] = useState("Activo");
  const [estadoMotivo, setEstadoMotivo] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  const [titulo, setTitulo] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [bio, setBio] = useState("");

  // ===== Nuevos campos =====
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [gradoInstruccionId, setGradoInstruccionId] = useState("");
  const [gradosInstruccion, setGradosInstruccion] = useState([]);
  const [aniosExperiencia, setAniosExperiencia] = useState("");
  const [sectorExperiencia, setSectorExperiencia] = useState("");
  const [tiempoEstudiosInicio, setTiempoEstudiosInicio] = useState("");
  const [tiempoEstudiosFin, setTiempoEstudiosFin] = useState("");
  const [institucionEgreso, setInstitucionEgreso] = useState("");
  const [contactoEmergenciaNombre, setContactoEmergenciaNombre] = useState("");
  const [contactoEmergenciaTelefono, setContactoEmergenciaTelefono] =
    useState("");
  const [perfilProfesional, setPerfilProfesional] = useState("");

  // ===== Password UI =====
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirm, setPassConfirm] = useState("");

  // ===== Nombre solo 1 vez =====
  const NAME_LOCK_KEY = "docente_nombre_completo_locked_v1";

  const [nombreBloqueado, setNombreBloqueado] = useState(() => {
    return localStorage.getItem(NAME_LOCK_KEY) === "true";
  });

  const confirmarNombre = () => {
    if (!nombreCompleto.trim()) {
      return alert("Ingresa tu nombre completo antes de confirmar.");
    }
    localStorage.setItem(NAME_LOCK_KEY, "true");
    setNombreBloqueado(true);
    alert("Nombre confirmado. Ya no podrás editarlo nuevamente.");
  };

  // ===== Foto perfil =====
  const [fotoUrl, setFotoUrl] = useState("");
  const inputFotoRef = useRef(null);

  const onElegirFoto = () => inputFotoRef.current?.click();

  const onFotoSeleccionada = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setFotoUrl(url);

    // Más adelante aquí iría la subida real a Supabase Storage
  };

  // ===== Archivos / cursos extra =====
  const [documentos, setDocumentos] = useState([]);
  const [cursosExtra, setCursosExtra] = useState([]);

  // ===== UI agregar curso/capacitación =====
  const [mostrarFormCursoExtra, setMostrarFormCursoExtra] = useState(false);
  const [nuevoCursoNombre, setNuevoCursoNombre] = useState("");
  const [nuevoCursoInstitucion, setNuevoCursoInstitucion] = useState("");
  const [nuevoCursoFechaInicio, setNuevoCursoFechaInicio] = useState("");
  const [nuevoCursoFechaFin, setNuevoCursoFechaFin] = useState("");
  const [nuevoCursoArchivo, setNuevoCursoArchivo] = useState(null);
  const [guardandoCursoExtra, setGuardandoCursoExtra] = useState(false);

  // ===== Stats / cursos / horario =====
  const [cursos, setCursos] = useState([]);
  const [horario, setHorario] = useState([]);
  const [alumnosTotal, setAlumnosTotal] = useState(0);
  const [promedioGeneral, setPromedioGeneral] = useState(0);
  const [historial, setHistorial] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const perfil = await getPerfilDocente();
        if (!perfil) {
          alert("No hay sesión. Inicia sesión nuevamente.");
          return;
        }

        setEstado(perfil.estado ?? "Activo");
        setEstadoMotivo((perfil.estado_motivo ?? "").trim());

        const nom = perfil.nombre ?? "";
        const ape = perfil.apellido ?? "";
        setNombreCompleto(`${nom} ${ape}`.trim());

        setCorreo(perfil.correo ?? "");
        setTelefono(
          perfil.telefono !== null && perfil.telefono !== undefined
            ? String(perfil.telefono)
            : ""
        );
        setDireccion(perfil.direccion ?? "");

        setTitulo(perfil.titulo ?? "");
        setExperiencia(perfil.experiencia ?? "");
        setBio(perfil.bio ?? "");

        setFechaNacimiento(perfil.fecha_nacimiento ?? "");
        setGradoInstruccionId(
          perfil.grado_instruccion_id !== null &&
            perfil.grado_instruccion_id !== undefined
            ? String(perfil.grado_instruccion_id)
            : ""
        );
        setAniosExperiencia(
          perfil.anios_experiencia !== null &&
            perfil.anios_experiencia !== undefined
            ? String(perfil.anios_experiencia)
            : ""
        );
        setSectorExperiencia(perfil.sector_experiencia ?? "");
        setTiempoEstudiosInicio(perfil.tiempo_estudios_inicio ?? "");
        setTiempoEstudiosFin(perfil.tiempo_estudios_fin ?? "");
        setInstitucionEgreso(perfil.institucion_egreso ?? "");
        setContactoEmergenciaNombre(perfil.contacto_emergencia_nombre ?? "");
        setContactoEmergenciaTelefono(
          perfil.contacto_emergencia_telefono ?? ""
        );
        setPerfilProfesional(perfil.perfil_profesional ?? perfil.bio ?? "");

        setFotoUrl(perfil.foto_url ?? "");

        const [c, h, grados, docs, cursosExtraData] = await Promise.all([
          getCursosDocente(),
          getHorarioDocente(),
          getGradosInstruccion(),
          getDocumentosDocente(),
          getCursosAdicionalesDocente(),
        ]);

        setCursos(c || []);
        setHorario(h || []);
        setGradosInstruccion(grados || []);
        setDocumentos(docs || []);
        setCursosExtra(cursosExtraData || []);

        setAlumnosTotal(0);
        setPromedioGeneral(0);

        const hist = await getHistorialDocente(perfil.id);
        setHistorial(
          (hist || []).map((row) => ({
            id: row.id,
            tipo: row.tipo,
            desde: row.fecha_inicio,
            hasta: row.fecha_fin,
            detalle: row.detalle || row.descripcion,
            institucion: row.institucion,
            cargo: row.cargo,
            area: row.area,
            sector: row.sector,
          }))
        );
      } catch (e) {
        console.error(e);
        alert(e?.message || "Error cargando perfil");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cursosActivos = cursos.length;

  const proximaClase = useMemo(() => {
    if (!horario?.length) return null;

    const hoy = dayLabelToday();
    const now = minutesNow();

    const clasesHoy = horario
      .filter((h) => h.dia === hoy)
      .slice()
      .sort(
        (a, b) =>
          parseRangeToMinutes(a.hora).startMinutes -
          parseRangeToMinutes(b.hora).startMinutes
      );

    const futuras = clasesHoy.filter(
      (c) => parseRangeToMinutes(c.hora).endMinutes > now
    );

    return futuras.length ? futuras[0] : null;
  }, [horario]);

  const guardarCambios = async () => {
    try {
      if (passNueva || passConfirm || passActual) {
        if (!passActual) return alert("Ingresa tu contraseña actual.");
        if (passNueva.length < 6) {
          return alert("La nueva contraseña debe tener al menos 6 caracteres.");
        }
        if (passNueva !== passConfirm) {
          return alert("La confirmación no coincide.");
        }

        alert(
          "La contraseña aún no está conectada. Por ahora solo se guarda el perfil."
        );
      }

      if (aniosExperiencia && !/^\d+$/.test(aniosExperiencia)) {
        return alert("Los años de experiencia solo deben contener números.");
      }

      if (
        contactoEmergenciaTelefono &&
        !/^\d+$/.test(contactoEmergenciaTelefono)
      ) {
        return alert(
          "El teléfono de contacto de emergencia solo debe contener números."
        );
      }

      const { nombre, apellido } = splitNombreCompleto(nombreCompleto);

      const patch = {
        estado,
        nombre,
        apellido,
        correo,
        telefono: telefono ? Number(telefono) : null,
        direccion,
        titulo: titulo ?? null,
        experiencia: experiencia ?? null,
        bio: bio ?? null,
        foto_url: fotoUrl || null,

        fecha_nacimiento: fechaNacimiento || null,
        grado_instruccion_id: gradoInstruccionId
          ? Number(gradoInstruccionId)
          : null,
        anios_experiencia: aniosExperiencia ? Number(aniosExperiencia) : null,
        sector_experiencia: sectorExperiencia || null,
        tiempo_estudios_inicio: tiempoEstudiosInicio || null,
        tiempo_estudios_fin: tiempoEstudiosFin || null,
        institucion_egreso: institucionEgreso || null,
        contacto_emergencia_nombre: contactoEmergenciaNombre || null,
        contacto_emergencia_telefono: contactoEmergenciaTelefono || null,
        perfil_profesional: perfilProfesional || null,
      };

      await updatePerfilDocente(patch);
      alert("Cambios guardados ✅");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Error guardando cambios");
    }
  };

  const eliminarCursoExtra = async (id) => {
    try {
      await deleteCursoAdicionalDocente(id);
      setCursosExtra((prev) => prev.filter((c) => c.id !== id));
      alert("Curso eliminado correctamente ✅");
    } catch (e) {
      console.error(e);
      alert(e?.message || "No se pudo eliminar el curso");
    }
  };

  const agregarCursoExtraLocal = async () => {
    try {
      if (!nuevoCursoNombre.trim()) {
        return alert("Ingresa el nombre del curso o capacitación.");
      }

      setGuardandoCursoExtra(true);

      const nuevoCurso = await createCursoAdicionalDocente({
        nombre: nuevoCursoNombre.trim(),
        institucion: nuevoCursoInstitucion.trim(),
        fecha_inicio: nuevoCursoFechaInicio || null,
        fecha_fin: nuevoCursoFechaFin || null,
        archivo: nuevoCursoArchivo || null,
      });

      setCursosExtra((prev) => [nuevoCurso, ...prev]);

      setNuevoCursoNombre("");
      setNuevoCursoInstitucion("");
      setNuevoCursoFechaInicio("");
      setNuevoCursoFechaFin("");
      setNuevoCursoArchivo(null);
      setMostrarFormCursoExtra(false);

      alert("Curso guardado en Supabase ✅");
    } catch (e) {
      console.error(e);
      alert(e?.message || "No se pudo guardar el curso");
    } finally {
      setGuardandoCursoExtra(false);
    }
  };

  const eliminarCursoLocal = (id) => {
    setCursosExtra((prev) => prev.filter((c) => c.id !== id));
  };

  const badgeClass =
    estado === "Activo"
      ? "bg-green-100 text-green-700 border border-green-200"
      : "bg-red-100 text-red-700 border border-red-200";

  if (loading) {
    return (
      <div className="bg-white p-5 rounded shadow">
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Mi Perfil</h2>
            <p className="text-sm text-gray-500">
              Información personal, profesional y configuración.
            </p>
          </div>

          <div className="text-right">
            <span
              className={`inline-block text-sm px-3 py-1 rounded ${badgeClass}`}
            >
              {estado}
            </span>

            {estadoMotivo && (
              <div className="mt-2 text-xs text-gray-600 max-w-[260px] ml-auto">
                <span className="font-semibold text-gray-700">Motivo:</span>{" "}
                <span>{estadoMotivo}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Cursos activos" value={cursosActivos} />
        <StatCard label="Alumnos" value={alumnosTotal} />
        <StatCard label="Promedio general" value={promedioGeneral} />
      </div>

      {/* Cuerpo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="bg-white p-5 rounded shadow space-y-5">
          {/* Foto */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border flex items-center justify-center overflow-hidden bg-gray-50">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt="Foto perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm text-gray-400">Sin foto</span>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={onElegirFoto}
                className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 text-sm"
              >
                Cambiar foto
              </button>
              <p className="text-xs text-gray-500 mt-1">
                JPG o PNG recomendado
              </p>

              <input
                ref={inputFotoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFotoSeleccionada}
              />
            </div>
          </div>

          {/* Edad */}
          <div className="rounded-xl border bg-gray-50 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Edad calculada
            </div>
            <div className="text-xl font-bold text-gray-800 mt-1">
              {calcularEdad(fechaNacimiento) || "--"}
            </div>
          </div>

          {/* Próxima clase */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm text-gray-500 mb-2">
              Próxima clase
            </h3>

            {proximaClase ? (
              <div className="space-y-2">
                <div className="font-semibold">{proximaClase.curso}</div>
                <div className="text-sm text-gray-600">
                  {proximaClase.dia} • {proximaClase.hora} • Grupo{" "}
                  {proximaClase.grupo}
                </div>
                <div className="text-sm">
                  Modalidad:{" "}
                  <span className="font-semibold">
                    {proximaClase.modalidad}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay clases programadas.</p>
            )}
          </div>

          {/* Documentos PDF */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm text-gray-500 mb-3">
              Documentos de experiencia laboral
            </h3>

            {[
              ...documentos,
              ...cursosExtra
                .filter((c) => c.archivo_url)
                .map((c) => ({
                  id: `curso-${c.id}`,
                  nombre: c.nombre,
                  tipo: "Curso / capacitación",
                  archivo_url: c.archivo_url,
                })),
            ].length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay documentos registrados.
              </p>
            ) : (
              <div className="space-y-2">
                {[
                  ...documentos,
                  ...cursosExtra
                    .filter((c) => c.archivo_url)
                    .map((c) => ({
                      id: `curso-${c.id}`,
                      nombre: c.nombre,
                      tipo: "Curso / capacitación",
                      archivo_url: c.archivo_url,
                    })),
                ].map((doc) => (
                  <div
                    key={doc.id}
                    className="border rounded-lg px-3 py-2 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-medium text-sm text-gray-800">
                        {doc.nombre}
                      </div>
                      <div className="text-xs text-gray-500">
                        {doc.tipo || "Documento PDF"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={doc.archivo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50"
                      >
                        Ver PDF
                      </a>

                      <a
                        href={doc.archivo_url}
                        download
                        className="text-sm px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Descargar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historial */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm text-gray-500 mb-2">
              Historial
            </h3>

            {historial.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay historial registrado.
              </p>
            ) : (
              <div className="space-y-3">
                {historial.map((h) => (
                  <div key={h.id} className="border rounded-lg p-3">
                    <div className="font-semibold text-sm text-gray-800">
                      {h.tipo || "Registro"}
                    </div>

                    {(h.institucion || h.cargo) && (
                      <div className="text-sm text-gray-700 mt-1">
                        {[h.cargo, h.institucion].filter(Boolean).join(" - ")}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-1">
                      {h.desde || "--"} {h.hasta ? `a ${h.hasta}` : ""}
                    </div>

                    {(h.area || h.sector) && (
                      <div className="text-xs text-gray-500 mt-1">
                        {[h.area, h.sector].filter(Boolean).join(" • ")}
                      </div>
                    )}

                    {h.detalle && (
                      <div className="text-sm text-gray-600 mt-2">
                        {h.detalle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos personales */}
          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-xl font-bold mb-4">Datos personales</h3>

            <label className="block font-semibold mb-2">Nombre completo</label>
            <input
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              disabled={nombreBloqueado}
              className={`border rounded px-3 py-2 w-full ${
                nombreBloqueado ? "bg-gray-100 text-gray-500" : ""
              }`}
            />

            {!nombreBloqueado && (
              <button
                type="button"
                onClick={confirmarNombre}
                className="mt-2 border px-3 py-2 rounded hover:bg-gray-50 text-sm"
              >
                Confirmar nombre (solo una vez)
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div>
                <label className="block font-semibold mb-2">Correo</label>
                <input
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Teléfono</label>
                <input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Edad</label>
                <input
                  value={calcularEdad(fechaNacimiento)}
                  disabled
                  className="border rounded px-3 py-2 w-full bg-gray-100 text-gray-500"
                />
              </div>
            </div>

            <label className="block font-semibold mb-2 mt-4">Dirección</label>
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div>
                <label className="block font-semibold mb-2">
                  Contacto de emergencia
                </label>
                <input
                  value={contactoEmergenciaNombre}
                  onChange={(e) => setContactoEmergenciaNombre(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Nombre del contacto"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Teléfono de emergencia
                </label>
                <input
                  value={contactoEmergenciaTelefono}
                  onChange={(e) =>
                    setContactoEmergenciaTelefono(e.target.value.replace(/\D/g, ""))
                  }
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Solo números"
                />
              </div>
            </div>
          </div>

          {/* Información profesional */}
          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-xl font-bold mb-4">Información profesional</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Título</label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Grado de instrucción
                </label>
                <select
                  value={gradoInstruccionId}
                  onChange={(e) => setGradoInstruccionId(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="">Seleccione</option>
                  {gradosInstruccion.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Años de experiencia
                </label>
                <input
                  value={aniosExperiencia}
                  onChange={(e) =>
                    setAniosExperiencia(e.target.value.replace(/\D/g, ""))
                  }
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Solo números"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Sector de experiencia
                </label>
                <select
                  value={sectorExperiencia}
                  onChange={(e) => setSectorExperiencia(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="">Seleccione</option>
                  <option value="Publico">Público</option>
                  <option value="Privado">Privado</option>
                  <option value="Mixto">Público / Privado</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Inicio de estudios
                </label>
                <input
                  type="date"
                  value={tiempoEstudiosInicio}
                  onChange={(e) => setTiempoEstudiosInicio(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Fin de estudios
                </label>
                <input
                  type="date"
                  value={tiempoEstudiosFin}
                  onChange={(e) => setTiempoEstudiosFin(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block font-semibold mb-2">
                Institución de egreso
              </label>
              <input
                value={institucionEgreso}
                onChange={(e) => setInstitucionEgreso(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div className="mt-4">
              <label className="block font-semibold mb-2">
                Experiencia resumida
              </label>
              <input
                value={experiencia}
                onChange={(e) => setExperiencia(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div className="mt-4">
              <label className="block font-semibold mb-2">
                Perfil profesional
              </label>
              <textarea
                value={perfilProfesional}
                onChange={(e) => setPerfilProfesional(e.target.value)}
                rows={5}
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div className="mt-4">
              <label className="block font-semibold mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>

          {/* Cursos adicionales */}
          <div className="bg-white p-5 rounded shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold">Cursos y capacitaciones</h3>
                <p className="text-sm text-gray-500">
                  Permite eliminar si se añadió por error
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarFormCursoExtra((prev) => !prev)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                {mostrarFormCursoExtra ? "Cerrar formulario" : "+ Agregar curso"}
              </button>
            </div>

            {mostrarFormCursoExtra && (
              <div className="border rounded-xl p-4 bg-gray-50 mb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-2">
                      Nombre del curso o capacitación
                    </label>
                    <input
                      value={nuevoCursoNombre}
                      onChange={(e) => setNuevoCursoNombre(e.target.value)}
                      className="border rounded px-3 py-2 w-full bg-white"
                      placeholder="Ej. Diplomado en IA"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      Institución
                    </label>
                    <input
                      value={nuevoCursoInstitucion}
                      onChange={(e) => setNuevoCursoInstitucion(e.target.value)}
                      className="border rounded px-3 py-2 w-full bg-white"
                      placeholder="Ej. Universidad / Instituto"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      value={nuevoCursoFechaInicio}
                      onChange={(e) => setNuevoCursoFechaInicio(e.target.value)}
                      className="border rounded px-3 py-2 w-full bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">Fecha fin</label>
                    <input
                      type="date"
                      value={nuevoCursoFechaFin}
                      onChange={(e) => setNuevoCursoFechaFin(e.target.value)}
                      className="border rounded px-3 py-2 w-full bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Certificado o constancia (PDF)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setNuevoCursoArchivo(e.target.files?.[0] || null)}
                    className="border rounded px-3 py-2 w-full bg-white"
                  />
                  {nuevoCursoArchivo && (
                    <p className="text-xs text-gray-500 mt-2">
                      Archivo seleccionado: {nuevoCursoArchivo.name}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormCursoExtra(false);
                      setNuevoCursoNombre("");
                      setNuevoCursoInstitucion("");
                      setNuevoCursoFechaInicio("");
                      setNuevoCursoFechaFin("");
                      setNuevoCursoArchivo(null);
                    }}
                    className="px-4 py-2 rounded border hover:bg-white text-sm"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={agregarCursoExtraLocal}
                    disabled={guardandoCursoExtra}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm disabled:opacity-60"
                  >
                    {guardandoCursoExtra ? "Guardando..." : "Guardar curso"}
                  </button>
                </div>
              </div>
            )}

            {cursosExtra.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay cursos adicionales registrados.
              </p>
            ) : (
              <div className="space-y-3">
                {cursosExtra.map((curso) => (
                  <div
                    key={curso.id}
                    className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <div className="font-semibold text-gray-800">
                        {curso.nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {curso.institucion || "Sin institución"}
                      </div>
                      {(curso.fecha_inicio || curso.fecha_fin) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {curso.fecha_inicio || "--"}{" "}
                          {curso.fecha_fin ? `a ${curso.fecha_fin}` : ""}
                        </div>
                      )}
                      {curso.local && (
                        <div className="text-xs text-blue-600 mt-1">
                          Registro agregado localmente
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {curso.archivo_url && (
                        <a
                          href={curso.archivo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded border text-sm hover:bg-gray-50"
                        >
                          Ver PDF
                        </a>
                      )}

                      {curso.local ? (
                        <button
                          type="button"
                          onClick={() => eliminarCursoLocal(curso.id)}
                          className="px-3 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => eliminarCursoExtra(curso.id)}
                          className="px-3 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guardar */}
          <div className="flex justify-end">
            <button
              onClick={guardarCambios}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white px-4 py-3 rounded shadow-sm border">
      <div className="text-xs text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}

export default PerfilDocente;