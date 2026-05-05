import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TareaService } from './tarea.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Tareas Académicas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tarea')
export class TareaController {
  constructor(private readonly tareaService: TareaService) {}

  @Get(':idcurso')
  @ApiOperation({
    summary: 'Obtener tareas por curso',
    description:
      'Retorna todas las tareas (descripción, fecha de entrega y archivos adjuntos) asociadas a un curso específico.',
  })
  @ApiParam({
    name: 'idcurso',
    description: 'ID numérico del curso para filtrar las tareas',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas del curso obtenida exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Se requiere token JWT.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron tareas para el curso proporcionado.',
  })
  async obtenerTarea(@Param('idcurso', ParseIntPipe) idcurso: number) {
    return this.tareaService.obtenerPorCurso(idcurso);
  }
}
