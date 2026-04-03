import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'soporte_adjunto' })
export class SoporteAdjunto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  idsoporte: number;

  @Column({ type: 'varchar', length: 255 })
  nombre_archivo: string;

  @Column({ type: 'text' })
  archivo_url: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tipo_mime: string;

  @Column({ type: 'bigint', nullable: true })
  tamano: number;

  @Column({ type: 'timestamp', nullable: true, default: () => 'now()' })
  created_at: Date;
}