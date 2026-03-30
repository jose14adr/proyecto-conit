import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  correo: string;

  @Column({ type: 'integer' })
  idempresa: number;

  @Column({ type: 'varchar' })
  contrasenia: string;

  @Column({ type: 'varchar' })
  rol: string;

  @Column('text', { array: true, default: [] })
  historialcontrasenias: string[];

  @Column({ type: 'boolean', default: true })
  estado: boolean;
}
