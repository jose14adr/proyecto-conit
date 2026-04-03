import { useState, useEffect } from "react";

export default function PagoIzipay({ curso_id, onClose }) {

  const [formToken, setFormToken] = useState(null);
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState("idle"); 
  const [tiempo, setTiempo] = useState(120);
  const [loading, setLoading] = useState(false);

  const sonido = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // =============================
  // GENERAR PAGO
  // =============================
  const generarQR = async () => {

    if (!validarEmail(email)) {
      alert("Correo inválido");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/pago/izipay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          matricula_id: curso_id,
          preciofinal: 50,
          email
        })
      });

      const data = await res.json();

      setFormToken(data.formToken);
      setEstado("esperando");

    } catch (error) {
      console.error(error);
      setEstado("error");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // INICIALIZAR IZIPAY
  // =============================
  useEffect(() => {

    if (!formToken || !window.Kr) return;

    try {
      window.Kr.setFormConfig({
        formToken: formToken,
        publicKey: import.meta.env.VITE_IZIPAY_PUBLIC_KEY,
        language: "es-ES"
      });

      window.Kr.renderElements("#izipay-container");


    } catch (err) {
      console.error("Error Izipay:", err);
      setEstado("error");
    }

  }, [formToken]);

  useEffect(() => {
  if (!formToken || estado !== "esperando") return;

  const interval = setInterval(async () => {
    try {
      const res = await fetch("http://localhost:3000/pago/estado", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          matricula_id: curso_id
        })
      });

      const result = await res.json();

      if (result.status === "pagado") {
        setEstado("pagado");
        sonido.play();
        clearInterval(interval);

        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      }

    } catch (error) {
      console.error(error);
    }
  }, 3000);

  return () => clearInterval(interval);

}, [formToken, estado]);

  // =============================
  // COUNTDOWN
  // =============================
  useEffect(() => {
    if (estado !== "esperando") return;

    const timer = setInterval(() => {
      setTiempo((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setEstado("error");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [estado]);

  const reset = () => {
    setFormToken(null);
    setEstado("idle");
    setTiempo(120);
  };

  return (
    <div className="p-4 border rounded-xl shadow-lg text-center">

      <h3 className="text-lg font-bold mb-3">📱 Pago con Yape</h3>

      {!formToken && (
        <>
          <input
            className="w-full border p-2 rounded mb-3"
            placeholder="Tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={generarQR}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg"
          >
            {loading ? "Generando..." : "Pagar con Yape"}
          </button>
        </>
      )}

      {formToken && (
        <div className="mt-4">

          <div id="izipay-container"></div>

          {estado === "esperando" && (
            <>
              <p className="text-blue-600 mt-3">Esperando pago...</p>
              <p className="text-sm text-gray-500">⏳ {tiempo}s</p>
            </>
          )}

          {estado === "pagado" && (
            <p className="text-green-600 text-xl font-bold mt-4">
              ✅ Pago exitoso
            </p>
          )}

          {estado === "error" && (
            <>
              <p className="text-red-600 mt-4">❌ Tiempo agotado</p>
              <button onClick={reset} className="mt-2 bg-gray-300 px-3 py-1 rounded">
                Intentar nuevamente
              </button>
            </>
          )}

        </div>
      )}

    </div>
  );
}