import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionVivo } from './entities/sesion-vivo.entity';
import { SesionVivoService } from './sesion-vivo.service';
import { SesionVivoController } from './sesion-vivo.controller';
import { GoogleMeetModule } from '../google-meet/google-meet.module';
import { EmpresaModule } from '../empresa/empresa.module';
import { Curso } from '../curso/entities/curso.entity';
import { MeetingProviderFactory } from '../meeting/meeting-provider.factory';
import { ZoomMeetingService } from '../zoom-meeting/zoom-meeting.service';
import { TeamsMeetingService } from '../teams-meeting/teams-meeting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SesionVivo, Curso]),
    GoogleMeetModule,
    EmpresaModule,
  ],
  controllers: [SesionVivoController],
  providers: [
    SesionVivoService,
    MeetingProviderFactory,
    ZoomMeetingService,
    TeamsMeetingService,
  ],
  exports: [SesionVivoService],
})
export class SesionVivoModule {}