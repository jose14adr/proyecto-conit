import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('web_contenido')
export class WebContenido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80, unique: true })
  pagina: string;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  contenido: any;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  updated_at: Date | null;
}