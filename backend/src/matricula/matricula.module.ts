import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Matricula } from './entities/matricula.entity';
import { MatriculaService } from './matricula.service';
import { MatriculaController } from './matricula.controller';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Matricula, Alumno, Usuario]),
    MailModule,
  ],
  controllers: [MatriculaController],
  providers: [MatriculaService],
  exports: [MatriculaService],
})
export class MatriculaModule {}