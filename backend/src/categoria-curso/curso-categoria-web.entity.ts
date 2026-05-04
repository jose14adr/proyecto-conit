import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Curso } from '../curso/entities/curso.entity';
import { CategoriaCurso } from './categoria-curso.entity';

@Entity('curso_categoria_web')
export class CursoCategoriaWeb {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  idcurso: number;

  @Column({ type: 'int' })
  idcategoria: number;

  @Column({ type: 'int', default: 1 })
  orden: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  created_at: Date | null;

  @ManyToOne(() => Curso, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idcurso' })
  curso: Curso;

  @ManyToOne(() => CategoriaCurso, (categoria) => categoria.cursosRelacionados, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idcategoria' })
  categoria: CategoriaCurso;
}