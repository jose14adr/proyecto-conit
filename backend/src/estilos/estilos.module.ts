import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstiloColor } from './entities/estilo-color.entity';
import { EstiloConfiguracion } from './entities/estilo-configuracion.entity';
import { EstilosService } from './estilos.service';
import { EstilosController } from './estilos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EstiloColor, EstiloConfiguracion])],
  controllers: [EstilosController],
  providers: [EstilosService],
  exports: [EstilosService],
})
export class EstilosModule {}