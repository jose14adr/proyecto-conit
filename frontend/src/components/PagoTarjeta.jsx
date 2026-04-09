import { useEffect } from "react"
import api from "../api"

export default function PagoTarjeta({ curso }) {

  useEffect(() => {
    if (!curso || !window.MercadoPago) return

    const mp = new window.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY)
    const bricksBuilder = mp.bricks()

    bricksBuilder.create("payment", "paymentBrick_container", {
      initialization: {
        amount: Number(curso.monto), // 🔥 ya corregido
      },
      callbacks: {
        onReady: () => {
          console.log("✅ Brick listo")
        },
        onSubmit: async (formData) => {
          try {
            const res = await api.post("/pago/tarjeta", {
              ...formData,
              transaction_amount: Number(curso.monto),
              matricula_id: curso.id,
            })

            if (res.data.status === "approved") {
              alert("Pago exitoso ✅")
            } else {
              alert("Pago pendiente ⏳")
            }

          } catch (error) {
            console.error("Error pago:", error.response?.data)
            alert("Error en el pago ❌")
          }
        },
        onError: (error) => {
          console.error("💥 Error Brick:", error)
        }
      }
    })

  }, [curso])

  return <div id="paymentBrick_container"></div>
}