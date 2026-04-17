import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamp } from 'typeorm/browser';

@Entity({ name: 'Examen' }) // Respeta el nombre exacto en BD
export class Examen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'date' })
  fechaInicio: Date;

  @Column({ type: 'date' })
  fechaFin: Date;

  @Column({ type: 'integer' })
  cantIntentos: number;

  @Column({ type: 'integer' })
  tiempoLimite: number;

  @Column({ type: 'timestamptz' })
  horaInicio: Date;

  @Column({ type: 'timestamptz' })
  horaFin: Date;

  @Column({ type: 'integer' })
  notaAprobacion: number;
}
