import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { MatriculaModule } from 'src/matricula/matricula.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pago]), MatriculaModule],
  controllers: [PagoController],
  providers: [PagoService],
})
export class PagoModule {}