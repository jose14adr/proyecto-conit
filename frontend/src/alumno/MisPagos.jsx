import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import PagoModal from "../components/PagosModal";
import PagoTarjeta from "./PagoTarjeta";
import Checkout from "./Checkout";

const generarCodigoBoleta = () => {
  const random = Math.floor(Math.random() * 10000);
  return `BOL-2026-${random}`;
};

export default function MisPagos() {
  const [activeTab, setActiveTab] = useState("pendientes");
  const [selectedPago, setSelectedPago] = useState(null);

  const [pagosPendientes, setPagosPendientes] = useState([]);

  const [pagosRealizados, setPagosRealizados] = useState([
    {
      id: 3,
      fecha: "10/02/2026",
      descripcion: "Matrícula 2025-II",
      curso: "Programación I",
      monto: 300,
      codigo: "BOL-2025-0001",
    },
  ]);

  const recargarPagos = async () => {
  const [pend, real] = await Promise.all([
    fetch("http://localhost:3000/pago/pendientes").then(r => r.json()),
    fetch("http://localhost:3000/pago/realizados").then(r => r.json())
  ])

  setPagosPendientes(pend)
  setPagosRealizados(real)
}

  useEffect(() => {
    const cargarPagos = async () => {
      try {
        const [resPendientes, resRealizados] = await Promise.all([
          fetch("http://localhost:3000/pago/pendientes"),
          fetch("http://localhost:3000/pago/realizados"),
        ]);

        if (!resPendientes.ok) {
          throw new Error("No se pudieron cargar los pagos pendientes");
        }

        if (!resRealizados.ok) {
          throw new Error("No se pudieron cargar los pagos realizados");
        }

        const dataPendientes = await resPendientes.json();
        const dataRealizados = await resRealizados.json();

        setPagosPendientes(dataPendientes || []);
        setPagosRealizados(dataRealizados || []);
      } catch (error) {
        console.error("Error cargando pagos:", error);
      }
    };

    cargarPagos();
  }, []);


  const confirmarPago = async () => {
    if (!selectedPago) return;

    try {
      const res = await fetch(
        `http://localhost:3000/pago/pagar/${selectedPago.id}`,
        {
          method: "PATCH",
        },
      );

      if (!res.ok) {
        throw new Error("No se pudo registrar el pago");
      }

      const fechaActual = new Date().toLocaleDateString();
      const codigoBoleta = generarCodigoBoleta();

      const nuevoPago = {
        ...selectedPago,
        fecha: fechaActual,
        codigo: codigoBoleta,
      };

      setPagosRealizados((prev) => [...prev, nuevoPago]);

      setPagosPendientes((prev) =>
        prev.filter((p) => p.id !== selectedPago.id),
      );

      setSelectedPago(null);

      generarBoleta(nuevoPago);
    } catch (error) {
      console.error("Error al realizar pago:", error);
      alert("No se pudo realizar el pago");
    }
  };

  const generarBoleta = async (pago) => {
    const doc = new jsPDF();

    // ✅ NORMALIZAR DATOS (CLAVE 🔑)
    const curso = pago.matricula?.grupo?.curso?.nombrecurso || "Curso no definido";
    const monto = pago.preciofinal || pago.monto || 0;
    const fecha = pago.fechapago || pago.fecha || new Date().toLocaleDateString();
    const alumno = pago.alumno || "Alumno";
    const dni = pago.dni || "-";
    const codigo = pago.codigo || `BOL-2026-${Math.floor(Math.random() * 10000)}`;

    // ✅ TEXTO EN LETRAS (básico pero funcional)
    const montoTexto = `${monto} CON 00/100 SOLES`;

    // ✅ QR DATA (YA SIN UNDEFINED 💥)
    const qrData = `
  SISTEMA UNIVERSITARIO
  Código: ${codigo}
  Fecha: ${fecha}
  Curso: ${curso}
  Monto: S/ ${monto}
  Estado: PAGADO
  `;

    const qrImage = await QRCode.toDataURL(qrData);

    // LOGO
    const logo = "/logo.png";
    doc.addImage(logo, "PNG", 20, 10, 45, 20);

    // CABECERA
    doc.rect(140, 10, 50, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    doc.text("RUC: 20610017828", 165, 15, null, null, "center");
    doc.text("BOLETA", 165, 20, null, null, "center");
    doc.text("ELECTRÓNICA", 165, 25, null, null, "center");
    doc.text(codigo, 165, 30, null, null, "center");

    doc.line(20, 35, 190, 35);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // CLIENTE
    doc.text(`SEÑOR(ES): ${alumno}`, 20, 40);
    doc.text(`DNI: ${dni}`, 20, 48);
    doc.text(`FECHA: ${fecha}`, 20, 56);
    doc.text(`CURSO: ${curso}`, 20, 64);
    doc.text(`MONEDA: SOLES`, 20, 72);

    doc.line(20, 78, 190, 78);

    // TABLA
    doc.setFont("helvetica", "bold");
    doc.text("CANT.", 20, 88);
    doc.text("DESCRIPCIÓN", 45, 88);
    doc.text("P. UNIT.", 130, 88);
    doc.text("IMPORTE", 170, 88);

    doc.setFont("helvetica", "normal");
    doc.line(20, 92, 190, 92);

    doc.text("1.00", 20, 102);
    doc.text(curso, 45, 102);
    doc.text(`S/ ${monto}`, 130, 102);
    doc.text(`S/ ${monto}`, 170, 102);

    doc.line(20, 110, 190, 110);

    // TOTALES
    doc.rect(120, 120, 70, 25);

    doc.text("Total:", 125, 130);
    doc.text(`S/ ${monto}`, 185, 130, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text("IMPORTE TOTAL:", 125, 140);
    doc.text(`S/ ${monto}`, 185, 140, { align: "right" });

    // MONTO EN LETRAS
    doc.setFont("helvetica", "normal");
    doc.text(`SON: ${montoTexto}`, 20, 135);

    // QR
    doc.addImage(qrImage, "PNG", 85, 160, 35, 35);

    doc.text("SON: TRESCIENTOS CON 00/100 SOLES", 20, 134);

    doc.setFontSize(10);

    doc.text(
      "Este comprobante ha sido generado automáticamente por el Sistema Universitario.",
      40,
      215,
    );

    doc.text("Para validar la autenticidad escanee el código QR.", 65, 230);

    doc.line(20, 275, 190, 275);

    doc.setFontSize(8);

    doc.text(
      "Representación impresa de la Boleta de Venta Electrónica",
      105,
      280,
      { align: "center" },
    );

    doc.line(20, 150, 190, 150);

    // FOOTER
    doc.setFontSize(9);
    doc.text(
      "Este comprobante ha sido generado automáticamente.",
      105,
      210,
      null,
      null,
      "center",
    );

    doc.text(
      "Valide escaneando el código QR.",
      105,
      220,
      null,
      null,
      "center"
    );

    doc.line(20, 270, 190, 270);

    doc.setFontSize(8);
    doc.text(
      "Representación impresa del Comprobante de Pago",
      105,
      275,
      { align: "center" }
    );

    doc.save(`Boleta_${codigo}.pdf`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Mis Pagos</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("pendientes")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "pendientes"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Pagos Pendientes
        </button>

        <button
          onClick={() => setActiveTab("realizados")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "realizados"
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Pagos Realizados
        </button>
      </div>

      {activeTab === "pendientes" && (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Descripción</th>
                <th className="p-3 text-left">Curso</th>
                <th className="p-3 text-left">Monto</th>
                <th className="p-3 text-left">Acción</th>
              </tr>
            </thead>

            <tbody>
              {pagosPendientes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No hay pagos pendientes
                  </td>
                </tr>
              ) : (
                pagosPendientes.map((pago) => (
                  <tr key={pago.id} className="border-t">
                    <td className="p-3">{pago.descripcion}</td>
                    <td className="p-3">{pago.curso}</td>
                    <td className="p-3">S/ {pago.monto}</td>

                    <td className="p-3">
                      <button
                        onClick={() => setSelectedPago(pago)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                      >
                        Realizar Pago
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "realizados" && (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Código</th>
                <th className="p-3 text-left">Curso</th>
                <th className="p-3 text-left">Monto</th>
                <th className="p-3 text-left">Descargar</th>
              </tr>
            </thead>

            <tbody>
              {pagosRealizados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No hay pagos realizados
                  </td>
                </tr>
              ) : (
                pagosRealizados.map((pago) => (
                  <tr key={pago.id} className="border-t">
                    <td className="p-3">{pago.fechapago}</td>
                    <td className="p-3">{pago.estado}</td>
                    <td className="p-3">
                      {pago.matricula?.grupo?.curso?.nombrecurso}
                    </td>
                    <td className="p-3">S/ {pago.preciofinal}</td>
                    <td className="p-3">
                      <button
                        onClick={() => generarBoleta(pago)}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                      >
                        Descargar PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedPago && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-[420px] shadow-xl">

            <Checkout
              curso={selectedPago}
              onClose={() => setSelectedPago(null)}
              onSuccess={async() => {

                alert("Pago exitoso ✅")

                // 🔄 recargar listas
                /*fetch("http://localhost:3000/pago/realizados")
                  .then(res => res.json())
                  .then(data => setPagosRealizados(data))

                fetch("http://localhost:3000/pago/pendientes")
                  .then(res => res.json())
                  .then(data => setPagosPendientes(data))*/
                await recargarPagos()
                setSelectedPago(null)
              }}
            />

            <button
              onClick={() => setSelectedPago(null)}
              className="mt-4 w-full bg-gray-300 py-2 rounded"
            >
              Cancelar
            </button>

          </div>

        </div>
      )}

        <PagoModal
          pago={selectedPago}
          onClose={() => setSelectedPago(null)}
          onConfirm={() => {
            // Aquí recargamos la lista de pagos cuando Izipay termine con éxito
            setSelectedPago(null);
            window.location.reload();
          }}
        />
    
    </div>
  );
}
