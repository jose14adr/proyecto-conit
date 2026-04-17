import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Matricula } from '../../matricula/entities/matricula.entity';
import { LeccionMaterial } from '../../leccion-material/entities/leccion-material.entity';

@Entity('alumno_material_progreso')
@Unique('uq_alumno_material', ['idmatricula', 'idmaterial'])
export class AlumnoMaterialProgreso {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Matricula, { nullable: false })
  @JoinColumn({ name: 'idmatricula' })
  matricula: Matricula;

  @Column({ type: 'bigint' })
  idmatricula: number;

  @ManyToOne(() => LeccionMaterial, { nullable: false })
  @JoinColumn({ name: 'idmaterial' })
  material: LeccionMaterial;

  @Column({ type: 'bigint' })
  idmaterial: number;

  @Column({ type: 'timestamptz', nullable: true })
  fecha_inicio: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  fecha_ultimo_evento: Date | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  ultimo_segundo_reportado: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  max_segundo_visto: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  duracion_segundos: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  porcentaje_visto: number;

  @Column({ type: 'boolean', default: false })
  completado: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  fecha_completado: Date | null;

  @Column({ type: 'int', default: 0 })
  veces_reproducido: number;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  created_at: Date;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  updated_at: Date;
}