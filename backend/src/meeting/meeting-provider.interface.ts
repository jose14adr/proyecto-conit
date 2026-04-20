export type MeetingProvider = 'google' | 'zoom' | 'teams';

export interface CreateMeetingInput {
  titulo: string;
  descripcion?: string;
  fechaInicioIso: string;
  fechaFinIso: string;
}

export interface CreateMeetingResult {
  provider: MeetingProvider;
  externalMeetingId?: string | null;
  joinUrl: string;
  hostUrl?: string | null;
  metadata?: any;
}

export interface IMeetingProviderService {
  createMeeting(input: CreateMeetingInput): Promise<CreateMeetingResult>;
}