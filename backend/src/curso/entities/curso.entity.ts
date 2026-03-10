import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Curso' })
export class Curso {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  descripcion: string;

  @Column({ type: 'text', nullable: true })
  contenidoMultimedia: string;

  @Column({ type: 'varchar', nullable: true })
  nombreCurso: string;

  @Column({ type: 'varchar', nullable: true })
  publicoObjetivo: string;

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
  idRequisito: number;

  @Column({ type: 'int', nullable: true })
  idTemario: number;

  @Column({ type: 'int', nullable: true })
  idCategorizacion: number;

  @Column({ type: 'varchar', nullable: true })
  tiempoSemanal: string;
}
