import { Module } from '@nestjs/common';
import { ExamenRespuestaController } from './examen_respuesta.controller';
import { ExamenRespuestaService } from './examen_respuesta.service';

@Module({
  controllers: [ExamenRespuestaController],
  providers: [ExamenRespuestaService]
})
export class ExamenRespuestaModule {}
