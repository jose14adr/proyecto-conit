import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UsuarioService } from '../usuario/usuario.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { HistorialLoginService } from '../historial-login/historial-login.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Alumno } from 'src/alumno/entities/alumno.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly historialLoginService: HistorialLoginService,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
  ) {}

  async login(loginDto: LoginDto, ip: string, dispositivo: string) {
    // 🔐 Validación del token de reCaptcha
    if (!loginDto.recaptchaToken) {
      throw new UnauthorizedException('Falta el token de reCaptcha');
    }

    const secretkey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretkey}&response=${loginDto.recaptchaToken}`;

    try {
      const recaptchaResponse = await fetch(verificationUrl, {
        method: 'POST',
      });
      const recaptchaData = await recaptchaResponse.json();

      if (!recaptchaData.success) {
        throw new UnauthorizedException('Validación de reCaptcha fallida');
      }
    } catch {
      throw new UnauthorizedException('Error al verificar reCaptcha');
    }

    const usuario = await this.usuarioService.findOneByCorreo(loginDto.correo);

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    let isPasswordValid = false;

    try {
      isPasswordValid = await bcrypt.compare(
        loginDto.contrasenia,
        usuario.contrasenia,
      );
    } catch {
      isPasswordValid = false;
    }

    // Compatibilidad temporal para usuarios antiguos con contraseña sin hash
    if (!isPasswordValid && usuario.contrasenia === loginDto.contrasenia) {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // ⚠️ Bloquear login si no verificó correo
    if (!usuario.emailVerificado) {
      throw new UnauthorizedException('Debes verificar tu correo');
    }

    let sessionId: number | null = null;

    try {
      const sesion = await this.historialLoginService.registrarIngreso(
        usuario.id,
        ip || 'IP desconocida',
        dispositivo || 'Navegador desconocido',
      );
      sessionId = sesion.id;
    } catch (error) {
      console.error('Error al registrar el inicio de sesión:', error);
    }

    let idAlumnoRelacionado: number | null = null;

    if (usuario.rol === 'ALUMNO') {
      try {
        const alumno = await this.alumnoRepository.findOne({
          where: { idusuario: usuario.id } as any,
        });

        if (alumno) {
          idAlumnoRelacionado = alumno.id;
        }
      } catch (error) {
        console.error('Error al buscar el alumno vinculado:', error);
      }
    }

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      sessionId: sessionId,
      idalumno: idAlumnoRelacionado,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
        idEmpresa: usuario.idempresa,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const usuario = await this.usuarioService.findOneByCorreo(
      forgotPasswordDto.correo,
    );

    if (!usuario) {
      return {
        message:
          'Si el correo existe, se enviará un enlace de restablecimiento',
      };
    }

    const caracteres =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let codigoSeguridad = '';

    for (let i = 0; i < 6; i++) {
      codigoSeguridad += caracteres.charAt(
        Math.floor(Math.random() * caracteres.length),
      );
    }

    const hashedCode = await bcrypt.hash(codigoSeguridad, 10);

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      code: hashedCode,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '5m' });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: usuario.correo,
      subject: 'Restablecimiento de contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #141426;">
          <h2 style="color: #344c92;">Recuperación de contraseña</h2>
          <p>Hola,</p>
          <p>Hemos recibido una solicitud para restablecer tu contraseña en el Aula Virtual.</p>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #4b5563;">Tu código de seguridad es:</p>
            <h1 style="margin: 10px 0 0 0; color: #1b2751; font-size: 32px; letter-spacing: 5px;">${codigoSeguridad}</h1>
          </div>

          <p>Haz clic en el siguiente enlace y digita tu código (ambos <b>expiran en 5 minutos</b>):</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #5573b3; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Restablecer mi contraseña</a>
          <p style="margin-top: 20px; font-size: 12px; color: #8a9585;">Si tú no solicitaste esto, simplemente ignora este correo.</p>
        </div>
      `,
    });

    return {
      message: 'Si el correo existe, se enviará un enlace de restablecimiento',
    };
  }

  // Función para restablecer la contraseña usando el token enviado por correo
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      // Verificamos el token. Si expiró o es inválido, lanzamos un error
      const payload = this.jwtService.verify<{ correo: string; code: string }>(
        resetPasswordDto.token,
      );

      const isCodeValid = await bcrypt.compare(
        resetPasswordDto.codigoSeguridad,
        payload.code,
      );

      if (!isCodeValid) {
        throw new BadRequestException('Código de seguridad inválido');
      }

      // Buscamos al usuario en la base de datos
      const usuario = await this.usuarioService.findOneByCorreo(payload.correo);

      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Actualizamos la contraseña del usuario
      await this.usuarioService.actualizarContrasenia(
        usuario.id,
        resetPasswordDto.contrasenia,
      );

      return { message: 'Contraseña restablecida exitosamente' };
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      // Si el error es nuestro BadRequestException, lo lanzamos tal cual
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Si el token es inválido o expiró, respondemos con un mensaje genérico
      throw new UnauthorizedException('El enlace no es válido o expiró');
    }
  }

  async verificarCorreo(token: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { tokenVerificacion: token },
    });

    if (!usuario) {
      throw new BadRequestException('Token inválido');
    }

    if (
      usuario.tokenVerificacionExpira &&
      new Date(usuario.tokenVerificacionExpira) < new Date()
    ) {
      throw new BadRequestException('El token ha expirado');
    }

    usuario.emailVerificado = true;
    usuario.tokenVerificacion = null;
    usuario.tokenVerificacionExpira = null;

    await this.usuarioRepository.save(usuario);

    return { message: 'Correo verificado correctamente' };
  }

  async enviarCorreoVerificacion(
    nombre: string,
    correo: string,
    token: string,
  ) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const link = `${backendUrl}/auth/verificar-correo?token=${token}`;

    await this.mailerService.sendMail({
      to: correo,
      subject: 'Verifica tu correo',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #141426;">
          <h2 style="color: #344c92;">Verificación de correo</h2>
          <p>Hola ${nombre},</p>
          <p>Haz clic en el siguiente botón para verificar tu correo:</p>

          <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #5573b3; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            Verificar correo
          </a>

          <p style="margin-top: 20px; font-size: 12px; color: #8a9585;">
            Si no solicitaste esto, puedes ignorar este mensaje.
          </p>
        </div>
      `,
    });
  }
}

