import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AsistenciaService } from './asistencia.service';

@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly service: AsistenciaService) {}

  @Get('alumno/:idalumno')
  getPorAlumno(
    @Param('idalumno', ParseIntPipe) idalumno: number
  ) {
    return this.service.obtenerTodasPorAlumno(idalumno);
  }

  @Get('historial/:idalumno/:idgrupo')
  getHistorial(
    @Param('idalumno', ParseIntPipe) idalumno: number,
    @Param('idgrupo', ParseIntPipe) idgrupo: number,
  ) {
    return this.service.historial(idalumno, idgrupo);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async crearAsistencia(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    return this.service.crear(body, file);
  }
}