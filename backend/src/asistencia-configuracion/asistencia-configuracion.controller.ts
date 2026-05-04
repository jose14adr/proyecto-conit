import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AsistenciaService } from '../asistencia/asistencia.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Asistencia - Configuración')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('asistencia-configuracion')
export class AsistenciaConfiguracionController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  @Get('activo/:idgrupo')
  @ApiOperation({
    summary: 'Obtener configuración de asistencia activa',
    description:
      'Retorna los parámetros de configuración (tolerancia, fechas permitidas, etc.) para el marcado de asistencia de un grupo específico.',
  })
  @ApiParam({
    name: 'idgrupo',
    description: 'ID del grupo al que pertenece el curso',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración encontrada y retornada.',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró una configuración activa para este grupo.',
  })
  getActivo(@Param('idgrupo') idgrupo: string) {
    return this.asistenciaService.getConfiguracionActiva(Number(idgrupo));
  }
}
