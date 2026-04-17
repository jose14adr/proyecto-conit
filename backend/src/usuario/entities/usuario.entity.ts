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

  @Column({ name: 'email_verificado', type: 'boolean', default: false })
  emailVerificado: boolean;

  @Column({ name: 'token_verificacion', type: 'varchar', nullable: true })
  tokenVerificacion: string | null;

  @Column({
    name: 'token_verificacion_expira',
    type: 'timestamp',
    nullable: true,
  })
  tokenVerificacionExpira: Date | null;
}