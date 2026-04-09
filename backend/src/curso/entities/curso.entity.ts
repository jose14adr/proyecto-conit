import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Grupo } from '../../grupo/entities/grupo.entity';
import { Temario } from '../../temario/entities/temario.entity';
import { SesionVivo } from '../../sesion-vivo/entities/sesion-vivo.entity';
import { CursoModulo } from '../../curso_modulo/entities/curso_modulo.entity';

@Entity({ name: 'curso' })
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  descripcion: string;

  @Column({ type: 'text', nullable: true })
  contenidomultimedia: string;

  @Column({ type: 'varchar', nullable: true })
  nombrecurso: string;

  @Column({ type: 'varchar', nullable: true })
  publicoobjetivo: string;

  @Column({ type: 'int', nullable: true })
  duracion: number;

  @Column({ type: 'int', nullable: true })
  creditos: number;

  @Column({ type: 'varchar', nullable: true })
  nivel: string;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @Column({ type: 'real', nullable: true })
  precio: number;

  @Column({ type: 'int', nullable: true })
  idrequisito: number;

  @ManyToOne(() => Temario, { nullable: true })
  @JoinColumn({ name: 'idtemario' })
  temario?: Temario;

  @Column({ type: 'int', nullable: true })
  idcategorizacion: number;

  @Column({ type: 'varchar', nullable: true })
  tiemposemana: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  descuento: number;

  @Column({ type: 'real', nullable: true })
  precio_final: number;

  @OneToMany(() => Grupo, (grupo) => grupo.curso)
  grupos: Grupo[];

  @OneToMany(() => CursoModulo, (cursoModulo) => cursoModulo.curso)
  modulos: CursoModulo[];

  @OneToMany(() => SesionVivo, (sesionVivo) => sesionVivo.curso)
  sesionesVivo: SesionVivo[];
}
