import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase.client';
import mercadopago from 'mercadopago';
import { MatriculaService } from '../matricula/matricula.service';
import * as nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';

@Injectable()
export class PagoService {

  constructor(private matriculaService: MatriculaService) {}

  // ==============================
  // PAGOS PENDIENTES
  // ==============================
  async getPagosPendientes() {
    const { data, error } = await supabase
      .from('matricula')
      .select(`
        id,
        observacion,
        estado,
        idalumno,
        grupo (
          idcurso,
          curso (
            precio,
            nombrecurso
          )
        )
      `)
      .eq('estado', 'pendiente')
      .eq('idalumno', 1);

    if (error) throw new Error(error.message);

    return (data || []).map((m: any) => ({
      id: m.id,
      descripcion: m.observacion || 'Matrícula pendiente',
      curso: m.grupo?.curso?.nombrecurso || 'Curso',
      monto: m.grupo?.curso?.precio || 0,
      estado: m.estado,
      idalumno: m.idalumno,
    }));
  }

  // ==============================
  // PAGOS REALIZADOS
  // ==============================
async getPagosRealizados() {
  const { data, error } = await supabase
    .from('pago')
    .select(`
      id,
      fechapago,
      igv,
      precioinicial,
      preciofinal,
      preciodescuento,
      tipopago,
      estado,
      matricula (
        id,
        observacion,
        estado,
        idalumno,
        grupo (
          idcurso,
          curso (
            precio,
            nombrecurso
          )
        )
      )
    `)
    .eq('estado', 'pagado')        // Filtra por estado del pago
    .eq('matricula.idalumno', 1);  // Filtra por id del alumno dentro de la relación

  if (error) throw new Error(error.message);

  return data;
}

  // ==============================
  // PAGO MANUAL
  // ==============================
  async realizarPago(id: number) {
    const { data, error } = await supabase
      .from('matricula')
      .update({ estado: 'pagado' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { message: 'Pago realizado correctamente', data };
  }

  // ==============================
  // PAGO CON TARJETA
  // ==============================
  async pagarConTarjeta(data: any) {

    mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });
    console.log("📦 DATA BACKEND:", data);

    // 🔹 Sandbox: simulamos pago aprobado
    if (data.sandbox) {
      const fakePayment = {
        body: { id: Math.floor(Math.random() * 10000000), status: "approved", status_detail: "accredited" }
      };
      await this._guardarPago(data, fakePayment);
      return { id: fakePayment.body.id, status: fakePayment.body.status, status_detail: fakePayment.body.status_detail };
    }

    try {
      const payment = await mercadopago.payment.create({
        transaction_amount: Number(data.preciofinal),
        token: data.token,
        description: 'Pago curso',
        installments: Number(data.installments),
        payment_method_id: data.payment_method_id,
        issuer_id: data.issuer_id,
        payer: { email: data.email, identification: { type: "DNI", number: data.dni } }
      });

      console.log("✅ RESPUESTA MP:", payment.body);
      await this._guardarPago(data, payment);

      return {
        id: payment.body.id,
        status: payment.body.status,
        status_detail: payment.body.status_detail
      };

    } catch (error) {
      console.error("💥 ERROR GENERAL:", error);
      throw error;
    }
  }

  // 🔹 Método privado para guardar pago + PDF + correo
  private async _guardarPago(data: any, payment: any) {
    let estado = payment.body.status === "approved" ? "pagado" : "rechazado";

    const { error: errorPago } = await supabase
      .from('pago')
      .insert([{
        fechapago: new Date(),
        precioinicial: data.precioinicial,
        preciodescuento: data.preciodescuento,
        preciofinal: data.preciofinal,
        igv: data.igv,
        tipopago: data.tipopago,
        estado,
        matricula_id: data.matricula_id,
        idpagodoc: payment.body.id,
        idtipocomprobante: 1,
        status_detail: payment.body.status_detail || null
      }]);

    if (errorPago) throw new Error(errorPago.message);

    if (estado === "pagado") {
      await supabase.from('matricula')
        .update({ estado: 'pagado' })
        .eq('id', data.matricula_id);

      const pdfPath = await this.generarPDF(data, payment);
      await this.enviarCorreo(data.email, data, pdfPath);
    }
  }

  // ==============================
  // WEBHOOK
  // ==============================
  async procesarWebhook(body: any) {
    console.log("📩 WEBHOOK:", body);

    if (body.type === "payment") {
      const paymentId = body.data.id;
      const payment = await mercadopago.payment.findById(paymentId);
      const estadoMP = payment.body.status;
      let estado = "pendiente";
      if (estadoMP === "approved") estado = "pagado";
      if (estadoMP === "rejected") estado = "rechazado";

      await supabase
        .from('pago')
        .update({ estado, status_detail: payment.body.status_detail })
        .eq('idpagodoc', paymentId);

      console.log("✅ WEBHOOK actualizado:", estado);
    }

    return { received: true };
  }

  // ==============================
  // CORREO
  // ==============================
  async enviarCorreo(email: string, detalle: any, pdfPath: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '✅ Pago confirmado',
      html: `<h2>Pago exitoso</h2><p>Monto: S/ ${detalle.preciofinal}</p>`,
      attachments: [{ filename: 'boleta.pdf', path: pdfPath }]
    });
  }

  // ==============================
  // PDF
  // ==============================
  async generarPDF(data: any, payment: any) {
    const filePath = `boleta-${payment.body.id}.pdf`;
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(18).text('BOLETA ELECTRÓNICA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Código: ${payment.body.id}`);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`);
    doc.text(`Cliente: ${data.email}`);
    doc.text(`Monto: S/ ${data.preciofinal}`);
    doc.moveDown();
    doc.text('Gracias por su compra', { align: 'center' });
    doc.end();
    return filePath;
  }
}