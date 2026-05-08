import { useEffect, useMemo, useRef, useState } from "react";
import {
  getForoPublicacionesByGrupo,
  crearForoPublicacion,
  eliminarForoPublicacion,
  toggleFijarForoPublicacion,
  toggleCerrarForoPublicacion,
  getForoRespuestasByPublicacion,
  crearForoRespuesta,
  eliminarForoRespuesta,

  subirYGuardarAdjuntoForo,
  crearForoAdjuntoEnlaceVideo,
  getForoAdjuntosByPublicacion,
  getForoAdjuntosByRespuestas,
  getForoAdjuntoDownloadUrl,
  eliminarForoAdjunto,
} from "../services/docenteService";

function formatearFecha(fecha) {
  if (!fecha) return "-";

  try {
    return new Date(fecha).toLocaleString("es-PE", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return fecha;
  }
}

function esUrlValida(url) {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function nombreTipoAdjunto(tipo) {
  if (tipo === "imagen") return "Imagen";
  if (tipo === "video") return "Video";
  if (tipo === "video_vimeo") return "Video Vimeo";
  if (tipo === "enlace_video") return "Enlace de video";
  return "Archivo";
}

function AdjuntosForo({ adjuntos = [], puedeModerar = false, onEliminar }) {
  if (!adjuntos || adjuntos.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        Adjuntos
      </p>

      <div className="grid grid-cols-1 gap-3">
        {adjuntos.map((adjunto) => {
          const url = adjunto.download_url || adjunto.url_externa || "#";
          const tipo = adjunto.tipo || "archivo";

          return (
            <div
              key={adjunto.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-600">
                    {nombreTipoAdjunto(tipo)}
                  </span>

                  <p className="mt-2 text-sm font-bold text-slate-800">
                    {adjunto.nombre_archivo || "Adjunto"}
                  </p>

                  {adjunto.tamano_bytes && (
                    <p className="text-xs text-slate-400">
                      {(Number(adjunto.tamano_bytes) / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}

                  {tipo === "video_vimeo" && adjunto.estado_video && (
                    <p className="mt-1 text-xs font-semibold text-indigo-500">
                      Estado: {adjunto.estado_video}
                    </p>
                  )}
                </div>

                {puedeModerar && (
                  <button
                    type="button"
                    onClick={() => onEliminar?.(adjunto)}
                    className="rounded-lg px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              {tipo === "imagen" && adjunto.download_url && (
                <a href={url} target="_blank" rel="noreferrer">
                  <img
                    src={url}
                    alt={adjunto.nombre_archivo || "Imagen del foro"}
                    className="max-h-80 w-full rounded-2xl border border-slate-200 bg-white object-contain"
                  />
                </a>
              )}

              {tipo === "video" && adjunto.download_url && (
                <video
                  controls
                  className="w-full rounded-2xl border border-slate-200 bg-black"
                >
                  <source src={url} type={adjunto.mime_type || "video/mp4"} />
                  Tu navegador no puede reproducir este video.
                </video>
              )}

              {tipo === "video_vimeo" && (adjunto.embed_url || adjunto.url_externa) && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
                  <iframe
                    src={adjunto.embed_url || adjunto.url_externa}
                    title={adjunto.nombre_archivo || "Video de Vimeo"}
                    className="h-[260px] w-full md:h-[380px]"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {tipo === "enlace_video" && adjunto.url_externa && (
                <a
                  href={adjunto.url_externa}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  Abrir enlace de video
                </a>
              )}

              {tipo === "archivo" && adjunto.download_url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  Ver / descargar archivo
                </a>
              )}

              {adjunto.object_key && !adjunto.download_url && (
                <p className="text-sm text-red-500">
                  No se pudo generar la URL temporal del archivo.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ForoGrupoPanel({ grupoId, modo = "docente" }) {
  const [publicaciones, setPublicaciones] = useState([]);
  const [publicacionActiva, setPublicacionActiva] = useState(null);
  const [respuestas, setRespuestas] = useState([]);

  const [adjuntosPublicacion, setAdjuntosPublicacion] = useState([]);
  const [adjuntosRespuestasMap, setAdjuntosRespuestasMap] = useState({});

  const [cargando, setCargando] = useState(false);
  const [cargandoRespuestas, setCargandoRespuestas] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardandoRespuesta, setGuardandoRespuesta] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [formPublicacion, setFormPublicacion] = useState({
    titulo: "",
    contenido: "",
  });

  const [formRespuesta, setFormRespuesta] = useState("");

  const [archivosPublicacion, setArchivosPublicacion] = useState([]);
  const [archivosRespuesta, setArchivosRespuesta] = useState([]);

  const [videoExternoPublicacion, setVideoExternoPublicacion] = useState("");
  const [videoExternoRespuesta, setVideoExternoRespuesta] = useState("");

  const [fileKeyPublicacion, setFileKeyPublicacion] = useState(1);
  const [fileKeyRespuesta, setFileKeyRespuesta] = useState(1);

  const [avisosForo, setAvisosForo] = useState([]);
  const [subidasForo, setSubidasForo] = useState([]);

  const publicacionActivaRef = useRef(null);

  const puedeModerar = modo === "admin" || modo === "docente";

  useEffect(() => {
    publicacionActivaRef.current = publicacionActiva;
  }, [publicacionActiva]);

  const mostrarAvisoForo = (tipo, mensaje) => {
    const id = `${Date.now()}-${Math.random()}`;

    setAvisosForo((prev) => [
      ...prev,
      {
        id,
        tipo,
        mensaje,
      },
    ]);

    setTimeout(() => {
      setAvisosForo((prev) => prev.filter((aviso) => aviso.id !== id));
    }, 5500);
  };

  const agregarSubidaForo = ({ id, titulo, estado }) => {
    setSubidasForo((prev) => [
      ...prev,
      {
        id,
        titulo,
        estado,
      },
    ]);
  };

  const actualizarSubidaForo = (id, patch) => {
    setSubidasForo((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const removerSubidaForo = (id) => {
    setTimeout(() => {
      setSubidasForo((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const hidratarAdjuntos = async (adjuntos = []) => {
    return await Promise.all(
      adjuntos.map(async (adjunto) => {
        if (!adjunto.object_key) return adjunto;

        try {
          const downloadUrl = await getForoAdjuntoDownloadUrl(adjunto.object_key);

          return {
            ...adjunto,
            download_url: downloadUrl,
          };
        } catch {
          return {
            ...adjunto,
            download_url: null,
          };
        }
      })
    );
  };

  const cargarPublicaciones = async () => {
    try {
      setCargando(true);

      const data = await getForoPublicacionesByGrupo(grupoId);
      setPublicaciones(data || []);

      const activaActual = publicacionActivaRef.current;

      if (activaActual) {
        const actualizada = (data || []).find(
          (p) => Number(p.id) === Number(activaActual.id)
        );

        setPublicacionActiva(actualizada || null);
      }
    } catch (error) {
      alert(error?.message || "No se pudo cargar el foro.");
    } finally {
      setCargando(false);
    }
  };

  const cargarRespuestas = async (publicacion) => {
    if (!publicacion?.id) return;

    try {
      setPublicacionActiva(publicacion);
      setCargandoRespuestas(true);

      const [respuestasDB, adjuntosPublicacionDB] = await Promise.all([
        getForoRespuestasByPublicacion(publicacion.id),
        getForoAdjuntosByPublicacion(publicacion.id),
      ]);

      const adjuntosPubHydrated = await hidratarAdjuntos(adjuntosPublicacionDB || []);
      setAdjuntosPublicacion(adjuntosPubHydrated);

      const listaRespuestas = respuestasDB || [];
      setRespuestas(listaRespuestas);

      const respuestaIds = listaRespuestas.map((r) => Number(r.id)).filter(Boolean);

      if (respuestaIds.length > 0) {
        const adjuntosRespuestasDB = await getForoAdjuntosByRespuestas(respuestaIds);
        const adjuntosHydrated = await hidratarAdjuntos(adjuntosRespuestasDB || []);

        const mapa = {};

        adjuntosHydrated.forEach((adj) => {
          const key = Number(adj.idrespuesta);

          if (!mapa[key]) mapa[key] = [];
          mapa[key].push(adj);
        });

        setAdjuntosRespuestasMap(mapa);
      } else {
        setAdjuntosRespuestasMap({});
      }
    } catch (error) {
      alert(error?.message || "No se pudieron cargar las respuestas.");
    } finally {
      setCargandoRespuestas(false);
    }
  };

  const subirAdjuntosPublicacionEnSegundoPlano = async ({
    publicacion,
    archivos = [],
    videoExterno = "",
  }) => {
    const jobId = `pub-${publicacion.id}-${Date.now()}`;

    const tieneVideoSubido = archivos.some((file) =>
      String(file.type || "").startsWith("video/")
    );

    const tituloJob = tieneVideoSubido
      ? `Subiendo video: ${publicacion.titulo}`
      : `Subiendo adjuntos: ${publicacion.titulo}`;

    agregarSubidaForo({
      id: jobId,
      titulo: tituloJob,
      estado: "Subiendo en segundo plano...",
    });

    try {
      for (const file of archivos) {
        const esVideo = String(file.type || "").startsWith("video/");

        actualizarSubidaForo(jobId, {
          estado: esVideo
            ? `Subiendo video a Vimeo: ${file.name}`
            : `Subiendo archivo: ${file.name}`,
        });

        await subirYGuardarAdjuntoForo({
          file,
          grupoId,
          idpublicacion: publicacion.id,
        });
      }

      if (videoExterno.trim()) {
        actualizarSubidaForo(jobId, {
          estado: "Guardando enlace de video...",
        });

        await crearForoAdjuntoEnlaceVideo({
          idpublicacion: publicacion.id,
          url: videoExterno.trim(),
        });
      }

      actualizarSubidaForo(jobId, {
        estado: "Completado",
      });

      mostrarAvisoForo(
        "success",
        tieneVideoSubido
          ? "Video listo, publicación actualizada."
          : "Adjuntos listos, publicación actualizada."
      );

      await cargarPublicaciones();

      const activaActual = publicacionActivaRef.current;

      if (activaActual && Number(activaActual.id) === Number(publicacion.id)) {
        await cargarRespuestas(publicacion);
      }

      removerSubidaForo(jobId);
    } catch (error) {
      actualizarSubidaForo(jobId, {
        estado: "Error al subir adjuntos",
      });

      mostrarAvisoForo(
        "error",
        error?.message || "No se pudieron subir los adjuntos del foro."
      );

      removerSubidaForo(jobId);
    }
  };

  const subirAdjuntosRespuestaEnSegundoPlano = async ({
    respuesta,
    publicacion,
    archivos = [],
    videoExterno = "",
  }) => {
    const jobId = `resp-${respuesta.id}-${Date.now()}`;

    const tieneVideoSubido = archivos.some((file) =>
      String(file.type || "").startsWith("video/")
    );

    agregarSubidaForo({
      id: jobId,
      titulo: tieneVideoSubido
        ? "Subiendo video de respuesta"
        : "Subiendo adjunto de respuesta",
      estado: "Subiendo en segundo plano...",
    });

    try {
      for (const file of archivos) {
        const esVideo = String(file.type || "").startsWith("video/");

        actualizarSubidaForo(jobId, {
          estado: esVideo
            ? `Subiendo video a Vimeo: ${file.name}`
            : `Subiendo archivo: ${file.name}`,
        });

        await subirYGuardarAdjuntoForo({
          file,
          grupoId,
          idrespuesta: respuesta.id,
        });
      }

      if (videoExterno.trim()) {
        actualizarSubidaForo(jobId, {
          estado: "Guardando enlace de video...",
        });

        await crearForoAdjuntoEnlaceVideo({
          idrespuesta: respuesta.id,
          url: videoExterno.trim(),
        });
      }

      actualizarSubidaForo(jobId, {
        estado: "Completado",
      });

      mostrarAvisoForo(
        "success",
        tieneVideoSubido
          ? "Video listo, respuesta actualizada."
          : "Adjunto listo, respuesta actualizada."
      );

      const activaActual = publicacionActivaRef.current;

      if (activaActual && Number(activaActual.id) === Number(publicacion.id)) {
        await cargarRespuestas(publicacion);
      }

      await cargarPublicaciones();

      removerSubidaForo(jobId);
    } catch (error) {
      actualizarSubidaForo(jobId, {
        estado: "Error al subir adjuntos",
      });

      mostrarAvisoForo(
        "error",
        error?.message || "No se pudieron subir los adjuntos de la respuesta."
      );

      removerSubidaForo(jobId);
    }
  };

  useEffect(() => {
    if (grupoId) cargarPublicaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoId]);

  const publicacionesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    if (!q) return publicaciones;

    return publicaciones.filter((p) => {
      return (
        String(p.titulo || "").toLowerCase().includes(q) ||
        String(p.contenido || "").toLowerCase().includes(q) ||
        String(p.autor_nombre || "").toLowerCase().includes(q)
      );
    });
  }, [publicaciones, busqueda]);

  const handleSeleccionarArchivosPublicacion = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 3) {
      alert("Solo puedes adjuntar hasta 3 archivos por publicación.");
    }

    setArchivosPublicacion(files.slice(0, 3));
  };

  const handleSeleccionarArchivosRespuesta = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 1) {
      alert("Solo puedes adjuntar 1 archivo por respuesta.");
    }

    setArchivosRespuesta(files.slice(0, 1));
  };

  const handleCrearPublicacion = async (e) => {
    e.preventDefault();

    try {
      setGuardando(true);

      if (
        videoExternoPublicacion.trim() &&
        !esUrlValida(videoExternoPublicacion.trim())
      ) {
        throw new Error("El enlace de video no es válido.");
      }

      const archivosSeleccionados = [...archivosPublicacion];
      const videoExternoSeleccionado = videoExternoPublicacion.trim();

      const tieneAdjuntos =
        archivosSeleccionados.length > 0 || videoExternoSeleccionado;

      const tieneVideoSubido = archivosSeleccionados.some((file) =>
        String(file.type || "").startsWith("video/")
      );

      const nuevaPublicacion = await crearForoPublicacion({
        grupoId,
        titulo: formPublicacion.titulo,
        contenido: formPublicacion.contenido,
      });

      setFormPublicacion({
        titulo: "",
        contenido: "",
      });

      setArchivosPublicacion([]);
      setVideoExternoPublicacion("");
      setFileKeyPublicacion((prev) => prev + 1);

      await cargarPublicaciones();
      await cargarRespuestas(nuevaPublicacion);

      if (tieneAdjuntos) {
        mostrarAvisoForo(
          "info",
          tieneVideoSubido
            ? "Publicación creada. El video se está subiendo en segundo plano."
            : "Publicación creada. Los adjuntos se están subiendo en segundo plano."
        );

        subirAdjuntosPublicacionEnSegundoPlano({
          publicacion: nuevaPublicacion,
          archivos: archivosSeleccionados,
          videoExterno: videoExternoSeleccionado,
        });
      } else {
        mostrarAvisoForo("success", "Publicación creada correctamente.");
      }
    } catch (error) {
      alert(error?.message || "No se pudo crear la publicación.");
    } finally {
      setGuardando(false);
    }
  };

  const handleResponder = async (e) => {
    e.preventDefault();

    if (!publicacionActiva) return;

    try {
      setGuardandoRespuesta(true);

      if (
        videoExternoRespuesta.trim() &&
        !esUrlValida(videoExternoRespuesta.trim())
      ) {
        throw new Error("El enlace de video no es válido.");
      }

      const archivosSeleccionados = [...archivosRespuesta];
      const videoExternoSeleccionado = videoExternoRespuesta.trim();

      const tieneAdjuntos =
        archivosSeleccionados.length > 0 || videoExternoSeleccionado;

      const tieneVideoSubido = archivosSeleccionados.some((file) =>
        String(file.type || "").startsWith("video/")
      );

      const nuevaRespuesta = await crearForoRespuesta({
        publicacionId: publicacionActiva.id,
        contenido: formRespuesta,
      });

      setFormRespuesta("");
      setArchivosRespuesta([]);
      setVideoExternoRespuesta("");
      setFileKeyRespuesta((prev) => prev + 1);

      await cargarRespuestas(publicacionActiva);
      await cargarPublicaciones();

      if (tieneAdjuntos) {
        mostrarAvisoForo(
          "info",
          tieneVideoSubido
            ? "Respuesta creada. El video se está subiendo en segundo plano."
            : "Respuesta creada. El adjunto se está subiendo en segundo plano."
        );

        subirAdjuntosRespuestaEnSegundoPlano({
          respuesta: nuevaRespuesta,
          publicacion: publicacionActiva,
          archivos: archivosSeleccionados,
          videoExterno: videoExternoSeleccionado,
        });
      } else {
        mostrarAvisoForo("success", "Respuesta enviada correctamente.");
      }
    } catch (error) {
      alert(error?.message || "No se pudo enviar la respuesta.");
    } finally {
      setGuardandoRespuesta(false);
    }
  };

  const handleEliminarPublicacion = async (publicacion) => {
    const ok = window.confirm("¿Eliminar esta publicación del foro?");
    if (!ok) return;

    try {
      await eliminarForoPublicacion(publicacion.id);

      if (publicacionActiva?.id === publicacion.id) {
        setPublicacionActiva(null);
        setRespuestas([]);
        setAdjuntosPublicacion([]);
        setAdjuntosRespuestasMap({});
      }

      await cargarPublicaciones();
    } catch (error) {
      alert(error?.message || "No se pudo eliminar la publicación.");
    }
  };

  const handleEliminarRespuesta = async (respuesta) => {
    const ok = window.confirm("¿Eliminar esta respuesta?");
    if (!ok) return;

    try {
      await eliminarForoRespuesta(respuesta.id);
      await cargarRespuestas(publicacionActiva);
      await cargarPublicaciones();
    } catch (error) {
      alert(error?.message || "No se pudo eliminar la respuesta.");
    }
  };

  const handleEliminarAdjuntoPublicacion = async (adjunto) => {
    const ok = window.confirm("¿Eliminar este adjunto?");
    if (!ok) return;

    try {
      await eliminarForoAdjunto(adjunto.id);
      await cargarRespuestas(publicacionActiva);
    } catch (error) {
      alert(error?.message || "No se pudo eliminar el adjunto.");
    }
  };

  const handleEliminarAdjuntoRespuesta = async (adjunto) => {
    const ok = window.confirm("¿Eliminar este adjunto?");
    if (!ok) return;

    try {
      await eliminarForoAdjunto(adjunto.id);
      await cargarRespuestas(publicacionActiva);
    } catch (error) {
      alert(error?.message || "No se pudo eliminar el adjunto.");
    }
  };

  const handleToggleFijado = async (publicacion) => {
    try {
      await toggleFijarForoPublicacion(publicacion.id, !publicacion.fijado);
      await cargarPublicaciones();
    } catch (error) {
      alert(error?.message || "No se pudo actualizar la publicación.");
    }
  };

  const handleToggleCerrado = async (publicacion) => {
    try {
      await toggleCerrarForoPublicacion(publicacion.id, !publicacion.cerrado);
      await cargarPublicaciones();

      if (publicacionActiva?.id === publicacion.id) {
        setPublicacionActiva({
          ...publicacionActiva,
          cerrado: !publicacion.cerrado,
        });
      }
    } catch (error) {
      alert(error?.message || "No se pudo actualizar la publicación.");
    }
  };

  return (
    <>
      <div className="fixed right-5 top-5 z-[9999] space-y-3">
        {avisosForo.map((aviso) => (
          <div
            key={aviso.id}
            className={`w-[340px] rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg ${
              aviso.tipo === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : aviso.tipo === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-indigo-200 bg-indigo-50 text-indigo-700"
            }`}
          >
            {aviso.mensaje}
          </div>
        ))}
      </div>

      {subidasForo.length > 0 && (
        <div className="fixed bottom-5 right-5 z-[9999] w-[360px] space-y-3">
          {subidasForo.map((subida) => (
            <div
              key={subida.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
            >
              <p className="text-sm font-black text-slate-900">
                {subida.titulo}
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                {subida.estado}
              </p>

              {subida.estado !== "Completado" &&
                subida.estado !== "Error al subir adjuntos" && (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-indigo-500" />
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      <section className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-950 to-indigo-900 px-6 py-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
              Foro del grupo
            </p>

            <h3 className="mt-2 text-2xl font-black tracking-tight">
              Discusiones y comunicados
            </h3>

            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              Crea publicaciones, responde dudas y comparte imágenes, videos o archivos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[420px_1fr]">
            <div className="space-y-5">
              <form
                onSubmit={handleCrearPublicacion}
                className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    Nueva publicación
                  </h4>

                  <p className="text-sm text-slate-500">
                    Puedes crear un tema, aviso o material complementario.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Título
                  </label>

                  <input
                    value={formPublicacion.titulo}
                    onChange={(e) =>
                      setFormPublicacion((prev) => ({
                        ...prev,
                        titulo: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Ej. Material complementario de la clase"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Contenido
                  </label>

                  <textarea
                    value={formPublicacion.contenido}
                    onChange={(e) =>
                      setFormPublicacion((prev) => ({
                        ...prev,
                        contenido: e.target.value,
                      }))
                    }
                    rows={5}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Escribe el mensaje..."
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Adjuntar archivos
                  </label>

                  <input
                    key={fileKeyPublicacion}
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
                    onChange={handleSeleccionarArchivosPublicacion}
                    className="mt-1 w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Máximo 3 archivos. Imágenes 5 MB, archivos 20 MB, videos a Vimeo.
                  </p>

                  {archivosPublicacion.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {archivosPublicacion.map((file) => (
                        <p
                          key={`${file.name}-${file.size}`}
                          className="text-xs font-semibold text-slate-500"
                        >
                          📎 {file.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Enlace de video externo
                  </label>

                  <input
                    value={videoExternoPublicacion}
                    onChange={(e) => setVideoExternoPublicacion(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="https://vimeo.com/... o https://youtube.com/..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={guardando}
                  className={`w-full rounded-2xl px-5 py-3 text-sm font-bold text-white transition ${
                    guardando
                      ? "cursor-not-allowed bg-slate-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {guardando ? "Publicando..." : "Publicar"}
                </button>
              </form>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-black text-slate-900">
                      Publicaciones
                    </h4>

                    <p className="text-sm text-slate-500">
                      {publicaciones.length} tema(s) creado(s)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cargarPublicaciones}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Actualizar
                  </button>
                </div>

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Buscar en el foro..."
                />

                <div className="mt-4 max-h-[560px] space-y-3 overflow-y-auto pr-1">
                  {cargando ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      Cargando publicaciones...
                    </div>
                  ) : publicacionesFiltradas.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      No hay publicaciones todavía.
                    </div>
                  ) : (
                    publicacionesFiltradas.map((publicacion) => {
                      const activa =
                        Number(publicacionActiva?.id) === Number(publicacion.id);

                      return (
                        <button
                          key={publicacion.id}
                          type="button"
                          onClick={() => cargarRespuestas(publicacion)}
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            activa
                              ? "border-indigo-300 bg-indigo-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            {publicacion.fijado && (
                              <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-700">
                                Fijado
                              </span>
                            )}

                            {publicacion.cerrado && (
                              <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-bold text-slate-600">
                                Cerrado
                              </span>
                            )}

                            <span className="rounded-full bg-indigo-100 px-2 py-1 text-[11px] font-bold text-indigo-700">
                              {publicacion.autor_rol || "USUARIO"}
                            </span>
                          </div>

                          <h5 className="mt-2 font-black text-slate-900">
                            {publicacion.titulo}
                          </h5>

                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {publicacion.contenido}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                            <span>{publicacion.autor_nombre || "Usuario"}</span>
                            <span>
                              {publicacion.total_respuestas || 0} respuesta(s)
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="min-h-[520px] overflow-hidden rounded-3xl border border-slate-200 bg-white">
              {!publicacionActiva ? (
                <div className="flex h-full min-h-[520px] items-center justify-center p-8 text-center">
                  <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl">
                      💬
                    </div>

                    <h4 className="mt-4 text-xl font-black text-slate-900">
                      Selecciona una publicación
                    </h4>

                    <p className="mt-2 max-w-md text-sm text-slate-500">
                      Al elegir una publicación podrás ver sus respuestas, adjuntos y participar en la conversación.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[520px] flex-col">
                  <div className="border-b border-slate-200 bg-slate-50 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {publicacionActiva.fijado && (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
                              Fijado
                            </span>
                          )}

                          {publicacionActiva.cerrado && (
                            <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-600">
                              Cerrado
                            </span>
                          )}

                          <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-700">
                            {publicacionActiva.autor_rol || "USUARIO"}
                          </span>
                        </div>

                        <h4 className="mt-3 text-2xl font-black text-slate-900">
                          {publicacionActiva.titulo}
                        </h4>

                        <p className="mt-1 text-xs text-slate-400">
                          Publicado por {publicacionActiva.autor_nombre || "Usuario"} ·{" "}
                          {formatearFecha(publicacionActiva.created_at)}
                        </p>
                      </div>

                      {puedeModerar && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleFijado(publicacionActiva)}
                            className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
                          >
                            {publicacionActiva.fijado ? "Quitar fijado" : "Fijar"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleCerrado(publicacionActiva)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                          >
                            {publicacionActiva.cerrado ? "Reabrir" : "Cerrar"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEliminarPublicacion(publicacionActiva)}
                            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="mt-5 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                      {publicacionActiva.contenido}
                    </p>

                    <AdjuntosForo
                      adjuntos={adjuntosPublicacion}
                      puedeModerar={puedeModerar}
                      onEliminar={handleEliminarAdjuntoPublicacion}
                    />
                  </div>

                  <div className="flex-1 space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <h5 className="font-black text-slate-900">Respuestas</h5>

                      <span className="text-xs text-slate-400">
                        {respuestas.length} respuesta(s)
                      </span>
                    </div>

                    {cargandoRespuestas ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        Cargando respuestas...
                      </div>
                    ) : respuestas.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        Aún no hay respuestas.
                      </div>
                    ) : (
                      respuestas.map((respuesta) => (
                        <div
                          key={respuesta.id}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-slate-900">
                                {respuesta.autor_nombre || "Usuario"}
                              </p>

                              <p className="text-xs text-slate-400">
                                {respuesta.autor_rol || "USUARIO"} ·{" "}
                                {formatearFecha(respuesta.created_at)}
                              </p>
                            </div>

                            {puedeModerar && (
                              <button
                                type="button"
                                onClick={() => handleEliminarRespuesta(respuesta)}
                                className="rounded-lg px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {respuesta.contenido}
                          </p>

                          <AdjuntosForo
                            adjuntos={adjuntosRespuestasMap[Number(respuesta.id)] || []}
                            puedeModerar={puedeModerar}
                            onEliminar={handleEliminarAdjuntoRespuesta}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  <form
                    onSubmit={handleResponder}
                    className="border-t border-slate-200 bg-slate-50 p-5"
                  >
                    {publicacionActiva.cerrado ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                        Esta publicación está cerrada. No se pueden agregar más respuestas.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={formRespuesta}
                          onChange={(e) => setFormRespuesta(e.target.value)}
                          rows={3}
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                          placeholder="Escribe una respuesta..."
                        />

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <label className="text-sm font-semibold text-slate-700">
                              Adjuntar archivo
                            </label>

                            <input
                              key={fileKeyRespuesta}
                              type="file"
                              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
                              onChange={handleSeleccionarArchivosRespuesta}
                              className="mt-1 w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600"
                            />

                            {archivosRespuesta.length > 0 && (
                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                📎 {archivosRespuesta[0].name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-sm font-semibold text-slate-700">
                              Enlace de video
                            </label>

                            <input
                              value={videoExternoRespuesta}
                              onChange={(e) => setVideoExternoRespuesta(e.target.value)}
                              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                              placeholder="https://vimeo.com/... o https://youtube.com/..."
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={guardandoRespuesta}
                            className={`rounded-2xl px-5 py-3 text-sm font-bold text-white transition ${
                              guardandoRespuesta
                                ? "cursor-not-allowed bg-slate-400"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                          >
                            {guardandoRespuesta ? "Enviando..." : "Responder"}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}