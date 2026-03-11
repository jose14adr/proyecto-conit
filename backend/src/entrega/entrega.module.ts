import { Module } from '@nestjs/common';
import { EntregaService } from './entrega.service';
import { EntregaController } from './entrega.controller';

@Module({
  providers: [EntregaService],
  controllers: [EntregaController]
})
export class EntregaModule {}
