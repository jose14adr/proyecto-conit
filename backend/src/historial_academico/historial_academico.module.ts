import { Module } from '@nestjs/common';
import { HistorialAcademicoController } from './historial_academico.controller';
import { HistorialAcademicoService } from './historial_academico.service';

@Module({
  controllers: [HistorialAcademicoController],
  providers: [HistorialAcademicoService]
})
export class HistorialAcademicoModule {}
