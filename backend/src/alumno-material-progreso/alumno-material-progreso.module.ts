import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlumnoMaterialProgreso } from './entities/alumno-material-progreso.entity';
import { AlumnoMaterialProgresoService } from './alumno-material-progreso.service';
import { AlumnoMaterialProgresoController } from './alumno-material-progreso.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlumnoMaterialProgreso])],
  controllers: [AlumnoMaterialProgresoController],
  providers: [AlumnoMaterialProgresoService],
  exports: [AlumnoMaterialProgresoService],
})
export class AlumnoMaterialProgresoModule {}