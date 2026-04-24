import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExamenPregunta } from '../../examen_pregunta/entities/examen_pregunta.entity';

@Entity({ name: 'examen_opcion' })
export class ExamenOpcion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExamenPregunta, (p) => p.opciones)
  @JoinColumn({ name: 'idpregunta' })
  examen_pregunta: ExamenPregunta;

  @Column({ type: 'text' })
  texto: string;

  @Column()
  es_correcta: boolean;

  @Column()
  orden: number;
}