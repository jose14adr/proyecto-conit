import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ExamenService } from './examen.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Exámenes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('examen')
export class ExamenController {
  constructor(private readonly examenService: ExamenService) {}

  @Get('curso/:grupoId')
  @ApiOperation({
    summary: 'Obtener exámenes por grupo',
    description:
      'Retorna la lista de exámenes asociados a un grupo específico del curso.',
  })
  @ApiParam({ name: 'grupoId', description: 'ID del grupo', example: 1 })
  @ApiResponse({ status: 200, description: 'Lista de exámenes obtenida.' })
  getByCurso(@Param('grupoId', ParseIntPipe) grupoId: number) {
    return this.examenService.getByCurso(grupoId);
  }

  @Post('responder')
  @ApiOperation({
    summary: 'Enviar respuestas de un examen',
    description:
      'Registra las respuestas marcadas por el alumno para un intento específico.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        intentoId: { type: 'number', example: 101 },
        respuestas: {
          type: 'object',
          additionalProperties: { type: 'number' },
          example: { '1': 5, '2': 8 },
          description: 'Mapa de { idPregunta: idOpcionSeleccionada }',
        },
      },
      required: ['intentoId', 'respuestas'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Respuestas procesadas y examen calificado.',
  })
  async responder(
    @Body() body: { intentoId: number; respuestas: Record<string, number> },
  ) {
    return await this.examenService.responder(body.intentoId, body.respuestas);
  }

  @Post(':id/iniciar')
  @ApiOperation({
    summary: 'Iniciar un intento de examen',
    description:
      'Crea un registro de inicio de examen para controlar el tiempo y el número de intentos.',
  })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idAlumno: { type: 'number', example: 5 },
      },
      required: ['idAlumno'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Intento de examen creado correctamente.',
  })
  iniciar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { idAlumno: number },
  ) {
    return this.examenService.iniciar(id, body.idAlumno);
  }

  @Get('intentos/:idAlumno')
  @ApiOperation({
    summary: 'Obtener intentos realizados por un alumno',
    description:
      'Retorna la lista de intentos de examen realizados por un alumno específico.',
  })
  @ApiParam({ name: 'idAlumno', description: 'ID del alumno' })
  @ApiResponse({ status: 200, description: 'Lista de intentos encontrados.' })
  getIntentos(@Param('idAlumno', ParseIntPipe) idAlumno: number) {
    return this.examenService.getIntentosAlumno(idAlumno);
  }

  @Get('historial/:idAlumno')
  @ApiOperation({
    summary: 'Ver historial de calificaciones de exámenes',
    description:
      'Muestra el historial completo de resultados de exámenes para un alumno.',
  })
  @ApiParam({ name: 'idAlumno', description: 'ID del alumno' })
  @ApiResponse({
    status: 200,
    description: 'Historial de resultados obtenido.',
  })
  async getHistorial(@Param('idAlumno', ParseIntPipe) idAlumno: number) {
    return await this.examenService.getHistorial(idAlumno);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle completo de un examen',
    description:
      'Retorna el examen con sus preguntas y opciones para ser renderizado.',
  })
  @ApiParam({ name: 'id', description: 'ID del examen' })
  @ApiResponse({ status: 200, description: 'Estructura completa del examen.' })
  getExamen(@Param('id', ParseIntPipe) id: number) {
    return this.examenService.getExamenCompleto(Number(id));
  }
}
