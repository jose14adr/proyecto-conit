import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AlumnoMaterialProgresoService } from './alumno-material-progreso.service';
import { ReportarProgresoMaterialDto } from './dto/reportar-progreso-material.dto';

@Controller('alumno-material-progreso')
export class AlumnoMaterialProgresoController {
  constructor(
    private readonly service: AlumnoMaterialProgresoService,
  ) {}

  @Post('reportar')
  reportar(@Body() dto: ReportarProgresoMaterialDto) {
    return this.service.reportar(dto);
  }

  @Get('matricula/:idmatricula/material/:idmaterial')
  obtenerUno(
    @Param('idmatricula') idmatricula: string,
    @Param('idmaterial') idmaterial: string,
  ) {
    return this.service.obtenerUno(Number(idmatricula), Number(idmaterial));
  }

  @Get('matricula/:idmatricula')
  listarPorMatricula(@Param('idmatricula') idmatricula: string) {
    return this.service.listarPorMatricula(Number(idmatricula));
  }
}