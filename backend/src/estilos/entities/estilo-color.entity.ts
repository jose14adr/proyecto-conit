import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'estilo_color' })
export class EstiloColor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  hex: string;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  hue: number | null;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  saturation: number | null;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  value: number | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'integer', default: 1 })
  orden: number;

  @Column({ name: 'creado_en', type: 'timestamptz', default: () => 'now()' })
  creadoEn: Date;
}