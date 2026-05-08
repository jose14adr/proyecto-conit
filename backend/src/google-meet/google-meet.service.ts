import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { google } from 'googleapis';
import {
  CreateMeetingInput,
  CreateMeetingResult,
  IMeetingProviderService,
  MeetingAccessType,
} from '../meeting/meeting-provider.interface';

@Injectable()
export class GoogleMeetService implements IMeetingProviderService {
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/meetings.space.created',
      ],
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

  private normalizarAccessType(
    accessType?: string,
  ): MeetingAccessType {
    const value = String(accessType || 'RESTRICTED').toUpperCase();

    if (value === 'OPEN' || value === 'TRUSTED' || value === 'RESTRICTED') {
      return value;
    }

    return 'RESTRICTED';
  }

  private descripcionAccessType(accessType: MeetingAccessType): string {
    if (accessType === 'OPEN') {
      return 'Libre: cualquiera con el enlace puede entrar sin pedir admisión.';
    }

    if (accessType === 'TRUSTED') {
      return 'Confiable: invitados, usuarios de la organización y acceso telefónico pueden entrar directo. Los demás deben pedir admisión.';
    }

    return 'Con admisión: solo los invitados entran directo. Los demás deben pedir admisión.';
  }

  async crearSesionMeet(params: {
    titulo: string;
    descripcion?: string;
    fechaInicioIso: string;
    fechaFinIso: string;
    accessType?: MeetingAccessType;
  }) {
    try {
      const auth = this.getAuthorizedClient();
      const accessType = this.normalizarAccessType(params.accessType);

      // 1. Crear espacio de Google Meet con configuración de acceso
      const meetResponse = await auth.request<any>({
        url: 'https://meet.googleapis.com/v2/spaces',
        method: 'POST',
        data: {
          config: {
            accessType,
            entryPointAccess: 'ALL',
          },
        },
      });

      const meetSpace = meetResponse.data;
      const meetLink = meetSpace?.meetingUri || null;

      if (!meetLink) {
        throw new InternalServerErrorException(
          'Google Meet no devolvió un enlace de reunión.',
        );
      }

      // 2. Crear evento en Google Calendar con el enlace del Meet
      const calendar = google.calendar({
        version: 'v3',
        auth,
      });

      const descripcionBase = params.descripcion?.trim() || '';
      const descripcionConMeet = `${descripcionBase}

Enlace de Google Meet:
${meetLink}

Acceso de la reunión:
${this.descripcionAccessType(accessType)}
`;

      const calendarResponse = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: params.titulo,
          description: descripcionConMeet,
          location: meetLink,
          start: {
            dateTime: params.fechaInicioIso,
            timeZone: 'America/Lima',
          },
          end: {
            dateTime: params.fechaFinIso,
            timeZone: 'America/Lima',
          },
        },
      });

      const createdEvent = calendarResponse.data;

      return {
        eventId: createdEvent.id,
        meetLink,
        htmlLink: createdEvent.htmlLink,
        spaceName: meetSpace?.name || null,
        meetingCode: meetSpace?.meetingCode || null,
        accessType,
        meetSpace,
      };
    } catch (error) {
      const googleError = error?.response?.data || error;

      console.error('Error creando sesión en Google Meet:', googleError);

      if (
        googleError?.error === 'invalid_grant' ||
        googleError?.error_description?.includes('expired') ||
        googleError?.error_description?.includes('revoked')
      ) {
        throw new UnauthorizedException(
          'La conexión con Google Meet expiró o fue revocada. Genera un nuevo GOOGLE_REFRESH_TOKEN.',
        );
      }

      throw new InternalServerErrorException(
        googleError?.message ||
          'No se pudo crear la sesión en vivo con Google Meet.',
      );
    }
  }

  async createMeeting(
    input: CreateMeetingInput,
  ): Promise<CreateMeetingResult> {
    const meet = await this.crearSesionMeet({
      titulo: input.titulo,
      descripcion: input.descripcion || '',
      fechaInicioIso: input.fechaInicioIso,
      fechaFinIso: input.fechaFinIso,
      accessType: input.accessType || 'RESTRICTED',
    });

    return {
      provider: 'google',
      externalMeetingId: meet?.eventId || null,
      joinUrl: meet?.meetLink || meet?.htmlLink || '',
      hostUrl: meet?.htmlLink || null,
      metadata: meet,
      accessType: meet?.accessType || input.accessType || 'RESTRICTED',
    };
  }
}