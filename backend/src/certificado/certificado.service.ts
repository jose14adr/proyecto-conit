import { DataSource } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
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
import { CursoCertificadoConfig } from './entities/curso-certificado-config.entity';
import { MailService } from '../mail/mail.service';

type SavePlantillaDto = {
  nombre: string;
  activa?: boolean;
  fondoKey?: string | null;
  canvasWidth?: number;
  canvasHeight?: number;
  configJson?: any[];
  dobleCara?: boolean;
  configJsonReverso?: any[];
};

@Injectable()
export class CertificadoService {
  private readonly bucket = process.env.AWS_S3_BUCKET || '';
  private readonly prefix =
    process.env.AWS_S3_CERTIFICADOS_PREFIX || 'certificados/plantillas';
  private readonly emitidosPrefix =
    process.env.AWS_S3_CERTIFICADOS_EMITIDOS_PREFIX || 'certificados/emitidos';

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

    @InjectRepository(CursoCertificadoConfig)
    private cursoConfigRepo: Repository<CursoCertificadoConfig>,

    private readonly dataSource: DataSource,

    @Optional()
    private readonly mailService?: MailService,
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

  async getConfigByCurso(idcurso: number) {
    const config = await this.cursoConfigRepo.findOne({
      where: { idcurso },
    });

    if (!config) {
      return {
        idcurso,
        habilitado: true,
        modoEntrega: 'DESCARGA_UNICA',
        plantillaId: null,
        requiereAprobacion: true,
        notaMinima: null,
        asistenciaMinima: null,
        progresoMinimo: 100,
        requiereExamenAprobado: true,
        requiereProgresoCompleto: true,
        soloCursosCompletosEnEmision: true,
      };
    }

    return config;
  }

