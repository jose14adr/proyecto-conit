import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursoModulo } from './entities/curso_modulo.entity';
import { CursoModuloController } from './curso_modulo.controller';
import { CursoModuloService } from './curso_modulo.service';
import { CursoLeccion } from '../curso_leccion/entities/curso_leccion.entity';


@Module({
  imports: [TypeOrmModule.forFeature([CursoModulo,CursoLeccion])],
  controllers: [CursoModuloController],
  providers: [CursoModuloService]
})
@Module({})
export class CursoModuloModule {}
