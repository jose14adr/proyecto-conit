import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('web_media')
export class WebMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre_original: string;

  @Column({ type: 'varchar', length: 255 })
  nombre_archivo: string;

  @Column({ type: 'text' })
  archivo_url: string;

  @Column({ type: 'text' })
  archivo_key: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  mime_type: string | null;

  @Column({ type: 'int', nullable: true })
  size_bytes: number | null;

  @Column({ type: 'varchar', length: 120, nullable: true, default: 'web' })
  carpeta: string | null;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  updated_at: Date | null;
}