import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);

  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 465),
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async onModuleInit() {
    try {
      await this.transporter.verify();
      this.logger.log('Servicio de correo listo');
    } catch (error) {
      this.logger.error('No se pudo verificar SMTP', error);
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    return this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
    });
  }

  async sendEmailVerificacion(nombre: string, correo: string, token: string) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  const link = `${backendUrl}/auth/verificar-correo?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Verifica tu correo</h2>
      <p>Hola ${nombre},</p>
      <p>Haz clic en el siguiente botón para verificar tu correo:</p>
      <p>
        <a href="${link}" style="background:#2563eb;color:white;padding:10px 16px;text-decoration:none;border-radius:6px;">
          Verificar correo
        </a>
      </p>
      <p>Si no solicitaste esto, puedes ignorar este mensaje.</p>
      <br />
      <p>Saludos,<br />Equipo Conit</p>
    </div>
  `;

  await this.sendMail(correo, 'Verifica tu correo', html);
}

  async sendBienvenidaAlumno(nombre: string, correo: string, curso: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>¡Bienvenido(a) a ${curso}!</h2>
        <p>Hola ${nombre},</p>
        <p>Tu matrícula en el curso <b>${curso}</b> se realizó correctamente.</p>
        <p>Ya puedes ingresar a la plataforma y revisar el contenido.</p>
        <br />
        <p>Saludos,<br />Equipo Conit</p>
      </div>
    `;

    await this.sendMail(correo, 'Bienvenido(a) a tu curso', html);
  }

  async sendAsignacionDocente(nombre: string, correo: string, curso: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Asignación de curso</h2>
        <p>Hola ${nombre},</p>
        <p>Se te ha asignado el curso <b>${curso}</b>.</p>
        <p>Ya puedes ingresar a la plataforma para gestionarlo.</p>
        <br />
        <p>Saludos,<br />Equipo Conit</p>
      </div>
    `;

    await this.sendMail(correo, 'Se te asignó un curso', html);
  }
}