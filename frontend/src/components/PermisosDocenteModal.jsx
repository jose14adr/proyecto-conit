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

  // Mapeamos las funcionalidades a sus respectivos íconos y descripciones
  const PERMISOS_LIST = [
    {
      id: "gestionar_contenido",
      label: "Gestión de Contenido",
      desc: "Crear, editar, eliminar y reordenar módulos, lecciones y materiales (incluyendo videos).",
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      id: "gestionar_tareas",
      label: "Gestión de Tareas",
      desc: "Crear, modificar y eliminar tareas. Adjuntar archivos de apoyo.",
      icon: CheckSquare,
      color: "text-violet-600",
      bg: "bg-violet-100",
    },
    {
      id: "gestionar_examenes",
      label: "Gestión de Exámenes",
      desc: "Diseñar, estructurar y configurar cuestionarios y exámenes interactivos.",
      icon: FileEdit,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      id: "gestionar_sesiones",
      label: "Sesiones en Vivo",
      desc: "Programar, editar y gestionar enlaces para las clases en vivo (Meet/Zoom).",
      icon: Video,
      color: "text-rose-600",
      bg: "bg-rose-100",
    },
    {
      id: "tomar_asistencia",
      label: "Control de Asistencia",
      desc: "Registrar presentes, tardanzas, faltas y exportar reportes (PDF/Excel).",
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      id: "gestionar_calificaciones",
      label: "Calificaciones y Notas",
      desc: "Revisar entregas, colocar notas y vincular tareas/exámenes al registro oficial.",
      icon: GraduationCap,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
  ];

  useEffect(() => {
    if (grupo && grupo.permisos_docente) {
      try {
        let p = grupo.permisos_docente;

        // Lo parseamos con seguridad (doble parseo por si el backend lo mandó doblemente convertido a string)
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

        // Verificamos si todos los individuales están marcados
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
      toast.error(
        error.response?.data?.message || "Error al actualizar los permisos",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!grupo || !docente) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-6 md:p-8 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/20">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold leading-tight">
                Permisos del Docente
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                {grupo.curso?.nombrecurso || "Curso"} • Grupo{" "}
                {grupo.nombregrupo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors relative z-10"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <form
          id="permisos-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-lg uppercase shrink-0">
              {docente.nombre?.charAt(0)}
              {docente.apellido?.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-800">
                {docente.nombre} {docente.apellido}
              </p>
              <p className="text-sm text-slate-500">
                Configura las áreas del curso a las que tendrá acceso.
              </p>
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl overflow-hidden shadow-sm">
            {/* Control Total Master Switch */}
            <div className="bg-white px-6 py-5 border-b border-indigo-100">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-colors ${permisos.control_total ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}
                  >
                    <Key size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-base group-hover:text-black block">
                      Control total del curso
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Otorga acceso absoluto a todas las funciones académicas.
                    </span>
                  </div>
                </div>

                <div className="relative flex items-center ml-4">
                  <input
                    type="checkbox"
                    name="control_total"
                    checked={permisos.control_total}
                    onChange={handlePermisoChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>
            </div>

            {/* Grid de Permisos Individuales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-indigo-100">
              {PERMISOS_LIST.map((item) => {
                const Icon = item.icon;
                const isChecked = permisos[item.id];

                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-4 p-5 cursor-pointer transition-colors bg-white hover:bg-slate-50 ${isChecked ? "bg-slate-50/50" : ""}`}
                  >
                    <div
                      className={`mt-0.5 p-2 rounded-lg border ${isChecked ? `${item.bg} ${item.color} border-transparent` : "bg-slate-50 text-slate-400 border-slate-200"}`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="flex-1">
                      <span
                        className={`font-semibold text-sm block ${isChecked ? "text-slate-900" : "text-slate-700"}`}
                      >
                        {item.label}
                      </span>
                      <span className="text-xs text-slate-500 mt-1 block leading-relaxed pr-2">
                        {item.desc}
                      </span>
                    </div>

                    <div className="pt-1">
                      <input
                        type="checkbox"
                        name={item.id}
                        checked={isChecked}
                        onChange={handlePermisoChange}
                        className="w-5 h-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-600 transition-colors cursor-pointer"
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="permisos-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save size={18} /> Guardar Permisos
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
