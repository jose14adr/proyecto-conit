import { Matricula } from 'src/matricula/entities/matricula.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';


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

  @Column({ type: 'varchar' })
  telefono: string;

  @Column({ type: 'varchar' })
  direccion: string;

  @Column({ type: 'varchar' })
  correo: string;

  @Column({ type: 'varchar' })
  numdocumento: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.alumnos)
  @JoinColumn({ name: 'idusuario' })
  usuario: Usuario;

  @Column({ type: 'integer' })
  idusuario: number;

  @Column({ default: false })
  nombre_editado: boolean;

  @Column({type:'varchar', nullable: true})
  foto_url: string;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @Column({ type: 'varchar' })
  lugar_residencia: string;

  @Column({ type: 'varchar' })
  departamento: string;

  @Column({ type: 'varchar' })
  provincia: string;

  @Column({ type: 'varchar' })
  distrito: string;

  @Column({ type: 'varchar' })
  estado_civil: string;

  @OneToMany(() => Matricula, (matricula) => matricula.alumno)
  matriculas: Matricula[];
}
