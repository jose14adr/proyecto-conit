import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificado } from './entities/certificado.entity';
import { CertificadoPlantilla } from './entities/certificado-plantilla.entity';
import { CursoCertificadoConfig } from './entities/curso-certificado-config.entity';
import { CertificadoService } from './certificado.service';
import { CertificadoController } from './certificado.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Certificado,
      CertificadoPlantilla,
      CursoCertificadoConfig,
    ]),
    MailModule,
  ],
  controllers: [CertificadoController],
  providers: [CertificadoService],
  exports: [CertificadoService],
})
export class CertificadoModule {}