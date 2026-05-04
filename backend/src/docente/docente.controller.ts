import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { DocenteService } from './docente.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Docentes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('docente')
export class DocenteController {
  constructor(private readonly docenteService: DocenteService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener lista de todos los docentes',
    description:
      'Retorna un listado de todos los docentes registrados en el sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de docentes retornada con éxito.',
  })
  findAll() {
    return this.docenteService.findAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Registrar un nuevo docente',
    description:
      'Crea un registro de docente y opcionalmente su usuario de acceso.',
  })
  @ApiResponse({ status: 201, description: 'Docente creado correctamente.' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o correo/DNI ya registrado.',
  })
  create(@Body() createDocenteDto: CreateDocenteDto) {
    return this.docenteService.create(createDocenteDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar información de un docente',
    description: 'Modifica los datos de un docente existente.',
  })
  @ApiParam({ name: 'id', description: 'ID del docente' })
  @ApiResponse({ status: 200, description: 'Docente actualizado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDocenteDto: any) {
    return this.docenteService.update(id, updateDocenteDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar o deshabilitar un docente',
    description: 'Deshabilita un docente para que no pueda acceder al sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Docente deshabilitado del sistema.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.remove(id);
  }

  @Patch(':id/habilitar')
  @ApiOperation({
    summary: 'Habilitar de nuevo a un docente',
    description:
      'Permite que un docente previamente deshabilitado vuelva a acceder al sistema.',
  })
  @ApiResponse({ status: 200, description: 'Acceso del docente habilitado.' })
  habilitar(@Param('id', ParseIntPipe) id: number) {
    return this.docenteService.habilitar(id);
  }
}
