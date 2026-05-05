/*import { useEffect, useState } from "react"

export default function PagoTarjeta({ curso, onSuccess }) {

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!window.MercadoPago || !curso) return

    const mp = new window.MercadoPago(
      import.meta.env.VITE_MP_PUBLIC_KEY
    )

    const bricks = mp.bricks()

    let controller

    const renderBrick = async () => {
      controller = await bricks.create("payment", "paymentBrick_container", {

        initialization: {
          amount: Number(curso.monto),
          payer: {
            email: "kdaniela.paredes.11@gmail.com",
          },
        },

        customization: {
          paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            ticket: "none",
          },
        },

        callbacks: {

          // ✅ OBLIGATORIO (evita error del SDK)
          onReady: () => {
            console.log("✅ Brick listo")
          },

          onSubmit: async (formData) => {

            if (loading) return
            setLoading(true)

            try {

              console.log("🔥 FORM DATA COMPLETO:", formData)

              // ✅ EXTRAER TOKEN CORRECTAMENTE (TODOS LOS CASOS)
              const token =
                formData.token ||
                formData.formData?.token ||
                formData.payment_method_data?.token

              const payment_method_id =
                formData.payment_method_id ||
                formData.formData?.payment_method_id ||
                formData.payment_method_data?.payment_method_id

              const issuer_id =
                formData.issuer_id ||
                formData.formData?.issuer_id ||
                formData.payment_method_data?.issuer_id

              // 🚨 VALIDACIÓN CLAVE
              if (!token || !payment_method_id) {
                console.error("❌ TOKEN O METHOD ID FALTANTE:", formData)
                alert("Error: no se pudo procesar la tarjeta")
                return
              }

              // ✅ PAYLOAD CORRECTO
              const payload = {
                token,
                payment_method_id,
                issuer_id: issuer_id || null,
                installments: Number(formData.installments || 1),
                transaction_amount: Number(curso.monto),
                description: curso.curso,
                payer: {
                  email: "kdaniela.paredes.11@gmail.com",
                },
                matricula_id: curso.id,
              }

              console.log("📦 PAYLOAD FINAL:", payload)

              const res = await fetch("http://localhost:3000/pago/mercadopago/card", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              })

              const data = await res.json()

              console.log("✅ RESPUESTA BACKEND:", data)

              if (data.status === "approved") {
                if (onSuccess) onSuccess(data)
              } else {
                throw new Error("Pago no aprobado")
              }

            } catch (error) {
              console.error("💥 ERROR PAGO:", error)
              alert("❌ Error al procesar el pago")
            } finally {
              setLoading(false)
            }
          },

          // ✅ OBLIGATORIO
          onError: (error) => {
            console.error("💥 Error Brick:", error)
          },
        },
      })
    }

    renderBrick()

    // 🧹 LIMPIEZA
    return () => {
      if (controller) controller.unmount()
    }

  }, [curso])

  return (
    <div className="mt-4">

      <div id="paymentBrick_container"></div>

      {loading && (
        <div className="text-center mt-4 text-blue-600 font-semibold">
          Procesando pago...
        </div>
      )}

    </div>
  )
}*/
import { useEffect, useState, useRef } from "react"

export default function PagoTarjeta({ curso, onSuccess }) {

  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")

  const emailRef = useRef("")

  useEffect(() => {
    emailRef.current = email
  }, [email])

  useEffect(() => {

    if (!window.MercadoPago || !curso) return

    const mp = new window.MercadoPago(
      import.meta.env.VITE_MP_PUBLIC_KEY // 🔥 PRODUCCIÓN
    )

    const bricksBuilder = mp.bricks()
    let controller

    const renderBrick = async () => {

      controller = await bricksBuilder.create(
        "payment",
        "paymentBrick_container",
        {
          initialization: {
            amount: Number(curso.monto)
          },

          customization: {
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
              ticket: "none"
            }
          },

          callbacks: {

            onReady: () => {
              console.log("✅ Brick listo")
            },

            onSubmit: async (formData) => {

              const token = formData?.token || formData?.formData?.token
              const emailFinal = emailRef.current

              console.log("🟡 TOKEN:", token)
              console.log("📧 EMAIL:", emailFinal)
              console.log("💳 installments:", formData.installments)
              console.log("🟡 FORMDATA:", formData)

              if (loading) return
              setLoading(true)

              try {

                if (!emailFinal) {
                  alert("❌ Ingresa tu correo")
                  setLoading(false)
                  return
                }

                if (!token) {
                  alert("❌ No se generó token")
                  setLoading(false)
                  return
                }

                const payload = {
                  token: token,

                  payment_method_id: formData.payment_method_id,
                  issuer_id: formData.issuer_id || null,
                  installments: Number(formData.installments) || 1,

                  transaction_amount: Number(curso.monto),
                  description: curso.descripcion,

                  payer: {
                    email: emailFinal
                  },

                  matricula_id: curso.id
                }

                if (formData.issuer_id) {
                  payload.issuer_id = formData.issuer_id
                }

                console.log("📦 PAYLOAD:", payload)

                const res = await fetch("http://localhost:3000/pago/mercadopago/card", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(payload),
                })

                const data = await res.json()
                console.log("🟢 RESPUESTA BACKEND:", data)

                if (data.status === "approved") {
                  alert("✅ Pago aprobado")
                  if (onSuccess) onSuccess(data)
                } else {
                  alert(`❌ Pago rechazado: ${data.status_detail}`)
                }

              } catch (error) {
                console.error(error)
                alert("❌ Error en el pago")
              } finally {
                setLoading(false)
              }
            },

            onError: (error) => {
              console.error("💥 Error Brick:", error)
            }
          }
        }
      )
    }

    renderBrick()

    return () => {
      if (controller) controller.unmount()
    }

  }, [curso])

  return (
    <div className="mt-4">

      {/* EMAIL */}
      <input
        type="email"
        placeholder="Ingresa tu correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />

      {/* BRICK */}
      <div id="paymentBrick_container"></div>

      {loading && (
        <div className="text-center mt-4 text-blue-600 font-semibold">
          Procesando pago...
        </div>
      )}
    </div>
  )
}