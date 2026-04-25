import { useState } from "react";
import { X, Award, Eye, Download, Save, Loader2 } from "lucide-react";
import { actualizarPermisosCertificado } from "../services/matricula.service";
import toast from "react-hot-toast";

export default function PermisosCertificadoModal({
  matricula,
  onClose,
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permisos, setPermisos] = useState({
    puede_ver: matricula.puede_ver_certificado || false,
    puede_descargar: matricula.puede_descargar_certificado || false,
  });

  const handleToggle = (tipo) => {
    setPermisos((prev) => {
      let nuevoEstado = { ...prev };

      if (tipo === "ver") {
        nuevoEstado.puede_ver = !prev.puede_ver;
        if (!nuevoEstado.puede_ver) {
          nuevoEstado.puede_descargar = false;
        }
      } else if (tipo === "descargar") {
        nuevoEstado.puede_descargar = !prev.puede_descargar;
      }

      return nuevoEstado;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await actualizarPermisosCertificado(
        matricula.id,
        permisos.puede_ver,
        permisos.puede_descargar,
      );

      toast.success("Permisos de certificado actualizados");

      // Le pasamos los nuevos datos al componente padre para que actualice la tabla en tiempo real
      onSuccess(matricula.id, permisos.puede_ver, permisos.puede_descargar);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar los permisos");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[70] p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white flex justify-between items-start relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex gap-4 relative z-10">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/20">
              <Award size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">
                Configurar Certificado
              </h2>
              <p className="text-emerald-50 text-sm mt-1">
                {matricula.grupo?.curso?.nombrecurso || matricula.observacion}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors relative z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form
          id="cert-form"
          onSubmit={handleSubmit}
          className="p-6 space-y-4 bg-slate-50"
        >
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-colors">
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-lg ${permisos.puede_ver ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
              >
                <Eye size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Visualización</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  El alumno podrá ver que tiene este certificado.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("ver")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${permisos.puede_ver ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permisos.puede_ver ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          <div
            className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-colors ${!permisos.puede_ver ? "opacity-50 grayscale" : "hover:border-emerald-200"}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-lg ${permisos.puede_descargar ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
              >
                <Download size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Descarga en PDF</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  El alumno podrá descargar e imprimir el archivo.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={!permisos.puede_ver}
              onClick={() => handleToggle("descargar")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${permisos.puede_descargar ? "bg-emerald-500" : "bg-slate-300"} ${!permisos.puede_ver && "cursor-not-allowed"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permisos.puede_descargar ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="cert-form"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Guardando
              </>
            ) : (
              <>
                <Save size={16} /> Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
