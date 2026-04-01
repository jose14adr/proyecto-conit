import { useEffect, useState } from "react";
import "./PagoTarjeta.css";

export default function PagoTarjeta({ curso_id, onClose }) {

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.MercadoPago) {
      console.error("❌ MercadoPago no cargó");
      return;
    }

    const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;

    if (!publicKey) {
      console.error("❌ Falta VITE_MP_PUBLIC_KEY");
      return;
    }

    const mp = new window.MercadoPago(publicKey, { locale: "es-PE" });

    let cardForm;

    try {

      cardForm = mp.cardForm({
        amount: "50.00",
        form: {
          id: "form-checkout",
          cardNumber: { id: "cardNumber" },
          expirationDate: { id: "expirationDate" },
          securityCode: { id: "securityCode" },
          cardholderName: { id: "cardholderName" },
          issuer: { id: "issuer" },
          installments: { id: "installments" },
          identificationType: { id: "identificationType" },
          identificationNumber: { id: "identificationNumber" },
          cardholderEmail: { id: "email" }
        },
        callbacks: {
          onFormMounted: (error) => {
            if (error) console.error(error);
          },

          onSubmit: async (event) => {
            event.preventDefault();
            if (loading) return;
            setLoading(true);

            try {
              const data = cardForm.getCardFormData();

              // 🔹 En sandbox, usar cualquier número de prueba
              const res = await fetch("http://localhost:3000/pago/mercadopago/card", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  token: data.token,
                  issuer_id: data.issuerId,
                  payment_method_id: data.paymentMethodId,
                  installments: Number(data.installments),
                  email: data.cardholderEmail,
                  dni: data.identificationNumber,
                  matricula_id: curso_id,
                  precioinicial: 50,
                  preciodescuento: 0,
                  preciofinal: 50,
                  igv: 9,
                  tipopago: "tarjeta",
                  sandbox: true // 🔹 Flag para backend
                })
              });

              const result = await res.json();
              console.log("🧾 RESPUESTA:", result);

              if (result.status === "approved") {
                alert("✅ Pago aprobado (sandbox)");
                if (onClose) onClose();
              } else if (result.status === "pending") {
                alert("⏳ Pago pendiente");
              } else {
                const mensajes = {
                  cc_rejected_other_reason: "Tu tarjeta fue rechazada. Verifica fondos o datos.",
                  cc_rejected_insufficient_amount: "Fondos insuficientes.",
                  cc_rejected_call_for_authorize: "Se requiere autorización de tu banco."
                };
                alert(`❌ ${mensajes[result.status_detail] || "Pago rechazado"}`);
              }

            } catch (error) {
              console.error("💥 ERROR FRONT:", error);
            } finally {
              setLoading(false);
            }
          },

          onError: (err) => {
            console.error("🔥 ERROR MP:", err);
          }
        }
      });

    } catch (error) {
      console.error(error);
    }

    return () => { if (cardForm) cardForm.unmount(); };

  }, [curso_id, loading]);

  return (
    <div className="pago-container">
      <h3>Pagar Curso (Sandbox)</h3>
      <form id="form-checkout" className="pago-form">
        <input id="cardNumber" placeholder="Número de tarjeta" />
        <input id="expirationDate" placeholder="MM/YY" />
        <input id="securityCode" placeholder="CVV" />
        <input id="cardholderName" placeholder="Nombre" />
        <select id="issuer"></select>
        <select id="installments"></select>
        <select id="identificationType">
          <option value="DNI">DNI</option>
          <option value="RUC">RUC</option>
        </select>
        <input id="identificationNumber" placeholder="DNI / RUC" />
        <input id="email" placeholder="Correo" required />
        <button type="submit" disabled={loading}>
          {loading ? "Procesando..." : "💳 Pagar (sandbox)"}
        </button>
      </form>
    </div>
  );
}