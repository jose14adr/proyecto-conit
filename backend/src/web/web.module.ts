import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebController } from './web.controller';
import { WebService } from './web.service';
import { Curso } from '../curso/entities/curso.entity';
import { CategoriaCurso } from '../categoria-curso/categoria-curso.entity';
import { CursoCategoriaWeb } from '../categoria-curso/curso-categoria-web.entity';
import { WebContenido } from './entities/web-contenido.entity';
import { MensajeContacto } from './entities/mensaje-contacto.entity';
import { WebPagina } from './entities/web-pagina.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Curso,
      CategoriaCurso,
      CursoCategoriaWeb,
      WebContenido,
      MensajeContacto,
      WebPagina,
    ]),
  ],
  controllers: [WebController],
  providers: [WebService],
})
export class WebModule {}