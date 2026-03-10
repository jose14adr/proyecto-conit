import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'alumno' }) // Respeta el nombre exacto en BD
export class Alumno {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar' })
  apellido: string;
  
  @Column({ type: 'varchar' })
  tipodocumento: string;

  @Column({ type: 'integer' })
  telefono: number;

  @Column({ type: 'varchar' })
  direccion: string;

  @Column({ type: 'varchar' })
  correo: string;

  @Column({ type: 'varchar' })
  numdocumento: string;

  @Column({ type: 'integer' })
  idusuario: number;

  @Column({ default: false })
  nombre_editado: boolean;

  @Column({type:'varchar', nullable: true})
  foto_url: string;

  @Column({ type: 'varchar', default: 'ACTIVO' })
  estado: string;
}
