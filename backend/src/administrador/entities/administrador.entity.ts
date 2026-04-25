import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('administrador')
export class Administrador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar' })
  apellido: string;

  @Column({ type: 'varchar' })
  tipodocumento: string;

  @Column({ type: 'varchar' })
  numdocumento: string;

  @Column({ type: 'varchar' })
  telefono: string;

  @Column({ type: 'varchar' })
  direccion: string;

  @Column({ type: 'varchar' })
  correo: string;

  @Column({ type: 'varchar' })
  contrasenia: string;

  @Column({ type: 'int' })
  idusuario: number;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @Column({ type: 'varchar', nullable: true })
  foto_url: string;

  @Column({ type: 'varchar', nullable: true })
  cv_url: string;
}