import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Examen } from '../../examen/entities/examen.entity';
import { ExamenOpcion } from '../../examen_opcion/entities/examen_opcion.entity';

@Entity({ name: 'examen_pregunta' })
export class ExamenPregunta {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Examen, (examen) => examen.preguntas)
  @JoinColumn({ name: 'idexamen' })
  examen: Examen;

  @Column()
  enunciado: string;

  @Column('numeric')
  puntaje: number;

  @Column()
  orden: number;

  @Column()
  estado: boolean;

  @Column({ type: 'timestamptz' })
  created_at: Date;

  @Column()
  tipo_pregunta: string;

  @Column({ type: 'text', nullable: true })
  respuesta_texto: string;

  @Column({ type: 'text', nullable: true })
  texto_placeholder: string;

  @Column({ nullable: true })
  max_caracteres: number;

  @Column({ nullable: true })
  permitir_decimales: boolean;

  @Column({ nullable: true })
  tamano_max_mb: number;

  @Column({ type: 'text', nullable: true })
  extensiones_permitidas: string;

  @OneToMany(() => ExamenOpcion, (op) => op.examen_pregunta)
  opciones: ExamenOpcion[];
}