import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Key,
  Save,
  ShieldCheck,
  BookOpen,
  CheckSquare,
  FileEdit,
  Video,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { asignarDocenteAGrupo } from "../services/grupo.service";
import toast from "react-hot-toast";

export default function PermisosDocenteModal({
  docente,
  grupo,
  onClose,
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [permisos, setPermisos] = useState({
    control_total: false,
    gestionar_contenido: false,
    gestionar_tareas: false,
    gestionar_examenes: false,
    gestionar_sesiones: false,
    tomar_asistencia: true,
    gestionar_calificaciones: false,
  });

  const PERMISOS_LIST = [
    {
      id: "gestionar_contenido",
      label: "Gestión de Contenido",
      desc: "Crear, editar, eliminar y reordenar módulos, lecciones y materiales.",
      icon: BookOpen,
      tone: "primary",
    },
    {
      id: "gestionar_tareas",
      label: "Gestión de Tareas",
      desc: "Crear, modificar y eliminar tareas. Adjuntar archivos de apoyo.",
      icon: CheckSquare,
      tone: "secondary",
    },
    {
      id: "gestionar_examenes",
      label: "Gestión de Exámenes",
      desc: "Diseñar, estructurar y configurar cuestionarios y exámenes.",
      icon: FileEdit,
      tone: "amber",
    },
    {
      id: "gestionar_sesiones",
      label: "Sesiones en Vivo",
      desc: "Programar, editar y gestionar enlaces para clases en vivo.",
      icon: Video,
      tone: "rose",
    },
    {
      id: "tomar_asistencia",
      label: "Control de Asistencia",
      desc: "Registrar presentes, tardanzas, faltas y exportar reportes.",
      icon: UserCheck,
      tone: "emerald",
    },
    {
      id: "gestionar_calificaciones",
      label: "Calificaciones y Notas",
      desc: "Revisar entregas, colocar notas y vincular evaluaciones.",
      icon: GraduationCap,
      tone: "primary",
    },
  ];

  useEffect(() => {
    if (grupo && grupo.permisos_docente) {
      try {
        let p = grupo.permisos_docente;

        if (typeof p === "string") p = JSON.parse(p);
        if (typeof p === "string") p = JSON.parse(p);

        setPermisos({
          control_total: !!p.control_total,
          gestionar_contenido: !!p.gestionar_contenido,
          gestionar_tareas: !!p.gestionar_tareas,
          gestionar_examenes: !!p.gestionar_examenes,
          gestionar_sesiones: !!p.gestionar_sesiones,
          tomar_asistencia: p.tomar_asistencia ?? true,
          gestionar_calificaciones: !!p.gestionar_calificaciones,
        });
      } catch (error) {
        console.error("Error al parsear permisos:", error);
      }
    }
  }, [grupo]);

  const handlePermisoChange = (e) => {
    const { name, checked } = e.target;

    if (name === "control_total") {
      setPermisos({
        control_total: checked,
        gestionar_contenido: checked,
        gestionar_tareas: checked,
        gestionar_examenes: checked,
        gestionar_sesiones: checked,
        tomar_asistencia: checked,
        gestionar_calificaciones: checked,
      });
    } else {
      setPermisos((prev) => {
        const next = { ...prev, [name]: checked };
        const todosMarcados = PERMISOS_LIST.every((item) => next[item.id]);
        next.control_total = todosMarcados;
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      await asignarDocenteAGrupo(grupo.id, docente.id, permisos);

      if (grupo) {
        grupo.permisos_docente = JSON.stringify(permisos);
      }

      toast.success("Permisos actualizados exitosamente");

      if (onSuccess) onSuccess();

      onClose();
    } catch (error) {
      console.error("Error al actualizar permisos:", error);
      toast.error(
        error.response?.data?.message || "Error al actualizar los permisos"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!grupo || !docente) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl animate-fadeIn">
        {/* Header */}
        <div
          className="relative flex shrink-0 items-center justify-between overflow-hidden p-6 text-white md:p-8"
          style={{
            background:
              "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
          }}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="rounded-2xl border border-white/20 bg-white/20 p-3 backdrop-blur-sm">
              <ShieldCheck size={28} />
            </div>

            <div>
              <h2 className="text-2xl font-black leading-tight">
                Permisos del Docente
              </h2>

              <p className="mt-1 text-sm text-white/75">
                {grupo.curso?.nombrecurso || "Curso"} • Grupo{" "}
                {grupo.nombregrupo}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 rounded-full p-2 transition hover:bg-white/20"
            title="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <form
          id="permisos-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto bg-[var(--color-background)] p-6 md:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] text-lg font-black uppercase text-[var(--color-primary)]">
              {docente.nombre?.charAt(0)}
              {docente.apellido?.charAt(0)}
            </div>

            <div>
              <p className="font-black text-[var(--color-text)]">
                {docente.nombre} {docente.apellido}
              </p>

              <p className="text-sm text-[var(--color-muted-text)]">
                Configura las áreas del curso a las que tendrá acceso.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
            {/* Control total */}
            <div className="border-b border-[var(--color-border)] bg-[var(--color-card)] px-6 py-5">
              <label className="group flex cursor-pointer items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-xl p-2 transition ${
                      permisos.control_total
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-background)] text-[var(--color-muted-text)]"
                    }`}
                  >
                    <Key size={20} />
                  </div>

                  <div>
                    <span className="block text-base font-black text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                      Control total del curso
                    </span>

                    <span className="mt-0.5 block text-xs text-[var(--color-muted-text)]">
                      Otorga acceso absoluto a todas las funciones académicas.
                    </span>
                  </div>
                </div>

                <div className="relative ml-4 flex items-center">
                  <input
                    type="checkbox"
                    name="control_total"
                    checked={permisos.control_total}
                    onChange={handlePermisoChange}
                    className="peer sr-only"
                  />

                  <div className="h-7 w-14 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--color-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </div>
              </label>
            </div>

            {/* Permisos individuales */}
            <div className="grid grid-cols-1 gap-px bg-[var(--color-border)] md:grid-cols-2">
              {PERMISOS_LIST.map((item) => {
                const Icon = item.icon;
                const isChecked = permisos[item.id];

                return (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-start gap-4 bg-[var(--color-card)] p-5 transition hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)] ${
                      isChecked
                        ? "bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-card))]"
                        : ""
                    }`}
                  >
                    <div
                      className={`mt-0.5 rounded-xl border p-2 transition ${
                        isChecked
                          ? "border-transparent bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]"
                          : "border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-muted-text)]"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="flex-1">
                      <span
                        className={`block text-sm font-bold ${
                          isChecked
                            ? "text-[var(--color-text)]"
                            : "text-[var(--color-muted-text)]"
                        }`}
                      >
                        {item.label}
                      </span>

                      <span className="mt-1 block pr-2 text-xs leading-relaxed text-[var(--color-muted-text)]">
                        {item.desc}
                      </span>
                    </div>

                    <div className="pt-1">
                      <input
                        type="checkbox"
                        name={item.id}
                        checked={isChecked}
                        onChange={handlePermisoChange}
                        className="h-5 w-5 cursor-pointer rounded-md border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-card)] p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-6 py-2.5 font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="permisos-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-button-primary)] px-6 py-2.5 font-semibold text-[var(--color-button-primary-text)] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar Permisos
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}