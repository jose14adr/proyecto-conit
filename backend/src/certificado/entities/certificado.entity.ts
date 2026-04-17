import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'certificado' })
export class Certificado {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'codigocertificado', type: 'varchar', nullable: true })
  codigoCertificado: string | null;

  @Column({ name: 'codigoqr', type: 'bytea', nullable: true })
  codigoqr: Buffer | null;

  @Column({ type: 'date', nullable: true })
  fechaemision: Date;

  @Column({ name: 'plantilla', type: 'bytea', nullable: true })
  plantilla: Buffer | null;

  @Column({ name: 'fechaemision', type: 'date', nullable: true })
  fechaEmision: Date | null;

  @Column({ name: 'origen', type: 'varchar', nullable: true })
  origen: string | null;

  @Column({ name: 'idalumno', type: 'integer', nullable: true })
  idalumno: number | null;

  @Column({ name: 'idcurso', type: 'integer', nullable: true })
  idcurso: number | null;

  @Column({
    name: 'anulado',
    type: 'boolean',
    default: false,
  })
  anulado: boolean;

  @Column({
    name: 'fecha_anulacion',
    type: 'timestamp with time zone',
    nullable: true,
  })
  fechaAnulacion: Date | null;

  @Column({
    name: 'motivo_anulacion',
    type: 'text',
    nullable: true,
  })
  motivoAnulacion: string | null;

  @Column({ name: 'curso', type: 'varchar', nullable: true })
  curso: string | null;

  @Column({ name: 'horas', type: 'integer', nullable: true })
  horas: number | null;

  @Column({ name: 'creditos', type: 'integer', nullable: true })
  creditos: number | null;

  @Column({ name: 'archivo_url', type: 'text', nullable: true })
  archivo_url: string | null;

  @Column({ name: 'estado', type: 'varchar', nullable: true })
  estado: string | null;

  @Column({
    name: 'enviado_correo',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  enviadoCorreo: boolean | null;

  @Column({
    name: 'fecha_envio_correo',
    type: 'timestamp with time zone',
    nullable: true,
  })
  fechaEnvioCorreo: Date | null;

  @Column({
    name: 'descarga_habilitada',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  descargaHabilitada: boolean | null;

  @Column({
    name: 'descargado',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  descargado: boolean | null;

  @Column({
    name: 'fecha_descarga',
    type: 'timestamp with time zone',
    nullable: true,
  })
  fechaDescarga: Date | null;

  @Column({ name: 'nombre_alumno', type: 'varchar', nullable: true })
  nombreAlumno: string | null;

  @Column({ name: 'dni_alumno', type: 'varchar', length: 20, nullable: true })
  dniAlumno: string | null;

  @Column({ name: 'qr_token', type: 'varchar', length: 120, nullable: true })
  qrToken: string | null;

  @Column({ name: 'qr_url', type: 'text', nullable: true })
  qrUrl: string | null;
}