import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AlumnoService } from './alumno.service';
import { Alumno } from './entities/alumno.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { CreateAlumnoDto } from './dto/create-alumno.dto'; // Importa tu DTO (ajusta la ruta si es necesario)
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Alumnos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alumno')
@UseGuards(JwtAuthGuard)
export class AlumnoController {
  constructor(private readonly alumnoService: AlumnoService) {}

  @Get('perfil')
  @ApiOperation({
    summary: 'Obtener mi perfil (Alumno)',
    description:
      'Retorna la información del alumno asociado al usuario autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente.' })
  @ApiResponse({
    status: 404,
    description: 'El usuario no tiene un perfil de alumno vinculado.',
  })
  getPerfilAlumno(@Req() req: any) {
    const idUsuario = req.user?.sub || req.user?.id || req.user?.userId;
    return this.alumnoService.buscarPorIdUsuario(idUsuario);
  }

  @Post()
  @ApiOperation({
    summary: 'Registrar un nuevo alumno',
    description:
      'Crea un registro de alumno y opcionalmente su cuenta de usuario.',
  })
  @ApiResponse({ status: 201, description: 'Alumno registrado correctamente.' })
  @ApiResponse({ status: 400, description: 'Error en la validación de datos.' })
  create(@Body() createAlumnoDto: CreateAlumnoDto) {
    return this.alumnoService.create(createAlumnoDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener alumno por ID',
    description: 'Retorna los datos de un alumno específico por su ID.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico del alumno' })
  @ApiResponse({ status: 200, description: 'Detalle del alumno encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alumnoService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar información de un alumno',
    description: 'Actualiza los datos de un alumno específico por su ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Información actualizada con éxito.',
  })
  update(@Param('id') id: string, @Body() body: Partial<Alumno>) {
    return this.alumnoService.update(+id, body);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los alumnos',
    description: 'Uso exclusivo para administradores.',
  })
  @ApiResponse({ status: 200, description: 'Lista total de alumnos.' })
  findAll() {
    return this.alumnoService.findAll();
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar o deshabilitar un alumno',
    description: 'Elimina o deshabilita un alumno específico por su ID.',
  })
  @ApiResponse({ status: 200, description: 'Alumno eliminado del sistema.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alumnoService.remove(id);
  }

  @Patch(':id/habilitar')
  @ApiOperation({
    summary: 'Habilitar acceso de un alumno',
    description: 'Restaura el acceso de un alumno específico por su ID.',
  })
  @ApiResponse({ status: 200, description: 'Acceso restaurado.' })
  habilitar(@Param('id', ParseIntPipe) id: number) {
    return this.alumnoService.habilitar(id);
  }
}
