import { useState } from "react"
import PagoTarjeta from "./PagoTarjeta"
import PagoQR from "./PagoQR"
import PagoYape from "./PagoYape"
import WalletBrickPago from "./WalletBrickPago"
import Swal from "sweetalert2"

export default function Checkout({ curso, onClose, onSuccess  }) {

  const [metodo, setMetodo] = useState("tarjeta")
  
  return (
    <div>

      <h2 className="mb-4 font-bold text-lg">
        Pagar {curso?.curso}
      </h2>

      {/* 🔥 TABS */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMetodo("tarjeta")}
          className={metodo === "tarjeta" ? "bg-blue-600 text-white px-3 py-1 rounded" : "bg-gray-200 px-3 py-1 rounded"}
        >
          💳 Tarjeta
        </button>

        <button
          onClick={() => setMetodo("yape")}
          className={metodo === "yape" ? "bg-green-600 text-white px-3 py-1 rounded" : "bg-gray-200 px-3 py-1 rounded"}
        >
          🧾 YAPE
        </button>

        <button
          onClick={() => setMetodo("qr")}
          className={metodo === "qr" ? "bg-green-600 text-white px-3 py-1 rounded" : "bg-gray-200 px-3 py-1 rounded"}
        >
          🧾 QR
        </button>
      </div>

      {/* 💳 TARJETA */}
      {metodo === "tarjeta" && (
        <PagoTarjeta
          curso={curso}
          onSuccess={(data) => {
            Swal.fire({
              icon: "success",
              title: "Pago exitoso 🎉",
              text: "Tu matrícula fue confirmada",
              confirmButtonColor: "#2563eb",
              timer: 2000,
              showConfirmButton: false
            })

            if (onSuccess) onSuccess(data)

            onClose()
          }}
        />
      )}

      {/* 📱 YAPE (Mercado Pago Wallet) */}
      {metodo === "yape" && (
        <PagoYape
          curso={curso}
          onSuccess={(data) => {
            if (onSuccess) onSuccess(data)
            onClose()
          }}
        />
      )}

      {/* 🧾 QR (Yape manual o respaldo) */}
      {metodo === "qr" && (
        <PagoQR curso={curso} />
      )}

    </div>
  )
}