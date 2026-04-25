import { useState, useEffect } from "react";
import KRGlue from "@lyracom/embedded-form-glue";
import { generarTokenIzipay } from "../services/pago.service";
import api from "../api";

export default function PagoIzipay({ curso_id, monto, onSuccess, onClose }) {
  const [formToken, setFormToken] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sonido = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg",
  );

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const generarToken = async () => {
    // 1. Validamos que Vite esté leyendo la llave del .env
    const publicKey = import.meta.env.VITE_IZIPAY_PUBLIC_KEY;
    if (!publicKey) {
      setError(
        "Error crítico: No se detectó VITE_IZIPAY_PUBLIC_KEY en el archivo .env. Revisa que el archivo esté en la raíz del proyecto y reinicia Vite.",
      );
      return;
    }

    if (!validarEmail(email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (!monto || Number(monto) <= 0) {
      setError("Error: El monto a cobrar no es válido.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await generarTokenIzipay(curso_id, Number(monto), email);

      if (!data || !data.formToken) {
        throw new Error("El servidor no devolvió un token de pago.");
      }

      setFormToken(data.formToken);
    } catch (err) {
      console.error("Error al generar token:", err);
      const mensaje =
        err.response?.data?.message ||
        err.message ||
        "Error al conectar con la pasarela.";
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!formToken) return;

    const setupIzipay = async () => {
      try {
        const publicKey = import.meta.env.VITE_IZIPAY_PUBLIC_KEY;

        const { KR } = await KRGlue.loadLibrary(
          "https://api.micuentaweb.pe",
          publicKey,
        );

        // Limpiamos cualquier formulario previo antes de crear uno nuevo
        try {
          await KR.removeForms();
        } catch {
          // Ignoramos si no había formularios previos
        }

        await KR.setFormConfig({
          formToken: formToken,
          "kr-language": "es-PE",
          "kr-theme": "classic",
        });

        // Usamos una función real
        KR.onSubmit(async (paymentData) => {
          if (paymentData.clientAnswer.orderStatus === "PAID") {
            sonido.play();

            // Le avisamos manualmente al backend que ya pagó
            try {
              await api.post("/pago/izipay/confirmar", {
                formToken: formToken,
                matricula_id: curso_id,
                preciofinal: monto,
                email: email,
                igv: 0,
                tipopago: "izipay"
              });
            } catch (error) {
              console.error("Error al registrar el pago en la base de datos:", error);
            }

            if (onSuccess) onSuccess(paymentData);
          }
          return false; // Retornamos false para evitar que el iframe recargue la página
        });

        // Renderizamos el formulario
        await KR.renderElements("#myPaymentForm");
      } catch (err) {
        console.error("Error crítico al renderizar Izipay:", err);
        setError("Error al cargar el formulario de pago seguro.");
      }
    };

    setupIzipay();

    // Cuando el componente se cierra, destruimos el formulario
    return () => {
      if (window.KR) {
        window.KR.removeForms().catch(() => {});
      }
    };
  }, [formToken]);

  return (
    <div className="p-4 border rounded-xl shadow-lg bg-white">
      <h3 className="text-lg font-bold mb-3 text-center text-slate-800">
        Pago con Tarjeta - Izipay
      </h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
          {error}
        </div>
      )}

      {!formToken && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Correo para tu comprobante
            </label>
            <input
              type="email"
              className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            onClick={generarToken}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Conectando con Izipay..." : "Continuar al pago"}
          </button>

          <button
            onClick={onClose}
            className="w-full text-slate-500 py-2 hover:text-slate-800 transition"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Contenedor Izipay */}
      <div className={`${!formToken ? "hidden" : "block"} flex justify-center`}>
        <div id="myPaymentForm" className="kr-embedded" kr-theme="classic"></div>
      </div>
    </div>
  );
}
