import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SoporteService } from './soporte.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Soporte Técnico')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('soporte')
export class SoporteController {
  constructor(private readonly soporteService: SoporteService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo ticket de soporte',
    description:
      'Registra una solicitud de ayuda técnica o académica de un alumno.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idalumno: { type: 'number', example: 5 },
        asunto: { type: 'string', example: 'Error al cargar examen' },
        mensaje: {
          type: 'string',
          example: 'No puedo visualizar las imágenes en la pregunta 3.',
        },
        prioridad: {
          type: 'string',
          example: 'ALTA',
          enum: ['BAJA', 'MEDIA', 'ALTA'],
        },
        categoria: { type: 'string', example: 'Técnico' },
      },
      required: ['idalumno', 'asunto', 'mensaje'],
    },
  })
  @ApiResponse({ status: 201, description: 'Ticket creado exitosamente.' })
  @ApiResponse({
    status: 400,
    description:
      'Error en la validación: faltan campos obligatorios o el body está vacío.',
  })
  create(@Body() body: any) {
    return this.soporteService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los tickets (Vista Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de solicitudes de soporte.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  findAll() {
    return this.soporteService.findAll();
  }

  @Get('alumno/:idalumno')
  @ApiOperation({ summary: 'Listar tickets de un alumno específico' })
  @ApiParam({ name: 'idalumno', description: 'ID del alumno' })
  @ApiResponse({ status: 200, description: 'Historial de tickets del alumno.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  findByAlumno(@Param('idalumno', ParseIntPipe) idalumno: number) {
    return this.soporteService.findByAlumno(idalumno);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un ticket' })
  @ApiParam({ name: 'id', description: 'ID del ticket' })
  @ApiResponse({ status: 200, description: 'Detalle del ticket obtenido.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.soporteService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar estado o respuesta de un ticket' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estado: {
          type: 'string',
          example: 'EN_PROCESO',
          enum: ['ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'],
        },
        respuesta_admin: {
          type: 'string',
          example: 'Estamos revisando el servidor de imágenes.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket actualizado correctamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.soporteService.update(id, body);
  }

  @Post(':id/adjuntos')
  @ApiOperation({
    summary: 'Añadir archivos o enlaces adjuntos a un ticket',
    description:
      'Permite vincular URLs de archivos (previamente subidos a S3) como evidencia para el ticket.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        adjuntos: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                example: 'https://bucket.s3.amazonaws.com/evidencia.png',
              },
              nombre: { type: 'string', example: 'error-pantalla.png' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Adjuntos vinculados al ticket.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  addAdjuntos(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { adjuntos: any[] },
  ) {
    return this.soporteService.addAdjuntos(id, body.adjuntos || []);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un ticket de soporte' })
  @ApiResponse({ status: 200, description: 'Ticket eliminado del sistema.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.soporteService.remove(id);
  }
}
