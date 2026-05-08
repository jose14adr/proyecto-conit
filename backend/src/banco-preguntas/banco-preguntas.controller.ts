import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BancoPreguntasService } from './banco-preguntas.service';

@Controller('banco-preguntas')
export class BancoPreguntasController {
  constructor(private readonly bancoPreguntasService: BancoPreguntasService) {}

  @Post('importar-excel')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  importarExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body('iddocente') iddocente: string,
    @Body('idcurso') idcurso?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Debe subir un archivo Excel.');
    }

    if (!iddocente) {
      throw new BadRequestException('Debe enviar el iddocente.');
    }

    return this.bancoPreguntasService.importarExcel({
      file,
      iddocente: Number(iddocente),
      idcurso: idcurso ? Number(idcurso) : null,
    });
  }

  @Get('docente/:iddocente')
  listarPorDocente(@Param('iddocente') iddocente: string) {
    return this.bancoPreguntasService.listarPorDocente(Number(iddocente));
  }

  @Get('docente/:iddocente/curso/:idcurso')
  listarPorDocenteYCurso(
    @Param('iddocente') iddocente: string,
    @Param('idcurso') idcurso: string,
  ) {
    return this.bancoPreguntasService.listarPorDocenteYCurso(
      Number(iddocente),
      Number(idcurso),
    );
  }

  @Post('examen/:idexamen/agregar-desde-banco')
  agregarPreguntasAExamen(
    @Param('idexamen') idexamen: string,
    @Body('preguntasIds') preguntasIds: number[],
  ) {
    return this.bancoPreguntasService.agregarPreguntasAExamen({
      idexamen: Number(idexamen),
      preguntasIds,
    });
  }
}