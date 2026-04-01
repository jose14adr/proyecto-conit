import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { HistorialLoginService } from './historial-login.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('historial-login')
@UseGuards(AuthGuard('jwt'))
export class HistorialLoginController {
  constructor(private readonly historialLoginService: HistorialLoginService) {}

  @Get()
  findAll() {
    return this.historialLoginService.findAll();
  }

  @Patch(':id/cerrar')
  cerrarSesion(@Param('id', ParseIntPipe) id: number) {
    return this.historialLoginService.cerrarSesionRemota(id);
  }
}
