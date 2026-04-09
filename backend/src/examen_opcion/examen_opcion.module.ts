import { Module } from '@nestjs/common';
import { ExamenOpcionController } from './examen_opcion.controller';
import { ExamenOpcionService } from './examen_opcion.service';

@Module({
  controllers: [ExamenOpcionController],
  providers: [ExamenOpcionService]
})
export class ExamenOpcionModule {}
