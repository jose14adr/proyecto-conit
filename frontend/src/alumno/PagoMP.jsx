import { useEffect } from "react"
import { initMercadoPago, Payment } from "@mercadopago/sdk-react"

export default function PagoMP({ curso }) {

  useEffect(() => {
    initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY)
  }, [])

  const initialization = {
    amount: curso.monto,
  }

  const onSubmit = async ({ selectedPaymentMethod, formData }) => {
    try {
      const res = await fetch("http://localhost:3000/pago/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          metodo: selectedPaymentMethod,
          curso_id: curso.id
        }),
      })

      const data = await res.json()

      if (data.status === "approved") {
        alert("Pago aprobado ✅")
      }

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="mt-4">
      <Payment
        initialization={initialization}
        onSubmit={onSubmit}
      />
    </div>
  )
}