import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Curso } from '../../curso/entities/curso.entity';
@Entity({ name: 'sesion_vivo' })

export class SesionVivo {

@PrimaryGeneratedColumn()
id: number;

@ManyToOne(
    () => Curso,
    (curso) => curso.sesionesVivo,
    { nullable: true }
  )
  @JoinColumn({ name: 'idcurso' })
  curso?: Curso;

@Column({ type: 'varchar' })
titulo: string;

@Column({ type: 'text', nullable: true })
descripcion: string | null;

@Column()
fecha: Date;

@Column()
duracion: number;

@Column()
link_reunion: string;

@Column({ default: "programada" })
estado: string;

}