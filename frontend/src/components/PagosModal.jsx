import { useState } from "react";
import { X, AlertCircle, CreditCard, Smartphone, Globe } from "lucide-react";
import PagoIzipay from "./PagoIzipay";
// Aquí luego importarás tus otros componentes cuando los creemos
// import PagoMercadoPago from "./PagoMercadoPago";
// import PagoPayPal from "./PagoPayPal";

export default function PagosModal({ pago, onClose, onConfirm }) {
  // Estado para saber qué método de pago eligió el alumno
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);

  const montoBruto =
    pago?.monto ||
    pago?.precio_final ||
    pago?.preciofinal ||
    pago?.precio ||
    pago?.curso?.precio_final ||
    pago?.grupo?.curso?.precio_final ||
    0;

  const montoAPagar = Number(montoBruto);

  if (isNaN(montoAPagar) || montoAPagar <= 0) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative p-6 text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Precio no configurado
          </h2>
          <p className="text-slate-600 mb-6">
            El curso <strong>{pago?.curso}</strong> no tiene un precio válido
            asignado.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="bg-slate-50 border-b px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-slate-800">
            Completar Matrícula
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 transition p-1 rounded-lg hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Resumen */}
        <div className="px-6 py-4 bg-blue-50/50 shrink-0">
          <p className="text-sm text-slate-500">
            Estás a punto de pagar el curso:
          </p>
          <p
            className="font-semibold text-slate-800 text-lg line-clamp-1"
            title={pago.curso}
          >
            {pago.curso}
          </p>
          <div className="mt-2 flex justify-between items-center border-t border-blue-100 pt-2">
            <span className="text-slate-600 font-medium">Total a pagar:</span>
            <span className="text-2xl font-black text-blue-700">
              S/ {montoAPagar.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Contenido Dinámico con Scroll */}
        <div className="p-6 bg-slate-50 overflow-y-auto">
          {/* Si no ha elegido método, mostramos las opciones */}
          {!metodoSeleccionado ? (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">
                Selecciona un método de pago
              </h3>

              <button
                onClick={() => setMetodoSeleccionado("izipay")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition group text-left"
              >
                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    Tarjeta de Crédito / Débito
                  </p>
                  <p className="text-xs text-slate-500">
                    Pago seguro con Visa, Mastercard, etc.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setMetodoSeleccionado("mercadopago")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:shadow-md transition group text-left"
              >
                <div className="bg-teal-100 text-teal-600 p-3 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition">
                  <Smartphone size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    Yape, Plin o PagoEfectivo
                  </p>
                  <p className="text-xs text-slate-500">
                    Billeteras digitales vía MercadoPago
                  </p>
                </div>
              </button>

              <button
                onClick={() => setMetodoSeleccionado("paypal")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-md transition group text-left"
              >
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                  <Globe size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-800">PayPal</p>
                  <p className="text-xs text-slate-500">
                    Para alumnos internacionales (USD)
                  </p>
                </div>
              </button>
            </div>
          ) : (
            <div className="animate-fade-in">
              <button
                onClick={() => setMetodoSeleccionado(null)}
                className="text-sm text-blue-600 font-medium mb-4 hover:underline flex items-center gap-1"
              >
                ← Cambiar método de pago
              </button>

              {metodoSeleccionado === "izipay" && (
                <PagoIzipay
                  curso_id={pago.id}
                  monto={montoAPagar}
                  onClose={onClose}
                  onSuccess={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                  }}
                />
              )}

              {metodoSeleccionado === "mercadopago" && (
                <div className="text-center p-6 border rounded-xl bg-white border-dashed border-teal-300">
                  <Smartphone className="w-12 h-12 text-teal-300 mx-auto mb-2" />
                  <p className="text-slate-500">
                    Próximamente: Integración con MercadoPago
                  </p>
                </div>
              )}

              {metodoSeleccionado === "paypal" && (
                <div className="text-center p-6 border rounded-xl bg-white border-dashed border-indigo-300">
                  <Globe className="w-12 h-12 text-indigo-300 mx-auto mb-2" />
                  <p className="text-slate-500">
                    Próximamente: Integración con PayPal
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
