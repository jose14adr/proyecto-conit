import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';


@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload-docente-documento')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocenteDocumento(
    @UploadedFile() file: Express.Multer.File,
    @Body('docenteId') docenteId: string,
    @Body('tipo') tipo: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Solo se permiten archivos PDF.');
    }

    if (!docenteId) {
      throw new BadRequestException('Falta docenteId.');
    }

    const safeName = String(file.originalname || 'archivo.pdf').replace(/\s+/g, '_');
    const safeTipo = String(tipo || 'cv').replace(/\s+/g, '_');

    const key = `docentes/documentos/docente-${docenteId}-${safeTipo}-${Date.now()}-${safeName}`;

    await this.s3Service.uploadBuffer({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });

    return {
      ok: true,
      key,
      bucket: this.s3Service.getBucketName(),
      originalName: file.originalname,
      mimeType: file.mimetype,
    };
  }

  @Post('presign-download')
    async presignDownload(@Body('key') key: string) {
        const downloadUrl = await this.s3Service.createDownloadUrl(key);

        return {
            ok: true,
            downloadUrl,
        };
    }

  @Delete('object')
  async deleteObject(@Body('key') key: string) {
    await this.s3Service.deleteObject(key);
    return { ok: true };
  }

    @Post('upload-leccion-material')
    @UseInterceptors(FileInterceptor('file'))
    async uploadLeccionMaterial(
        @UploadedFile() file: Express.Multer.File,
        @Body('leccionId') leccionId: string,
        ) {
        if (!file) {
            throw new BadRequestException('No se recibió ningún archivo.');
        }

        if (!leccionId) {
            throw new BadRequestException('Falta leccionId.');
        }

        const safeName = String(file.originalname || 'archivo').replace(/\s+/g, '_');
        const key = `cursos/lecciones/leccion-${leccionId}-${Date.now()}-${safeName}`;

        await this.s3Service.uploadBuffer({
            key,
            body: file.buffer,
            contentType: file.mimetype || 'application/octet-stream',
        });

        return {
            ok: true,
            key,
            bucket: this.s3Service.getBucketName(),
            originalName: file.originalname,
            mimeType: file.mimetype || 'application/octet-stream',
        };
    }

    @Post('upload-tarea-apoyo')
    @UseInterceptors(FileInterceptor('file'))
    async uploadTareaApoyo(
        @UploadedFile() file: Express.Multer.File,
        @Body('cursoId') cursoId: string,
        @Body('tipoApoyo') tipoApoyo: string,
        ) {
        if (!file) {
            throw new BadRequestException('No se recibió ningún archivo.');
        }

        if (!cursoId) {
            throw new BadRequestException('Falta cursoId.');
        }

        if (!tipoApoyo) {
            throw new BadRequestException('Falta tipoApoyo.');
        }

        const safeName = String(file.originalname || 'archivo').replace(/\s+/g, '_');
        const safeTipo = String(tipoApoyo || 'archivo').replace(/\s+/g, '_');

        const key = `tareas-apoyo/curso-${cursoId}/${safeTipo}-${Date.now()}-${safeName}`;

        await this.s3Service.uploadBuffer({
            key,
            body: file.buffer,
            contentType: file.mimetype || 'application/octet-stream',
        });

        return {
            ok: true,
            key,
            bucket: this.s3Service.getBucketName(),
            originalName: file.originalname,
            mimeType: file.mimetype || 'application/octet-stream',
        };
    }

      @Post('upload-foro-adjunto')
      @UseInterceptors(FileInterceptor('file'))
      async uploadForoAdjunto(
        @UploadedFile() file: Express.Multer.File,
        @Body('grupoId') grupoId: string,
      ) {
        if (!file) {
          throw new BadRequestException('No se recibió ningún archivo.');
        }

        if (!grupoId) {
          throw new BadRequestException('Falta grupoId.');
        }

        const mimeType = file.mimetype || 'application/octet-stream';
        const size = Number(file.size || 0);

        const esImagen = mimeType.startsWith('image/');
        const esVideo = mimeType.startsWith('video/');

        const tiposPermitidos = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/zip',
          'application/x-zip-compressed',
          'text/plain',
        ];

        const esArchivoPermitido = tiposPermitidos.includes(mimeType);

        if (!esImagen && !esVideo && !esArchivoPermitido) {
          throw new BadRequestException(
            'Tipo de archivo no permitido. Solo se permiten imágenes, videos, PDF, Word, Excel, PowerPoint, ZIP o TXT.',
          );
        }

        const maxImagen = 5 * 1024 * 1024; // 5 MB
        const maxArchivo = 20 * 1024 * 1024; // 20 MB
        const maxVideo = 80 * 1024 * 1024; // 80 MB

        if (esImagen && size > maxImagen) {
          throw new BadRequestException('La imagen no debe superar los 5 MB.');
        }

        if (esVideo && size > maxVideo) {
          throw new BadRequestException('El video no debe superar los 80 MB.');
        }

        if (!esImagen && !esVideo && size > maxArchivo) {
          throw new BadRequestException('El archivo no debe superar los 20 MB.');
        }

        let tipo = 'archivo';

        if (esImagen) tipo = 'imagen';
        if (esVideo) tipo = 'video';

        const safeName = String(file.originalname || 'archivo')
          .replace(/\s+/g, '_')
          .replace(/[^\w.\-]/g, '');

        const key = `foros/grupo-${grupoId}/${tipo}-${Date.now()}-${safeName}`;

        await this.s3Service.uploadBuffer({
          key,
          body: file.buffer,
          contentType: mimeType,
        });

        return {
          ok: true,
          key,
          bucket: this.s3Service.getBucketName(),
          originalName: file.originalname,
          mimeType,
          size,
          tipo,
        };
      }
}