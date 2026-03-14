import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TareaService } from './tarea.service';

@Controller('tarea')
export class TareaController {

  constructor(private readonly tareaService: TareaService) {}

  @Get(':idcurso')
  async obtenerTarea(
    @Param('idcurso', ParseIntPipe) idcurso: number,
  ) {
    return this.tareaService.obtenerPorCurso(idcurso);
  }

}