import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EntregasVideoService } from './entregas-video.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Entregas de Video')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('entregas_video')
export class EntregasVideoController {
  constructor(private service: EntregasVideoService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar una nueva entrega de video',
    description:
      'Guarda la información de un video entregado por el alumno para un curso específico.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idcurso: { type: 'number', example: 1 },
        idalumno: { type: 'number', example: 5 },
        titulo: { type: 'string', example: 'Presentación de Proyecto Final' },
        video_url: { type: 'string', example: 'https://vimeo.com/123456789' },
        descripcion: {
          type: 'string',
          example: 'Explicación de la arquitectura del sistema.',
          nullable: true,
        },
      },
      required: ['idcurso', 'idalumno', 'video_url'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Entrega de video creada con éxito.',
  })
  crear(@Body() body: any) {
    return this.service.crear(body);
  }

  @Get(':curso_id')
  @ApiOperation({
    summary: 'Obtener entregas de video por curso',
    description:
      'Retorna una lista de todas las entregas de video asociadas a un curso específico.',
  })
  @ApiParam({
    name: 'curso_id',
    description: 'ID del curso para filtrar las entregas',
  })
  @ApiResponse({ status: 200, description: 'Lista de entregas obtenida.' })
  obtener(@Param('curso_id') curso_id: number) {
    return this.service.obtener(curso_id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar una entrega de video existente',
    description: 'Modifica los datos de una entrega de video registrada.',
  })
  @ApiParam({ name: 'id', description: 'ID de la entrega de video' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        video_url: { type: 'string' },
        descripcion: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Entrega actualizada.' })
  actualizar(@Param('id') id: number, @Body() body: any) {
    return this.service.actualizar(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar una entrega de video',
    description: 'Elimina una entrega de video específica por su ID.',
  })
  @ApiParam({ name: 'id', description: 'ID de la entrega a eliminar' })
  @ApiResponse({ status: 200, description: 'Entrega eliminada correctamente.' })
  eliminar(@Param('id') id: number) {
    return this.service.eliminar(id);
  }
}
