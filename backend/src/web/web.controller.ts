import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WebService } from './web.service';

@Controller('web')
export class WebController {
  constructor(private readonly webService: WebService) {}
  
  @Post('contacto/mensaje')
  registrarMensajeContacto(@Body() data: any) {
    return this.webService.registrarMensajeContacto(data);
  }

  @Get('contenido/:pagina')
  obtenerContenidoPagina(@Param('pagina') pagina: string) {
    return this.webService.obtenerContenidoPagina(pagina);
  }
  
  @Get('categorias')
  listarCategoriasWeb() {
    return this.webService.listarCategoriasWeb();
  }

  @Get('cursos')
  listarCursosWeb() {
    return this.webService.listarCursosWeb();
  }

  @Get('cursos-destacados')
  listarCursosDestacadosWeb() {
    return this.webService.listarCursosDestacadosWeb();
  }

  @Get('cursos/:idOrSlug')
  obtenerCursoWeb(@Param('idOrSlug') idOrSlug: string) {
    return this.webService.obtenerCursoWeb(idOrSlug);
  }

  @Get('categorias/:slug/cursos')
  listarCursosPorCategoria(@Param('slug') slug: string) {
    return this.webService.listarCursosPorCategoria(slug);
  }

  // ==============================
  // PÁGINAS WEB
  // ==============================

  @Get('paginas/menu')
  listarPaginasMenu() {
    return this.webService.listarPaginasMenu();
  }

  @Get('paginas/:slug')
  obtenerPaginaPorSlug(@Param('slug') slug: string) {
    return this.webService.obtenerPaginaPorSlug(slug);
  }
}