import { useEffect, useMemo, useState } from "react";
import {
  Palette,
  Save,
  RotateCcw,
  Paintbrush,
  LayoutDashboard,
  Moon,
  Sun,
  Menu,
  Check,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { estilosService } from "../services/estilosService";
import { useTheme } from "../theme/ThemeProvider";

const DEFAULT_FORM = {
  colorPrincipalId: 4,
  colorSecundarioId: 8,
  colorSidenavId: 3,

  colorPrincipalCustom: "",
  colorSecundarioCustom: "",
  colorSidenavCustom: "",

  botonPrimarioUsaSidenav: true,
  botonSecundarioUsaSidenav: true,

  botonPrimarioColorId: null,
  botonSecundarioColorId: null,

  botonPrimarioCustom: "",
  botonSecundarioCustom: "",

  tipoSidenav: "OSCURO",
  sidenavMini: false,
  modoOscuro: false,
};

function obtenerColorPorId(colores, id) {
  if (!id) return null;
  return colores.find((color) => Number(color.id) === Number(id)) || null;
}

function obtenerHexColor(colores, id, custom, fallback = "#3B82F6") {
  if (custom && custom.trim() !== "") return custom;
  const color = obtenerColorPorId(colores, id);
  return color?.hex || fallback;
}

function normalizarCustom(valor) {
  if (!valor || valor.trim() === "") return null;
  return valor;
}

function ColorSelector({
  titulo,
  descripcion,
  colores,
  selectedId,
  customValue,
  fallback,
  onSelectId,
  onCustomChange,
}) {
  const colorActual = obtenerHexColor(colores, selectedId, customValue, fallback);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text)]">
            {titulo}
          </h3>
          <p className="mt-1 text-xs text-[var(--color-muted-text)]">
            {descripcion}
          </p>
        </div>

        <div
          className="h-11 w-11 rounded-2xl border border-slate-200 shadow-inner"
          style={{ backgroundColor: colorActual }}
        />
      </div>

      <div className="mt-4 grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {colores.map((color) => {
          const activo =
            Number(selectedId) === Number(color.id) &&
            (!customValue || customValue.trim() === "");

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onSelectId(color.id)}
              title={`${color.nombre} ${color.hex}`}
              className={`relative h-9 w-9 rounded-full border transition-all hover:scale-110 ${
                activo
                  ? "border-slate-900 ring-2 ring-slate-900 ring-offset-2"
                  : "border-slate-200"
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {activo && (
                <Check
                  size={16}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
        <input
          type="color"
          value={customValue && customValue.trim() !== "" ? customValue : colorActual}
          onChange={(e) => onCustomChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white"
        />

        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-600">
            Color personalizado
          </p>
          <input
            value={customValue || ""}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder={colorActual}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>
    </div>
  );
}

function SwitchControl({ label, description, checked, onChange, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-left shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
          <Icon size={18} />
        </div>

        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--color-text)]">{label}</p>
          <p className="text-xs text-[var(--color-muted-text)]">{description}</p>
        </div>

        <div
          className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
            checked ? "bg-[var(--color-primary)]" : "bg-slate-300"
          }`}
        >
          <div
            className={`h-4 w-4 rounded-full bg-white shadow transition ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>
      </div>
    </button>
  );
}

export default function ConfigurarEstilos() {
  const { actualizarThemeLocal, cargarTheme } = useTheme();

  const [colores, setColores] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const preview = useMemo(() => {
    const primary = obtenerHexColor(
      colores,
      form.colorPrincipalId,
      form.colorPrincipalCustom,
      "#3B82F6"
    );

    const secondary = obtenerHexColor(
      colores,
      form.colorSecundarioId,
      form.colorSecundarioCustom,
      "#0EA5E9"
    );

    const sidenav = obtenerHexColor(
      colores,
      form.colorSidenavId,
      form.colorSidenavCustom,
      "#1E293B"
    );

    const buttonPrimary = form.botonPrimarioUsaSidenav
      ? sidenav
      : obtenerHexColor(
          colores,
          form.botonPrimarioColorId,
          form.botonPrimarioCustom,
          primary
        );

    const buttonSecondary = form.botonSecundarioUsaSidenav
      ? sidenav
      : obtenerHexColor(
          colores,
          form.botonSecundarioColorId,
          form.botonSecundarioCustom,
          secondary
        );

    return {
      primary,
      secondary,
      sidenav,
      buttonPrimary,
      buttonSecondary,
      background: form.modoOscuro ? "#0F172A" : "#F8FAFC",
      card: form.modoOscuro ? "#1E293B" : "#FFFFFF",
      text: form.modoOscuro ? "#F8FAFC" : "#0F172A",
    };
  }, [colores, form]);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [listaColores, dataConfig] = await Promise.all([
        estilosService.listarColores(),
        estilosService.obtenerConfiguracionAdmin(),
      ]);

      setColores(listaColores || []);

      const config = dataConfig?.config;

      if (config) {
        setForm({
          colorPrincipalId: config.colorPrincipal?.id ?? null,
          colorSecundarioId: config.colorSecundario?.id ?? null,
          colorSidenavId: config.colorSidenav?.id ?? null,

          colorPrincipalCustom: config.colorPrincipalCustom ?? "",
          colorSecundarioCustom: config.colorSecundarioCustom ?? "",
          colorSidenavCustom: config.colorSidenavCustom ?? "",

          botonPrimarioUsaSidenav: Boolean(config.botonPrimarioUsaSidenav),
          botonSecundarioUsaSidenav: Boolean(config.botonSecundarioUsaSidenav),

          botonPrimarioColorId: config.botonPrimarioColor?.id ?? null,
          botonSecundarioColorId: config.botonSecundarioColor?.id ?? null,

          botonPrimarioCustom: config.botonPrimarioCustom ?? "",
          botonSecundarioCustom: config.botonSecundarioCustom ?? "",

          tipoSidenav: config.tipoSidenav ?? "OSCURO",
          sidenavMini: Boolean(config.sidenavMini),
          modoOscuro: Boolean(config.modoOscuro),
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los estilos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const actualizarCampo = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const guardarCambios = async () => {
    try {
      setGuardando(true);

      const payload = {
        colorPrincipalId: form.colorPrincipalCustom ? null : form.colorPrincipalId,
        colorSecundarioId: form.colorSecundarioCustom ? null : form.colorSecundarioId,
        colorSidenavId: form.colorSidenavCustom ? null : form.colorSidenavId,

        colorPrincipalCustom: normalizarCustom(form.colorPrincipalCustom),
        colorSecundarioCustom: normalizarCustom(form.colorSecundarioCustom),
        colorSidenavCustom: normalizarCustom(form.colorSidenavCustom),

        botonPrimarioUsaSidenav: form.botonPrimarioUsaSidenav,
        botonSecundarioUsaSidenav: form.botonSecundarioUsaSidenav,

        botonPrimarioColorId: form.botonPrimarioCustom
          ? null
          : form.botonPrimarioColorId,
        botonSecundarioColorId: form.botonSecundarioCustom
          ? null
          : form.botonSecundarioColorId,

        botonPrimarioCustom: normalizarCustom(form.botonPrimarioCustom),
        botonSecundarioCustom: normalizarCustom(form.botonSecundarioCustom),

        tipoSidenav: form.tipoSidenav,
        sidenavMini: form.sidenavMini,
        modoOscuro: form.modoOscuro,
      };

      const respuesta = await estilosService.actualizarConfiguracion(payload);

      if (respuesta?.resuelto) {
        actualizarThemeLocal(respuesta.resuelto);
      } else {
        await cargarTheme();
      }

      toast.success("Estilos actualizados correctamente");
      await cargarDatos();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "No se pudieron guardar los estilos"
      );
    } finally {
      setGuardando(false);
    }
  };

  const restablecerValores = async () => {
    const confirmar = window.confirm(
      "¿Deseas restablecer los colores principales del sistema?"
    );

    if (!confirmar) return;

    setForm({
      ...DEFAULT_FORM,
      colorPrincipalCustom: "",
      colorSecundarioCustom: "",
      colorSidenavCustom: "",
      botonPrimarioCustom: "",
      botonSecundarioCustom: "",
    });
  };

  if (cargando) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin" size={34} />
          <p className="font-medium">Cargando configuración de estilos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
              <Palette size={16} />
              Personalización global
            </div>

            <h1 className="text-2xl font-black tracking-tight md:text-3xl">
              Configurar estilos del sistema
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Los cambios se aplicarán al administrador, docente, alumno y web
              pública cuando sus componentes usen las variables globales del tema.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={restablecerValores}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <RotateCcw size={18} />
              Restablecer
            </button>

            <button
              type="button"
              onClick={guardarCambios}
              disabled={guardando}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {guardando ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Guardar cambios
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <ColorSelector
              titulo="Color principal"
              descripcion="Se usará en títulos, acentos, enlaces activos y elementos importantes."
              colores={colores}
              selectedId={form.colorPrincipalId}
              customValue={form.colorPrincipalCustom}
              fallback="#3B82F6"
              onSelectId={(id) =>
                setForm((prev) => ({
                  ...prev,
                  colorPrincipalId: id,
                  colorPrincipalCustom: "",
                }))
              }
              onCustomChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  colorPrincipalCustom: value,
                  colorPrincipalId: null,
                }))
              }
            />

            <ColorSelector
              titulo="Color secundario"
              descripcion="Se usará como color de apoyo para detalles, etiquetas y fondos suaves."
              colores={colores}
              selectedId={form.colorSecundarioId}
              customValue={form.colorSecundarioCustom}
              fallback="#0EA5E9"
              onSelectId={(id) =>
                setForm((prev) => ({
                  ...prev,
                  colorSecundarioId: id,
                  colorSecundarioCustom: "",
                }))
              }
              onCustomChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  colorSecundarioCustom: value,
                  colorSecundarioId: null,
                }))
              }
            />

            <ColorSelector
              titulo="Color del menú lateral"
              descripcion="Controla el fondo principal del sidenav del sistema."
              colores={colores}
              selectedId={form.colorSidenavId}
              customValue={form.colorSidenavCustom}
              fallback="#1E293B"
              onSelectId={(id) =>
                setForm((prev) => ({
                  ...prev,
                  colorSidenavId: id,
                  colorSidenavCustom: "",
                }))
              }
              onCustomChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  colorSidenavCustom: value,
                  colorSidenavId: null,
                }))
              }
            />

            <div className="space-y-5">
              <SwitchControl
                label="Botón primario usa color del menú"
                description="Hace que los botones principales usen el color del sidenav."
                checked={form.botonPrimarioUsaSidenav}
                onChange={(value) =>
                  actualizarCampo("botonPrimarioUsaSidenav", value)
                }
                icon={Paintbrush}
              />

              <SwitchControl
                label="Botón secundario usa color del menú"
                description="Hace que los botones secundarios también usen el color del sidenav."
                checked={form.botonSecundarioUsaSidenav}
                onChange={(value) =>
                  actualizarCampo("botonSecundarioUsaSidenav", value)
                }
                icon={Paintbrush}
              />

              <SwitchControl
                label="Sidenav mini"
                description="Activa la versión compacta del menú lateral."
                checked={form.sidenavMini}
                onChange={(value) => actualizarCampo("sidenavMini", value)}
                icon={Menu}
              />

              <SwitchControl
                label="Modo oscuro"
                description="Cambia los fondos principales a una versión oscura."
                checked={form.modoOscuro}
                onChange={(value) => actualizarCampo("modoOscuro", value)}
                icon={form.modoOscuro ? Moon : Sun}
              />
            </div>
          </div>

          {!form.botonPrimarioUsaSidenav && (
            <ColorSelector
              titulo="Color del botón primario"
              descripcion="Solo se usa si el botón primario no toma el color del menú."
              colores={colores}
              selectedId={form.botonPrimarioColorId}
              customValue={form.botonPrimarioCustom}
              fallback={preview.primary}
              onSelectId={(id) =>
                setForm((prev) => ({
                  ...prev,
                  botonPrimarioColorId: id,
                  botonPrimarioCustom: "",
                }))
              }
              onCustomChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  botonPrimarioCustom: value,
                  botonPrimarioColorId: null,
                }))
              }
            />
          )}

          {!form.botonSecundarioUsaSidenav && (
            <ColorSelector
              titulo="Color del botón secundario"
              descripcion="Solo se usa si el botón secundario no toma el color del menú."
              colores={colores}
              selectedId={form.botonSecundarioColorId}
              customValue={form.botonSecundarioCustom}
              fallback={preview.secondary}
              onSelectId={(id) =>
                setForm((prev) => ({
                  ...prev,
                  botonSecundarioColorId: id,
                  botonSecundarioCustom: "",
                }))
              }
              onCustomChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  botonSecundarioCustom: value,
                  botonSecundarioColorId: null,
                }))
              }
            />
          )}

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              Tipo de sidenav
            </h3>
            <p className="mt-1 text-xs text-[var(--color-muted-text)]">
              Estilo de sidenav
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["OSCURO", "TRANSPARENTE", "BLANCO"].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => actualizarCampo("tipoSidenav", tipo)}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    form.tipoSidenav === tipo
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[var(--color-primary)]"
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="sticky top-24 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-lg">
            <div className="mb-4 flex items-center gap-2">
              <LayoutDashboard size={20} className="text-[var(--color-primary)]" />
              <h2 className="font-black text-[var(--color-text)]">
                Vista previa
              </h2>
            </div>

            <div
              className="overflow-hidden rounded-2xl border shadow-sm"
              style={{
                backgroundColor: preview.background,
                borderColor: form.modoOscuro ? "#334155" : "#E2E8F0",
              }}
            >
              <div className="flex min-h-[360px]">
                <div
                  className={`${form.sidenavMini ? "w-16" : "w-36"} p-3 transition-all`}
                  style={{ backgroundColor: preview.sidenav }}
                >
                  <div className="mb-5 flex items-center gap-2 text-white">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black"
                      style={{ backgroundColor: preview.primary }}
                    >
                      C
                    </div>
                    {!form.sidenavMini && (
                      <span className="text-sm font-black">CONIT</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className={`h-9 rounded-xl ${
                          item === 1 ? "opacity-100" : "opacity-50"
                        }`}
                        style={{
                          backgroundColor:
                            item === 1 ? preview.primary : "rgba(255,255,255,0.12)",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex-1 p-4">
                  <div
                    className="mb-4 h-10 rounded-xl border"
                    style={{
                      backgroundColor: preview.card,
                      borderColor: form.modoOscuro ? "#334155" : "#E2E8F0",
                    }}
                  />

                  <div
                    className="rounded-2xl border p-4"
                    style={{
                      backgroundColor: preview.card,
                      borderColor: form.modoOscuro ? "#334155" : "#E2E8F0",
                    }}
                  >
                    <div
                      className="mb-3 h-4 w-28 rounded-full"
                      style={{ backgroundColor: preview.primary }}
                    />

                    <div
                      className="mb-2 h-3 w-full rounded-full opacity-40"
                      style={{ backgroundColor: preview.text }}
                    />
                    <div
                      className="mb-5 h-3 w-2/3 rounded-full opacity-25"
                      style={{ backgroundColor: preview.text }}
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg px-3 py-2 text-xs font-bold text-white"
                        style={{ backgroundColor: preview.buttonPrimary }}
                      >
                        Primario
                      </button>

                      <button
                        type="button"
                        className="rounded-lg px-3 py-2 text-xs font-bold text-white"
                        style={{ backgroundColor: preview.buttonSecondary }}
                      >
                        Secundario
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-bold text-slate-500">Principal</p>
                <p className="mt-1 font-black text-slate-800">
                  {preview.primary}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-bold text-slate-500">Sidenav</p>
                <p className="mt-1 font-black text-slate-800">
                  {preview.sidenav}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}