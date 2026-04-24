import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { SesionVivoService } from './sesion-vivo.service';
import { SesionVivo } from './entities/sesion-vivo.entity';

@Controller('sesion-vivo')
export class SesionVivoController {
  constructor(private readonly service: SesionVivoService) {}

  @Get()
  async obtener(): Promise<SesionVivo[]> {
    return this.service.obtenerSesiones();
  }

  @Get('curso/:idcurso')
  async obtenerPorCurso(
    @Param('idcurso', ParseIntPipe) idcurso: number,
  ): Promise<SesionVivo[]> {
    return this.service.obtenerSesionesPorCurso(idcurso);
  }

  @Post()
  async crear(@Body() body: any): Promise<SesionVivo> {
    // 🔥 Validación básica para evitar errores silenciosos
    if (!body) {
      throw new BadRequestException('Body vacío');
    }

    if (!body.idcurso || !body.titulo || !body.fecha) {
      throw new BadRequestException('Faltan campos obligatorios');
    }

    return this.service.crearSesion({
      idcurso: Number(body.idcurso),
      titulo: String(body.titulo),
      descripcion: body.descripcion ? String(body.descripcion) : null,
      fecha: body.fecha,
      duracion: Number(body.duracion || 0),
    });
  }
}
