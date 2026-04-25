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

    const safeName = String(file.originalname || 'archivo.pdf').replace(
      /\s+/g,
      '_',
    );
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

    const safeName = String(file.originalname || 'archivo').replace(
      /\s+/g,
      '_',
    );
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

    const safeName = String(file.originalname || 'archivo').replace(
      /\s+/g,
      '_',
    );
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

  // ==========================================
  // NUEVOS ENDPOINTS PARA EL ADMINISTRADOR
  // ==========================================

  @Post('upload-admin-foto')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAdminFoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }

    // Validar que sea una imagen
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Solo se permiten archivos de imagen (JPG, PNG, etc).',
      );
    }

    const safeName = String(file.originalname || 'foto.jpg').replace(
      /\s+/g,
      '_',
    );
    const key = `administradores/fotos/admin-${Date.now()}-${safeName}`;

    await this.s3Service.uploadBuffer({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });

    const bucket = this.s3Service.getBucketName();
    const region = process.env.AWS_REGION || 'us-east-1';

    // Construimos la URL pública de AWS S3 para devolvérsela al frontend
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { ok: true, key, url };
  }

  @Post('upload-admin-cv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAdminCv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }

    // Validar que sea PDF o documento de Word
    if (
      file.mimetype !== 'application/pdf' &&
      !file.mimetype.includes('word')
    ) {
      throw new BadRequestException('Solo se permiten archivos PDF o Word.');
    }

    const safeName = String(file.originalname || 'cv.pdf').replace(/\s+/g, '_');
    const key = `administradores/cvs/admin-${Date.now()}-${safeName}`;

    await this.s3Service.uploadBuffer({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });

    const bucket = this.s3Service.getBucketName();
    const region = process.env.AWS_REGION || 'us-east-1';

    // Construimos la URL pública de AWS S3
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { ok: true, key, url };
  }
}
