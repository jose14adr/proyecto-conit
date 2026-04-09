import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocenteCursoAdicionalService } from './docente-curso-adicional.service';
import { CreateDocenteCursoAdicionalDto } from './dto/create-docente-curso-adicional.dto';
import { UpdateDocenteCursoAdicionalDto } from './dto/update-docente-curso-adicional.dto';

@Controller('docente-curso-adicional')
export class DocenteCursoAdicionalController {
  constructor(private readonly docenteCursoAdicionalService: DocenteCursoAdicionalService) {}

  @Post()
  create(@Body() createDocenteCursoAdicionalDto: CreateDocenteCursoAdicionalDto) {
    return this.docenteCursoAdicionalService.create(createDocenteCursoAdicionalDto);
  }

  @Get()
  findAll() {
    return this.docenteCursoAdicionalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.docenteCursoAdicionalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocenteCursoAdicionalDto: UpdateDocenteCursoAdicionalDto) {
    return this.docenteCursoAdicionalService.update(+id, updateDocenteCursoAdicionalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.docenteCursoAdicionalService.remove(+id);
  }
}
