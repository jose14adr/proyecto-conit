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

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private historialLoginService: HistorialLoginService,
  ) {}

  async login(loginDto: LoginDto, ip: string, dispositivo: string) {
    //Validacion del token de reCaptcha
    if (!loginDto.recaptchaToken) {
      throw new UnauthorizedException('Falta el token de reCaptcha');
    }

    const secretkey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretkey}&response=${loginDto.recaptchaToken}`;

    try {
      //Hacemos la consulta a los servidores de Google para verificar el token
      const recaptchaResponse = await fetch(verificationUrl, {
        method: 'POST',
      });
      const recaptchaData = await recaptchaResponse.json();

      //Si Google detecta que el token no es válido, lanzamos un error de autenticación
      if (!recaptchaData.success) {
        throw new UnauthorizedException('Validación de reCaptcha fallida');
      }
    } catch (error) {
      //Si hay error de red al conectar a Google
      throw new UnauthorizedException('Error al verificar reCaptcha');
    }

    const usuario = await this.usuarioService.findOneByCorreo(loginDto.correo);

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (usuario.contrasenia !== loginDto.contrasenia) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    try {
      await this.historialLoginService.registrarIngreso(usuario.id, ip || 'IP desconocida', dispositivo || "Navegador desconocido");
    } catch (error) {
      console.error('Error al registrar el inicio de sesión:', error);
    }

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
    //Para evitar revelar si el correo existe o no, siempre respondemos con el mismo mensaje
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

    //Creamos un token JWT con la información del usuario que expira en 5 minutos
    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      code: hashedCode,
    };
    const token = this.jwtService.sign(payload, { expiresIn: '5m' });

    //Armamos el enlace hacia el frontend con el token
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to: usuario.correo,
      subject: 'Restablecimiento de contraseña',
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #141426;">
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
    //Enviamos el correo con el enlace de restablecimiento
    return {
      message: 'Si el correo existe, se enviará un enlace de restablecimiento',
    };
  }

  //Función para restablecer la contraseña usando el token enviado por correo
 async resetPassword(resetPasswordDto: ResetPasswordDto) {
      try {
        //Verificamos el token. Si expiró o es inválido, lanzamos un error
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

        //Buscamos al usuario en la base de datos
        const usuario = await this.usuarioService.findOneByCorreo(payload.correo);
        if (!usuario) {
          throw new UnauthorizedException('Usuario no encontrado');
        }

        //Actualizamos la contraseña del usuario
        await this.usuarioService.actualizarContrasenia(
          usuario.id,
          resetPasswordDto.contrasenia,
        );

        return { message: 'Contraseña restablecida exitosamente' };
      } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        //Si el error es nuestro BadRequestException (contraseña repetida), lo lanzamos tal cual para que el cliente lo maneje
        if (error instanceof BadRequestException) {
          throw error;
        }
        //Si el token es inválido o expiró, respondemos con un mensaje genérico para no revelar detalles
        throw new UnauthorizedException(
          'El enlace de restablecimiento no es válido o ha expirado',
        );
      }
    }
}
  
