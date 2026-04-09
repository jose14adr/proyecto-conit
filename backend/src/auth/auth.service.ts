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

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private historialLoginService: HistorialLoginService,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async login(loginDto: LoginDto, ip: string, dispositivo: string) {
    // 🔐 reCaptcha
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

    // 🔐 Validación de contraseña (soporta legacy sin hash)
    let isPasswordValid = await bcrypt.compare(
      loginDto.contrasenia,
      usuario.contrasenia,
    );

    if (!isPasswordValid && usuario.contrasenia === loginDto.contrasenia) {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // ⚠️ Bloquear login si no verificó correo (opcional pero recomendado)
    if (!usuario.emailVerificado) {
      throw new UnauthorizedException('Debes verificar tu correo');
    }

    // 📊 Historial login
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

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      sessionId,
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

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: usuario.correo,
      subject: 'Restablecimiento de contraseña',
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>Recuperación de contraseña</h2>
          <p>Tu código:</p>
          <h1>${codigoSeguridad}</h1>
          <a href="${resetLink}">Restablecer contraseña</a>
        </div>
      `,
    });

    return {
      message: 'Si el correo existe, se enviará un enlace de restablecimiento',
    };
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
        <h2>Hola ${nombre}</h2>
        <p>Haz clic para verificar:</p>
        <a href="${link}">Verificar correo</a>
      `,
    });
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify<{
        correo: string;
        code: string;
      }>(resetPasswordDto.token);

      const isCodeValid = await bcrypt.compare(
        resetPasswordDto.codigoSeguridad,
        payload.code,
      );

      if (!isCodeValid) {
        throw new BadRequestException('Código de seguridad inválido');
      }

      const usuario = await this.usuarioService.findOneByCorreo(
        payload.correo,
      );

      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      await this.usuarioService.actualizarContrasenia(
        usuario.id,
        resetPasswordDto.contrasenia,
      );

      return { message: 'Contraseña restablecida exitosamente' };
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new UnauthorizedException(
        'El enlace no es válido o expiró',
      );
    }
  }
}