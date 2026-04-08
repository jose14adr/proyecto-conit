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

  @Get('plantilla')
  findAllPlantillas() {
    return this.certificadoService.findAllPlantillas();
  }

  @Get('plantilla/activa')
  findPlantillaActiva() {
    return this.certificadoService.findPlantillaActiva();
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
    },
  ) {
    return this.certificadoService.updatePlantilla(id, body);
  }
}