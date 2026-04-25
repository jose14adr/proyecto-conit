import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { useEffect, useState } from 'react'

export default function WalletBrickPago({ curso }) {

  const [preferenceId, setPreferenceId] = useState(null)

  useEffect(() => {
    initMercadoPago("APP_USR-3b49dcdb-cc90-413a-95f6-8bdf84e41236", {
      locale: "es-PE"
    })

    crearPreferencia()
  }, [])

  const crearPreferencia = async () => {
    const res = await fetch("http://localhost:3000/pago/preferencia", {
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

  return (
    <div>
      <h3>Pagar con Yape / Mercado Pago</h3>

      {preferenceId && (
        <Wallet
          initialization={{
            preferenceId: preferenceId
          }}
          customization={{
            texts: {
              valueProp: 'smart_option'
            }
          }}
        />
      )}
    </div>
  )
}