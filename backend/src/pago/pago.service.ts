import { Injectable, BadRequestException } from '@nestjs/common';
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
import { ConfiguracionPago } from './entities/configuracion-pago.entity'; // 👈 Nueva importación

@Injectable()
export class PagoService {
  constructor(
    private matriculaService: MatriculaService,
    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
    @InjectRepository(ConfiguracionPago) // 👈 Inyección del repositorio de configuración
    private configPagoRepo: Repository<ConfiguracionPago>,
  ) {}

  // ==============================
  // 🔐 MÉTODO AUXILIAR: OBTENER CREDENCIALES DE BD
  // ==============================
  private async _obtenerConfig(pasarela: string) {
    const config = await this.configPagoRepo.findOne({
      where: { pasarela, activa: true },
    });

    if (!config || !config.credenciales) {
      throw new BadRequestException(
        `La pasarela ${pasarela} no está configurada o se encuentra inactiva.`,
      );
    }

    return config.credenciales;
  }

  // ==============================
  // PAGOS PENDIENTES
  // ==============================
  async getPagosPendientes() {
    const { data, error } = await supabase
      .from('matricula')
      .select(
        `
        id,
        observacion,
        estado,
        alumno (
          nombre,
          apellido
        ),
        grupo (
          curso (
            precio,
            precio_final,
            nombrecurso
          )
        )
      `,
      )
      .eq('estado', 'pendiente');

    if (error) throw new Error(error.message);

    return (data || []).map((m: any) => {
      const nombreAlumno = m.alumno?.nombre
        ? `${m.alumno.nombre} ${m.alumno.apellido || ''}`
        : 'Alumno Desconocido';

      const montoCobrar =
        m.grupo?.curso?.precio_final || m.grupo?.curso?.precio || 0;

      return {
        id: m.id,
        descripcion: m.observacion || 'Matrícula pendiente',
        alumno: nombreAlumno,
        curso: m.grupo?.curso?.nombrecurso || 'Curso Desconocido',
        monto: montoCobrar,
        estado: m.estado,
      };
    });
  }

  // ==============================
  // PAGOS REALIZADOS
  // ==============================
  async getPagosRealizados() {
    const { data, error } = await supabase
      .from('pago')
      .select(
        `
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
        alumno (
          nombre, 
          apellido   
        ),
        grupo (
          curso (
            precio,
            nombrecurso
          )
        )
      )
    `,
      )
      .eq('estado', 'pagado');

    if (error) {
      console.error('❌ Error en Supabase al obtener pagos realizados:', error);
      throw new Error(error.message);
    }

    return data;
  }

  // ==============================
  // PAGO CON MERCADOPAGO (Legacy)
  // ==============================
  async pagarConMercadoPago(data: any) {
    const credenciales = await this._obtenerConfig('mercadopago');
    mercadopago.configure({ access_token: credenciales.access_token });

    const payment = await mercadopago.payment.create({
      transaction_amount: Number(data.preciofinal),
      token: data.token,
      description: 'Pago curso',
      installments: Number(data.installments),
      payment_method_id: data.payment_method_id,
      issuer_id: data.issuer_id,
      payer: {
        email: data.email,
        identification: { type: 'DNI', number: data.dni },
      },
    });

    return this.procesarPagoBackend(data, payment.body, 'mercadopago');
  }

  // ==============================
  // PAGO CON PAYPAL
  // ==============================
  async pagarConPaypal(data: any) {
    const credenciales = await this._obtenerConfig('paypal');
    const token = credenciales.access_token; // Se lee de la BD

    const res = await axios.post(
      'https://api-m.sandbox.paypal.com/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [
          { amount: { currency_code: 'PEN', value: String(data.preciofinal) } },
        ],
        payer: { email_address: data.email },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const orderId = res.data.id;
    const capture = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const pago = {
      id: capture.data.id,
      status: capture.data.status.toLowerCase(),
      status_detail: null,
    };

    return this.procesarPagoBackend(data, pago, 'paypal');
  }

