import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'asistencia' }) // Respeta el nombre exacto en BD
export class Asistencia {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 10,
    description: 'ID del grupo al que pertenece el curso',
  })
  @Column({ type: 'integer' })
  idgrupo: number;

  @ApiProperty({ example: 5, description: 'ID del alumno' })
  @Column({ type: 'integer' })
  idalumno: number;

  @ApiProperty({ example: '2026-04-29', description: 'Fecha de la asistencia' })
  @Column({ type: 'date' })
  fecha: Date;

  @ApiProperty({ example: 'presente', enum: ['presente', 'falta', 'tardanza'] })
  @Column({ type: 'varchar' })
  estado: string;

  @ApiProperty({
    example: 'médica',
    nullable: true,
    description: 'Tipo de justificación si aplica',
  })
  @Column({ type: 'text', nullable: true })
  tipo_justificacion: string | null;

  @ApiProperty({ example: 'El alumno llegó 10 min tarde', nullable: true })
  @Column({ type: 'text', nullable: true })
  observacion: string | null;

  @ApiProperty({ example: '2026-04-29T10:00:00Z' })
  @Column({ type: 'timestamptz' })
  created_at: string;

  @ApiProperty({
    example: ['evidencia1.jpg'],
    description: 'Lista de nombres de archivos de evidencia',
    nullable: true,
  })
  @Column({ type: 'jsonb', nullable: true })
  evidencias: string[];

  @ApiProperty({ example: 'https://storage.../archivo.pdf', nullable: true })
  @Column({ type: 'text', nullable: true })
  archivo_url: string | null;
}
