import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Alumno } from '../../alumno/entities/alumno.entity';

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

  @Column({ type: 'text', array: true, nullable: true })
  historialcontrasenias: string[];

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @OneToMany(() => Alumno, (alumno) => alumno.usuario)
  alumnos: Alumno[];

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
