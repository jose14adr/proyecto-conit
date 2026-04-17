import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Stage,
  Layer,
  Text as KonvaText,
  Image as KonvaImage,
  Rect,
} from "react-konva";
import {
  Save,
  Upload,
  Type,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Award,
  ImagePlus,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  activarPlantillaCertificado,
  eliminarPlantillaCertificado,
  guardarPlantillaCertificado,
  obtenerPlantillaActiva,
  obtenerPlantillas,
  solicitarUploadFondoCertificado,
} from "../services/certificado-plantilla.service";

const CAMPOS = [
  { key: "alumno", label: "Nombre del alumno" },
  { key: "curso", label: "Curso" },
  { key: "descripcion", label: "Descripción" },
  { key: "fecha", label: "Fecha" },
  { key: "horas", label: "Horas" },
  { key: "codigo", label: "Código" },
];

const MUESTRAS = {
  alumno: "José Díaz Ramírez",
  curso: "POR HABER APROBADO SATISFACTORIAMENTE EL CURSO",
  descripcion: "Diseño y desarrollo web con enfoque práctico",
  fecha: "08/04/2026",
  horas: "120 HORAS ACADÉMICAS",
  codigo: "CERT-2026-0001",
};

const PREVIEW_WIDTH = 920;

const crearElementosBase = () => [
  {
    id: crypto.randomUUID(),
    type: "text",
    dynamicField: "alumno",
    text: "",
    x: 560,
    y: 520,
    width: 760,
    fontSize: 62,
    color: "#111111",
    fontStyle: "italic",
    align: "center",
    locked: false,
    fontFamily: "Georgia",
  },
  {
    id: crypto.randomUUID(),
    type: "text",
    dynamicField: "curso",
    text: "",
    x: 500,
    y: 650,
    width: 820,
    fontSize: 24,
    color: "#111827",
    fontStyle: "bold",
    align: "center",
    locked: false,
    fontFamily: "Arial",
  },
  {
    id: crypto.randomUUID(),
    type: "text",
    dynamicField: "descripcion",
    text: "",
    x: 470,
    y: 705,
    width: 880,
    fontSize: 18,
    color: "#374151",
    fontStyle: "normal",
    align: "center",
    locked: false,
    fontFamily: "Arial",
  },
  {
    id: crypto.randomUUID(),
    type: "text",
    dynamicField: "horas",
    text: "",
    x: 470,
    y: 760,
    width: 880,
    fontSize: 18,
    color: "#374151",
    fontStyle: "normal",
    align: "center",
    locked: false,
    fontFamily: "Arial",
  },
  {
    id: crypto.randomUUID(),
    type: "text",
    dynamicField: "codigo",
    text: "",
    x: 130,
    y: 955,
    width: 280,
    fontSize: 16,
    color: "#374151",
    fontStyle: "bold",
    align: "left",
    locked: false,
    fontFamily: "Arial",
  },
  {
    id: crypto.randomUUID(),
    type: "text",
    dynamicField: "fecha",
    text: "",
    x: 1030,
    y: 955,
    width: 220,
    fontSize: 18,
    color: "#374151",
    fontStyle: "normal",
    align: "center",
    locked: false,
    fontFamily: "Arial",
  },
];

const crearTextoLibre = () => ({
  id: crypto.randomUUID(),
  type: "text",
  dynamicField: null,
  text: "Texto editable",
  x: 180,
  y: 180,
  width: 500,
  fontSize: 28,
  color: "#111827",
  fontStyle: "normal",
  align: "left",
  locked: false,
  fontFamily: "Arial",
});

const crearImagenElemento = ({ src, key, nombre = "Imagen" }) => ({
  id: crypto.randomUUID(),
  type: "image",
  name: nombre,
  src,
  imageKey: key || null,
  x: 120,
  y: 120,
  width: 180,
  height: 180,
  locked: false,
});

const obtenerSrcElemento = (el) => el.localPreviewUrl || el.src || null;

