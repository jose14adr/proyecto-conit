import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { Certificado } from './entities/certificado.entity';
import { CertificadoPlantilla } from './entities/certificado-plantilla.entity';

type SavePlantillaDto = {
  nombre: string;
  activa?: boolean;
  fondoKey?: string | null;
  canvasWidth?: number;
  canvasHeight?: number;
  configJson?: any[];
};

@Injectable()
export class CertificadoService {
  private readonly bucket = process.env.AWS_S3_BUCKET || '';
  private readonly prefix =
    process.env.AWS_S3_CERTIFICADOS_PREFIX || 'certificados/plantillas';

  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });

  constructor(
    @InjectRepository(Certificado)
    private certificadoRepo: Repository<Certificado>,

    @InjectRepository(CertificadoPlantilla)
    private plantillaRepo: Repository<CertificadoPlantilla>,
  ) {}

  async findAll() {
    return this.certificadoRepo.find({
      order: { id: 'DESC' },
    });
  }

  async findByAlumno(idalumno: number) {
    return this.certificadoRepo.find({
      where: { idalumno },
      order: { id: 'DESC' },
    });
  }

  async findAllPlantillas() {
    const plantillas = await this.plantillaRepo.find({
      order: { updatedAt: 'DESC' },
    });

    return Promise.all(plantillas.map((p) => this.hydratePlantilla(p)));
  }

  async activatePlantilla(id: number) {
    const plantilla = await this.plantillaRepo.findOne({
      where: { id },
    });

    if (!plantilla) {
      throw new NotFoundException('Plantilla no encontrada');
    }

    await this.desactivarPlantillas(id);
    plantilla.activa = true;

    const saved = await this.plantillaRepo.save(plantilla);
    return this.hydratePlantilla(saved);
  }

  async getPlantillaAsset(key: string) {
    if (!this.bucket) {
      throw new BadRequestException(
        'AWS_S3_BUCKET no está configurado en el backend',
      );
    }

    try {
      const response = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      const bytes = await response.Body?.transformToByteArray();

      if (!bytes) {
        throw new NotFoundException('Archivo no encontrado');
      }

      return {
        buffer: Buffer.from(bytes),
        contentType: response.ContentType || 'application/octet-stream',
      };
    } catch (error) {
      console.error('Error obteniendo asset desde S3:', error);
      throw new NotFoundException('No se pudo obtener el archivo');
    }
  }

  async deletePlantilla(id: number) {
    const plantilla = await this.plantillaRepo.findOne({
      where: { id },
    });

    if (!plantilla) {
      throw new NotFoundException('Plantilla no encontrada');
    }

    const eraActiva = !!plantilla.activa;

    const imageKeys = Array.isArray(plantilla.configJson)
      ? plantilla.configJson
          .filter((el) => el?.type === 'image' && el?.imageKey)
          .map((el) => el.imageKey)
      : [];

    await this.plantillaRepo.remove(plantilla);

    await Promise.all([
      this.deleteS3Object(plantilla.fondoKey),
      ...imageKeys.map((key) => this.deleteS3Object(key)),
    ]);

    if (eraActiva) {
      const siguiente = await this.plantillaRepo.findOne({
        order: { updatedAt: 'DESC' },
      });

      if (siguiente) {
        await this.activatePlantilla(siguiente.id);
      }
    }

    return { message: 'Plantilla eliminada correctamente' };
  }

  private async deleteS3Object(key?: string | null) {
    if (!key || !this.bucket) return;

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      console.error('No se pudo eliminar archivo en S3:', key, error);
    }
  }

  async findPlantillaActiva() {
    const plantilla = await this.plantillaRepo.findOne({
      where: { activa: true },
      order: { updatedAt: 'DESC' },
    });

    if (!plantilla) {
      return null;
    }

    return this.hydratePlantilla(plantilla);
  }

  async createBackgroundUploadUrl(fileName: string, contentType: string) {
    if (!this.bucket) {
      throw new BadRequestException(
        'AWS_S3_BUCKET no está configurado en el backend',
      );
    }

    const safeName = this.sanitizeFilename(fileName || 'fondo-certificado.png');
    const key = `${this.prefix}/${Date.now()}-${randomUUID()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType || 'image/png',
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 60 * 5,
    });

    return {
      key,
      uploadUrl,
    };
  }

  async uploadPlantillaAsset(file: Express.Multer.File) {
    if (!this.bucket) {
        throw new BadRequestException(
        'AWS_S3_BUCKET no está configurado en el backend',
        );
    }

    if (!file?.mimetype?.startsWith('image/')) {
        throw new BadRequestException('Solo se permiten imágenes');
    }

    const safeName = this.sanitizeFilename(file.originalname || 'archivo.png');
    const key = `${this.prefix}/${Date.now()}-${randomUUID()}-${safeName}`;

    await this.s3.send(
        new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype || 'image/png',
        }),
    );

    const temporaryUrl = await this.buildSignedReadUrl(key);

    return {
        key,
        temporaryUrl,
    };
    }

  async createPlantilla(dto: SavePlantillaDto) {
    const activa = dto.activa !== false;

    if (activa) {
      await this.desactivarPlantillas();
    }

    const plantilla = this.plantillaRepo.create({
      nombre: dto.nombre?.trim() || 'Plantilla principal',
      activa,
      fondoKey: dto.fondoKey || null,
      canvasWidth: dto.canvasWidth || 1600,
      canvasHeight: dto.canvasHeight || 1131,
      configJson: Array.isArray(dto.configJson) ? dto.configJson : [],
    });

    const saved = await this.plantillaRepo.save(plantilla);
    return this.hydratePlantilla(saved);
  }

  async updatePlantilla(id: number, dto: SavePlantillaDto) {
    const plantilla = await this.plantillaRepo.findOne({
      where: { id },
    });

    if (!plantilla) {
      throw new NotFoundException('Plantilla no encontrada');
    }

    const activa = dto.activa !== false;

    if (activa) {
      await this.desactivarPlantillas(id);
    }

    plantilla.nombre = dto.nombre?.trim() || plantilla.nombre;
    plantilla.activa = activa;
    plantilla.fondoKey =
      dto.fondoKey !== undefined ? dto.fondoKey : plantilla.fondoKey;
    plantilla.canvasWidth = dto.canvasWidth || plantilla.canvasWidth;
    plantilla.canvasHeight = dto.canvasHeight || plantilla.canvasHeight;
    plantilla.configJson = Array.isArray(dto.configJson)
      ? dto.configJson
      : plantilla.configJson;

    const saved = await this.plantillaRepo.save(plantilla);
    return this.hydratePlantilla(saved);
  }

  private async hydratePlantilla(plantilla: CertificadoPlantilla) {
    const fondoTemporalUrl = await this.buildSignedReadUrl(plantilla.fondoKey);

    return {
      ...plantilla,
      fondoTemporalUrl,
    };
  }

  private async buildSignedReadUrl(key?: string | null) {
    if (!key || !this.bucket) {
      return null;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: 60 * 60,
    });
  }

  private async desactivarPlantillas(exceptId?: number) {
    const query = this.plantillaRepo
      .createQueryBuilder()
      .update(CertificadoPlantilla)
      .set({ activa: false });

    if (exceptId) {
      query.where('id != :exceptId', { exceptId });
    }

    await query.execute();
  }

  private sanitizeFilename(fileName: string) {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .toLowerCase();
  }
}