import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionVivo } from './entities/sesion-vivo.entity';
import { SesionVivoService } from './sesion-vivo.service';
import { SesionVivoController } from './sesion-vivo.controller';
import { GoogleMeetModule } from '../google-meet/google-meet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SesionVivo]),
    GoogleMeetModule,
  ],
  controllers: [SesionVivoController],
  providers: [SesionVivoService],
})
export class SesionVivoModule {}