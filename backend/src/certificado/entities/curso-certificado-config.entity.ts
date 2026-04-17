import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'curso_certificado_config' })
export class CursoCertificadoConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'idcurso', type: 'integer', unique: true })
  idcurso: number;

  @Column({ type: 'boolean', default: true })
  habilitado: boolean;

  @Column({
    name: 'modo_entrega',
    type: 'varchar',
    length: 30,
    default: 'DESCARGA_UNICA',
  })
  modoEntrega: 'EMAIL' | 'DESCARGA_UNICA';

  @Column({ name: 'plantilla_id', type: 'integer', nullable: true })
  plantillaId: number | null;

  @Column({ name: 'requiere_aprobacion', type: 'boolean', default: true })
  requiereAprobacion: boolean;

  @Column({
    name: 'nota_minima',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  notaMinima: number | null;

  @Column({ name: 'asistencia_minima', type: 'integer', nullable: true })
  asistenciaMinima: number | null;

  @Column({ name: 'progreso_minimo', type: 'integer', nullable: true, default: 100 })
  progresoMinimo: number | null;

  @Column({
    name: 'requiere_examen_aprobado',
    type: 'boolean',
    default: true,
  })
  requiereExamenAprobado: boolean;

  @Column({
    name: 'requiere_progreso_completo',
    type: 'boolean',
    default: true,
  })
  requiereProgresoCompleto: boolean;

  @Column({
    name: 'solo_cursos_completos_en_emision',
    type: 'boolean',
    default: true,
  })
  soloCursosCompletosEnEmision: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt: Date;
}