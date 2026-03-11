import { Controller, Get, Param } from '@nestjs/common';
import { GrupoService } from './grupo.service';

@Controller('grupo')
export class GrupoController {

  constructor(
    private readonly grupoService: GrupoService
  ) {}

  @Get("curso/:idcurso")
  getGrupos(@Param("idcurso") idcurso: number) {
    return this.grupoService.gruposPorCurso(idcurso);
  }

}