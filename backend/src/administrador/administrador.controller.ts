import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { AdministradorService } from './administrador.service';
import { CreateAdministradorDto } from './dto/create-administrador.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Administradores')
@ApiBearerAuth()
@Controller('administrador')
@UseGuards(JwtAuthGuard)
export class AdministradorController {
  constructor(private readonly administradorService: AdministradorService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos los administradores',
    description: 'Retorna una lista de todos los administradores registrados.',
  })
  @ApiResponse({ status: 200, description: 'Lista obtenida correctamente.' })
  findAll() {
    return this.administradorService.findAll();
  }

  @Get('perfil')
  @ApiOperation({
    summary: 'Obtener perfil del administrador autenticado',
    description: 'Usa el token JWT para identificar al administrador actual.',
  })
  @ApiResponse({ status: 200, description: 'Perfil encontrado.' })
  @ApiResponse({
    status: 404,
    description: 'Administrador no vinculado al usuario.',
  })
  obtenerMiPerfil(@Request() req: any) {
    const idUsuario = req.user?.sub || req.user?.id || req.user?.userId;
    return this.administradorService.buscarPorIdUsuario(idUsuario);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener administrador por ID',
    description: 'Retorna los datos de un administrador específico por su ID.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico del administrador' })
  @ApiResponse({ status: 200, description: 'Administrador encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.administradorService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo administrador',
    description:
      'Registra un administrador y opcionalmente le crea un usuario de acceso.',
  })
  @ApiResponse({
    status: 201,
    description: 'Administrador creado exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o correo duplicado.',
  })
  create(@Body() createAdministradorDto: CreateAdministradorDto) {
    return this.administradorService.create(createAdministradorDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar datos de un administrador',
    description: 'Actualiza la información de un administrador existente.',
  })
  @ApiResponse({ status: 200, description: 'Datos actualizados.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateAdministradorDto>,
  ) {
    return this.administradorService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar o deshabilitar administrador',
    description: 'Elimina o deshabilita un administrador existente.',
  })
  @ApiResponse({ status: 200, description: 'Administrador eliminado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.administradorService.remove(id);
  }

  @Patch(':id/habilitar')
  @ApiOperation({
       summary: 'Habilitar un administrador deshabilitado',
       description:
      'Habilita un administrador que ha sido previamente deshabilitado.',
  })
  @ApiResponse({ status: 200, description: 'Administrador habilitado.' })
  habilitar(@Param('id', ParseIntPipe) id: number) {
    return this.administradorService.habilitar(id);
  }
}
