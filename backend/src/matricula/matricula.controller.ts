import {
  Controller,
  Patch,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { MatriculaService } from './matricula.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Matrículas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matricula')
export class MatriculaController {
  constructor(private readonly matriculaService: MatriculaService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar una nueva matrícula',
    description:
      'Vincula a un alumno con un grupo específico y registra el nombre del curso para el historial.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        alumnoId: { type: 'number', example: 5 },
        grupoId: { type: 'number', example: 12 },
        nombreCurso: { type: 'string', example: 'Ingeniería de Software II' },
      },
      required: ['alumnoId', 'grupoId', 'nombreCurso'],
    },
  })
  @ApiResponse({ status: 201, description: 'Matrícula creada exitosamente.' })
  @ApiResponse({
    status: 400,
    description:
      'Error en los datos (ej. alumno ya matriculado en este grupo).',
  })
  crear(@Body() body: any) {
    return this.matriculaService.crear(
      body.alumnoId,
      body.grupoId,
      body.nombreCurso,
    );
  }

  @Get('alumno/:id')
  @ApiOperation({
    summary: 'Listar matrículas de un alumno',
    description:
      'Retorna las matrículas activas de un alumno, con detalles de grupo y curso.',
  })
  @ApiParam({ name: 'id', description: 'ID del alumno' })
  @ApiResponse({
    status: 200,
    description: 'Lista de matrículas con detalle de grupos y cursos.',
  })
  obtenerPorAlumno(@Param('id', ParseIntPipe) id: number) {
    return this.matriculaService.findByAlumno(id);
  }

  @Get('curso/:idcurso/alumnos')
  @ApiOperation({
    summary: 'Listar alumnos matriculados en un curso',
    description:
      'Retorna la lista de alumnos matriculados en un curso específico, junto con su estado de matrícula.',
  })
  @ApiParam({ name: 'idcurso', description: 'ID del curso' })
  @ApiResponse({
    status: 200,
    description: 'Lista de alumnos con sus estados de matrícula.',
  })
  getAlumnosPorCurso(@Param('idcurso', ParseIntPipe) idcurso: number) {
    return this.matriculaService.obtenerAlumnosPorCurso(idcurso);
  }

  @Patch(':id/permisos-certificado')
  @ApiOperation({
    summary: 'Actualizar permisos de visualización y descarga de certificado',
    description:
      'Permite habilitar o deshabilitar si el alumno puede ver o descargar su certificado tras completar el curso.',
  })
  @ApiParam({ name: 'id', description: 'ID de la matrícula' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        puedeVer: { type: 'boolean', example: true },
        puedeDescargar: { type: 'boolean', example: false },
      },
      required: ['puedeVer', 'puedeDescargar'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos actualizados correctamente.',
  })
  actualizarPermisosCertificado(
    @Param('id', ParseIntPipe) idMatricula: number,
    @Body('puedeVer') puedeVer: boolean,
    @Body('puedeDescargar') puedeDescargar: boolean,
  ) {
    return this.matriculaService.actualizarPermisosCertificado(
      idMatricula,
      puedeVer,
      puedeDescargar,
    );
  }
}
