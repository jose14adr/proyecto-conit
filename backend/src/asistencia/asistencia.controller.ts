import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AsistenciaService } from './asistencia.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Asistencia')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly service: AsistenciaService) {}

  @Get('alumno/:idalumno')
  @ApiOperation({
    summary: 'Obtener todas las asistencias de un alumno',
    description:
      'Retorna una lista de todas las asistencias registradas para un alumno específico.',
  })
  @ApiParam({ name: 'idalumno', description: 'ID del alumno a consultar' })
  @ApiResponse({ status: 200, description: 'Lista de asistencias retornada.' })
  getPorAlumno(@Param('idalumno', ParseIntPipe) idalumno: number) {
    return this.service.obtenerTodasPorAlumno(idalumno);
  }

  @Get('historial/:idalumno/:idgrupo')
  @ApiOperation({
    summary: 'Obtener historial de asistencia por grupo específico',
    description:
      'Retorna el historial detallado de asistencias de un alumno en un grupo específico, incluyendo fechas, estados y evidencias.',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial detallado del alumno en ese grupo.',
  })
  getHistorial(
    @Param('idalumno', ParseIntPipe) idalumno: number,
    @Param('idgrupo', ParseIntPipe) idgrupo: number,
  ) {
    return this.service.historial(idalumno, idgrupo);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Registrar una asistencia con archivo', description: 'Crea un nuevo registro de asistencia para un alumno, con la opción de adjuntar un archivo como evidencia.' })
  @ApiBody({
    description: 'Datos de la asistencia y archivo adjunto',
    schema: {
      type: 'object',
      properties: {
        idgrupo: { type: 'integer', example: 1 },
        idalumno: { type: 'integer', example: 5 },
        fecha: { type: 'string', format: 'date', example: '2026-04-29' },
        estado: { type: 'string', example: 'presente' },
        tipo_justificacion: { type: 'string', example: 'Salud' },
        observacion: { type: 'string', example: 'Adjunto receta' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Asistencia creada correctamente.' })
  async crearAsistencia(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    return this.service.crear(body, file);
  }
}
