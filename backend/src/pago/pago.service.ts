import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase.client';
import mercadopago from 'mercadopago';
import { MatriculaService } from '../matricula/matricula.service';
import * as nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import axios from 'axios';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';


@Injectable()
export class PagoService {

  constructor(
    private matriculaService: MatriculaService,
      @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
  ) {}

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
  // PAGO CON MERCADOPAGO
  // ==============================
  async pagarConMercadoPago(data: any) {
    mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });

    const payment = await mercadopago.payment.create({
      transaction_amount: Number(data.preciofinal),
      token: data.token,
      description: 'Pago curso',
      installments: Number(data.installments),
      payment_method_id: data.payment_method_id,
      issuer_id: data.issuer_id,
      payer: { email: data.email, identification: { type: 'DNI', number: data.dni } },
    });

    return this.procesarPagoBackend(data, payment.body, 'mercadopago');
  }

  // ==============================
  // PAGO CON PAYPAL
  // ==============================
  async pagarConPaypal(data: any) {
    // 🌐 Aquí usarías la API de PayPal REST v2
    const res = await axios.post('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: 'PEN', value: String(data.preciofinal) } }],
      payer: { email_address: data.email },
    }, {
      headers: { Authorization: `Bearer ${process.env.PAYPAL_ACCESS_TOKEN}` }
    });

    // Capturar pago inmediatamente (sandbox)
    const orderId = res.data.id;
    const capture = await axios.post(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {}, {
      headers: { Authorization: `Bearer ${process.env.PAYPAL_ACCESS_TOKEN}` }
    });

    const pago = {
      id: capture.data.id,
      status: capture.data.status.toLowerCase(), // APPROVED -> approved
      status_detail: null
    };

    return this.procesarPagoBackend(data, pago, 'paypal');
  }

 
    // ==============================
  // PROCESAR PAGO Y GUARDAR EN SUPABASE
  // ==============================
  private async procesarPagoBackend(data: any, pago: any, metodo: string) {
    const estado = pago.status === 'approved' ? 'pagado' : (pago.status === 'rejected' ? 'rechazado' : 'pendiente');

    const { data: existe } = await supabase
      .from('pago')
      .select('id')
      .eq('idpagodoc', pago.id)
      .maybeSingle();

    if (!existe) {
      await supabase.from('pago').insert([{
        fechapago: new Date(),
        precioinicial: data.precioinicial,
        preciodescuento: data.preciodescuento,
        preciofinal: data.preciofinal,
        igv: data.igv,
        tipopago: metodo,
        estado,
        matricula_id: data.matricula_id,
        idpagodoc: pago.id,
        idtipocomprobante: 1,
        status_detail: pago.status_detail
      }]);
    }

    if (estado === 'pagado') {
      await supabase.from('matricula').update({ estado: 'pagado' }).eq('id', data.matricula_id);
      const pdfPath = await this.generarPDF(data, pago);
      await this.enviarCorreo(data.email, data, pdfPath);
    }

    return { id: pago.id, status: estado, status_detail: pago.status_detail };
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
  // PDF Y CORREO
  // ==============================
  async generarPDF(data: any, payment: any) {
    const filePath = `boleta-${payment.id}.pdf`;
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(18).text('BOLETA ELECTRÓNICA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Código: ${payment.id}`);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`);
    doc.text(`Cliente: ${data.email}`);
    doc.text(`Monto: S/ ${data.preciofinal}`);
    doc.moveDown();
    doc.text('Gracias por su compra', { align: 'center' });
    doc.end();
    return filePath;
  }

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
  // PAGO CON IZIPAY
  // ==============================
  async pagarConIzipay(data: any) {

  if (!process.env.IZIPAY_USER || !process.env.IZIPAY_PASSWORD) {
    throw new Error("❌ Credenciales Izipay no configuradas");
  }

  const res = await axios.post(
    "https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment",
    {
      amount: data.preciofinal * 100,
      currency: "PEN",
      orderId: data.matricula_id.toString(), // 🔥 IMPORTANTE
      customer: {
        email: data.email
      }
    },
    {
      headers: {
        Authorization: "Basic " + Buffer.from(
          `${process.env.IZIPAY_USER}:${process.env.IZIPAY_PASSWORD}`
        ).toString("base64"),
        "Content-Type": "application/json"
      }
    }
  );

  return {
    status: "pending",
    formToken: res.data.answer?.formToken
  };
}

  async confirmarPagoIzipay(formToken: string, data: any) {

  const res = await axios.post(
    "https://api.micuentaweb.pe/api-payment/V4/Charge/GetPaymentDetails",
    { formToken },
    {
      headers: {
        Authorization: "Basic " + Buffer.from(
          `${process.env.IZIPAY_USER}:${process.env.IZIPAY_PASSWORD}`
        ).toString("base64"),
        "Content-Type": "application/json"
      }
    }
  );

  const estado = res.data.answer?.orderStatus;

  if (estado === "PAID") {
    return this.procesarPagoBackend(
      data,
      { id: Date.now(), status: "approved", status_detail: "accredited" },
      "izipay"
    );
  }

  return { status: "pending" };
}


  async procesarWebhookIzipay(body: any) {

    console.log("📩 WEBHOOK RAW:", body);

    const hashRecibido = body['kr-hash'];
    const claveSecreta = process.env.IZIPAY_HMAC_SHA256;

    if (!claveSecreta) {
  throw new Error("❌ Falta IZIPAY_HMAC_SHA256 en .env");
}

    // 🔐 1. Construir string para firma
    const data = Object.keys(body)
      .filter(key => key.startsWith('kr-') && key !== 'kr-hash')
      .sort()
      .map(key => `${key}=${body[key]}`)
      .join('&');

    // 🔐 2. Generar hash local
    const hashCalculado = crypto
      .createHmac('sha256', claveSecreta)
      .update(data)
      .digest('hex');

    // 🔐 3. Validar firma
    if (hashCalculado !== hashRecibido) {
      console.error("❌ FIRMA INVÁLIDA");
      throw new Error("Firma inválida");
    }

    console.log("✅ FIRMA VÁLIDA");

    // ============================
    // 📊 DATOS IMPORTANTES
    // ============================
    const estado = body['kr-answer-orderStatus']; // PAID / REFUSED
    const orderId = body['kr-answer-orderDetails-orderId'];
    const monto = body['kr-answer-orderDetails-orderTotalAmount'];

    console.log("📊 ESTADO:", estado);

    // ============================
    // 💾 ACTUALIZAR BD
    // ============================
    if (estado === "PAID") {

      await supabase
        .from('matricula')
        .update({ estado: 'pagado' })
        .eq('id', orderId);

      await supabase
        .from('pago')
        .update({ estado: 'pagado' })
        .eq('matricula_id', orderId);

      console.log("💰 Pago confirmado en BD");

      // 📄 PDF + 📧 correo
      const pdfPath = await this.generarPDF({ preciofinal: monto / 100 }, { id: orderId });

      await this.enviarCorreo("cliente@email.com", { preciofinal: monto / 100 }, pdfPath);

    }

    return { ok: true };
  }

  async buscarPorMatricula(matricula_id: number) {
  return await this.pagoRepository.findOne({
    where: {
      matricula: { id: matricula_id }
    }
  });
}

  async marcarPagado(matricula_id: number, data: any) {
  const pago = await this.pagoRepository.findOne({
    where: {
      matricula: { id: matricula_id }
    },
    relations: ["matricula"]
  });

  if (!pago) {
    throw new Error("Pago no encontrado");
  }

  pago.estado = "pagado";
  pago.status_detail = JSON.stringify(data);
  pago.fechapago = new Date();

  return await this.pagoRepository.save(pago);
}






  // ==============================
  // CORREO
  // ==============================
  /*async enviarCorreo(email: string, detalle: any, pdfPath: string) {
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
  }*/

  // ==============================
  // PDF
  // ==============================
  /*async generarPDF(data: any, payment: any) {
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
  }*/
}