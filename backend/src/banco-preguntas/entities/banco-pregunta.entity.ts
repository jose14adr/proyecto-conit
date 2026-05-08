import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BancoOpcion } from './banco-opcion.entity';

@Entity('banco_pregunta')
export class BancoPregunta {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'int' })
  iddocente: number;

  @Column({ type: 'int', nullable: true })
  idcurso: number | null;

  @Column({ type: 'varchar', length: 30 })
  tipo_pregunta: string;

  @Column({ type: 'text' })
  enunciado: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 1 })
  puntaje: number;

  @Column({ type: 'text', nullable: true })
  respuesta_referencia: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  dificultad: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoria: string | null;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @OneToMany(() => BancoOpcion, (opcion) => opcion.pregunta)
  opciones: BancoOpcion[];
}