  // ==============================
  // PROCESAR PAGO Y GUARDAR EN SUPABASE
  // ==============================
  private async procesarPagoBackend(data: any, pago: any, metodo: string) {
    const estado =
      pago.status === 'approved'
        ? 'pagado'
        : pago.status === 'rejected'
          ? 'rechazado'
          : 'pendiente';

    const { data: existe } = await supabase
      .from('pago')
      .select('id')
      .eq('idpagodoc', pago.id)
      .maybeSingle();

    if (!existe) {
      await supabase.from('pago').insert([
        {
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
          status_detail: pago.status_detail,
        },
      ]);
    }

    if (estado === 'pagado') {
      await supabase
        .from('matricula')
        .update({ estado: 'pagado' })
        .eq('id', data.matricula_id);
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
  // PAGO CON TARJETA (MercadoPago)
  // ==============================
  async pagarConTarjeta(body: any) {
    const {
      token,
      payment_method_id,
      issuer_id,
      installments,
      transaction_amount,
      description,
      payer,
      matricula_id,
    } = body;

    console.log('📩 BODY:', body);

    if (!token) throw new Error('Falta token');
    if (!payer?.email) throw new Error('Falta email');

    const credenciales = await this._obtenerConfig('mercadopago');
    const mercadopago = require('mercadopago');

    mercadopago.configure({
      access_token: credenciales.access_token, // 🔥 Viene de la BD
    });

    const paymentData: any = {
      transaction_amount,
      token,
      description,
      installments: Number(installments) || 1,
      payment_method_id,
      payer,
    };

    if (issuer_id) {
      paymentData.issuer_id = issuer_id.toString();
    }

    const payment = await mercadopago.payment.create(paymentData);
    const data = payment.body;

    console.log('💳 RESPUESTA MP:', data);

    const pago = await this.pagoRepository.save({
      matricula: { id: matricula_id },
      tipopago: 'tarjeta',
      mp_payment_id: data.id,
      collector_id: data.collector_id,
      estado: data.status,
      status_detail: data.status_detail,
      precioinicial:
        data.transaction_details?.total_paid_amount || transaction_amount,
      preciofinal: data.transaction_amount,
      igv: 0,
      descripcion: description,
      idtipocomprobante: 1,
      idpagodoc: 1,
      fechapago: new Date(),
    });

    return {
      status: data.status,
      status_detail: data.status_detail,
      pago,
    };
  }

  // ==============================
  // MÉTODO PRIVADO GUARDAR PAGO
  // ==============================
  private async _guardarPago(data: any, payment: any) {
    if (!payment || !payment.body) {
      throw new Error('Respuesta inválida de Mercado Pago');
    }

    let estado = 'pendiente';

    if (payment.body.status === 'approved') {
      estado = 'pagado';
    } else if (payment.body.status === 'rejected') {
      estado = 'rechazado';
    }

    const { data: existe } = await supabase
      .from('pago')
      .select('*')
      .eq('idpagodoc', payment.body.id)
      .single();

    if (existe) return;

    const { error: errorPago } = await supabase.from('pago').insert([
      {
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
        status_detail: payment.body.status_detail || null,
      },
    ]);

    if (errorPago) throw new Error(errorPago.message);

    if (estado === 'pagado') {
      const { error: errorMatricula } = await supabase
        .from('matricula')
        .update({ estado: 'pagado' })
        .eq('id', data.matricula_id);

      if (errorMatricula) throw new Error(errorMatricula.message);

      try {
        const pdfPath = await this.generarPDF(data, payment);
        await this.enviarCorreo(data.email, data, pdfPath);
      } catch (err) {
        console.error('Error en PDF/correo:', err);
      }
    }
  }

  // ==============================
  // YAPE DIRECTO
  // ==============================
  async pagarConYape(body: any) {
    const {
      matricula_id,
      codigo_aprobacion,
      celular,
      precioinicial,
      preciodescuento = 0,
      descripcion,
    } = body;

    // Aquí no necesitamos llaves de API porque Yape directo es un registro manual,
    // pero si lo validaras contra una API, usarías _obtenerConfig('yape').

    if (!celular || !codigo_aprobacion) {
      throw new Error('Datos incompletos');
    }

    const subtotal = precioinicial - preciodescuento;
    const igv = subtotal * 0.18;
    const precioFinal = subtotal + igv;

    const pago = await this.pagoRepository.save({
      matricula_id,
      tipopago: 'yape',
      celular,
      codigo_aprobacion,
      precioinicial,
      preciodescuento,
      preciofinal: precioFinal,
      igv,
      descripcion,
      estado: 'pagado',
      status_detail: 'accredited',
      idpagodoc: Math.floor(Math.random() * 10000),
      idtipocomprobante: 1,
      fechapago: new Date(),
    });

    return { status: 'approved', pago };
  }

  async buscarPorMatricula(matricula_id: number) {
    return await this.pagoRepository.findOne({
      where: {
        matricula: { id: matricula_id },
      },
    });
  }

  // ==============================
  // WEBHOOK MERCADOPAGO
  // ==============================
  async procesarWebhook(body: any) {
    if (body.type === 'payment') {
      const paymentId = body.data.id;

      const credenciales = await this._obtenerConfig('mercadopago');
      mercadopago.configure({ access_token: credenciales.access_token });

      const payment = await mercadopago.payment.findById(paymentId);
      const metodo = payment.body.payment_method_id;

      if (metodo === 'yape') {
        console.log('📱 Pago con Yape detectado en Webhook');
      }

      const estadoMP = payment.body.status;
      let estado = 'pendiente';

      if (estadoMP === 'approved') estado = 'pagado';
      if (estadoMP === 'rejected') estado = 'rechazado';

      await supabase
        .from('pago')
        .update({
          estado,
          status_detail: payment.body.status_detail,
          tipopago: metodo,
        })
        .eq('idpagodoc', paymentId);
    }

    return { received: true };
  }

  // ==============================
  // CREAR PREFERENCIA MP
  // ==============================
  async crearPreferencia(data: any) {
    const credenciales = await this._obtenerConfig('mercadopago');

    mercadopago.configure({
      access_token: credenciales.access_token,
    });

    const preference = {
      items: [
        {
          title: data.nombre,
          quantity: 1,
          unit_price: Number(data.preciofinal),
          currency_id: 'PEN',
        },
      ],
      payer: {
        email: data.email,
      },
      metadata: {
        matricula_id: data.matricula_id,
      },
      payment_methods: {
        installments: 1,
      },
      // Idealmente, esto también podría venir de la BD o variables de entorno del servidor
      notification_url:
        'https://buddy-blunt-crumpled.ngrok-free.dev/pago/webhook',
    };

    const res = await mercadopago.preferences.create(preference);
    return { preferenceId: res.body.id };
  }

  // ==============================
  // YAPE VÍA MERCADOPAGO
  // ==============================
  async pagarYapeMP(body: any) {
    const credenciales = await this._obtenerConfig('mercadopago');
    const mercadopago = require('mercadopago');

    mercadopago.configure({
      access_token: credenciales.access_token,
    });

    const payment = await mercadopago.payment.create({
      transaction_amount: Number(body.transaction_amount),
      token: body.token,
      description: body.description,
      installments: 1,
      payment_method_id: 'yape',
      payer: {
        email: body.payer.email,
      },
    });

    const data = payment.body;
    console.log('🧾 YAPE RESPONSE:', data);

    const estado =
      data.status === 'approved'
        ? 'pagado'
        : data.status === 'rejected'
          ? 'rechazado'
          : 'pendiente';

    await this.pagoRepository.save({
      matricula: { id: body.matricula_id },
      tipopago: 'yape',
      mp_payment_id: data.id,
      estado: estado,
      status_detail: data.status_detail,
      preciofinal: data.transaction_amount,
      fechapago: new Date(),
    });

    return {
      status: data.status,
      detail: data.status_detail,
    };
  }

  // ==============================
  // PDF Y CORREO
  // ==============================
  async generarPDF(data: any, payment: any) {
    const paymentId = payment.body ? payment.body.id : payment.id;

    const filePath = `boleta-${paymentId}.pdf`;
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(18).text('COMPROBANTE DE PAGO', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Código: ${paymentId}`);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`);
    doc.text(`Cliente: ${data.email}`);
    doc.text(`Monto: S/ ${data.preciofinal}`);
    doc.moveDown();
    doc.text('Gracias por su compra', { align: 'center' });
    doc.end();

    return filePath;
  }

  async enviarCorreo(email: string, detalle: any, pdfPath: string) {
    // Nota: Las credenciales de correo se mantienen en .env por seguridad de la plataforma
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '✅ Pago confirmado',
      html: `<h2>Pago exitoso</h2><p>Monto: S/ ${detalle.preciofinal}</p>`,
      attachments: [{ filename: 'boleta.pdf', path: pdfPath }],
    });
  }

