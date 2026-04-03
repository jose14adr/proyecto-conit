import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Soporte } from './entities/soporte.entity';
import { SoporteAdjunto } from './entities/soporte-adjunto.entity';
import { SoporteController } from './soporte.controller';
import { SoporteService } from './soporte.service';

@Module({
  imports: [TypeOrmModule.forFeature([Soporte, SoporteAdjunto])],
  controllers: [SoporteController],
  providers: [SoporteService],
})
export class SoporteModule {}