export default function Certificados() {
  const [plantillaId, setPlantillaId] = useState(null);
  const [nombre, setNombre] = useState("Plantilla principal");
  const [canvasWidth, setCanvasWidth] = useState(1600);
  const [canvasHeight, setCanvasHeight] = useState(1131);
  const [fondoKey, setFondoKey] = useState(null);
  const [fondoRemotoUrl, setFondoRemotoUrl] = useState(null);
  const [fondoLocalUrl, setFondoLocalUrl] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [elementos, setElementos] = useState(crearElementosBase);
  const [seleccionadoId, setSeleccionadoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [imagenesCargadas, setImagenesCargadas] = useState({});

  const [plantillas, setPlantillas] = useState([]);
  const [esPlantillaActiva, setEsPlantillaActiva] = useState(true);

  const fondoPreviewSrc = fondoLocalUrl || fondoRemotoUrl || null;

  const escala = useMemo(
    () => Math.min(1, PREVIEW_WIDTH / canvasWidth),
    [canvasWidth]
  );

  const seleccionado = useMemo(
    () => elementos.find((el) => el.id === seleccionadoId) || null,
    [elementos, seleccionadoId]
  );

  const aplicarPlantillaEnEditor = (data) => {
    if (!data) {
      setPlantillaId(null);
      setNombre("Plantilla principal");
      setCanvasWidth(1600);
      setCanvasHeight(1131);
      setFondoKey(null);
      setFondoRemotoUrl(null);
      setFondoLocalUrl(null);
      setBackgroundImage(null);
      setElementos(crearElementosBase());
      setSeleccionadoId(null);
      setEsPlantillaActiva(plantillas.length === 0);
      return;
    }

    setPlantillaId(data.id);
    setNombre(data.nombre || "Plantilla principal");
    setCanvasWidth(data.canvasWidth || 1600);
    setCanvasHeight(data.canvasHeight || 1131);
    setFondoKey(data.fondoKey || null);
    setFondoRemotoUrl(data.fondoTemporalUrl || null);
    setFondoLocalUrl(null);
    setElementos(
      Array.isArray(data.configJson) && data.configJson.length
        ? data.configJson
        : crearElementosBase()
    );
    setSeleccionadoId(null);
    setEsPlantillaActiva(!!data.activa);
  };

  const prepararNuevaPlantilla = () => {
    setPlantillaId(null);
    setNombre(`Plantilla ${plantillas.length + 1}`);
    setCanvasWidth(1600);
    setCanvasHeight(1131);
    setFondoKey(null);
    setFondoRemotoUrl(null);
    setFondoLocalUrl(null);
    setBackgroundImage(null);
    setElementos(crearElementosBase());
    setSeleccionadoId(null);
    setEsPlantillaActiva(plantillas.length === 0);
  };

  const recargarPlantillas = async (idPreferido = null) => {
    const [todas, activa] = await Promise.all([
      obtenerPlantillas(),
      obtenerPlantillaActiva(),
    ]);

    setPlantillas(todas || []);

    if (idPreferido) {
      const encontrada = (todas || []).find((p) => p.id === idPreferido);
      if (encontrada) {
        aplicarPlantillaEnEditor(encontrada);
        return;
      }
    }

    if (activa) {
      aplicarPlantillaEnEditor(activa);
      return;
    }

    if (todas?.length) {
      aplicarPlantillaEnEditor(todas[0]);
      return;
    }

    prepararNuevaPlantilla();
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        await recargarPlantillas();
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar las plantillas");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  useEffect(() => {
    if (!fondoPreviewSrc) {
      setBackgroundImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setBackgroundImage(img);
    img.onerror = () => setBackgroundImage(null);
    img.src = fondoPreviewSrc;
  }, [fondoPreviewSrc]);

  useEffect(() => {
    const imagenes = elementos.filter((el) => el.type === "image");

    if (!imagenes.length) {
      setImagenesCargadas({});
      return;
    }

    let cancelled = false;

    const cargarImagenes = async () => {
      const resultado = {};

      await Promise.all(
        imagenes.map(
          (el) =>
            new Promise((resolve) => {
              const src = obtenerSrcElemento(el);

              if (!src) {
                resolve(null);
                return;
              }

              const img = new window.Image();
              img.crossOrigin = "anonymous";
              img.onload = () => {
                resultado[el.id] = img;
                resolve(null);
              };
              img.onerror = () => resolve(null);
              img.src = src;
            })
        )
      );

      if (!cancelled) {
        setImagenesCargadas(resultado);
      }
    };

    cargarImagenes();

    return () => {
      cancelled = true;
    };
  }, [elementos]);

  const actualizarElemento = (id, cambios) => {
    setElementos((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...cambios } : el))
    );
  };

  const actualizarSeleccionado = (cambios) => {
    if (!seleccionadoId) return;
    actualizarElemento(seleccionadoId, cambios);
  };

  const agregarCampo = (fieldKey) => {
    const campo = CAMPOS.find((item) => item.key === fieldKey);

    const nuevo = {
      id: crypto.randomUUID(),
      type: "text",
      dynamicField: fieldKey,
      text: "",
      x: 200,
      y: 200,
      width: 500,
      fontSize: 26,
      color: "#111827",
      fontStyle: "normal",
      align: "left",
      locked: false,
      fontFamily: "Arial",
    };

    setElementos((prev) => [...prev, nuevo]);
    setSeleccionadoId(nuevo.id);
    toast.success(`Campo agregado: ${campo?.label || fieldKey}`);
  };

  const agregarTextoLibre = () => {
    const nuevo = crearTextoLibre();
    setElementos((prev) => [...prev, nuevo]);
    setSeleccionadoId(nuevo.id);
  };

  const duplicarSeleccionado = () => {
    if (!seleccionado) return;

    const copia = {
      ...seleccionado,
      id: crypto.randomUUID(),
      x: seleccionado.x + 24,
      y: seleccionado.y + 24,
    };

    setElementos((prev) => [...prev, copia]);
    setSeleccionadoId(copia.id);
  };

  const eliminarSeleccionado = () => {
    if (!seleccionadoId) return;
    setElementos((prev) => prev.filter((el) => el.id !== seleccionadoId));
    setSeleccionadoId(null);
  };

  const traerAlFrente = () => {
    if (!seleccionadoId) return;

    setElementos((prev) => {
      const item = prev.find((el) => el.id === seleccionadoId);
      if (!item) return prev;
      return [...prev.filter((el) => el.id !== seleccionadoId), item];
    });
  };

  const enviarAtras = () => {
    if (!seleccionadoId) return;

    setElementos((prev) => {
      const item = prev.find((el) => el.id === seleccionadoId);
      if (!item) return prev;
      return [item, ...prev.filter((el) => el.id !== seleccionadoId)];
    });
  };

  const handleSubirFondo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Subiendo fondo...", { id: "subiendo-fondo" });

      const resultado = await solicitarUploadFondoCertificado(file);

      setFondoKey(resultado.key);
      setFondoLocalUrl(resultado.localPreviewUrl);
      setFondoRemotoUrl(resultado.proxyUrl || null);

      toast.success("Fondo subido correctamente", { id: "subiendo-fondo" });
    } catch (error) {
      console.error(error);
      toast.error("No se pudo subir el fondo", { id: "subiendo-fondo" });
    } finally {
      event.target.value = "";
    }
  };

  const handleAgregarImagen = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Subiendo imagen...", { id: "subiendo-imagen" });

      const resultado = await solicitarUploadFondoCertificado(file);

      const nuevaImagen = crearImagenElemento({
        src: resultado.proxyUrl || resultado.localPreviewUrl,
        key: resultado.key,
        nombre: file.name,
      });

        nuevaImagen.localPreviewUrl = resultado.localPreviewUrl;

      setElementos((prev) => [...prev, nuevaImagen]);
      setSeleccionadoId(nuevaImagen.id);

      toast.success("Imagen agregada correctamente", {
        id: "subiendo-imagen",
      });
    } catch (error) {
      console.error(error);
      toast.error("No se pudo subir la imagen", {
        id: "subiendo-imagen",
      });
    } finally {
      event.target.value = "";
    }
  };

  const guardar = async () => {
    try {
      setGuardando(true);

      const payload = {
        id: plantillaId,
        nombre,
        activa: esPlantillaActiva,
        fondoKey,
        canvasWidth,
        canvasHeight,
        configJson: elementos,
      };

      const saved = await guardarPlantillaCertificado(payload);

      toast.success("Plantilla guardada correctamente");
      await recargarPlantillas(saved.id);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar la plantilla");
    } finally {
      setGuardando(false);
    }
  };

  const handleActivarPlantilla = async (id) => {
    try {
      await activarPlantillaCertificado(id);
      toast.success("Plantilla activada");
      await recargarPlantillas(id);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo activar la plantilla");
    }
  };

  const handleEliminarPlantilla = async (id) => {
    const plantilla = plantillas.find((p) => p.id === id);

    if (!plantilla) return;

    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar la plantilla "${plantilla.nombre}"?`
    );

    if (!confirmado) return;

    try {
      await eliminarPlantillaCertificado(id);
      toast.success("Plantilla eliminada");
      await recargarPlantillas();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar la plantilla");
    }
  };

  if (cargando) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl shadow p-8 text-gray-500">
          Cargando editor de certificados...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 rounded-xl flex items-center justify-between px-8 text-white shadow">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Award size={28} /> Plantilla de Certificados
          </h2>
          <p className="text-sm opacity-90 mt-2">
            Edita el fondo, campos dinámicos, imágenes y estilos del
            certificado.
          </p>
        </div>

        <button
          onClick={guardar}
          disabled={guardando}
          className="bg-white text-indigo-700 hover:bg-gray-100 px-5 py-2.5 rounded-lg font-semibold transition-colors shrink-0 flex items-center gap-2 shadow-sm disabled:opacity-70"
        >
          <Save size={18} />
          {guardando ? "Guardando..." : "Guardar plantilla"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Plantillas guardadas</h3>
            <p className="text-sm text-gray-500">
              Carga, activa o elimina una plantilla existente.
            </p>
          </div>

          <button
            onClick={prepararNuevaPlantilla}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-black transition-colors"
          >
            Nueva plantilla
          </button>
        </div>

        {plantillas.length === 0 ? (
          <div className="text-sm text-gray-500 border border-dashed rounded-xl p-4">
            Aún no hay plantillas guardadas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plantillas.map((plantilla) => {
              const estaSeleccionada = plantilla.id === plantillaId;

              return (
                <div
                  key={plantilla.id}
                  className={`rounded-xl border p-4 transition-all ${
                    estaSeleccionada
                      ? "border-indigo-500 bg-indigo-50/50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {plantilla.nombre}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {plantilla.canvasWidth} × {plantilla.canvasHeight}
                      </p>
                    </div>

                    {plantilla.activa && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-md bg-green-100 text-green-700">
                        Activa
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => aplicarPlantillaEnEditor(plantilla)}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
                    >
                      Cargar
                    </button>

                    {!plantilla.activa && (
                      <button
                        onClick={() => handleActivarPlantilla(plantilla.id)}
                        className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                      >
                        Activar
                      </button>
                    )}

                    <button
                      onClick={() => handleEliminarPlantilla(plantilla.id)}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_320px] gap-6">
        <div className="bg-white rounded-2xl shadow p-5 space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Nombre de plantilla
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Ancho
              </label>
              <input
                type="number"
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(Number(e.target.value) || 1600)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Alto
              </label>
              <input
                type="number"
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(Number(e.target.value) || 1131)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 block">
              Fondo del certificado
            </label>

            <label className="w-full flex items-center justify-center gap-2 cursor-pointer border border-dashed border-indigo-300 bg-indigo-50 text-indigo-700 px-4 py-3 rounded-xl hover:bg-indigo-100 transition-colors">
              <Upload size={18} />
              Subir fondo
              <input
                type="file"
                accept="image/*"
                onChange={handleSubirFondo}
                className="hidden"
              />
            </label>

            {fondoKey && (
              <div className="text-xs text-gray-500 break-all">
                Fondo cargado: {fondoKey}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={agregarTextoLibre}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors"
            >
              <Type size={18} />
              Agregar texto libre
            </button>

            <label className="w-full flex items-center justify-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors">
              <ImagePlus size={18} />
              Agregar imagen
              <input
                type="file"
                accept="image/*"
                onChange={handleAgregarImagen}
                className="hidden"
              />
            </label>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-700">
                Campos dinámicos
              </div>

              {CAMPOS.map((campo) => (
                <button
                  key={campo.key}
                  onClick={() => agregarCampo(campo.key)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                >
                  + {campo.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 overflow-auto">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Vista previa</h3>
              <p className="text-sm text-gray-500">
                Arrastra los elementos para moverlos.
              </p>
            </div>
          </div>

          <div className="overflow-auto border rounded-xl bg-gray-100 p-4">
            <div
              style={{
                width: canvasWidth * escala,
                height: canvasHeight * escala,
              }}
            >
              <Stage
                width={canvasWidth}
                height={canvasHeight}
                scaleX={escala}
                scaleY={escala}
                onMouseDown={(e) => {
                  if (e.target === e.target.getStage()) {
                    setSeleccionadoId(null);
                  }
                }}
                onTouchStart={(e) => {
                  if (e.target === e.target.getStage()) {
                    setSeleccionadoId(null);
                  }
                }}
              >
                <Layer>
                  <Rect
                    x={0}
                    y={0}
                    width={canvasWidth}
                    height={canvasHeight}
                    fill="#ffffff"
                  />

                  {backgroundImage && (
                    <KonvaImage
                      image={backgroundImage}
                      x={0}
                      y={0}
                      width={canvasWidth}
                      height={canvasHeight}
                      listening={false}
                    />
                  )}

                  {elementos.map((el) => {
                    const selected = el.id === seleccionadoId;

                    if (el.type === "image") {
                      const imagen = imagenesCargadas[el.id];

                      return (
                        <Fragment key={el.id}>
                          {selected && (
                            <Rect
                              x={el.x - 8}
                              y={el.y - 8}
                              width={(el.width || 100) + 16}
                              height={(el.height || 100) + 16}
                              stroke="#2563eb"
                              dash={[8, 5]}
                              cornerRadius={8}
                              listening={false}
                            />
                          )}

                          {imagen && (
                            <KonvaImage
                              image={imagen}
                              x={el.x}
                              y={el.y}
                              width={el.width || 100}
                              height={el.height || 100}
                              draggable={!el.locked}
                              onClick={(evt) => {
                                evt.cancelBubble = true;
                                setSeleccionadoId(el.id);
                              }}
                              onTap={(evt) => {
                                evt.cancelBubble = true;
                                setSeleccionadoId(el.id);
                              }}
                              onDragEnd={(evt) =>
                                actualizarElemento(el.id, {
                                  x: evt.target.x(),
                                  y: evt.target.y(),
                                })
                              }
                            />
                          )}
                        </Fragment>
                      );
                    }

                    const previewText = el.dynamicField
                      ? MUESTRAS[el.dynamicField] || el.dynamicField
                      : el.text;

                    return (
                      <Fragment key={el.id}>
                        {selected && (
                          <Rect
                            x={el.x - 8}
                            y={el.y - 8}
                            width={(el.width || 300) + 16}
                            height={Math.max(el.fontSize + 26, 44)}
                            stroke="#2563eb"
                            dash={[8, 5]}
                            cornerRadius={8}
                            listening={false}
                          />
                        )}

                        <KonvaText
                          x={el.x}
                          y={el.y}
                          width={el.width || 300}
                          text={previewText || " "}
                          fontSize={el.fontSize || 24}
                          fill={el.color || "#111827"}
                          fontStyle={el.fontStyle || "normal"}
                          fontFamily={el.fontFamily || "Arial"}
                          align={el.align || "left"}
                          draggable={!el.locked}
                          onClick={(evt) => {
                            evt.cancelBubble = true;
                            setSeleccionadoId(el.id);
                          }}
                          onTap={(evt) => {
                            evt.cancelBubble = true;
                            setSeleccionadoId(el.id);
                          }}
                          onDragEnd={(evt) =>
                            actualizarElemento(el.id, {
                              x: evt.target.x(),
                              y: evt.target.y(),
                            })
                          }
                        />
                      </Fragment>
                    );
                  })}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 space-y-5">
          <h3 className="text-lg font-bold text-gray-800">Propiedades</h3>

          {!seleccionado ? (
            <div className="text-sm text-gray-500">
              Selecciona un elemento para editarlo.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={duplicarSeleccionado}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
                >
                  <Copy size={16} />
                  Duplicar
                </button>

                <button
                  onClick={eliminarSeleccionado}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>

                <button
                  onClick={traerAlFrente}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
                >
                  <ArrowUp size={16} />
                  Al frente
                </button>

                <button
                  onClick={enviarAtras}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
                >
                  <ArrowDown size={16} />
                  Atrás
                </button>
              </div>

              {seleccionado.type !== "image" && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Tipo de contenido
                  </label>
                  <select
                    value={seleccionado.dynamicField || ""}
                    onChange={(e) =>
                      actualizarSeleccionado({
                        dynamicField: e.target.value || null,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Texto libre</option>
                    {CAMPOS.map((campo) => (
                      <option key={campo.key} value={campo.key}>
                        {campo.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {seleccionado.type !== "image" && !seleccionado.dynamicField && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Texto
                  </label>
                  <textarea
                    rows={3}
                    value={seleccionado.text || ""}
                    onChange={(e) =>
                      actualizarSeleccionado({ text: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    X
                  </label>
                  <input
                    type="number"
                    value={seleccionado.x}
                    onChange={(e) =>
                      actualizarSeleccionado({ x: Number(e.target.value) || 0 })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Y
                  </label>
                  <input
                    type="number"
                    value={seleccionado.y}
                    onChange={(e) =>
                      actualizarSeleccionado({ y: Number(e.target.value) || 0 })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Ancho
                  </label>
                  <input
                    type="number"
                    value={seleccionado.width || 300}
                    onChange={(e) =>
                      actualizarSeleccionado({
                        width: Number(e.target.value) || 300,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                {seleccionado.type === "image" ? (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Alto
                    </label>
                    <input
                      type="number"
                      value={seleccionado.height || 300}
                      onChange={(e) =>
                        actualizarSeleccionado({
                          height: Number(e.target.value) || 300,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Tamaño
                    </label>
                    <input
                      type="number"
                      value={seleccionado.fontSize || 24}
                      onChange={(e) =>
                        actualizarSeleccionado({
                          fontSize: Number(e.target.value) || 24,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                )}
              </div>

              {seleccionado.type !== "image" && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={seleccionado.color || "#111827"}
                      onChange={(e) =>
                        actualizarSeleccionado({ color: e.target.value })
                      }
                      className="w-full h-11 border border-gray-300 rounded-lg px-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-2">
                        Alineación
                      </label>
                      <select
                        value={seleccionado.align || "left"}
                        onChange={(e) =>
                          actualizarSeleccionado({ align: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="left">Izquierda</option>
                        <option value="center">Centro</option>
                        <option value="right">Derecha</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-2">
                        Estilo
                      </label>
                      <select
                        value={seleccionado.fontStyle || "normal"}
                        onChange={(e) =>
                          actualizarSeleccionado({ fontStyle: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Negrita</option>
                        <option value="italic">Cursiva</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Fuente
                    </label>
                    <select
                      value={seleccionado.fontFamily || "Arial"}
                      onChange={(e) =>
                        actualizarSeleccionado({ fontFamily: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </div>
                </>
              )}

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={!!seleccionado.locked}
                  onChange={(e) =>
                    actualizarSeleccionado({ locked: e.target.checked })
                  }
                />
                Bloquear movimiento
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}