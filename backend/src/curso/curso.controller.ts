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
  constructor(private readonly cursoService: CursoService) {}

  @Get()
  findAll() {
    return this.cursoService.findAll();
  }

  // Ruta general para el detalle del curso (Tu versión local)
  @Get('detalle/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cursoService.obtenerUno(id);
  }

  // Rutas específicas para el alumno (Versión de la nube)
  @Get('/alumno/:id')
  async obtenerCursos(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Matricula[]> {
    return this.cursoService.listarCursosAlumno(id);
  }

  @Get('/alumno/:idalumno/curso/:idcurso')
  async obtenerCursoAlumno(
    @Param('idalumno', ParseIntPipe) idalumno: number,
    @Param('idcurso', ParseIntPipe) idcurso: number,
  ) {
    return this.cursoService.obtenerUnoCursoAlumno(idcurso, idalumno);
  }

  @Get(':id')
  async obtenerCurso(@Param('id', ParseIntPipe) id: number) {
    return this.cursoService.obtenerUnoCursoAlumno(id);
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
