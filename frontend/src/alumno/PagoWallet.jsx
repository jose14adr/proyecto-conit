import { useEffect, useState } from "react"

export default function PagoWallet({ curso, onSuccess }) {

  const [preferenceId, setPreferenceId] = useState(null)

  useEffect(() => {

    const init = async () => {

      const res = await fetch("http://localhost:3000/pago/preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: curso.curso,
          preciofinal: curso.monto,
          matricula_id: curso.id,
          email: "test@email.com"
        })
      })

      const data = await res.json()
      setPreferenceId(data.preferenceId)
    }

    init()
  }, [curso])

  useEffect(() => {

    if (!preferenceId || !window.MercadoPago) return

    const mp = new window.MercadoPago(
      import.meta.env.VITE_MP_PUBLIC_KEY
    )

    const bricksBuilder = mp.bricks()

    let controller

    const renderBrick = async () => {

      controller = await bricksBuilder.create(
        "wallet",
        "walletBrick_container",
        {
          initialization: {
            preferenceId: preferenceId,
          },

          callbacks: {
            onReady: () => {
              console.log("✅ Wallet listo")
            },

            onSubmit: () => {
              console.log("💳 Procesando pago...")
            },

            onError: (error) => {
              console.error("💥 Error Wallet:", error)
            }
          }
        }
      )
    }

    renderBrick()

    return () => {
      if (controller) controller.unmount()
    }

  }, [preferenceId])

  return (
    <div className="mt-4">
      <div id="walletBrick_container"></div>
    </div>
  )
}