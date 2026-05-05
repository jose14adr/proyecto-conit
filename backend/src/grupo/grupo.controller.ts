import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { GrupoService } from './grupo.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Grupos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('grupo')
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo grupo',
    description:
      'Registra un grupo para un curso, definiendo su nombre, fecha de inicio y fin.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idcurso: { type: 'number', example: 1 },
        nombre: { type: 'string', example: 'Grupo A - Mañana' },
        fecha_inicio: { type: 'string', format: 'date', example: '2026-05-01' },
        fecha_fin: { type: 'string', format: 'date', example: '2026-08-30' },
      },
      required: ['idcurso', 'nombre'],
    },
  })
  @ApiResponse({ status: 201, description: 'Grupo creado exitosamente.' })
  create(@Body() createGrupoDto: any) {
    return this.grupoService.create(createGrupoDto);
  }

  @Get('curso/:idcurso')
  @ApiOperation({
    summary: 'Obtener grupos por curso',
    description: 'Retorna la lista de grupos asociados a un curso específico.',
  })
  @ApiParam({
    name: 'idcurso',
    description: 'ID del curso para listar sus grupos',
  })
  @ApiResponse({ status: 200, description: 'Lista de grupos del curso.' })
  getGrupos(@Param('idcurso', ParseIntPipe) idcurso: number) {
    return this.grupoService.gruposPorCurso(idcurso);
  }

  @Patch(':id/asignar-docente')
  @ApiOperation({
    summary: 'Asignar un docente a un grupo',
    description:
      'Vincula a un docente con un grupo y define sus permisos de edición o lectura.',
  })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idDocente: { type: 'number', example: 3 },
        permisos: {
          type: 'object',
          example: { editar: true, eliminar: false },
          description: 'Objeto JSON con los permisos del docente en el grupo',
        },
      },
      required: ['idDocente'],
    },
  })
  @ApiResponse({ status: 200, description: 'Docente asignado correctamente.' })
  asignarDocente(
    @Param('id', ParseIntPipe) idGrupo: number,
    @Body('idDocente', ParseIntPipe) idDocente: number,
    @Body('permisos') permisos: any,
  ) {
    return this.grupoService.asignarDocente(idGrupo, idDocente, permisos);
  }

  @Patch(':id/cerrar')
  @ApiOperation({
    summary: 'Cerrar un grupo',
    description:
      'Cambia el estado del grupo a cerrado, impidiendo nuevas acciones.',
  })
  @ApiResponse({ status: 200, description: 'Grupo cerrado.' })
  cerrarGrupo(@Param('id', ParseIntPipe) idGrupo: number) {
    return this.grupoService.cerrarGrupo(idGrupo);
  }

  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Actualizar estado del grupo',
    description:
      'Modifica el estado de un grupo específico, permitiendo activarlo, desactivarlo o finalizarlo.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estado: {
          type: 'string',
          example: 'ACTIVO',
          enum: ['ACTIVO', 'INACTIVO', 'FINALIZADO'],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Estado actualizado.' })
  actualizarEstado(
    @Param('id', ParseIntPipe) idGrupo: number,
    @Body('estado') estado: string,
  ) {
    return this.grupoService.actualizarEstado(idGrupo, estado);
  }

  @Get('docente/:iddocente')
  @ApiOperation({
    summary: 'Listar grupos asignados a un docente',
    description:
      'Retorna la lista de grupos donde dicta un docente específico.',
  })
  @ApiParam({ name: 'iddocente', description: 'ID del docente' })
  @ApiResponse({
    status: 200,
    description: 'Lista de grupos donde dicta el docente.',
  })
  getGruposPorDocente(@Param('iddocente', ParseIntPipe) iddocente: number) {
    return this.grupoService.gruposPorDocente(iddocente);
  }

  @Get('alumno/:idalumno')
  @ApiOperation({
    summary: 'Listar grupos donde está matriculado un alumno',
    description:
      'Retorna la lista de grupos donde un alumno específico está matriculado.',
  })
  @ApiParam({ name: 'idalumno', description: 'ID del alumno' })
  @ApiResponse({ status: 200, description: 'Lista de grupos del alumno.' })
  obtenerGruposPorAlumno(@Param('idalumno') idalumno: string) {
    return this.grupoService.obtenerPorAlumno(Number(idalumno));
  }
}
