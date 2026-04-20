import { Injectable } from '@nestjs/common';
import {
  CreateMeetingInput,
  CreateMeetingResult,
  IMeetingProviderService,
} from '../meeting/meeting-provider.interface';

@Injectable()
export class TeamsMeetingService implements IMeetingProviderService {
  async createMeeting(
    input: CreateMeetingInput,
  ): Promise<CreateMeetingResult> {
    throw new Error('Teams no está configurado para esta instalación');
  }
}