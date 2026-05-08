import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminWebController } from './admin-web.controller';
import { AdminWebService } from './admin-web.service';
import { Curso } from '../curso/entities/curso.entity';
import { CategoriaCurso } from '../categoria-curso/categoria-curso.entity';
import { CursoCategoriaWeb } from '../categoria-curso/curso-categoria-web.entity';
import { WebContenido } from '../web/entities/web-contenido.entity';
import { MensajeContacto } from '../web/entities/mensaje-contacto.entity';
import { WebMedia } from '../web/entities/web-media.entity';
import { WebPagina } from '../web/entities/web-pagina.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Curso,
      CategoriaCurso,
      CursoCategoriaWeb,
      WebContenido,
      MensajeContacto,
      WebMedia,
      WebPagina,
    ]),
  ],
  controllers: [AdminWebController],
  providers: [AdminWebService],
})
export class AdminWebModule {}