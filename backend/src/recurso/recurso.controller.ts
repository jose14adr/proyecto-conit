import { Controller, Get, Patch, Param } from '@nestjs/common';
import { RecursoService } from './recurso.service';

@Controller('recurso')
export class RecursoController {

  constructor(private readonly recursoService: RecursoService) {}

  @Get()
  listarRecursos() {
    return this.recursoService.obtenerRecursos();
  }

  @Patch(':id/click')
  registrarClick(@Param('id') id: number) {
    return this.recursoService.incrementarClicks(id);
  }

}