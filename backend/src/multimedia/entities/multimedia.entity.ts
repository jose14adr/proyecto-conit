import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'multimedia' })
export class Multimedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'varchar' })
  tipo: string;

  @Column({ type: 'integer' })
  usuario_id: number;
}