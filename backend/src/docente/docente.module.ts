import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from './entities/docente.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { DocenteService } from './docente.service';
import { DocenteController } from './docente.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Docente, Usuario]), MailModule],
  controllers: [DocenteController],
  providers: [DocenteService],
})
export class DocenteModule {}
