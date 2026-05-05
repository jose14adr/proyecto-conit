import {
  Controller,
  Post,
  Body,
  Ip,
  Headers,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ 
    summary: 'Iniciar sesión', 
    description: 'Valida las credenciales del usuario y el token de reCaptcha. Retorna un JWT para la autorización.' 
  })
  @ApiResponse({ status: 200, description: 'Login exitoso. Retorna el access_token y datos básicos del usuario.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas, usuario no verificado o reCaptcha fallido.' })
  login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') dispositivo: string,
  ) {
    return this.authService.login(loginDto, ip, dispositivo);
  }

  @Post('forgot-password')
  @ApiOperation({ 
    summary: 'Olvidé mi contraseña', 
    description: 'Inicia el proceso de recuperación de contraseña. Envía un correo con un enlace para restablecer la contraseña si el correo existe en el sistema.'
  })
  @ApiResponse({ status: 200, description: 'Si el correo existe, se envía un email con instrucciones para restablecer la contraseña. Si no existe, se responde con éxito sin indicar que el correo no está registrado.' })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ 
    summary: 'Restablecer contraseña', 
    description: 'Completa el proceso de recuperación de contraseña con un nuevo password.' 
  })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida exitosamente.' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado.' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('verificar-correo')
<<<<<<< HEAD
  async verificarCorreo(@Query('token') token: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
=======
  @ApiOperation({ 
    summary: 'Verificar correo electrónico', 
    description: 'Verifica el correo electrónico del usuario mediante un token de verificación.' 
  })
  @ApiQuery({ name: 'token', description: 'Token único de verificación de cuenta' })
  @ApiResponse({ status: 302, description: 'Redirección: ?verified=success o ?verified=error' })
  async verificarCorreo(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:5173';
>>>>>>> main

    if (!token) {
      return res.redirect(`${frontendUrl}/login?verified=error`);
    }

    try {
      await this.authService.verificarCorreo(token);
      return res.redirect(`${frontendUrl}/login?verified=success`);
    } catch (error) {
      return res.redirect(`${frontendUrl}/login?verified=error`);
    }
  }
}