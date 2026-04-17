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
  getGrupos(@Param('idcurso') idcurso: number) {
    return this.grupoService.gruposPorCurso(idcurso);
  }

  @Patch(':id/asignar-docente')
  asignarDocente(
    @Param('id', ParseIntPipe) idGrupo: number,
    @Body('idDocente', ParseIntPipe) idDocente: number,
    @Body('permisos') permisos: any,
  ) {
    return this.grupoService.asignarDocente(idGrupo, idDocente, permisos);
  }

  @Get('docente/:iddocente')
  getGruposPorDocente(@Param('iddocente', ParseIntPipe) iddocente: number) {
    return this.grupoService.gruposPorDocente(iddocente);
  }
}