  async saveConfigByCurso(
    idcurso: number,
    dto: {
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
    let config = await this.cursoConfigRepo.findOne({
      where: { idcurso },
    });

    if (!config) {
      config = new CursoCertificadoConfig();
      config.idcurso = idcurso;
    }

    config.habilitado = dto.habilitado ?? true;
    config.modoEntrega = dto.modoEntrega;
    config.plantillaId =
      dto.plantillaId !== undefined ? dto.plantillaId : config.plantillaId ?? null;
    config.requiereAprobacion = dto.requiereAprobacion ?? true;
    config.notaMinima =
      dto.notaMinima !== undefined ? dto.notaMinima : config.notaMinima ?? null;
    config.asistenciaMinima =
      dto.asistenciaMinima !== undefined
        ? dto.asistenciaMinima
        : config.asistenciaMinima ?? null;
    config.progresoMinimo =
      dto.progresoMinimo !== undefined
        ? dto.progresoMinimo
        : config.progresoMinimo ?? 100;
    config.requiereExamenAprobado =
      dto.requiereExamenAprobado ?? config.requiereExamenAprobado ?? true;
    config.requiereProgresoCompleto =
      dto.requiereProgresoCompleto ?? config.requiereProgresoCompleto ?? true;
    config.soloCursosCompletosEnEmision =
      dto.soloCursosCompletosEnEmision ??
      config.soloCursosCompletosEnEmision ??
      true;

    return this.cursoConfigRepo.save(config);
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

  async getCursosMatriculadosYCompletosPorAlumno(idalumno: number) {
    const alumnoId = Number(idalumno);

    if (!alumnoId) {
      throw new BadRequestException('idalumno es obligatorio');
    }

    const rows = await this.dataSource.query(
      `
      select
        m.id as idmatricula,
        m.idgrupo,
        g.idcurso,
        c.nombrecurso,
        c.descripcion,
        c.duracion,
        c.creditos
      from matricula m
      inner join grupo g on g.id = m.idgrupo
      inner join curso c on c.id = g.idcurso
      where m.idalumno = $1
      order by m.id desc
      `,
      [alumnoId],
    );

    const vistos = new Set<string>();
    const resultado: any[] = [];

    for (const row of rows || []) {
      const key = `${row.idgrupo}-${row.idcurso}`;
      if (vistos.has(key)) continue;
      vistos.add(key);

      const verificacion = await this.verificarYPrepararEmision({
        idalumno: alumnoId,
        idgrupo: Number(row.idgrupo),
      });

      resultado.push({
        idgrupo: Number(row.idgrupo),
        idcurso: Number(row.idcurso),
        nombrecurso: row.nombrecurso || '',
        descripcion: row.descripcion || '',
        duracion: row.duracion ?? null,
        creditos: row.creditos ?? null,
        completo: !!verificacion?.emitirAhora,
        reason: verificacion?.reason || null,
        errores: verificacion?.errores || [],
        metricas: verificacion?.metricas || {
          promedioFinal: 0,
          asistenciaPct: 0,
          progresoPct: 0,
          examenAprobado: false,
        },
      });
    }

    return resultado;
  }

  async uploadPlantillaAsset(file: Express.Multer.File) {
    if (!this.bucket) {
      throw new BadRequestException(
        'AWS_S3_BUCKET no está configurado en el backend',
      );
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

  async getCertificadosAdmin(filters: {
    search?: string;
    dni?: string;
    curso?: string;
    estado?: string;
    anulado?: string;
  }) {
    const qb = this.certificadoRepo
      .createQueryBuilder('c')
      .orderBy('c.id', 'DESC');

    const search = filters.search?.trim();
    const dni = filters.dni?.trim();
    const curso = filters.curso?.trim();
    const estado = filters.estado?.trim();
    const anulado = filters.anulado?.trim();

    if (search) {
      qb.andWhere(
        `(c.nombre_alumno ILIKE :search
          OR c.dni_alumno ILIKE :search
          OR c.curso ILIKE :search
          OR c.codigocertificado ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (dni) {
      qb.andWhere(`c.dni_alumno ILIKE :dni`, {
        dni: `%${dni}%`,
      });
    }

    if (curso) {
      qb.andWhere(`c.curso ILIKE :curso`, {
        curso: `%${curso}%`,
      });
    }

    if (estado && estado !== 'TODOS') {
      qb.andWhere(`c.estado = :estado`, { estado });
    }

    if (anulado === 'SI') {
      qb.andWhere(`c.anulado = true`);
    } else if (anulado === 'NO') {
      qb.andWhere(`c.anulado = false`);
    }

    return qb.getMany();
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
      dobleCara: !!dto.dobleCara,
      configJsonReverso: Array.isArray(dto.configJsonReverso)
        ? dto.configJsonReverso
        : [],
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

    plantilla.dobleCara =
      dto.dobleCara !== undefined ? !!dto.dobleCara : plantilla.dobleCara;

    plantilla.configJsonReverso = Array.isArray(dto.configJsonReverso)
      ? dto.configJsonReverso
      : plantilla.configJsonReverso;  

    const saved = await this.plantillaRepo.save(plantilla);
    return this.hydratePlantilla(saved);
  }

  async anularCertificado(
    id: number,
    dto?: { motivo?: string },
  ) {
    const certificado = await this.certificadoRepo.findOne({
      where: { id },
    });

    if (!certificado) {
      throw new NotFoundException('Certificado no encontrado');
    }

    certificado.anulado = true;
    certificado.fechaAnulacion = new Date();
    certificado.motivoAnulacion = dto?.motivo?.trim() || null;
    certificado.descargaHabilitada = false;
    certificado.estado = 'ANULADO';

    return this.certificadoRepo.save(certificado);
  }

  async validarCertificadoPorCodigo(codigo: string) {
    const codigoNormalizado = String(codigo || "").trim();

    if (!codigoNormalizado) {
      throw new BadRequestException("Código de certificado inválido");
    }

    const certificado = await this.certificadoRepo.findOne({
      where: { codigoCertificado: codigoNormalizado },
    });

    if (!certificado) {
      throw new NotFoundException("Certificado no encontrado");
    }

    return {
      valido: !certificado.anulado,
      codigo: certificado.codigoCertificado,
      alumno: certificado.nombreAlumno,
      dni: certificado.dniAlumno,
      curso: certificado.curso,
      fechaEmision: certificado.fechaEmision,
      estado: certificado.estado,
      anulado: certificado.anulado,
      motivoAnulacion: certificado.motivoAnulacion || null,
    };
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

  async emitirCertificado(
    file: Express.Multer.File,
    dto: {
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
    if (!this.bucket) {
      throw new BadRequestException(
        'AWS_S3_BUCKET no está configurado en el backend',
      );
    }

    const mime = file?.mimetype || '';
    if (!mime.includes('pdf')) {
      throw new BadRequestException('El archivo enviado debe ser un PDF');
    }

    const idalumno =
      dto.idalumno !== undefined &&
      dto.idalumno !== null &&
      String(dto.idalumno).trim() !== ''
        ? Number(dto.idalumno)
        : null;

    const idcurso =
      dto.idcurso !== undefined &&
      dto.idcurso !== null &&
      String(dto.idcurso).trim() !== ''
        ? Number(dto.idcurso)
        : null;

    const horas =
      dto.horas !== undefined &&
      dto.horas !== null &&
      String(dto.horas).trim() !== ''
        ? Number(dto.horas)
        : null;

    const creditos =
      dto.creditos !== undefined &&
      dto.creditos !== null &&
      String(dto.creditos).trim() !== ''
        ? Number(dto.creditos)
        : null;

    const fecha = dto.fechaEmision ? new Date(dto.fechaEmision) : new Date();
    const codigo =
      dto.codigoCertificado?.trim() ||
      this.buildCertCode(idalumno ?? undefined, fecha);

    const key = `${this.emitidosPrefix}/${codigo}.pdf`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: 'application/pdf',
      }),
    );

    const certificadoExistente =
      idalumno !== null && idcurso !== null
        ? await this.certificadoRepo.findOne({
            where: {
              idalumno,
              idcurso,
            },
          })
        : null;

    let certificado: Certificado;

    if (certificadoExistente) {
      certificado = certificadoExistente;
    } else {
      certificado = new Certificado();
    }

    certificado.codigoCertificado = codigo;
    certificado.fechaEmision = fecha;
    certificado.origen = dto.origen || 'PLANTILLA_JSPDF';
    certificado.idalumno = idalumno;
    certificado.idcurso = idcurso;
    certificado.curso = dto.curso?.trim() || null;
    certificado.horas = horas;
    certificado.creditos = creditos;
    certificado.archivo_url = key;
    certificado.nombreAlumno = dto.nombreAlumno?.trim() || certificado.nombreAlumno || null;
    certificado.dniAlumno = dto.dniAlumno?.trim() || certificado.dniAlumno || null;

    if (!certificado.qrToken) {
      certificado.qrToken = this.buildQrToken(certificado.codigoCertificado || codigo);
    }
    certificado.qrUrl = this.buildQrUrl(certificado.qrToken);

    const saved = await this.certificadoRepo.save(certificado);

    return this.aplicarEntregaSegunConfig(saved, dto.emailAlumno || null);
  }

  async getCertificadosDisponiblesAlumno(idalumno: number) {
    return this.certificadoRepo.find({
      where: {
        idalumno,
        descargaHabilitada: true,
        descargado: false,
      },
      order: { id: 'DESC' },
    });
  }

  async descargarCertificadoAlumnoUnaVez(id: number, idalumno: number) {
    const certificado = await this.certificadoRepo.findOne({
      where: { id, idalumno },
    });

    if (!certificado) {
      throw new NotFoundException('Certificado no encontrado');
    }

    if (!certificado.descargaHabilitada) {
      throw new BadRequestException(
        'Este certificado no está habilitado para descarga del alumno',
      );
    }

    if (certificado.descargado) {
      throw new BadRequestException(
        'Este certificado ya fue descargado anteriormente',
      );
    }

    if (!certificado.archivo_url) {
      throw new NotFoundException('El archivo del certificado no existe');
    }

    const archivo = await this.getPlantillaAsset(certificado.archivo_url);

    certificado.descargado = true;
    certificado.fechaDescarga = new Date();
    certificado.estado = 'DESCARGADO';

    await this.certificadoRepo.save(certificado);

    return {
      ...archivo,
      fileName: `certificado-${certificado.codigoCertificado || certificado.id}.pdf`,
    };
  }

  async getGeneratedCertificadoFile(id: number) {
    const certificado = await this.certificadoRepo.findOne({
      where: { id },
    });

    if (!certificado || !certificado.archivo_url) {
      throw new NotFoundException('Certificado no encontrado');
    }

    const archivo = await this.getPlantillaAsset(certificado.archivo_url);

    if (certificado.anulado) {
    throw new BadRequestException('Este certificado fue anulado');
  }

    return {
      ...archivo,
      fileName: `certificado-${certificado.codigoCertificado || certificado.id}.pdf`,
    };
  }

  private async aplicarEntregaSegunConfig(
    certificado: Certificado,
    emailAlumno?: string | null,
  ) {
    if (!certificado.idcurso) {
      certificado.estado = 'GENERADO';
      certificado.enviadoCorreo = false;
      certificado.descargaHabilitada = false;
      certificado.descargado = false;

      const saved = await this.certificadoRepo.save(certificado);
      return {
        ...saved,
        archivoProxyUrl: `/certificado/${saved.id}/archivo`,
      };
    }

    const config = await this.cursoConfigRepo.findOne({
      where: { idcurso: certificado.idcurso },
    });

    if (!config || !config.habilitado) {
      certificado.estado = 'GENERADO';
      certificado.enviadoCorreo = false;
      certificado.descargaHabilitada = false;
      certificado.descargado = false;

      const saved = await this.certificadoRepo.save(certificado);
      return {
        ...saved,
        archivoProxyUrl: `/certificado/${saved.id}/archivo`,
      };
    }

    if (config.modoEntrega === 'DESCARGA_UNICA') {
      certificado.estado = 'DISPONIBLE_DESCARGA';
      certificado.enviadoCorreo = false;
      certificado.fechaEnvioCorreo = null;
      certificado.descargaHabilitada = true;
      certificado.descargado = false;
      certificado.fechaDescarga = null;

      const saved = await this.certificadoRepo.save(certificado);
      return {
        ...saved,
        archivoProxyUrl: `/certificado/${saved.id}/archivo`,
      };
    }

    const email = emailAlumno?.trim();

    if (!email) {
      certificado.estado = 'PENDIENTE_EMAIL';
      certificado.enviadoCorreo = false;
      certificado.fechaEnvioCorreo = null;
      certificado.descargaHabilitada = false;
      certificado.descargado = false;
      certificado.fechaDescarga = null;

      const saved = await this.certificadoRepo.save(certificado);
      return {
        ...saved,
        archivoProxyUrl: `/certificado/${saved.id}/archivo`,
      };
    }

    if (!this.mailService?.sendMail) {
      certificado.estado = 'PENDIENTE_EMAIL';
      certificado.enviadoCorreo = false;
      certificado.fechaEnvioCorreo = null;
      certificado.descargaHabilitada = false;
      certificado.descargado = false;
      certificado.fechaDescarga = null;

      const saved = await this.certificadoRepo.save(certificado);
      return {
        ...saved,
        archivoProxyUrl: `/certificado/${saved.id}/archivo`,
      };
    }

    try {
      const publicUrl = this.buildCertificadoPublicUrl(certificado.id);

      await this.mailService.sendMail(
        email,
        'Felicitaciones por culminar tu curso',
        this.buildEmailHtml({
          nombre: certificado.nombreAlumno || 'Alumno',
          curso: certificado.curso || 'Curso',
          codigo: certificado.codigoCertificado || '',
          url: publicUrl,
        }),
      );

      certificado.estado = 'ENVIADO';
      certificado.enviadoCorreo = true;
      certificado.fechaEnvioCorreo = new Date();
      certificado.descargaHabilitada = false;
      certificado.descargado = false;
      certificado.fechaDescarga = null;
    } catch (error) {
      console.error('No se pudo enviar el correo del certificado:', error);

      certificado.estado = 'PENDIENTE_EMAIL';
      certificado.enviadoCorreo = false;
      certificado.fechaEnvioCorreo = null;
      certificado.descargaHabilitada = false;
      certificado.descargado = false;
      certificado.fechaDescarga = null;
    }

    const saved = await this.certificadoRepo.save(certificado);

    return {
      ...saved,
      archivoProxyUrl: `/certificado/${saved.id}/archivo`,
    };
  }

  private buildCertificadoPublicUrl(id: number) {
    const base =
      process.env.PUBLIC_BACKEND_URL ||
      process.env.BACKEND_URL ||
      'http://localhost:3000';

    return `${base}/certificado/${id}/archivo`;
  }

  private buildEmailHtml(payload: {
    nombre?: string;
    curso: string;
    codigo: string;
    url: string;
  }) {
    return `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">¡Felicitaciones por culminar tu curso!</h2>
        <p>Hola ${payload.nombre || 'Alumno'},</p>
        <p>
          Has culminado satisfactoriamente el curso
          <strong>${payload.curso}</strong>.
        </p>
        <p>
          Queremos agradecerte por tu dedicación, compromiso y por haber sido parte
          de este proceso formativo.
        </p>
        <p>Tu certificado ya fue generado correctamente.</p>
        <p><strong>Código del certificado:</strong> ${payload.codigo}</p>
        <p>
          Puedes abrirlo desde aquí:
          <a href="${payload.url}" target="_blank">Ver certificado</a>
        </p>
        <br />
        <p>Te deseamos muchos éxitos en tus próximos retos.</p>
        <p>Saludos,<br />Equipo Conit</p>
      </div>
    `;
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

  private buildCertCode(idalumno?: number, fecha?: Date) {
    const year = (fecha || new Date()).getFullYear();
    const alumno = idalumno ? String(idalumno).padStart(4, '0') : '0000';
    const random = Math.random().toString(36).slice(2, 7).toUpperCase();

    return `CERT-${year}-${alumno}-${random}`;
  }

  private buildQrToken(base: string) {
  const safeBase = (base || 'CERT')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 60);

  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${safeBase}-${random}`;
}

  private buildQrUrl(qrToken?: string | null) {
    if (!qrToken) return null;

    const base =
      process.env.PUBLIC_FRONTEND_URL ||
      process.env.FRONTEND_URL ||
      process.env.PUBLIC_BACKEND_URL ||
      'http://localhost:5173';

    return `${base}/certificados/validar/${qrToken}`;
  }

  evaluarCumplimientoCurso(
    config: {
      requiereAprobacion?: boolean;
      notaMinima?: number | null;
      asistenciaMinima?: number | null;
      progresoMinimo?: number | null;
      requiereExamenAprobado?: boolean;
      requiereProgresoCompleto?: boolean;
    },
    metricas: {
      aprobo?: boolean;
      notaFinal?: number | null;
      asistenciaPct?: number | null;
      progresoPct?: number | null;
      examenAprobado?: boolean;
    },
  ) {
    const errores: string[] = [];

    if (config.requiereAprobacion && metricas.aprobo === false) {
      errores.push('NO_APROBADO');
    }

    if (
      config.notaMinima !== null &&
      config.notaMinima !== undefined &&
      (metricas.notaFinal === null || metricas.notaFinal === undefined ||
        Number(metricas.notaFinal) < Number(config.notaMinima))
    ) {
      errores.push('NOTA_INSUFICIENTE');
    }

    if (
      config.asistenciaMinima !== null &&
      config.asistenciaMinima !== undefined &&
      (metricas.asistenciaPct === null || metricas.asistenciaPct === undefined ||
        Number(metricas.asistenciaPct) < Number(config.asistenciaMinima))
    ) {
      errores.push('ASISTENCIA_INSUFICIENTE');
    }

    if (
      config.requiereProgresoCompleto &&
      config.progresoMinimo !== null &&
      config.progresoMinimo !== undefined &&
      (metricas.progresoPct === null || metricas.progresoPct === undefined ||
        Number(metricas.progresoPct) < Number(config.progresoMinimo))
    ) {
      errores.push('PROGRESO_INSUFICIENTE');
    }

    if (config.requiereExamenAprobado && metricas.examenAprobado !== true) {
      errores.push('EXAMEN_NO_APROBADO');
    }

    return {
      completo: errores.length === 0,
      errores,
    };
  }

  async verificarYPrepararEmision(payload: {
    idalumno: number;
    idgrupo: number;
  }) {
    const idalumno = Number(payload.idalumno);
    const idgrupo = Number(payload.idgrupo);

    if (!idalumno || !idgrupo) {
      throw new BadRequestException('idalumno e idgrupo son obligatorios');
    }

    const matricula = await this.dataSource.query(
      `
      select
        m.id,
        m.idalumno,
        m.idgrupo,
        g.idcurso,
        a.nombre,
        a.apellido,
        a.correo,
        a.numdocumento
      from matricula m
      inner join grupo g on g.id = m.idgrupo
      inner join alumno a on a.id = m.idalumno
      where m.idalumno = $1
        and m.idgrupo = $2
      order by m.id desc
      limit 1
      `,
      [idalumno, idgrupo],
    );

    const filaMatricula = matricula?.[0];

    if (!filaMatricula) {
      return {
        ok: false,
        emitirAhora: false,
        reason: 'MATRICULA_NO_ENCONTRADA',
      };
    }

    const idcurso = Number(filaMatricula.idcurso);

    const config = await this.getConfigByCurso(idcurso);

    if (!config?.habilitado) {
      return {
        ok: false,
        emitirAhora: false,
        reason: 'CERTIFICADO_DESHABILITADO',
      };
    }

    const existente = await this.certificadoRepo.findOne({
      where: {
        idalumno,
        idcurso,
      },
    });

    if (existente) {
      return {
        ok: true,
        emitirAhora: false,
        reason: 'YA_EXISTE_CERTIFICADO',
        certificadoId: existente.id,
        certificado: existente,
      };
    }

    const promedioRows = await this.dataSource.query(
      `
      select
        coalesce(sum(n.nota * (ec.porcentaje / 100.0)), 0) as promedio_final,
        count(*)::int as cantidad_notas
      from nota n
      inner join evaluacion_config ec on ec.id = n.evaluacion
      inner join matricula m on m.id = n.idmatricula
      where m.id = $1
        and ec.idgrupo = $2
        and ec.activa = true
      `,
      [Number(filaMatricula.id), idgrupo],
    );

    const promedioFinal = Number(promedioRows?.[0]?.promedio_final || 0);

    const asistenciaRows = await this.dataSource.query(
      `
      select
        count(*) filter (where lower(a.estado) = 'presente')::int as presentes,
        count(*) filter (where lower(a.estado) = 'tardanza')::int as tardanzas,
        count(*) filter (where lower(a.estado) = 'falta')::int as faltas,
        count(*)::int as total
      from asistencia a
      where a.idcurso = $1
        and a.idalumno = $2
      `,
      [idgrupo, idalumno],
    );

    const asistencia = asistenciaRows?.[0] || {};
    const totalSesiones = Number(asistencia.total || 0);
    const puntajeAsistencia =
      Number(asistencia.presentes || 0) + Number(asistencia.tardanzas || 0) * 0.5;

    const asistenciaPct =
      totalSesiones > 0 ? Number(((puntajeAsistencia / totalSesiones) * 100).toFixed(2)) : 0;

    const progresoData = await this.obtenerProgresoAlumnoParaCertificado(idgrupo, idalumno);
    const progresoPct = Number(progresoData?.progresoGeneral || 0);

    const examenRows = await this.dataSource.query(
      `
      select
        count(*)::int as total_finalizados_aprobados
      from examen_intento ei
      inner join examen e on e.id = ei.idexamen
      where ei.idmatricula = $1
        and e.idgrupo = $2
        and coalesce(ei.finalizado, false) = true
        and coalesce(ei.nota, 0) >= 12
      `,
      [Number(filaMatricula.id), idgrupo],
    );

    const examenAprobado = Number(examenRows?.[0]?.total_finalizados_aprobados || 0) > 0;

    const evaluacion = this.evaluarCumplimientoCurso(
      {
        requiereAprobacion: config.requiereAprobacion,
        notaMinima:
          config.notaMinima !== undefined && config.notaMinima !== null
            ? Number(config.notaMinima)
            : null,
        asistenciaMinima:
          config.asistenciaMinima !== undefined && config.asistenciaMinima !== null
            ? Number(config.asistenciaMinima)
            : null,
        progresoMinimo:
          config.progresoMinimo !== undefined && config.progresoMinimo !== null
            ? Number(config.progresoMinimo)
            : 100,
        requiereExamenAprobado: config.requiereExamenAprobado,
        requiereProgresoCompleto: config.requiereProgresoCompleto,
      },
      {
        aprobo: promedioFinal >= 12,
        notaFinal: promedioFinal,
        asistenciaPct,
        progresoPct,
        examenAprobado,
      },
    );

    const cursoRow = await this.dataSource.query(
      `
      select id, nombrecurso, descripcion, duracion, creditos
      from curso
      where id = $1
      limit 1
      `,
      [idcurso],
    );

    const curso = cursoRow?.[0] || null;

    return {
      ok: true,
      emitirAhora: evaluacion.completo,
      reason: evaluacion.completo ? 'CURSO_COMPLETADO' : 'REQUISITOS_INCOMPLETOS',
      errores: evaluacion.errores,
      metricas: {
        promedioFinal,
        asistenciaPct,
        progresoPct,
        examenAprobado,
      },
      alumno: {
        id: idalumno,
        nombre: filaMatricula.nombre || '',
        apellido: filaMatricula.apellido || '',
        nombreCompleto: `${filaMatricula.nombre || ''} ${filaMatricula.apellido || ''}`.trim(),
        correo: filaMatricula.correo || '',
        dni: filaMatricula.numdocumento || '',
      },
      curso: {
        id: idcurso,
        nombre: curso?.nombrecurso || '',
        descripcion: curso?.descripcion || '',
        horas: curso?.duracion ?? null,
        creditos: curso?.creditos ?? null,
      },
      matricula: {
        id: Number(filaMatricula.id),
        idgrupo,
      },
      config,
    };
  }

  private async obtenerProgresoAlumnoParaCertificado(idgrupo: number, idalumno: number) {
    const grupoRows = await this.dataSource.query(
      `
      select id, idcurso
      from grupo
      where id = $1
      limit 1
      `,
      [idgrupo],
    );

    const grupo = grupoRows?.[0];
    if (!grupo) {
      return {
        progresoGeneral: 0,
      };
    }

    const matriculaRows = await this.dataSource.query(
      `
      select id
      from matricula
      where idgrupo = $1 and idalumno = $2
      order by id desc
      limit 1
      `,
      [idgrupo, idalumno],
    );

    const matricula = matriculaRows?.[0];
    if (!matricula) {
      return {
        progresoGeneral: 0,
      };
    }

    const tareasRows = await this.dataSource.query(
      `
      select id
      from tarea
      where idgrupo = $1
        or (idcurso = $2 and idgrupo is null)
      `,
      [idgrupo, Number(grupo.idcurso)],
    );

    const totalTareas = tareasRows.length;
    const tareaIds = tareasRows.map((r: any) => Number(r.id));

    let tareasEntregadas = 0;
    if (tareaIds.length > 0) {
      const entregasRows = await this.dataSource.query(
        `
        select count(distinct idtarea)::int as total
        from tarea_entrega
        where idmatricula = $1
          and idtarea = any($2::int[])
        `,
        [Number(matricula.id), tareaIds],
      );

      tareasEntregadas = Number(entregasRows?.[0]?.total || 0);
    }

    const examenesRows = await this.dataSource.query(
      `
      select id
      from examen
      where idgrupo = $1
      `,
      [idgrupo],
    );

    const totalExamenes = examenesRows.length;
    const examenIds = examenesRows.map((r: any) => Number(r.id));

    let examenesRendidos = 0;
    if (examenIds.length > 0) {
      const intentosRows = await this.dataSource.query(
        `
        select count(distinct idexamen)::int as total
        from examen_intento
        where idmatricula = $1
          and idexamen = any($2::int[])
          and coalesce(finalizado, false) = true
        `,
        [Number(matricula.id), examenIds],
      );

      examenesRendidos = Number(intentosRows?.[0]?.total || 0);
    }

    const videosRows = await this.dataSource.query(
      `
      select lm.id
      from curso_modulo cm
      inner join curso_leccion cl on cl.idmodulo = cm.id
      inner join leccion_material lm on lm.idleccion = cl.id
      where cm.idcurso = $1
        and lm.tipo in ('video', 'url_video')
      `,
      [Number(grupo.idcurso)],
    );

    const totalVideos = videosRows.length;
    const videoIds = videosRows.map((r: any) => Number(r.id));

    let videosCompletados = 0;
    if (videoIds.length > 0) {
      const progresoRows = await this.dataSource.query(
        `
        select count(distinct idmaterial)::int as total
        from alumno_material_progreso
        where idmatricula = $1
          and idmaterial = any($2::int[])
          and (
            coalesce(completado, false) = true
            or coalesce(porcentaje_visto, 0) >= 80
          )
        `,
        [Number(matricula.id), videoIds],
      );

      videosCompletados = Number(progresoRows?.[0]?.total || 0);
    }

    const asistenciaRows = await this.dataSource.query(
      `
      select
        count(*) filter (where lower(estado) = 'presente')::int as presentes,
        count(*) filter (where lower(estado) = 'tardanza')::int as tardanzas,
        count(*)::int as total
      from asistencia
      where idcurso = $1 and idalumno = $2
      `,
      [idgrupo, idalumno],
    );

    const asistencia = asistenciaRows?.[0] || {};
    const totalSesiones = Number(asistencia.total || 0);
    const puntajeAsistencia =
      Number(asistencia.presentes || 0) + Number(asistencia.tardanzas || 0) * 0.5;

    const calc = (hecho: number, total: number) =>
      total > 0 ? Number(((hecho / total) * 100).toFixed(2)) : 0;

    const progresoTareas = calc(tareasEntregadas, totalTareas);
    const progresoExamenes = calc(examenesRendidos, totalExamenes);
    const progresoVideos = calc(videosCompletados, totalVideos);
    const progresoAsistencia =
      totalSesiones > 0 ? Number(((puntajeAsistencia / totalSesiones) * 100).toFixed(2)) : 0;

    const componentes: Array<{ valor: number; peso: number }> = [];

    if (totalTareas > 0) {
      componentes.push({ valor: progresoTareas, peso: 0.35 });
    }

    if (totalExamenes > 0) {
      componentes.push({ valor: progresoExamenes, peso: 0.30 });
    }

    if (totalVideos > 0) {
      componentes.push({ valor: progresoVideos, peso: 0.20 });
    }

    if (totalSesiones > 0) {
      componentes.push({ valor: progresoAsistencia, peso: 0.15 });
    }

    const pesoTotal = componentes.reduce((acc: number, item) => acc + item.peso, 0);

    const sumaPonderada = componentes.reduce(
      (acc: number, item) => acc + item.valor * item.peso,
      0,
    );

    const progresoGeneral = pesoTotal > 0 ? Number((sumaPonderada / pesoTotal).toFixed(2)) : 0;

    return {
      progresoTareas,
      progresoExamenes,
      progresoVideos,
      progresoAsistencia,
      progresoGeneral,
    };
  }
}
