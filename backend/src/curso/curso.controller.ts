import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Patch,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CursoService } from './curso.service';
import { Curso } from './entities/curso.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { Matricula } from '../matricula/entities/matricula.entity';

@Controller('curso')
@UseGuards(JwtAuthGuard)
export class CursoController {
  constructor(
    private readonly cursoService: CursoService
  ) {}

  @Get()
  findAll() {
    return this.cursoService.findAll();
  }

  @Get('/alumno/:id')
  async obtenerCursos(@Param('id') id: number): Promise<Matricula[]> {
    return this.cursoService.listarCursosAlumno(id);
  }

  @Get('/alumno/:idalumno/curso/:idcurso')
  async obtenerCursoAlumno(
    @Param('idalumno') idalumno: string,
    @Param('idcurso') idcurso: string,
  ) {
    return this.cursoService.obtenerUnoCursoAlumno(
      Number(idcurso),
      Number(idalumno),
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cursoService.obtenerUno(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cursoService.remove(id);
  }

  @Patch(':id/habilitar')
  habilitar(@Param('id', ParseIntPipe) id: number) {
    return this.cursoService.habilitar(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.cursoService.create(data);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.cursoService.update(id, data);
  }
}
