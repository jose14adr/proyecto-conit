import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CursoCategoriaWeb } from './curso-categoria-web.entity';

@Entity('categoria_curso')
export class CategoriaCurso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  slug: string | null;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'text', nullable: true })
  imagen_url: string | null;

  @Column({ type: 'boolean', default: true })
  visible_web: boolean;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @Column({ type: 'int', default: 1 })
  orden: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  updated_at: Date | null;

  @OneToMany(() => CursoCategoriaWeb, (item) => item.categoria)
  cursosRelacionados: CursoCategoriaWeb[];
}