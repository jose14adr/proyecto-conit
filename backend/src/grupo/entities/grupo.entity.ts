import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Docente } from '../../docente/entities/docente.entity';
import { Curso } from '../../curso/entities/curso.entity';

@Entity({ name: 'grupo' })
export class Grupo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombregrupo: string;

  @Column({ type: 'varchar' })
  horario: string;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'varchar' })
  modalidad: string;

  @Column({ type: 'integer' })
  cantidadpersonas: number;

  @Column({ type: 'text', nullable: true })
  permisos_docente: string;

  @ManyToOne(() => Curso, (curso) => curso.grupos, { nullable: true })
  @JoinColumn({ name: 'idcurso' })
  curso?: Curso;

  @ManyToOne(() => Docente, { nullable: true })
  @JoinColumn({ name: 'iddocente' })
  docente?: Docente;
}
