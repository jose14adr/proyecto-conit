import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursoLeccion } from './entities/curso_leccion.entity';
import { CursoLeccionController } from './curso_leccion.controller';
import { CursoLeccionService } from './curso_leccion.service';
import { LeccionMaterial } from '../leccion-material/entities/leccion-material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CursoLeccion,LeccionMaterial])],
  exports: [TypeOrmModule],
  controllers: [CursoLeccionController],
  providers: [CursoLeccionService]
})
export class CursoLeccionModule {}
