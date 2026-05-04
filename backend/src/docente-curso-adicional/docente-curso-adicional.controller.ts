import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DocenteCursoAdicionalService } from './docente-curso-adicional.service';
import { CreateDocenteCursoAdicionalDto } from './dto/create-docente-curso-adicional.dto';
import { UpdateDocenteCursoAdicionalDto } from './dto/update-docente-curso-adicional.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Docente - Cursos Adicionales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('docente-curso-adicional')
export class DocenteCursoAdicionalController {
  constructor(
    private readonly docenteCursoAdicionalService: DocenteCursoAdicionalService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar un curso adicional para un docente',
    description:
      'Permite agregar un curso adicional o certificación a un docente específico.',
  })
  @ApiResponse({ status: 201, description: 'Registro creado con éxito.' })
  create(
    @Body() createDocenteCursoAdicionalDto: CreateDocenteCursoAdicionalDto,
  ) {
    return this.docenteCursoAdicionalService.create(
      createDocenteCursoAdicionalDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los cursos adicionales registrados',
    description:
      'Retorna un listado de todos los cursos adicionales registrados para los docentes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos adicionales obtenida.',
  })
  findAll() {
    return this.docenteCursoAdicionalService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de un curso adicional por ID',
    description:
      'Retorna la información detallada de un curso adicional específico.',
  })
  @ApiParam({ name: 'id', description: 'ID único del registro' })
  @ApiResponse({ status: 200, description: 'Información del curso adicional.' })
  @ApiResponse({ status: 404, description: 'Curso adicional no encontrado.' })
  findOne(@Param('id') id: string) {
    return this.docenteCursoAdicionalService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar información de un curso adicional',
    description: 'Modifica los datos de un curso adicional existente.',
  })
  @ApiParam({ name: 'id', description: 'ID único del registro' })
  @ApiResponse({ status: 200, description: 'Curso adicional actualizado.' })
  @ApiResponse({ status: 404, description: 'Curso adicional no encontrado.' })
  update(
    @Param('id') id: string,
    @Body() updateDocenteCursoAdicionalDto: UpdateDocenteCursoAdicionalDto,
  ) {
    return this.docenteCursoAdicionalService.update(
      +id,
      updateDocenteCursoAdicionalDto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un registro de curso adicional',
    description: 'Elimina un curso adicional registrado para un docente.',
  })
  @ApiResponse({ status: 200, description: 'Curso adicional eliminado.' })
  @ApiResponse({ status: 404, description: 'Curso adicional no encontrado.' })
  remove(@Param('id') id: string) {
    return this.docenteCursoAdicionalService.remove(+id);
  }
}
