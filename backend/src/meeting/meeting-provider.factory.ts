import { BadRequestException, Injectable } from '@nestjs/common';
import { GoogleMeetService } from '../google-meet/google-meet.service';
import { ZoomMeetingService } from '../zoom-meeting/zoom-meeting.service';
import { TeamsMeetingService } from '../teams-meeting/teams-meeting.service';
import {
  IMeetingProviderService,
  MeetingProvider,
} from './meeting-provider.interface';

@Injectable()
export class MeetingProviderFactory {
  constructor(
    private readonly googleMeetService: GoogleMeetService,
    private readonly zoomMeetingService: ZoomMeetingService,
    private readonly teamsMeetingService: TeamsMeetingService,
  ) {}

  getProvider(provider: MeetingProvider): IMeetingProviderService {
    switch (provider) {
      case 'google':
        return this.googleMeetService;
      case 'zoom':
        return this.zoomMeetingService;
      case 'teams':
        return this.teamsMeetingService;
      default:
        throw new BadRequestException('Proveedor de reuniones no válido');
    }
  }
}