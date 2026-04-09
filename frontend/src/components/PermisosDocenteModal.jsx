import { useState, useEffect } from "react";
import { X, Loader2, Key, Save, ShieldCheck } from "lucide-react";
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
    tomar_asistencia: true,
    crear_tareas: false,
    modificar_modulos: false,
    modificar_notas: false,
    cargar_notas: true,
    enviar_mensajes: false,
  });

  useEffect(() => {
    if (grupo && grupo.permisos_docente) {
      try {
        const p =
          typeof grupo.permisos_docente === "string"
            ? JSON.parse(grupo.permisos_docente)
            : grupo.permisos_docente;

        setPermisos({
          control_total: p.control_total || false,
          tomar_asistencia: p.tomar_asistencia ?? true,
          crear_tareas: p.crear_tareas || false,
          modificar_modulos: p.modificar_modulos || false,
          modificar_notas: p.modificar_notas || false,
          cargar_notas: p.cargar_notas ?? true,
          enviar_mensajes: p.enviar_mensajes || false,
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
        tomar_asistencia: checked,
        crear_tareas: checked,
        modificar_modulos: checked,
        modificar_notas: checked,
        cargar_notas: checked,
        enviar_mensajes: checked,
      });
    } else {
      setPermisos((prev) => {
        const next = { ...prev, [name]: checked };
        if (!checked) next.control_total = false;
        const todosMarcados = [
          "tomar_asistencia",
          "crear_tareas",
          "modificar_modulos",
          "modificar_notas",
          "cargar_notas",
          "enviar_mensajes",
        ].every((k) => next[k]);
        if (todosMarcados) next.control_total = true;
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await asignarDocenteAGrupo(grupo.id, docente.id, permisos);
      toast.success("Permisos actualizados exitosamente");
      onSuccess();
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
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col">
        {/* Header (Tono Indigo/Violeta para Seguridad) */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">
                Configurar Permisos
              </h2>
              <p className="text-indigo-100 text-xs mt-1">
                {grupo.curso?.nombrecurso || "Curso"} - Grupo{" "}
                {grupo.nombregrupo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <form id="permisos-form" onSubmit={handleSubmit} className="p-6">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-indigo-100/50 px-5 py-3 border-b border-indigo-100 flex items-center gap-3">
              <Key size={18} className="text-indigo-600" />
              <div>
                <h4 className="font-bold text-indigo-900 text-sm">
                  Accesos del Docente
                </h4>
              </div>
            </div>

            <div className="p-5 bg-white">
              {/* Control Total Master Switch */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="font-bold text-gray-800 group-hover:text-black">
                    Control total del curso
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="control_total"
                      checked={permisos.control_total}
                      onChange={handlePermisoChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </div>
                </label>
              </div>

              {/* Checkboxes Individuales */}
              <div className="space-y-3">
                {[
                  { id: "tomar_asistencia", label: "Tomar asistencia" },
                  { id: "crear_tareas", label: "Crear tareas" },
                  { id: "modificar_modulos", label: "Modificar módulos" },
                  { id: "modificar_notas", label: "Modificar notas" },
                  { id: "cargar_notas", label: "Cargar notas" },
                  { id: "enviar_mensajes", label: "Enviar mensajes" },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      name={item.id}
                      checked={permisos[item.id]}
                      onChange={handlePermisoChange}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 transition-colors"
                    />
                    <span className="text-gray-700 group-hover:text-black font-medium text-sm">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="permisos-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
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
