import { useEffect, useMemo, useRef, useState } from "react";

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

function PerfilDocente() {
  // ===== Datos base (mock por ahora) =====
  const [estado, setEstado] = useState("Activo");

  const [nombre, setNombre] = useState("José Díaz Ramírez");
  const [correo, setCorreo] = useState("docente@email.com");
  const [telefono, setTelefono] = useState("987654321");

  const [titulo, setTitulo] = useState("Docente");
  const [especialidad, setEspecialidad] = useState("Desarrollo Web");
  const [experiencia, setExperiencia] = useState("3 años");
  const [bio, setBio] = useState("");

  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirm, setPassConfirm] = useState("");

  // ===== Nombre solo 1 vez (frontend) =====
  const NAME_LOCK_KEY = "docente_name_locked_v1";

  // 1. Le pasamos una función a useState para que lea el localStorage desde el principio
  const [nombreBloqueado, setNombreBloqueado] = useState(() => {
    return localStorage.getItem(NAME_LOCK_KEY) === "true";
  });

  // 2. ¡ELIMINA por completo el useEffect que estaba aquí!
  // useEffect(() => { ... }) ya no es necesario.

  const confirmarNombre = () => {
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
  };

  // ===== Stats / cursos / horario =====
  const [cursos, setCursos] = useState([]);
  const [horario, setHorario] = useState([]);

  useEffect(() => {
    //getCursosDocente().then(setCursos);
    //getHorarioDocente().then(setHorario);
  }, []);

  const cursosActivos = cursos.length;

  // mock alumnos total (luego viene del backend)
  const alumnosTotal = 85;

  // mock promedio (luego viene del backend)
  const promedioGeneral = 14.8;

  // ===== Próxima clase (para PERFIL) =====
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
          parseRangeToMinutes(b.hora).startMinutes,
      );

    const futuras = clasesHoy.filter(
      (c) => parseRangeToMinutes(c.hora).endMinutes > now,
    );

    return futuras.length ? futuras[0] : null;
  }, [horario]);

  const guardarCambios = () => {
    // Aquí después irá API (backend).
    // Por ahora solo mostramos un feedback.
    if (passNueva || passConfirm || passActual) {
      if (!passActual) return alert("Ingresa tu contraseña actual.");
      if (passNueva.length < 6)
        return alert("La nueva contraseña debe tener al menos 6 caracteres.");
      if (passNueva !== passConfirm)
        return alert("La confirmación no coincide.");
    }

    alert("Cambios guardados (mock). Luego se conectará al backend.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded shadow flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mi Perfil</h2>
          <p className="text-sm text-gray-500">
            Información personal, profesional y configuración.
          </p>
        </div>

        <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded border border-green-200">
          {estado}
        </span>
      </div>

      {/* Stats (solo 3) */}
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

          {/* Estado */}
          <div>
            <label className="block font-semibold mb-2">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option>Activo</option>
              <option>Inactivo</option>
            </select>

            {/* ===== Próxima clase debajo de Estado ===== */}
            <div className="mt-6 border-t pt-4">
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

                  {proximaClase.modalidad === "PRESENCIAL" && (
                    <div className="text-sm text-gray-600">
                      Salón:{" "}
                      <span className="font-semibold">
                        {proximaClase.salon || "No asignado"}
                      </span>
                    </div>
                  )}

                  {proximaClase.modalidad === "VIRTUAL" && (
                    <button
                      type="button"
                      onClick={() =>
                        proximaClase.link &&
                        window.open(proximaClase.link, "_blank")
                      }
                      disabled={!proximaClase.link}
                      className={`text-sm px-3 py-1.5 rounded text-white ${
                        proximaClase.link
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Ir a clase
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No hay clases programadas.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha (2 columnas) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos personales */}
          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-xl font-bold mb-4">Datos personales</h3>

            <label className="block font-semibold mb-2">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
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
                  onChange={(e) => setTelefono(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </div>
          </div>

          {/* Información profesional */}
          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-xl font-bold mb-4">Información profesional</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-2">Título</label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Especialidad</label>
                <input
                  value={especialidad}
                  onChange={(e) => setEspecialidad(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Experiencia</label>
                <input
                  value={experiencia}
                  onChange={(e) => setExperiencia(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block font-semibold mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="border rounded px-3 py-2 w-full"
                placeholder="Escribe una breve descripción sobre ti..."
              />
            </div>
          </div>

          {/* Cambio de contraseña */}
          <div className="bg-white p-5 rounded shadow">
            <h3 className="text-xl font-bold mb-4">Cambio de contraseña</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-2">Actual</label>
                <input
                  type="password"
                  value={passActual}
                  onChange={(e) => setPassActual(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Nueva</label>
                <input
                  type="password"
                  value={passNueva}
                  onChange={(e) => setPassNueva(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Confirmar</label>
                <input
                  type="password"
                  value={passConfirm}
                  onChange={(e) => setPassConfirm(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </div>
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
