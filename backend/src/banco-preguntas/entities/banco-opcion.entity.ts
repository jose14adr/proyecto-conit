import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { BancoPregunta } from './banco-pregunta.entity';

@Entity('banco_opcion')
export class BancoOpcion {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'bigint' })
  idpregunta: string;

  @Column({ type: 'text' })
  texto_opcion: string;

  @Column({ type: 'boolean', default: false })
  es_correcta: boolean;

  @Column({ type: 'int', default: 1 })
  orden: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @ManyToOne(() => BancoPregunta, (pregunta) => pregunta.opciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idpregunta' })
  pregunta: BancoPregunta;
}