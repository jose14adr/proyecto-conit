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

  @Column({ type: 'int' })
  telefono: number;

  @Column({ type: 'varchar' })
  direccion: string;

  @Column({ type: 'varchar' })
  correo: string;

  @Column({ type: 'varchar' })
  contrasenia: string;

  @Column({ type: 'int' })
  idusuario: number;
}
