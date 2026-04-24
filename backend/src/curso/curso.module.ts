import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curso } from './entities/curso.entity';
import { CursoService } from './curso.service';
import { CursoController } from './curso.controller';
import { LeccionMaterial } from '../leccion-material/entities/leccion-material.entity';
import { Sesion } from '../sesion/entities/sesion.entity';
import { CursoModulo } from '../curso_modulo/entities/curso_modulo.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { Matricula } from '../matricula/entities/matricula.entity';
import { Examen } from '../examen/entities/examen.entity';
import { ExamenPregunta } from '../examen_pregunta/entities/examen_pregunta.entity';
import { ExamenOpcion } from '../examen_opcion/entities/examen_opcion.entity';


@Module({
  imports: [TypeOrmModule.forFeature([
      Curso,
      Alumno,
      Matricula,
      Sesion,
      Grupo,
      CursoModulo,
      Grupo,
      Matricula,
      Examen,
      ExamenPregunta,
      ExamenOpcion])],
  controllers: [CursoController],
  providers: [CursoService],
})
export class CursoModule {}

