import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CertificadoService } from './certificado.service';

@Controller('certificado')
export class CertificadoController {
  constructor(private readonly certificadoService: CertificadoService) {}

  @Get()
  findAll() {
    return this.certificadoService.findAll();
  }

  @Get('alumno/:idalumno')
  findByAlumno(@Param('idalumno', ParseIntPipe) idalumno: number) {
    return this.certificadoService.findByAlumno(idalumno);
  }

  @Get('alumno/:idalumno/disponibles')
  getCertificadosDisponiblesAlumno(
    @Param('idalumno', ParseIntPipe) idalumno: number,
  ) {
    return this.certificadoService.getCertificadosDisponiblesAlumno(idalumno);
  }

  @Get('admin/listado')
  getCertificadosAdmin(
    @Query('search') search?: string,
    @Query('dni') dni?: string,
    @Query('curso') curso?: string,
    @Query('estado') estado?: string,
    @Query('anulado') anulado?: string,
  ) {
    return this.certificadoService.getCertificadosAdmin({
      search,
      dni,
      curso,
      estado,
      anulado,
    });
  }

  @Put(':id/anular')
  anularCertificado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body?: { motivo?: string },
  ) {
    return this.certificadoService.anularCertificado(id, body);
  }

  @Get('alumno/:idalumno/cursos-matriculados')
  getCursosMatriculadosYCompletosPorAlumno(
    @Param('idalumno', ParseIntPipe) idalumno: number,
  ) {
    return this.certificadoService.getCursosMatriculadosYCompletosPorAlumno(idalumno);
  }

  @Get('alumno/:idalumno/certificado/:id/descargar')
  async descargarCertificadoAlumnoUnaVez(
    @Param('idalumno', ParseIntPipe) idalumno: number,
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const archivo =
      await this.certificadoService.descargarCertificadoAlumnoUnaVez(
        id,
        idalumno,
      );

    res.setHeader('Content-Type', archivo.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${archivo.fileName}"`,
    );

    return new StreamableFile(archivo.buffer);
  }

  @Get('plantilla')
  findAllPlantillas() {
    return this.certificadoService.findAllPlantillas();
  }

  @Get('plantilla/activa')
  findPlantillaActiva() {
    return this.certificadoService.findPlantillaActiva();
  }

  @Get('config/curso/:idcurso')
  getConfigByCurso(@Param('idcurso', ParseIntPipe) idcurso: number) {
    return this.certificadoService.getConfigByCurso(idcurso);
  }

  @Put('config/curso/:idcurso')
  saveConfigByCurso(
    @Param('idcurso', ParseIntPipe) idcurso: number,
    @Body()
    body: {
      habilitado?: boolean;
      modoEntrega: 'EMAIL' | 'DESCARGA_UNICA';
      plantillaId?: number | null;
      requiereAprobacion?: boolean;
      notaMinima?: number | null;
      asistenciaMinima?: number | null;
      progresoMinimo?: number | null;
      requiereExamenAprobado?: boolean;
      requiereProgresoCompleto?: boolean;
      soloCursosCompletosEnEmision?: boolean;
    },
  ) {
    return this.certificadoService.saveConfigByCurso(idcurso, body);
  }

  @Post('emitir')
  @UseInterceptors(FileInterceptor('file'))
  emitirCertificado(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      idalumno?: number | string;
      idcurso?: number | string;
      curso?: string;
      horas?: number | string;
      creditos?: number | string;
      fechaEmision?: string;
      codigoCertificado?: string;
      origen?: string;
      emailAlumno?: string;
      nombreAlumno?: string;
      dniAlumno?: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('Debes enviar el PDF del certificado');
    }

    return this.certificadoService.emitirCertificado(file, body);
  }

  @Get(':id/archivo')
  async getArchivoCertificado(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const archivo =
      await this.certificadoService.getGeneratedCertificadoFile(id);

    res.setHeader('Content-Type', archivo.contentType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${archivo.fileName}"`,
    );

    return new StreamableFile(archivo.buffer);
  }

  @Get('validar/:codigo')
  validarCertificadoPorCodigo(
    @Param('codigo') codigo: string,
  ) {
    return this.certificadoService.validarCertificadoPorCodigo(codigo);
  }

  @Get('plantilla/asset')
  async getPlantillaAsset(
    @Query('key') key: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!key) {
      throw new BadRequestException('El parámetro key es obligatorio');
    }

    const archivo = await this.certificadoService.getPlantillaAsset(key);

    res.setHeader('Content-Type', archivo.contentType);
    res.setHeader('Cache-Control', 'private, max-age=300');

    return new StreamableFile(archivo.buffer);
  }

  @Post('plantilla/upload-file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Debes enviar un archivo');
    }

    return this.certificadoService.uploadPlantillaAsset(file);
  }

  @Post('plantilla/upload-url')
  createUploadUrl(
    @Body() body: { fileName: string; contentType: string },
  ) {
    return this.certificadoService.createBackgroundUploadUrl(
      body.fileName,
      body.contentType,
    );
  }

  @Put('plantilla/:id/activar')
  activatePlantilla(@Param('id', ParseIntPipe) id: number) {
    return this.certificadoService.activatePlantilla(id);
  }

  @Delete('plantilla/:id')
  deletePlantilla(@Param('id', ParseIntPipe) id: number) {
    return this.certificadoService.deletePlantilla(id);
  }

  @Post('verificar-emision')
  verificarYPrepararEmision(
    @Body()
    body: {
      idalumno: number;
      idgrupo: number;
    },
  ) {
    return this.certificadoService.verificarYPrepararEmision(body);
  }

  @Post('plantilla')
  createPlantilla(
    @Body()
    body: {
      nombre: string;
      activa?: boolean;
      fondoKey?: string | null;
      canvasWidth?: number;
      canvasHeight?: number;
      configJson?: any[];
      dobleCara?: boolean;
      configJsonReverso?: any[];
    },
  ) {
    return this.certificadoService.createPlantilla(body);
  }

  @Put('plantilla/:id')
  updatePlantilla(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      nombre: string;
      activa?: boolean;
      fondoKey?: string | null;
      canvasWidth?: number;
      canvasHeight?: number;
      configJson?: any[];
      dobleCara?: boolean;
      configJsonReverso?: any[];
    },
  ) {
    return this.certificadoService.updatePlantilla(id, body);
  }
}