import { Controller,Post, Body, Get, Param } from '@nestjs/common';
import { EntregaService } from './entrega.service';

@Controller('entrega')
export class EntregaController {

  constructor(private entregaService: EntregaService) {}

  @Post()
  crear(@Body() body) {
    return this.entregaService.crearEntrega(body)
  }

  @Get('alumno/:id')
  getAlumno(@Param('id') id: number) {
    return this.entregaService.obtenerEntregasAlumno(id)
  }

}
