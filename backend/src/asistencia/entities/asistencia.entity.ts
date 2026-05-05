import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'asistencia' }) // Respeta el nombre exacto en BD
export class Asistencia {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  idgrupo: number;

  @Column({ type: 'integer' })
  idalumno: number;
  
  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'varchar' })
  estado: string;

  @Column({ type: 'text', nullable: true })
tipo_justificacion: string | null;

@Column({ type: 'text', nullable: true })
observacion: string | null;

  @Column({ type: 'timestamptz' })
  created_at: string;

  @Column({ type: 'jsonb', nullable: true })
evidencias: string[];

@Column({ type: 'text', nullable: true })
archivo_url: string | null;

}