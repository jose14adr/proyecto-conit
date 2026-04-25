import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asistencia } from './entities/asistencia.entity';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaController } from './asistencia.controller';
import { S3Module } from '../s3/s3.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asistencia]),
    S3Module,
    MulterModule.register({
      storage: memoryStorage(), // 🔥 IMPORTANTE
    }),
  ],
  controllers: [AsistenciaController],
  providers: [AsistenciaService],
  exports: [AsistenciaService], // opcional pero recomendable
})
export class AsistenciaModule {}