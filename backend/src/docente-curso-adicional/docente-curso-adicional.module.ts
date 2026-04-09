import { Module } from '@nestjs/common';
import { DocenteCursoAdicionalService } from './docente-curso-adicional.service';
import { DocenteCursoAdicionalController } from './docente-curso-adicional.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocenteCursoAdicional } from './entities/docente-curso-adicional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocenteCursoAdicional])], 
  controllers: [DocenteCursoAdicionalController],
  providers: [DocenteCursoAdicionalService],
})
export class DocenteCursoAdicionalModule {}