import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Asistencia } from './entities/asistencia.entity';
import { ConfigService } from '@nestjs/config';
import { supabase } from '../supabase.client';


import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

@Injectable()
export class AsistenciaService {

  constructor(
    private configService: ConfigService,

    @InjectRepository(Asistencia)
    private asistenciaRepository: Repository<Asistencia>,
  ) {}

  async getConfiguracionActiva(idgrupo: number) {

  const now = new Date();

  // 🔥 formato PERÚ correcto
  const hoy = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const ahora = now.toTimeString().slice(0, 5); // HH:mm

  console.log("HOY:", hoy);
  console.log("AHORA:", ahora);

  const { data, error } = await supabase
    .from('asistencia_configuracion')
    .select('*')
    .eq('idgrupo', idgrupo)
    .eq('fecha', hoy)
    .eq('activo', true);

  if (error) throw new Error(error.message);

  if (!data || data.length === 0) return null;

  // 🔥 validar horario
  const activa = data.find(c => {
    const inicio = c.hora_inicio?.slice(0, 5);
    const fin = c.hora_fin?.slice(0, 5);

    return ahora >= inicio && ahora <= fin;
  });

  return activa || null;
}

  /* ========================= */
  /* CLIENTE S3 */
  /* ========================= */
  private getS3Client() {
    return new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
  }

  /* ========================= */
  /* SUBIR ARCHIVO */
  /* ========================= */
  async subirArchivoS3(file: Express.Multer.File): Promise<string> {

    const bucket = this.configService.get<string>('AWS_S3_BUCKET');

    if (!bucket) {
      throw new Error("AWS_S3_BUCKET no definido");
    }

    const fileName = `${Date.now()}-${file.originalname}`;

    const s3 = this.getS3Client();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return `https://${bucket}.s3.amazonaws.com/${fileName}`;
  }

  /* ========================= */
  /* REGISTRAR ASISTENCIA */
  /* ========================= */
  async crear(body: any, file?: Express.Multer.File) {

    const { idalumno, idgrupo, estado, tipo_justificacion, observacion } = body;

    if (!idalumno || !idgrupo) {
      throw new BadRequestException('Datos incompletos');
    }

    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date();
    fin.setHours(23, 59, 59, 999);

    const existente = await this.asistenciaRepository.findOne({
      where: {
        idalumno: Number(idalumno),
        idgrupo: Number(idgrupo),
        fecha: Between(inicio, fin),
      },
    });

    if (existente) {
      throw new BadRequestException('Ya registraste asistencia hoy');
    }

    let urlArchivo: string | null = null;

    if (file && tipo_justificacion === "justificada") {
      urlArchivo = await this.subirArchivoS3(file);
    }

    const nueva = this.asistenciaRepository.create({
      idalumno: Number(idalumno),
      idgrupo: Number(idgrupo),
      estado,
      tipo_justificacion: estado === 'presente' ? null : tipo_justificacion,
      observacion: observacion || null,
      archivo_url: urlArchivo,
      fecha: new Date(),
    });

    return await this.asistenciaRepository.save(nueva);
  }

  /* ========================= */
  /* HISTORIAL */
  /* ========================= */
  async historial(idalumno: number, idgrupo: number) {
    return this.asistenciaRepository.find({
      where: { idalumno, idgrupo },
      order: { fecha: 'DESC' },
    });
  }

  /* ========================= */
  /* TODAS */
  /* ========================= */
  async obtenerTodasPorAlumno(idalumno: number) {
    return this.asistenciaRepository.find({
      where: { idalumno },
      order: { fecha: 'DESC' },
    });
  }
}