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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { SesionVivoService } from './sesion-vivo.service';
import { SesionVivoResponseDto } from './dto/sesion-vivo-response.dto';

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
  async obtener(): Promise<SesionVivoResponseDto[]> {
    return this.service.obtenerSesiones();
  }

  @Get('grupo/:idgrupo')
  @ApiOperation({
    summary: 'Obtener sesiones por grupo',
    description:
      'Filtra y retorna las sesiones en vivo programadas para un grupo específico.',
  })
  @ApiParam({ name: 'idgrupo', description: 'ID del grupo', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Lista de sesiones del grupo obtenida con éxito.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  async obtenerPorGrupo(
    @Param('idgrupo', ParseIntPipe) idgrupo: number,
  ): Promise<SesionVivoResponseDto[]> {
    return this.service.obtenerSesionesPorGrupo(idgrupo);
  }

  @Get('grupo/:idgrupo/provider')
  @ApiOperation({
    summary: 'Obtener proveedor de reuniones del grupo',
    description:
      'Retorna información del proveedor configurado para crear sesiones en vivo del grupo.',
  })
  @ApiParam({ name: 'idgrupo', description: 'ID del grupo', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Información del proveedor obtenida con éxito.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  async obtenerProviderInfo(
    @Param('idgrupo', ParseIntPipe) idgrupo: number,
  ) {
    return this.service.obtenerProviderInfoPorGrupo(idgrupo);
  }

  @Post()
  @ApiOperation({
    summary: 'Programar una nueva sesión en vivo',
    description:
      'Crea una nueva clase en vivo vinculada a un grupo. El proveedor puede depender de la empresa o configuración del grupo.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idgrupo: {
          type: 'number',
          example: 1,
          description: 'ID del grupo donde se programará la sesión',
        },
        idcurso: {
          type: 'number',
          example: 1,
          nullable: true,
          description: 'ID del curso, opcional si la sesión se gestiona por grupo',
        },
        titulo: {
          type: 'string',
          example: 'Clase en vivo - Introducción',
        },
        descripcion: {
          type: 'string',
          example: 'Sesión introductoria del curso',
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
      required: ['idgrupo', 'titulo', 'fecha'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Sesión programada correctamente.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Error en la validación: faltan campos obligatorios o el body está vacío.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  async crear(@Body() body: any): Promise<SesionVivoResponseDto> {
    if (!body) {
      throw new BadRequestException('Body vacío');
    }

    if (!body.idgrupo || !body.titulo || !body.fecha) {
      throw new BadRequestException('Faltan campos obligatorios');
    }

    return this.service.crearSesion({
      idgrupo: Number(body.idgrupo),
      titulo: String(body.titulo),
      descripcion: body.descripcion ? String(body.descripcion) : undefined,
      fecha: body.fecha,
      duracion: Number(body.duracion || 60),
    });
  }
}