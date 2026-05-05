import { useEffect, useState } from "react"
import { initMercadoPago } from "@mercadopago/sdk-react"

export default function PagoYape({ curso, onSuccess }) {

  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    initMercadoPago("APP_USR-3b49dcdb-cc90-413a-95f6-8bdf84e41236") // 🔥 SOLO UNA VEZ EN TODA TU APP
  }, [])

  const pagar = async () => {
    setLoading(true)

    try {
      const mp = new window.MercadoPago("APP_USR-3b49dcdb-cc90-413a-95f6-8bdf84e41236")

      const yape = mp.yape({
        otp,
        phoneNumber: phone
      })

      const { id: token } = await yape.create()

      console.log("🧾 TOKEN YAPE:", token)

      const res = await fetch("http://localhost:3000/pago/yape-mp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          transaction_amount: curso.monto,
          description: curso.curso,
          installments: 1,
          payer: {
            email: "test@test.com"
          },
          matricula_id: curso.id
        })
      })

      const data = await res.json()

      if (data.status === "approved") {
        alert("✅ Pago con Yape exitoso")
        onSuccess && onSuccess(data)
      } else {
        alert("❌ Pago rechazado")
      }

    } catch (error) {
      console.error(error)
      alert("Error en Yape")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <input
        placeholder="Celular Yape"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 w-full"
      />

      <input
        placeholder="Código OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="border p-2 w-full"
      />

      <button
        onClick={pagar}
        className="bg-purple-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Procesando..." : "Pagar con Yape"}
      </button>
    </div>
  )
}