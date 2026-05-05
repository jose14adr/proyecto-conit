import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { RecursoService } from './recurso.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Recursos Académicos') // Agrupación en Swagger
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recurso')
export class RecursoController {
  constructor(private readonly recursoService: RecursoService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos los recursos',
    description:
      'Obtiene una lista de todos los recursos (archivos, links, documentos) disponibles en la plataforma.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de recursos obtenida con éxito.',
  })
  listarRecursos() {
    return this.recursoService.obtenerRecursos();
  }

  @Patch(':id/click')
  @ApiOperation({
    summary: 'Registrar interacción con un recurso',
    description:
      'Incrementa el contador de clics de un recurso específico. Útil para estadísticas de uso.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID numérico del recurso',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Interacción registrada e incremento realizado.',
  })
  @ApiResponse({
    status: 404,
    description: 'El recurso solicitado no existe.',
  })
  registrarClick(@Param('id', ParseIntPipe) id: number) {
    return this.recursoService.incrementarClicks(id);
  }
}
