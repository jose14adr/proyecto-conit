import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BancoPreguntasController } from './banco-preguntas.controller';
import { BancoPreguntasService } from './banco-preguntas.service';
import { BancoPregunta } from './entities/banco-pregunta.entity';
import { BancoOpcion } from './entities/banco-opcion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BancoPregunta, BancoOpcion])],
  controllers: [BancoPreguntasController],
  providers: [BancoPreguntasService],
  exports: [BancoPreguntasService],
})
export class BancoPreguntasModule {}