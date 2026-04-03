import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { SoporteService } from './soporte.service';

@Controller('soporte')
export class SoporteController {
  constructor(private readonly soporteService: SoporteService) {}

  @Post()
  create(@Body() body: any) {
    return this.soporteService.create(body);
  }

  @Get()
  findAll() {
    return this.soporteService.findAll();
  }

  @Get('alumno/:idalumno')
  findByAlumno(@Param('idalumno', ParseIntPipe) idalumno: number) {
    return this.soporteService.findByAlumno(idalumno);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.soporteService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.soporteService.update(id, body);
  }

  @Post(':id/adjuntos')
  addAdjuntos(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { adjuntos: any[] },
  ) {
    return this.soporteService.addAdjuntos(id, body.adjuntos || []);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.soporteService.remove(id);
  }
}