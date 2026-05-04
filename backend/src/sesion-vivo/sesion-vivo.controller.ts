import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { SesionVivoService } from './sesion-vivo.service';
import { SesionVivo } from './entities/sesion-vivo.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Sesiones en Vivo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sesion-vivo')
export class SesionVivoController {
  constructor(private readonly service: SesionVivoService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todas las sesiones en vivo',
    description:
      'Retorna un listado global de todas las clases programadas en el sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sesiones obtenida con éxito.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  async obtener(): Promise<SesionVivo[]> {
    return this.service.obtenerSesiones();
  }

  @Get('curso/:idcurso')
  @ApiOperation({
    summary: 'Obtener sesiones por curso',
    description:
      'Filtra y retorna las sesiones en vivo que pertenecen a un curso específico.',
  })
  @ApiParam({ name: 'idcurso', description: 'ID del curso', example: 1 })
  @ApiResponse({ status: 200, description: 'Lista de sesiones del curso.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  async obtenerPorCurso(
    @Param('idcurso', ParseIntPipe) idcurso: number,
  ): Promise<SesionVivo[]> {
    return this.service.obtenerSesionesPorCurso(idcurso);
  }

  @Post()
  @ApiOperation({
    summary: 'Programar una nueva sesión en vivo',
    description:
      'Crea una nueva clase en vivo vinculada a un curso. Requiere título, fecha e ID del curso.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idcurso: { type: 'number', example: 1 },
        titulo: {
          type: 'string',
          example: 'Clase Magistral: Arquitectura de Microservicios',
        },
        descripcion: {
          type: 'string',
          example: 'En esta sesión revisaremos patrones de diseño aplicados...',
          nullable: true,
        },
        fecha: {
          type: 'string',
          format: 'date-time',
          example: '2026-05-15T18:00:00Z',
        },
        duracion: {
          type: 'number',
          example: 60,
          description: 'Duración estimada en minutos',
        },
      },
      required: ['idcurso', 'titulo', 'fecha'],
    },
  })
  @ApiResponse({ status: 201, description: 'Sesión programada correctamente.' })
  @ApiResponse({
    status: 400,
    description:
      'Error en la validación: faltan campos obligatorios o el body está vacío.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  async crear(@Body() body: any): Promise<SesionVivo> {
    if (!body) {
      throw new BadRequestException('Body vacío');
    }

    if (!body.idcurso || !body.titulo || !body.fecha) {
      throw new BadRequestException('Faltan campos obligatorios');
    }

    return this.service.crearSesion({
      idcurso: Number(body.idcurso),
      titulo: String(body.titulo),
      descripcion: body.descripcion ? String(body.descripcion) : '',
      fecha: String(body.fecha),
      duracion: Number(body.duracion || 0),
    });
  }
}
