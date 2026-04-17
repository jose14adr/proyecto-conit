import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'certificado' })
export class Certificado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  codigocertificado: string;

  @Column({ type: 'date', nullable: true })
  fechaemision: Date;

  @Column({ type: 'varchar', nullable: true })
  origen: string;

  @Column({ type: 'integer', nullable: true })
  idalumno: number;

  @Column({ type: 'varchar', nullable: true })
  curso: string;

  @Column({ type: 'integer', nullable: true })
  horas: number;

  @Column({ type: 'integer', nullable: true })
  creditos: number;

  @Column({ type: 'text', nullable: true })
  archivo_url: string;
}