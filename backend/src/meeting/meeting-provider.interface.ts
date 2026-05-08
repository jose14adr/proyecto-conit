export type MeetingProvider = 'google' | 'zoom' | 'teams';

export type MeetingAccessType = 'OPEN' | 'TRUSTED' | 'RESTRICTED';

export interface CreateMeetingInput {
  titulo: string;
  descripcion?: string;
  fechaInicioIso: string;
  fechaFinIso: string;
  accessType?: MeetingAccessType;
}

export interface CreateMeetingResult {
  provider: MeetingProvider;
  externalMeetingId?: string | null;
  joinUrl: string;
  hostUrl?: string | null;
  metadata?: any;
  accessType?: MeetingAccessType;
}

export interface IMeetingProviderService {
  createMeeting(input: CreateMeetingInput): Promise<CreateMeetingResult>;
}