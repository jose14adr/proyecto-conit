import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'soporte' })
export class Soporte {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  asunto: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado: string;

  @Column({ type: 'varchar', length: 20, default: 'MEDIA' })
  prioridad: string;

  @Column({ type: 'integer', nullable: true })
  idalumno: number;

  @Column({ type: 'integer', nullable: true })
  idusuario: number;

  @Column({ type: 'integer', nullable: true })
  idadministrador: number;

  @Column({ type: 'text', nullable: true })
  respuesta: string;

  @Column({ type: 'timestamp', nullable: true, default: () => 'now()' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true, default: () => 'now()' })
  updated_at: Date;
}