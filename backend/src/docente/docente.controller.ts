import { Controller, Get, Post, Body, UseGuards, Patch, Param, Delete } from '@nestjs/common';
import { DocenteService } from './docente.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@Controller('docente')
@UseGuards(JwtAuthGuard)
export class DocenteController {
  constructor(private readonly docenteService: DocenteService) {}

  @Get()
  findAll() {
    return this.docenteService.findAll();
  }

  @Post()
  create(@Body() createDocenteDto: CreateDocenteDto) {
    return this.docenteService.create(createDocenteDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocenteDto: any) {
    return this.docenteService.update(+id, updateDocenteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.docenteService.remove(+id);
  }
  
  @Patch(':id/habilitar')
  habilitar(@Param('id') id: string) {
    return this.docenteService.habilitar(+id);
  }
}