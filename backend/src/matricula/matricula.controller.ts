import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { MatriculaService } from './matricula.service';

@Controller('matricula')
export class MatriculaController {

  constructor(private readonly matriculaService: MatriculaService) {}

  @Post()
crear(@Body() body){

  return this.matriculaService.crear(
    body.alumnoId,
    body.grupoId,
    body.nombreCurso
  );

}

}