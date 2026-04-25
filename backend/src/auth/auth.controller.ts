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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') dispositivo: string,
  ) {
    return this.authService.login(loginDto, ip, dispositivo);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('verificar-correo')
  async verificarCorreo(@Query('token') token: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

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