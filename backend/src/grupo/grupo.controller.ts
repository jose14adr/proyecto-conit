import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { GrupoService } from './grupo.service';

@Controller('grupo')
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Post()
  create(@Body() createGrupoDto: any) {
    return this.grupoService.create(createGrupoDto);
  }

  @Get('curso/:idcurso')
  getGrupos(@Param('idcurso', ParseIntPipe) idcurso: number) {
    return this.grupoService.gruposPorCurso(idcurso);
  }

  @Patch(':id/asignar-docente')
  asignarDocente(
    @Param('id', ParseIntPipe) idGrupo: number,
    @Body('idDocente', ParseIntPipe) idDocente: number,
  ) {
    return this.grupoService.asignarDocente(idGrupo, idDocente);
  }

  @Patch(':id/cerrar')
  cerrarGrupo(@Param('id', ParseIntPipe) idGrupo: number) {
    return this.grupoService.cerrarGrupo(idGrupo);
  }

  @Patch(':id/estado')
  actualizarEstado(
    @Param('id', ParseIntPipe) idGrupo: number,
    @Body('estado') estado: string,
  ) {
    return this.grupoService.actualizarEstado(idGrupo, estado);
  }

  @Get('docente/:iddocente')
  getGruposPorDocente(
    @Param('iddocente', ParseIntPipe) iddocente: number,
  ) {
    return this.grupoService.gruposPorDocente(iddocente);
  }
}