import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { MatriculaService } from './matricula.service';

@Controller('matricula')
export class MatriculaController {
  constructor(private readonly matriculaService: MatriculaService) {}

  @Post()
  crear(@Body() body) {
    return this.matriculaService.crear(
      body.alumnoId,
      body.grupoId,
      body.nombreCurso,
    );
  }

  @Get('alumno/:id')
  obtenerPorAlumno(@Param('id', ParseIntPipe) id: number) {
    return this.matriculaService.findByAlumno(id);
  }

  @Get('curso/:idcurso/alumnos')
  getAlumnosPorCurso(@Param('idcurso') idcurso: number) {
    return this.matriculaService.obtenerAlumnosPorCurso(idcurso);
  }
}
