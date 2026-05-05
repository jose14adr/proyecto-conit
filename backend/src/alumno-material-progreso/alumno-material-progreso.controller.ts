import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AlumnoMaterialProgresoService } from './alumno-material-progreso.service';
import { ReportarProgresoMaterialDto } from './dto/reportar-progreso-material.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Progreso de Materiales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alumno-material-progreso')
export class AlumnoMaterialProgresoController {
  constructor(private readonly service: AlumnoMaterialProgresoService) {}

  @Post('reportar')
  @ApiOperation({
    summary: 'Reportar avance en un material',
    description:
      'Guarda o actualiza el progreso (segundo actual) de un alumno en un material específico.',
  })
  @ApiResponse({
    status: 201,
    description: 'Progreso registrado correctamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos de reporte inválidos.' })
  reportar(@Body() dto: ReportarProgresoMaterialDto) {
    return this.service.reportar(dto);
  }

  @Get('matricula/:idmatricula/material/:idmaterial')
  @ApiOperation({
    summary: 'Obtener progreso específico',
    description:
      'Retorna el último segundo guardado y porcentaje de avance para un material específico.',
  })
  @ApiParam({ name: 'idmatricula', description: 'ID de la matrícula' })
  @ApiParam({ name: 'idmaterial', description: 'ID del material' })
  @ApiResponse({
    status: 200,
    description: 'Retorna el último segundo guardado y porcentaje de avance.',
  })
  obtenerUno(
    @Param('idmatricula') idmatricula: string,
    @Param('idmaterial') idmaterial: string,
  ) {
    return this.service.obtenerUno(Number(idmatricula), Number(idmaterial));
  }

  @Get('matricula/:idmatricula')
  @ApiOperation({
    summary: 'Listar progreso de todos los materiales por matrícula',
    description:
      'Retorna el progreso de todos los materiales para un alumno específico.',
  })
  @ApiParam({
    name: 'idmatricula',
    description: 'ID de la matrícula del alumno',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de avances de todos los materiales del curso.',
  })
  listarPorMatricula(@Param('idmatricula') idmatricula: string) {
    return this.service.listarPorMatricula(Number(idmatricula));
  }
}
