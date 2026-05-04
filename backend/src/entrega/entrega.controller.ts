import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { EntregaService } from './entrega.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Entregas de Tareas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('entrega')
export class EntregaController {
  constructor(private entregaService: EntregaService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar entrega de tarea',
    description:
      'Permite al alumno enviar su respuesta a una tarea (archivo, texto o link).',
  })
  @ApiBody({
    description: 'Datos de la entrega',
    schema: {
      type: 'object',
      properties: {
        idtarea: { type: 'number', example: 10 },
        idmatricula: { type: 'number', example: 5 },
        comentario: {
          type: 'string',
          example: 'Adjunto el documento solicitado.',
          nullable: true,
        },
        archivo_url: {
          type: 'string',
          example: 'https://storage.../tarea.pdf',
          nullable: true,
        },
        enlace_url: {
          type: 'string',
          example: 'https://github.com/...',
          nullable: true,
        },
      },
      required: ['idtarea', 'idmatricula'],
    },
  })
  @ApiResponse({ status: 201, description: 'Entrega registrada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrega inválidos.' })
  crear(@Body() body) {
    return this.entregaService.crearEntrega(body);
  }

  @Get('alumno/:id')
  @ApiOperation({
    summary: 'Listar entregas de un alumno',
    description:
      'Obtiene el historial de todas las tareas entregadas por un alumno específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del alumno (no del usuario)',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Lista de entregas encontrada.' })
  getAlumno(@Param('id') id: number) {
    return this.entregaService.obtenerEntregasAlumno(id);
  }
}
