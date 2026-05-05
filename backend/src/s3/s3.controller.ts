import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Almacenamiento S3 (AWS)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload-docente-documento')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir documento de docente (PDF)',
    description:
      'Sube documentos como el CV o certificados de un docente. Solo acepta archivos PDF.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        docenteId: { type: 'string', example: '15' },
        tipo: {
          type: 'string',
          example: 'cv',
          description: 'Ej: cv, titulo, dni',
        },
      },
      required: ['file', 'docenteId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Archivo PDF subido exitosamente.' })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos o formato del archivo.',
  })
  async uploadDocenteDocumento(
    @UploadedFile() file: Express.Multer.File,
    @Body('docenteId') docenteId: string,
    @Body('tipo') tipo: string,
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo.');
    if (file.mimetype !== 'application/pdf')
      throw new BadRequestException('Solo se permiten archivos PDF.');
    if (!docenteId) throw new BadRequestException('Falta docenteId.');

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
  @ApiOperation({
    summary: 'Generar URL de descarga firmada',
    description:
      'Genera una URL temporal y segura para descargar un archivo privado de S3 usando su Key.',
  })
  @ApiResponse({
    status: 200,
    description: 'URL de descarga generada exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos proporcionados para generar la URL.',
  })
  @ApiBody({
    schema: {
      properties: {
        key: { type: 'string', example: 'docentes/documentos/archivo.pdf' },
      },
    },
  })
  async presignDownload(@Body('key') key: string) {
    const downloadUrl = await this.s3Service.createDownloadUrl(key);
    return { ok: true, downloadUrl };
  }

  @Delete('object')
  @ApiOperation({
    summary: 'Eliminar objeto de S3',
    description: 'Elimina físicamente un archivo del bucket usando su Key.',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo eliminado exitosamente de S3.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos proporcionados para eliminar el archivo.',
  })
  @ApiBody({
    schema: {
      properties: { key: { type: 'string', example: 'carpeta/archivo.jpg' } },
    },
  })
  async deleteObject(@Body('key') key: string) {
    await this.s3Service.deleteObject(key);
    return { ok: true };
  }

  @Post('upload-leccion-material')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir material de lección',
    description:
      'Sube archivos (PDF, DOCX, etc.) asociados a una lección específica.',
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo de material de lección subido exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos o formato del archivo para la lección.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        leccionId: { type: 'string', example: '101' },
      },
      required: ['file', 'leccionId'],
    },
  })
  async uploadLeccionMaterial(
    @UploadedFile() file: Express.Multer.File,
    @Body('leccionId') leccionId: string,
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo.');
    if (!leccionId) throw new BadRequestException('Falta leccionId.');

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
    };
  }

  @Post('upload-tarea-apoyo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir material de apoyo para tareas',
    description:
      'Sube archivos de apoyo para tareas, organizados por curso y tipo.',
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo de material de apoyo subido exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos o formato del archivo para el material de apoyo.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        cursoId: { type: 'string', example: '1' },
        tipoApoyo: { type: 'string', example: 'guia' },
      },
    },
  })
  async uploadTareaApoyo(
    @UploadedFile() file: Express.Multer.File,
    @Body('cursoId') cursoId: string,
    @Body('tipoApoyo') tipoApoyo: string,
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo.');
    if (!cursoId) throw new BadRequestException('Falta cursoId.');
    if (!tipoApoyo) throw new BadRequestException('Falta tipoApoyo.');

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
    };
  }

  @Post('upload-admin-foto')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir foto de administrador',
    description: 'Solo acepta archivos de imagen (JPG, PNG, etc.).',
  })
  @ApiResponse({
    status: 201,
    description: 'Foto de administrador subida exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos o formato del archivo para la foto.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async uploadAdminFoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo.');
    if (!file.mimetype.startsWith('image/'))
      throw new BadRequestException('Solo se permiten imágenes.');

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
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { ok: true, key, url };
  }

  @Post('upload-admin-cv')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir CV de administrador',
    description: 'Acepta archivos PDF o Word.',
  })
  @ApiResponse({
    status: 201,
    description: 'CV de administrador subido exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos o formato del archivo para el CV.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async uploadAdminCv(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo.');
    if (
      file.mimetype !== 'application/pdf' &&
      !file.mimetype.includes('word')
    ) {
      throw new BadRequestException('Solo se permiten PDF o Word.');
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
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { ok: true, key, url };
  }
}
