import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AdminWebService } from './admin-web.service';

@Controller('admin-web')
export class AdminWebController {
  constructor(private readonly adminWebService: AdminWebService) {}

  // ==============================
  // CATEGORÍAS WEB
  // ==============================

  @Get('categorias')
  listarCategorias() {
    return this.adminWebService.listarCategorias();
  }

  @Post('categorias')
  crearCategoria(@Body() data: any) {
    return this.adminWebService.crearCategoria(data);
  }

  @Patch('categorias/:id')
  actualizarCategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.adminWebService.actualizarCategoria(id, data);
  }

  @Delete('categorias/:id')
  eliminarCategoria(@Param('id', ParseIntPipe) id: number) {
    return this.adminWebService.eliminarCategoria(id);
  }

  // ==============================
  // CURSOS WEB
  // ==============================

  @Get('cursos')
  listarCursosWebAdmin() {
    return this.adminWebService.listarCursosWebAdmin();
  }

  @Patch('cursos/:id/web')
  actualizarCursoWeb(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.adminWebService.actualizarCursoWeb(id, data);
  }

  @Post('cursos/:id/categorias')
  asignarCategoriasCurso(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.adminWebService.asignarCategoriasCurso(id, data);
  }

  // ==============================
  // CONTENIDO WEB
  // ==============================

  @Get('contenido/:pagina')
  obtenerContenidoPagina(@Param('pagina') pagina: string) {
    return this.adminWebService.obtenerContenidoPagina(pagina);
  }

  @Patch('contenido/:pagina')
  actualizarContenidoPagina(
    @Param('pagina') pagina: string,
    @Body() data: any,
  ) {
    return this.adminWebService.actualizarContenidoPagina(pagina, data);
  }

  // ==============================
  // MENSAJES DE CONTACTO
  // ==============================

  @Get('contacto/mensajes')
  listarMensajesContacto() {
    return this.adminWebService.listarMensajesContacto();
  }

  @Patch('contacto/mensajes/:id/leido')
  marcarMensajeContactoLeido(@Param('id', ParseIntPipe) id: number) {
    return this.adminWebService.marcarMensajeContactoLeido(id);
  }

  @Patch('contacto/mensajes/:id/estado')
  actualizarEstadoMensajeContacto(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.adminWebService.actualizarEstadoMensajeContacto(id, data);
  }

  // ==============================
  // MEDIOS WEB
  // ==============================

  @Get('medios')
  listarMediosWeb() {
    return this.adminWebService.listarMediosWeb();
  }

  @Post('medios/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 8 * 1024 * 1024,
      },
    }),
  )
  subirMedioWeb(@UploadedFile() file: any, @Body() data: any) {
    return this.adminWebService.subirMedioWeb(file, data);
  }

  @Delete('medios/:id')
  eliminarMedioWeb(@Param('id', ParseIntPipe) id: number) {
    return this.adminWebService.eliminarMedioWeb(id);
  }

  // ==============================
  // PÁGINAS WEB
  // ==============================

  @Get('paginas')
  listarPaginasAdmin() {
    return this.adminWebService.listarPaginasAdmin();
  }

  @Post('paginas')
  crearPaginaAdmin(@Body() data: any) {
    return this.adminWebService.crearPaginaAdmin(data);
  }

  @Patch('paginas/:id')
  actualizarPaginaAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ) {
    return this.adminWebService.actualizarPaginaAdmin(id, data);
  }

  @Delete('paginas/:id')
  eliminarPaginaAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.adminWebService.eliminarPaginaAdmin(id);
  }
}