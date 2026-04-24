import { Module } from '@nestjs/common';
import { ExamenIntentoController } from './examen_intento.controller';
import { ExamenIntentoService } from './examen_intento.service';

@Module({
  controllers: [ExamenIntentoController],
  providers: [ExamenIntentoService]
})
export class ExamenIntentoModule {}
