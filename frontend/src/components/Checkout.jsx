import { useState } from "react"
import PagoTarjeta from "./PagoTarjeta"
import PagoIzipay from "./PagoIzipay"
import PagoPaypal from "./PagoPaypal"

export default function Checkout({ curso, onClose }) {

  const [metodo, setMetodo] = useState("")

  return (
    <div>
      <h2 className="mb-3 font-bold">Elige tu método de pago</h2>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setMetodo("tarjeta")}>💳 Tarjeta</button>
        <button onClick={() => setMetodo("yape")}>📱 Yape</button>
        <button onClick={() => setMetodo("paypal")}>🌎 PayPal</button>
      </div>

      {/* 🔥 Render dinámico */}
      {metodo === "tarjeta" && (
        <PagoTarjeta curso={curso} onClose={onClose} />
      )}

      {metodo === "yape" && (
        <PagoIzipay curso={curso} onClose={onClose} />
      )}

      {metodo === "paypal" && (
        <PagoPaypal curso={curso} onClose={onClose} />
      )}
    </div>
  )
}