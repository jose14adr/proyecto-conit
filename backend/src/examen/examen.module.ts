import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Examen } from './entities/examen.entity';
import { ExamenService } from './examen.service';
import { ExamenController } from './examen.controller';
import { ExamenPregunta } from 'src/examen_pregunta/entities/examen_pregunta.entity';
import { ExamenOpcion } from 'src/examen_opcion/entities/examen_opcion.entity';
import { ExamenIntento } from '../examen_intento/entities/examen_intento.entity';
import { Matricula } from '../matricula/entities/matricula.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Examen, ExamenPregunta, ExamenOpcion,ExamenIntento,Matricula,
  ])],
  controllers: [ExamenController],
  providers: [ExamenService],
})
export class ExamenModule {}
