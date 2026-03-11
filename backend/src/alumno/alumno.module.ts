import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlumnoService } from './alumno.service';
import { AlumnoController } from './alumno.controller';
import { Alumno } from './entities/alumno.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Alumno, Usuario])], 
  controllers: [AlumnoController],
  providers: [AlumnoService],
})
export class AlumnoModule {}