import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'certificado_plantilla' })
export class CertificadoPlantilla {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'boolean', default: false })
  activa: boolean;

  @Column({ name: 'fondo_key', type: 'text', nullable: true })
  fondoKey: string | null;

  @Column({ name: 'canvas_width', type: 'integer', default: 1600 })
  canvasWidth: number;

  @Column({ name: 'canvas_height', type: 'integer', default: 1131 })
  canvasHeight: number;

  @Column({
    name: 'config_json',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  configJson: any[];

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

  @Column({ name: 'doble_cara', type: 'boolean', default: false })
  dobleCara: boolean;

  @Column({
    name: 'config_json_reverso',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  configJsonReverso: any[];
}