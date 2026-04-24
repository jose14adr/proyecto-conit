import { Module } from '@nestjs/common';
import { ExamenPreguntaController } from './examen_pregunta.controller';
import { ExamenPreguntaService } from './examen_pregunta.service';

@Module({
  controllers: [ExamenPreguntaController],
  providers: [ExamenPreguntaService]
})
export class ExamenPreguntaModule {}
