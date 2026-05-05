import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { HistorialLoginService } from './historial-login.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Historial de Sesiones')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('historial-login')
export class HistorialLoginController {
  constructor(private readonly historialLoginService: HistorialLoginService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todo el historial de accesos',
    description:
      'Retorna un registro detallado de todos los inicios de sesión en el sistema, incluyendo dirección IP, tipo de dispositivo y marcas de tiempo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de historial obtenida con éxito.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Se requiere un token válido.',
  })
  findAll() {
    return this.historialLoginService.findAll();
  }

  @Patch(':id/cerrar')
  @ApiOperation({
    summary: 'Cerrar una sesión activa de forma remota',
    description:
      'Permite invalidar un registro de sesión específico. Se utiliza normalmente para la función de "cerrar sesión en otros dispositivos".',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del registro de inicio de sesión (sessionId)',
    example: 125,
  })
  @ApiResponse({
    status: 200,
    description: 'La sesión ha sido marcada como cerrada/finalizada.',
  })
  @ApiResponse({
    status: 404,
    description: 'El ID de sesión proporcionado no existe en el historial.',
  })
  cerrarSesion(@Param('id', ParseIntPipe) id: number) {
    return this.historialLoginService.cerrarSesionRemota(id);
  }
}
