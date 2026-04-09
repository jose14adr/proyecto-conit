import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Docente } from '../../docente/entities/docente.entity';

@Entity({ name: 'docente_curso_adicional' })
export class DocenteCursoAdicional {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'iddocente', type: 'int' })
  iddocente: number;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar', nullable: true })
  institucion: string;

  @Column({ type: 'date', nullable: true })
  fecha_inicio: Date;

  @Column({ type: 'date', nullable: true })
  fecha_fin: Date;

  @Column({ type: 'text', nullable: true })
  archivo_url: string;

  @CreateDateColumn({ type: 'timestamp with time zone', nullable: true })
  created_at: Date;

  @ManyToOne(() => Docente, (docente) => docente.cursosAdicionales, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'iddocente' })
  docente: Docente;
}