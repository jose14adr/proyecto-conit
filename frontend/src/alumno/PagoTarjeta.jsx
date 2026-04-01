import { useEffect, useState } from "react"
import axios from "axios"

export default function PagoTarjeta({ curso_id }) {

  const [cardForm, setCardForm] = useState(null)

  useEffect(() => {

    const mp = new window.MercadoPago("TU_PUBLIC_KEY", {
      locale: "es-PE"
    })

    const form = mp.cardForm({
      amount: "50",
      autoMount: true,
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
        onSubmit: async (event) => {
          event.preventDefault()

          const data = form.getCardFormData()

          await procesarPago(data)
        }
      }
    })

    setCardForm(form)

  }, [])

  async function procesarPago(data) {

    const resMatricula = await axios.post(
      "http://localhost:3000/matricula",
      {
        alumno_id: 1,
        curso_id,
        precio: 50
      }
    )

    const matricula = resMatricula.data

    const res = await axios.post(
      "http://localhost:3000/pagos/mercadopago/card",
      {
        token: data.token,
        issuer_id: data.issuerId,
        payment_method_id: data.paymentMethodId,
        installments: data.installments,
        email: data.cardholderEmail,
        matricula_id: matricula.id
      }
    )

    if(res.data.status === "approved"){
      alert("✅ Pago aprobado")
    } else {
      alert("❌ Pago rechazado")
    }

  }

  return (
    <form id="form-checkout">
      <input id="cardNumber" placeholder="Número de tarjeta"/>
      <input id="expirationDate" placeholder="MM/YY"/>
      <input id="securityCode" placeholder="CVV"/>
      <input id="cardholderName" placeholder="Nombre"/>
      <select id="issuer"></select>
      <select id="installments"></select>
      <select id="identificationType"></select>
      <input id="identificationNumber" placeholder="DNI"/>
      <input id="email" placeholder="Email"/>

      <button type="submit">💳 Pagar</button>
    </form>
  )
}
