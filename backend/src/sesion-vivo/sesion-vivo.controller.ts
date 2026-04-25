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
import { SesionVivoResponseDto } from './dto/sesion-vivo-response.dto';

@Controller('sesion-vivo')
export class SesionVivoController {
  constructor(private readonly service: SesionVivoService) {}

  @Get()
  async obtener(): Promise<SesionVivoResponseDto[]> {
    return this.service.obtenerSesiones();
  }

  @Get('grupo/:idgrupo')
  async obtenerPorGrupo(
    @Param('idgrupo', ParseIntPipe) idgrupo: number,
  ): Promise<SesionVivoResponseDto[]> {
    return this.service.obtenerSesionesPorGrupo(idgrupo);
  }

  @Get('grupo/:idgrupo/provider')
  async obtenerProviderInfo(
    @Param('idgrupo', ParseIntPipe) idgrupo: number,
  ) {
    return this.service.obtenerProviderInfoPorGrupo(idgrupo);
  }

  @Post()
  async crear(@Body() body: any): Promise<SesionVivoResponseDto> {
    if (!body) {
      throw new BadRequestException('Body vacío');
    }

    if (!body.idgrupo || !body.titulo || !body.fecha) {
      throw new BadRequestException('Faltan campos obligatorios');
    }

    return this.service.crearSesion({
      idgrupo: Number(body.idgrupo),
      titulo: String(body.titulo),
      descripcion: body.descripcion ? String(body.descripcion) : undefined,
      fecha: body.fecha,
      duracion: Number(body.duracion || 0),
    });
  }
}