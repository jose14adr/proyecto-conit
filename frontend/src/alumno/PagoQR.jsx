import { useState } from "react"

export default function PagoQR({ curso, onClose }) {

  const [file, setFile] = useState(null)

  const enviarComprobante = async () => {
    if (!file) {
      alert("Sube tu comprobante")
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("matricula_id", curso.id)

    await fetch("http://localhost:3000/pago/yape", {
      method: "POST",
      body: formData
    })

    alert("Pago enviado ✅")
    onClose()
  }

  return (
    <div className="text-center mt-6">

      <p className="mb-4 font-semibold">
        Escanea y paga con Yape
      </p>

      <img
        src="/qr-yape.jpeg"
        alt="QR Yape"
        className="mx-auto w-64 rounded-xl shadow-lg"
      />

      <p className="mt-3">
        Monto: <strong>S/ {curso.monto}</strong>
      </p>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mt-4"
      />

      <button
        onClick={enviarComprobante}
        className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg"
      >
        Enviar comprobante
      </button>

    </div>
  )
}