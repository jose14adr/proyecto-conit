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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Cursos')
@ApiBearerAuth()
@Controller('curso')
@UseGuards(JwtAuthGuard)
export class CursoController {
  constructor(private readonly cursoService: CursoService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos los cursos',
    description:
      'Retorna un listado general de todos los cursos registrados en el sistema.',
  })
  @ApiResponse({ status: 200, description: 'Lista de cursos obtenida.' })
  findAll() {
    return this.cursoService.findAll();
  }

  // Ruta general para el detalle del curso (Tu versión local)
  @Get('detalle/:id')
  @ApiOperation({
    summary: 'Obtener detalle general de un curso',
    description:
      'Retorna toda la información detallada de un curso específico, incluyendo su temario, grupos asociados, sesiones en vivo, etc.',
  })
  @ApiParam({ name: 'id', description: 'ID del curso' })
  @ApiResponse({ status: 200, description: 'Información detallada del curso.' })
  @ApiResponse({ status: 404, description: 'Curso no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cursoService.obtenerUno(id);
  }

  // Rutas específicas para el alumno (Versión de la nube)
  @Get('/alumno/:id')
  @ApiOperation({
    summary: 'Listar cursos matriculados de un alumno',
    description:
      'Retorna los cursos en los que un alumno específico tiene una matrícula activa.',
  })
  @ApiParam({ name: 'id', description: 'ID del alumno' })
  @ApiResponse({
    status: 200,
    description: 'Lista de matrículas con información de cursos.',
  })
  async obtenerCursos(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Matricula[]> {
    return this.cursoService.listarCursosAlumno(id);
  }

  @Get('/alumno/:idalumno/curso/:idcurso')
  @ApiOperation({
    summary: 'Obtener información de un curso específico para un alumno',
    description:
      'Retorna la información detallada de un curso específico para un alumno, incluyendo su temario, grupos asociados, sesiones en vivo, etc.',
  })
  @ApiParam({ name: 'idalumno', description: 'ID del alumno' })
  @ApiParam({ name: 'idcurso', description: 'ID del curso' })
  @ApiResponse({
    status: 200,
    description: 'Detalle del curso desde la perspectiva del alumno.',
  })
  async obtenerCursoAlumno(
    @Param('idalumno', ParseIntPipe) idalumno: number,
    @Param('idcurso', ParseIntPipe) idcurso: number,
  ) {
    return this.cursoService.obtenerUnoCursoAlumno(idcurso, idalumno);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar o deshabilitar un curso',
    description: 'Elimina o deshabilita un curso específico por su ID.',
  })
  @ApiResponse({ status: 200, description: 'Curso eliminado correctamente.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cursoService.remove(id);
  }

  @Patch(':id/habilitar')
  @ApiOperation({
    summary: 'Habilitar un curso previamente deshabilitado',
    description:
      'Habilita un curso específico que haya sido previamente deshabilitado.',
  })
  @ApiResponse({ status: 200, description: 'Curso habilitado.' })
  habilitar(@Param('id', ParseIntPipe) id: number) {
    return this.cursoService.habilitar(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo curso',
    description: 'Crea un nuevo curso con la información proporcionada.',
  })
  @ApiBody({
    description: 'Estructura de datos para un nuevo curso',
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string', example: 'Ingeniería de Software' },
        descripcion: {
          type: 'string',
          example: 'Curso avanzado de arquitectura...',
        },
        idempresa: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Curso creado exitosamente.' })
  create(@Body() data: any) {
    return this.cursoService.create(data);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar información de un curso',
    description: 'Actualiza los datos de un curso específico por su ID.',
  })
  @ApiBody({ description: 'Datos parciales del curso a actualizar' })
  @ApiResponse({ status: 200, description: 'Curso actualizado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.cursoService.update(id, data);
  }
}
