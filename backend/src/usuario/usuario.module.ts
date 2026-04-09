import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from './entities/usuario.entity';

import { Alumno } from '../alumno/entities/alumno.entity';
import { Docente } from '../docente/entities/docente.entity';
import { Administrador } from '../administrador/entities/administrador.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Alumno, Docente, Administrador])],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}