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

@Controller('administrador')
@UseGuards(JwtAuthGuard)
export class AdministradorController {
  constructor(private readonly administradorService: AdministradorService) {}

  @Get()
  findAll() {
    return this.administradorService.findAll();
  }

  @Get('perfil')
  obtenerMiPerfil(@Request() req: any) {
    const idUsuario = req.user?.sub || req.user?.id || req.user?.userId;
    return this.administradorService.buscarPorIdUsuario(idUsuario);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.administradorService.findOne(id);
  }

  @Post()
  create(@Body() createAdministradorDto: CreateAdministradorDto) {
    return this.administradorService.create(createAdministradorDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateAdministradorDto>,
  ) {
    return this.administradorService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.administradorService.remove(id);
  }

  @Patch(':id/habilitar')
  habilitar(@Param('id', ParseIntPipe) id: number) {
    return this.administradorService.habilitar(id);
  }
}
