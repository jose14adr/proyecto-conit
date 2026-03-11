import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recurso } from './entities/recurso.entity';
import { RecursoService } from './recurso.service';
import { RecursoController } from './recurso.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Recurso])],
  controllers: [RecursoController],
  providers: [RecursoService],
})
export class RecursoModule {}