  // ==============================
  // PAGO CON IZIPAY
  // ==============================
  async pagarConIzipay(data: any) {
    const credenciales = await this._obtenerConfig('izipay');

    const res = await axios.post(
      'https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment',
      {
        amount: data.preciofinal * 100,
        currency: 'PEN',
        orderId: data.matricula_id.toString(),
        customer: {
          email: data.email,
        },
        paymentMethods: ['CARDS'],
      },
      {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              `${credenciales.usuario}:${credenciales.password}`, // 🔥 Viene de la BD
            ).toString('base64'),
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      formToken: res.data.answer?.formToken,
    };
  }

  async confirmarPagoIzipay(formToken: string, data: any) {
    try {
      const resultado = await this.procesarPagoBackend(
        {
          ...data,
          precioinicial: data.preciofinal,
          preciodescuento: 0,
        },
        { id: Date.now(), status: 'approved', status_detail: 'accredited' },
        'izipay',
      );

      return resultado;
    } catch (error) {
      console.error('❌ Error guardando en base de datos:', error);
      throw error;
    }
  }

  async procesarWebhookIzipay(body: any) {
    console.log('📩 WEBHOOK RAW:', body);

    const hashRecibido = body['kr-hash'];
    const credenciales = await this._obtenerConfig('izipay');
    const claveSecreta = credenciales.hmac_sha256; // 🔥 Viene de la BD

    if (!claveSecreta) {
      throw new Error('❌ Falta HMAC_SHA256 en la configuración de BD');
    }

    const data = Object.keys(body)
      .filter((key) => key.startsWith('kr-') && key !== 'kr-hash')
      .sort()
      .map((key) => `${key}=${body[key]}`)
      .join('&');

    const hashCalculado = crypto
      .createHmac('sha256', claveSecreta)
      .update(data)
      .digest('hex');

    if (hashCalculado !== hashRecibido) {
      console.error('❌ FIRMA INVÁLIDA');
      throw new Error('Firma inválida');
    }

    console.log('✅ FIRMA VÁLIDA');

    const estado = body['kr-answer-orderStatus'];
    const orderId = body['kr-answer-orderDetails-orderId'];
    const monto = body['kr-answer-orderDetails-orderTotalAmount'];

    console.log('📊 ESTADO:', estado);

    if (estado === 'PAID') {
      await supabase
        .from('matricula')
        .update({ estado: 'pagado' })
        .eq('id', orderId);

      await supabase
        .from('pago')
        .update({ estado: 'pagado' })
        .eq('matricula_id', orderId);

      console.log('💰 Pago confirmado en BD');

      const pdfPath = await this.generarPDF(
        { preciofinal: monto / 100 },
        { id: orderId },
      );

      await this.enviarCorreo(
        'cliente@email.com',
        { preciofinal: monto / 100 },
        pdfPath,
      );
    }

    return { ok: true };
  }

  async marcarPagado(matricula_id: number, data: any) {
    const pago = await this.pagoRepository.findOne({
      where: {
        matricula: { id: matricula_id },
      },
      relations: ['matricula'],
    });

    if (!pago) {
      throw new Error('Pago no encontrado');
    }

    pago.estado = 'pagado';
    pago.status_detail = JSON.stringify(data);
    pago.fechapago = new Date();

    return await this.pagoRepository.save(pago);
  }
}
