import { useState } from "react";

export default function PagoPaypal({ curso_id }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const pagar = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/pago/paypal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          matricula_id: curso_id,
          precioinicial: 50,
          preciodescuento: 0,
          preciofinal: 50,
          igv: 9,
          tipopago: "paypal"
        })
      });

      const result = await res.json();

      if (result.status === "pagado") {
        alert("✅ Pago PayPal exitoso");
      } else {
        alert("❌ Error en pago PayPal");
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        placeholder="Correo PayPal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={pagar}>
        {loading ? "Procesando..." : "Pagar con PayPal"}
      </button>
    </div>
  );
}