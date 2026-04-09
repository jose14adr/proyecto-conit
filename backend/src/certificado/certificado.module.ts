import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificado } from './entities/certificado.entity';
import { CertificadoPlantilla } from './entities/certificado-plantilla.entity';
import { CertificadoService } from './certificado.service';
import { CertificadoController } from './certificado.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Certificado, CertificadoPlantilla])],
  controllers: [CertificadoController],
  providers: [CertificadoService],
  exports: [CertificadoService],
})
export class CertificadoModule {}