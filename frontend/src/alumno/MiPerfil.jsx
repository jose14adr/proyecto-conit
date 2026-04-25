import { useEffect, useMemo, useState } from "react";
import api from "../api";

const DEFAULT_AVATAR =
  "https://via.placeholder.com/160x160.png?text=Perfil";

const INITIAL_DATOS = {
  nombre: "",
  apellido: "",
  tipodocumento: "",
  numdocumento: "",
  nombre_editado: false,
  lugar_residencia: "",
  departamento: "",
  provincia: "", 
  distrito: "",
  direccion: "",
  estado_civil: "",
  correo: "",
  telefono: "",
  foto_url: "",
  estado: true,
};

export default function MiPerfil() {
  const [foto, setFoto] = useState("");
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [mostrarModalNombre, setMostrarModalNombre] = useState(false);
  const [alumnoId, setAlumnoId] = useState(null);

  const [datos, setDatos] = useState(INITIAL_DATOS);

  useEffect(() => {
    const id = obtenerAlumnoId();
    setAlumnoId(id);

    if (!id) {
      setCargando(false);
      return;
    }

    obtenerAlumno(id);
  }, []);

  const porcentajePerfil = useMemo(() => {
    const campos = [
      datos.nombre,
      datos.apellido,
      datos.tipodocumento,
      datos.numdocumento,
      datos.lugar_residencia,
      datos.departamento,
      datos.provincia,
      datos.distrito,
      datos.direccion,
      datos.estado_civil,
      datos.correo,
      datos.telefono,
      datos.foto_url,
    ];

    const llenos = campos.filter((valor) => {
      if (valor === null || valor === undefined) return false;
      return String(valor).trim() !== "";
    }).length;

    return Math.round((llenos / campos.length) * 100);
  }, [datos]);

  const obtenerAlumno = async (id) => {
    try {
      setCargando(true);

      const res = await api.get(`/alumno/${id}`);
      const data = res.data || {};

      const datosNormalizados = {
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        tipodocumento: data.tipodocumento || "",
        numdocumento: data.numdocumento || "",
        nombre_editado: Boolean(data.nombre_editado),
        lugar_residencia: data.lugar_residencia || "",
        departamento: data.departamento || "",
        provincia: data.provincia || "",
        distrito: data.distrito || "",
        direccion: data.direccion || "",
        estado_civil: data.estado_civil || "",
        correo: data.correo || "",
        telefono:
          data.telefono !== null &&
          data.telefono !== undefined &&
          String(data.telefono).trim() !== ""
            ? String(data.telefono)
            : "",
        foto_url: data.foto_url || "",
        estado: data.estado ?? true,
      };

      setDatos(datosNormalizados);
      setFoto(data.foto_url || "");
    } catch (error) {
      console.error("Error cargando perfil:", error);
      alert("No se pudo cargar el perfil del alumno");
    } finally {
      setCargando(false);
    }
  };

  const guardarDatos = async (forzarNombreEditado = false) => {
    if (!alumnoId) {
      alert("No se encontró el ID del alumno");
      return;
    }

    try {
      setGuardando(true);

      const payload = {
        nombre: datos.nombre?.trim() || "",
        apellido: datos.apellido?.trim() || "",
        telefono: datos.telefono ? Number(datos.telefono) : null,
        direccion: datos.direccion?.trim() || "",
        correo: datos.correo?.trim() || "",
        lugar_residencia: datos.lugar_residencia?.trim() || "",
        departamento: datos.departamento?.trim() || "",
        provincia: datos.provincia?.trim() || "",
        distrito: datos.distrito?.trim() || "",
        estado_civil: datos.estado_civil?.trim() || "",
        foto_url: datos.foto_url || "",
        nombre_editado: forzarNombreEditado
          ? true
          : datos.nombre_editado,
      };

      const res = await api.put(`/alumno/${alumnoId}`, payload);
      const actualizado = res.data || {};

      setDatos((prev) => ({
        ...prev,
        ...payload,
        nombre_editado: Boolean(actualizado.nombre_editado ?? true),
      }));

      setFoto(actualizado.foto_url || payload.foto_url || "");
      setEditando(false);

      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("Error al actualizar el perfil");
    } finally {
      setGuardando(false);
    }
  };

  const toggleEditarGuardar = async () => {
    if (cargando || guardando) return;

    if (!editando) {
      setEditando(true);
      return;
    }

    if (!datos.nombre_editado) {
      setMostrarModalNombre(true);
      return;
    }

    await guardarDatos(false);
  };

  const subirFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewLocal = URL.createObjectURL(file);
    setFoto(previewLocal);

    try {
      setSubiendoFoto(true);

      const formData = new FormData();
      formData.append("file", file);

      // ❌ ELIMINAMOS usuario_id (ya no se usa)
      // formData.append("usuario_id", ...)

      const res = await api.post("/multimedia/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const body = res.data || {};

      const nuevaUrl =
        body.url || // 👈 este es el que devuelve tu backend
        body.publicUrl ||
        body.foto_url ||
        "";

      if (!nuevaUrl) {
        alert("El servidor no devolvió una URL válida");
        return;
      }

      setFoto(nuevaUrl);

      setDatos((prev) => ({
        ...prev,
        foto_url: nuevaUrl,
      }));

      // 🔥 opcional (ya backend lo hace, pero lo dejamos seguro)
      if (alumnoId) {
        await api.put(`/alumno/${alumnoId}`, {
          foto_url: nuevaUrl,
        });
      }

      alert("Foto actualizada correctamente");
    } catch (error) {
      console.error("Error subiendo foto:", error);
      alert("No se pudo subir la foto");
      setFoto(datos.foto_url || "");
    } finally {
      setSubiendoFoto(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-xl text-gray-500">
          Cargando perfil...
        </div>
      </div>
    );
  }

  if (!alumnoId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        No se encontró el ID del alumno en localStorage. Guarda `idalumno` al
        iniciar sesión para que el perfil cargue correctamente.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
          <h1 className="text-xl font-semibold">Mi Perfil</h1>
          <p className="text-sm text-blue-100 mt-1">
            Administra tu información personal y foto de perfil
          </p>
        </div>

        <div
          className="relative h-72 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop')",
          }}
        >
          <div className="absolute inset-0 bg-slate-900/45" />

          <div className="absolute inset-x-0 top-10 flex flex-col items-center px-4">
            <div className="relative">
              <img
                src={foto || datos.foto_url || DEFAULT_AVATAR}
                alt="Foto de perfil"
                className="h-32 w-32 rounded-2xl object-cover border-4 border-white shadow-xl bg-white"
              />

              <label className="absolute -bottom-3 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow hover:bg-blue-700 transition">
                {subiendoFoto ? "Subiendo..." : "Cambiar foto"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={subirFoto}
                  className="hidden"
                  disabled={subiendoFoto}
                />
              </label>
            </div>

            <div className="mt-8 text-center text-white">
              {editando && !datos.nombre_editado ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={datos.nombre}
                    onChange={(e) =>
                      setDatos((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    className="rounded-xl border border-white/30 bg-white px-4 py-2 text-center text-slate-800 outline-none"
                    placeholder="Nombre"
                  />
                  <input
                    value={datos.apellido}
                    onChange={(e) =>
                      setDatos((prev) => ({
                        ...prev,
                        apellido: e.target.value,
                      }))
                    }
                    className="rounded-xl border border-white/30 bg-white px-4 py-2 text-center text-slate-800 outline-none"
                    placeholder="Apellido"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">
                    {datos.nombre || "Sin nombre"} {datos.apellido || ""}
                  </h2>
                  <p className="mt-2 text-sm text-blue-100">{datos.correo}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Datos personales
              </h3>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Tipo de documento"
                  value={datos.tipodocumento}
                  editando={false}
                  disabled
                />

                <Input
                  label="N° de documento"
                  value={datos.numdocumento}
                  editando={false}
                  disabled
                />

                <Input
                  label="Lugar de residencia"
                  value={datos.lugar_residencia}
                  editando={editando}
                  onChange={(e) =>
                    setDatos((prev) => ({
                      ...prev,
                      lugar_residencia: e.target.value,
                    }))
                  }
                />

                <Input
                  label="Departamento"
                  value={datos.departamento}
                  editando={editando}
                  onChange={(e) =>
                    setDatos((prev) => ({
                      ...prev,
                      departamento: e.target.value,
                    }))
                  }
                />

                <Input
                  label="Provincia"
                  value={datos.provincia}
                  editando={editando}
                  onChange={(e) =>
                    setDatos((prev) => ({
                      ...prev,
                      provincia: e.target.value,
                    }))
                  }
                />

                <Input
                  label="Distrito"
                  value={datos.distrito}
                  editando={editando}
                  onChange={(e) =>
                    setDatos((prev) => ({
                      ...prev,
                      distrito: e.target.value,
                    }))
                  }
                />

                <Input
                  label="Dirección / Referencia"
                  value={datos.direccion}
                  editando={editando}
                  onChange={(e) =>
                    setDatos((prev) => ({
                      ...prev,
                      direccion: e.target.value,
                    }))
                  }
                />

                <Input
                  label="Estado civil"
                  value={datos.estado_civil}
                  editando={editando}
                  onChange={(e) =>
                    setDatos((prev) => ({
                      ...prev,
                      estado_civil: e.target.value,
                    }))
                  }
                />

                <Input
                  label="Correo"
                  value={datos.correo}
                  editando={editando}
                  onChange={(e) =>
                    setDatos((prev) => ({
                      ...prev,
                      correo: e.target.value,
                    }))
                  }
                />

                <Input
                  label="Teléfono"
                  value={datos.telefono}
                  editando={editando}
                  onChange={(e) => {
                    const soloNumeros = e.target.value.replace(/\D/g, "");
                    setDatos((prev) => ({
                      ...prev,
                      telefono: soloNumeros,
                    }));
                  }}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={toggleEditarGuardar}
                  disabled={cargando || guardando || subiendoFoto}
                  className={`rounded-xl px-5 py-2.5 text-sm font-medium text-white transition ${
                    cargando || guardando || subiendoFoto
                      ? "cursor-not-allowed bg-slate-400"
                      : editando
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {guardando
                    ? "Guardando..."
                    : editando
                    ? "Guardar cambios"
                    : "Editar perfil"}
                </button>

                {editando && (
                  <button
                    onClick={() => {
                      setEditando(false);
                      if (alumnoId) obtenerAlumno(alumnoId);
                    }}
                    disabled={guardando}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                PERFIL COMPLETADO
              </p>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-600">Progreso</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {porcentajePerfil}%
                  </span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${porcentajePerfil}%` }}
                  />
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Completa tus datos y mantén tu información actualizada.
              </p>

              {!editando && (
                <button
                  onClick={() => setEditando(true)}
                  className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
                >
                  Actualizar perfil
                </button>
              )}
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
              <p className="mb-4 text-sm font-semibold text-slate-700">
                Información del alumno
              </p>

              <div className="space-y-3">
                <Info
                  label="Documento"
                  value={`${datos.tipodocumento || "-"} ${
                    datos.numdocumento || ""
                  }`.trim()}
                />
                <Info
                  label="Correo"
                  value={datos.correo || "No registrado"}
                />
                <Info
                  label="Teléfono"
                  value={datos.telefono || "No registrado"}
                />
                <Info
                  label="Estado"
                  value={datos.estado ? "Activo" : "Inactivo"}
                />
              </div>
            </div>

            {!datos.nombre_editado && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Tu nombre y apellido solo pueden modificarse una vez.
              </div>
            )}
          </div>
        </div>
      </div>

      {mostrarModalNombre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-800">
              Confirmar cambio de nombre
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              Solo podrás modificar tu nombre y apellido una vez. ¿Deseas
              continuar?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setMostrarModalNombre(false)}
                className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
              >
                Cancelar
              </button>

              <button
                onClick={async () => {
                  setMostrarModalNombre(false);
                  await guardarDatos(true);
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  editando,
  onChange,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
      </label>
      <input
        type="text"
        value={value ?? ""}
        disabled={disabled || !editando}
        onChange={onChange}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${
          disabled || !editando
            ? "border-slate-200 bg-slate-100 text-slate-500"
            : "border-blue-300 bg-white focus:border-blue-500"
        }`}
      />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-800">
        {value}
      </span>
    </div>
  );
}

function obtenerAlumnoId() {
  const idAlumnoGuardado = localStorage.getItem("idalumno");
  if (idAlumnoGuardado && !Number.isNaN(Number(idAlumnoGuardado))) {
    return Number(idAlumnoGuardado);
  }

  try {
    const usuarioRaw = localStorage.getItem("usuario");
    if (!usuarioRaw) return null;

    const usuario = JSON.parse(usuarioRaw);

    if (usuario?.idalumno && !Number.isNaN(Number(usuario.idalumno))) {
      return Number(usuario.idalumno);
    }

    if (usuario?.alumnoId && !Number.isNaN(Number(usuario.alumnoId))) {
      return Number(usuario.alumnoId);
    }

    if (usuario?.id_alumno && !Number.isNaN(Number(usuario.id_alumno))) {
      return Number(usuario.id_alumno);
    }
  } catch (error) {
    console.error("Error leyendo localStorage:", error);
  }

  return null;
}