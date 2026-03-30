import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialLoginService } from './historial-login.service';
import { HistorialLoginController } from './historial-login.controller';
import { HistorialLogin } from './entities/historial-login.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialLogin])],
  controllers: [HistorialLoginController],
  providers: [HistorialLoginService],
  exports: [HistorialLoginService],
})
export class HistorialLoginModule {}
