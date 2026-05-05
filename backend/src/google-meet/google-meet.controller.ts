import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GoogleMeetService } from './google-meet.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Google Meet')
@Controller('google')
export class GoogleMeetController {
  constructor(private readonly googleMeetService: GoogleMeetService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('auth/url')
  @ApiOperation({ 
    summary: 'Generar URL de autenticación de Google', 
    description: 'Retorna la URL de Google para que el administrador autorice el uso de Calendar y Meet.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'URL generada correctamente.',
    schema: { example: { url: 'https://accounts.google.com/o/oauth2/v2/auth...' } }
  })
  getAuthUrl() {
    return {
      url: this.googleMeetService.getAuthUrl(),
    };
  }

  @Get('auth/callback')
  @ApiOperation({ 
    summary: 'Callback de autenticación de Google', 
    description: 'Endpoint al que Google redirige tras la autorización. Intercambia el código por tokens.' 
  })
  @ApiQuery({ name: 'code', description: 'Código de autorización enviado por Google' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tokens obtenidos. Es necesario guardar el refresh_token en las variables de entorno.' 
  })
  async callback(@Query('code') code: string) {
    const tokens = await this.googleMeetService.exchangeCodeForTokens(code);

    return {
      ok: true,
      tokens,
      message:
        'Copia el refresh_token y guárdalo en GOOGLE_REFRESH_TOKEN del backend.',
    };
  }
}