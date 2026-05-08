import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mensaje_contacto')
export class MensajeContacto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 180 })
  nombre: string;

  @Column({ type: 'varchar', length: 180 })
  correo: string;

  @Column({ type: 'varchar', length: 220 })
  asunto: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'varchar', length: 30, default: 'PENDIENTE' })
  estado: string;

  @Column({ type: 'boolean', default: false })
  leido: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  updated_at: Date | null;
}