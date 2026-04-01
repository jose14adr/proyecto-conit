import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curso } from './entities/curso.entity';
import { CursoService } from './curso.service';
import { CursoController } from './curso.controller';
import { LeccionMaterial } from '../leccion-material/entities/leccion-material.entity';
import { Sesion } from '../sesion/entities/sesion.entity';
import { CursoModulo } from '../curso_modulo/entities/curso_modulo.entity';


@Module({
  imports: [TypeOrmModule.forFeature([
      Curso,
      Sesion,
      CursoModulo])],
  controllers: [CursoController],
  providers: [CursoService],
})
export class CursoModule {}

