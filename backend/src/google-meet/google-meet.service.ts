import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleMeetService {
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.events.owned'],
    });
  }

  async exchangeCodeForTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  private getAuthorizedClient() {
    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    return this.oauth2Client;
  }

  async crearSesionMeet(params: {
    titulo: string;
    descripcion?: string;
    fechaInicioIso: string;
    fechaFinIso: string;
  }) {
    const auth = this.getAuthorizedClient();

    const calendar = google.calendar({
      version: 'v3',
      auth,
    });

    const event = {
      summary: params.titulo,
      description: params.descripcion ?? '',
      start: {
        dateTime: params.fechaInicioIso,
        timeZone: 'America/Lima',
      },
      end: {
        dateTime: params.fechaFinIso,
        timeZone: 'America/Lima',
      },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: event,
    });

    const created = response.data;

    const meetLink =
      created.conferenceData?.entryPoints?.find(
        (p) => p.entryPointType === 'video',
      )?.uri ?? null;

    return {
      eventId: created.id,
      meetLink,
      htmlLink: created.htmlLink,
    };
  }
}