import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { SesionVivoService } from './sesion-vivo.service';
import { SesionVivo } from './entities/sesion-vivo.entity';

@Controller('sesion-vivo')
export class SesionVivoController {
  constructor(private service: SesionVivoService) {}

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
    return this.service.crearSesion({
      idcurso: Number(body.idcurso),
      titulo: body.titulo,
      descripcion: body.descripcion,
      fecha: body.fecha,
      duracion: Number(body.duracion),
    });
  }
}