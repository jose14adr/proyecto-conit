import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  CreateMeetingInput,
  CreateMeetingResult,
  IMeetingProviderService,
} from '../meeting/meeting-provider.interface';

@Injectable()
export class TeamsMeetingService implements IMeetingProviderService {
  private readonly tokenBaseUrl = 'https://login.microsoftonline.com';
  private readonly graphBaseUrl = 'https://graph.microsoft.com/v1.0';

  private getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value || !value.trim()) {
      throw new InternalServerErrorException(
        `Falta configurar la variable ${name} para Teams`,
      );
    }
    return value.trim();
  }

  private async getAccessToken(): Promise<string> {
    const tenantId = this.getRequiredEnv('TEAMS_TENANT_ID');
    const clientId = this.getRequiredEnv('TEAMS_CLIENT_ID');
    const clientSecret = this.getRequiredEnv('TEAMS_CLIENT_SECRET');

    const body = new URLSearchParams();
    body.set('client_id', clientId);
    body.set('client_secret', clientSecret);
    body.set('scope', 'https://graph.microsoft.com/.default');
    body.set('grant_type', 'client_credentials');

    const response = await fetch(
      `${this.tokenBaseUrl}/${encodeURIComponent(
        tenantId,
      )}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      },
    );

    const data = await response.json();

    if (!response.ok || !data?.access_token) {
      throw new InternalServerErrorException(
        data?.error_description ||
          data?.error?.message ||
          data?.message ||
          'No se pudo obtener access token de Microsoft Graph',
      );
    }

    return data.access_token as string;
  }

  async createMeeting(
    input: CreateMeetingInput,
  ): Promise<CreateMeetingResult> {
    const accessToken = await this.getAccessToken();
    const organizerUserId = this.getRequiredEnv('TEAMS_ORGANIZER_USER_ID');

    const response = await fetch(
      `${this.graphBaseUrl}/users/${encodeURIComponent(
        organizerUserId,
      )}/onlineMeetings`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: input.titulo,
          startDateTime: input.fechaInicioIso,
          endDateTime: input.fechaFinIso,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new InternalServerErrorException(
        data?.error?.message ||
          data?.message ||
          'No se pudo crear la reunión en Teams',
      );
    }

    return {
      provider: 'teams',
      externalMeetingId: data?.id || null,
      joinUrl: data?.joinWebUrl || '',
      hostUrl: null,
      metadata: data,
    };
  }
}