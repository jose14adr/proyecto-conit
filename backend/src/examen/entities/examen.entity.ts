import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CursoLeccion } from '../../curso_leccion/entities/curso_leccion.entity';
import { ExamenPregunta } from '../../examen_pregunta/entities/examen_pregunta.entity';
import { Grupo } from '../../grupo/entities/grupo.entity';

@Entity({ name: 'examen' })
export class Examen {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CursoLeccion, (leccion) => leccion.examenes)
  @JoinColumn({ name: 'idleccion' })
  curso_leccion: CursoLeccion;

  @ManyToOne(() => Grupo, (grupo) => grupo.examenesGrupo)
  @JoinColumn({ name: 'idgrupo' })
  grupo: Grupo;

  @Column()
  titulo: string;

  @Column()
  descripcion: string;

  @Column()
  duracion_minutos: number;

  @Column()
  intentos_permitidos: number;

  @Column('numeric')
  nota_maxima: number;

  @Column()
  estado: boolean;

  @Column()
  randomizar_preguntas: boolean;

  @Column()
  randomizar_opciones: boolean;

  @Column({ type: 'timestamptz' })
  fecha_inicio: Date;

  @Column({ type: 'timestamptz' })
  fecha_fin: Date;

  @Column({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => ExamenPregunta, (p) => p.examen)
  preguntas: ExamenPregunta[];
}