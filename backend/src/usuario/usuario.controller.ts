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
import { Usuario } from './entities/usuario.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

import { UsuarioResponseDto } from './dto/usuario-response.dto';

@ApiTags('Usuarios')
@ApiBearerAuth('access-token')
@Controller('usuario')
@UseGuards(JwtAuthGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @ApiOperation({ summary: 'Crear usuario' })
  @ApiBody({ type: CreateUsuarioDto })
  @ApiResponse({ status: 201, description: 'Usuario creado', type: UsuarioResponseDto })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    type: [UsuarioResponseDto],
  })
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, type: UsuarioResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Usuario actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Usuario>,
  ) {
    return this.usuarioService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.remove(id);
  }

  @Patch(':id/habilitar')
  @ApiOperation({ summary: 'Habilitar usuario' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Usuario habilitado' })
  habilitar(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.habilitar(id);
  }
}