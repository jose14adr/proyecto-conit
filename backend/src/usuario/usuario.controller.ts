import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Gestión de Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description:
      'Crea una credencial de acceso. Por seguridad, la contraseña se hashea en el servicio.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente.',
    type: UsuarioResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o el correo ya se encuentra registrado.',
  })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los usuarios',
    description:
      'Retorna la lista de usuarios omitiendo datos sensibles como contraseñas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado obtenido.',
    type: [UsuarioResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un usuario por ID',
    description: 'Retorna los detalles de un usuario específico.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico del usuario', example: 1 })
  @ApiResponse({ status: 200, type: UsuarioResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar datos de usuario',
    description: 'Permite modificar parcialmente la información del usuario.',
  })
  @ApiBody({ type: CreateUsuarioDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado correctamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos para la actualización.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<CreateUsuarioDto>,
  ) {
    return this.usuarioService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario', description: 'Desactiva el acceso del usuario al sistema.' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado del sistema.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.remove(id);
  }

  @Patch(':id/habilitar')
  @ApiOperation({
    summary: 'Habilitar acceso de usuario',
    description:
      'Restaura el estado activo para que el usuario pueda volver a loguearse.',
  })
  @ApiResponse({ status: 200, description: 'Usuario habilitado.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT faltante o inválido.',
  })
  habilitar(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.habilitar(id);
  }
}
