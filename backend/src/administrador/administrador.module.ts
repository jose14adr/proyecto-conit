import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrador } from './entities/administrador.entity';
import { AdministradorService } from './administrador.service';
import { AdministradorController } from './administrador.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Administrador])],
  controllers: [AdministradorController],
  providers: [AdministradorService],
  exports: [AdministradorService],
})
export class AdministradorModule {}

