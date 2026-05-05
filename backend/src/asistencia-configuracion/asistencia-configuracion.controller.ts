import { Controller, Get, Param } from '@nestjs/common';
import { AsistenciaService } from '../asistencia/asistencia.service';

@Controller('asistencia-configuracion')
export class AsistenciaConfiguracionController {

  constructor(private readonly asistenciaService: AsistenciaService) {}

  @Get('activo/:idgrupo')
  getActivo(@Param('idgrupo') idgrupo: string) {
    return this.asistenciaService.getConfiguracionActiva(Number(idgrupo));
  }
}