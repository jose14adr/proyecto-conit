import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrador } from './entities/administrador.entity';
import { AdministradorService } from './administrador.service';
import { AdministradorController } from './administrador.controller';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Administrador, Usuario])],
  controllers: [AdministradorController],
  providers: [AdministradorService],
  exports: [AdministradorService],
})
export class AdministradorModule {}

