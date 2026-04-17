import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Docente } from '../../docente/entities/docente.entity';
import { Curso } from '../../curso/entities/curso.entity';
import { Matricula } from '../../matricula/entities/matricula.entity';
import { Examen } from '../../examen/entities/examen.entity';

@Entity({ name: 'grupo' })
export class Grupo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombregrupo: string;

  @Column({ type: 'varchar' })
  horario: string;

  @Column({ type: 'varchar', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar' })
  modalidad: string;

  @Column({ type: 'integer' })
  cantidadpersonas: number;

  @ManyToOne(() => Curso, (curso) => curso.grupos, { nullable: true })
  @JoinColumn({ name: 'idcurso' })
  curso?: Curso;

  @ManyToOne(() => Docente, { nullable: true })
  @JoinColumn({ name: 'iddocente' })
  docente?: Docente;

  @OneToMany(() => Matricula, (matricula) => matricula.grupo)
  matriculas: Matricula[];

  @OneToMany(() => Examen, (examen) => examen.grupo)
  examenesGrupo: Examen[];

  @Column({ type: 'varchar', default: 'ACTIVO' })
  estado: string;

  @Column({
    name: 'fecha_cierre',
    type: 'timestamptz',
    nullable: true,
  })
  fechaCierre: Date | null;

  @Column({
    name: 'correo_cierre_docente_enviado',
    type: 'boolean',
    default: false,
  })
  correoCierreDocenteEnviado: boolean;
}