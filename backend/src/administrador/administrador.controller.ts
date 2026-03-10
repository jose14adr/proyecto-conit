import { Controller, Get, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { AdministradorService } from './administrador.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

@Controller('administrador')
@UseGuards(JwtAuthGuard)
export class AdministradorController {
  constructor(private readonly administradorService: AdministradorService) {}

  @Get('perfil')
  async obtenerPerfil(@Request() req) {
    //Obtenemos el id del usuario autenticado a través del token JWT
    const idUsuario = req.user.sub;
    //Buscamos el perfil del administrador asociado a ese id de usuario
    const perfil = await this.administradorService.buscarPorIdUsuario(idUsuario);
    //Si por alguna razón no se encuentra el perfil, lanzamos un error 404
    if (!perfil) {
      throw new NotFoundException('Perfil de administrador no encontrado');
    }
    return perfil;
  }
}