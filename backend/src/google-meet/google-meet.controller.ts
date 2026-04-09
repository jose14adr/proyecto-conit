import { Controller, Get, Query } from '@nestjs/common';
import { GoogleMeetService } from './google-meet.service';

@Controller('google')
export class GoogleMeetController {
  constructor(private readonly googleMeetService: GoogleMeetService) {}

  @Get('auth/url')
  getAuthUrl() {
    return {
      url: this.googleMeetService.getAuthUrl(),
    };
  }

  @Get('auth/callback')
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