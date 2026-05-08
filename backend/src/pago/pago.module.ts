import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { MatriculaModule } from 'src/matricula/matricula.module';
import { ConfiguracionPago } from './entities/configuracion-pago.entity';
import { ConfiguracionPagoService } from './configuracion-pago.service';
import { ConfiguracionPagoController } from './configuracion-pago.controller';
import { Empresa } from '../empresa/entities/empresa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago, ConfiguracionPago, Empresa]),
    MatriculaModule,
  ],
  controllers: [PagoController, ConfiguracionPagoController],
  providers: [PagoService, ConfiguracionPagoService],
})
export class PagoModule {}
