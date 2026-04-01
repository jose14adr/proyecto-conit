import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { CursoModulo } from '../../curso_modulo/entities/curso_modulo.entity';
import { LeccionMaterial } from '../../leccion-material/entities/leccion-material.entity';

@Entity('curso_leccion')
export class CursoLeccion {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CursoModulo, (cursoModulo) => cursoModulo.lecciones)
  @JoinColumn({ name: 'idmodulo' })
  cursoModulo: CursoModulo;

  @Column({ nullable: true })
  titulo: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column()
  orden: number;

  // 🔥 FIX PRO
  @CreateDateColumn()
  created_at: Date;

  @OneToMany(
    () => LeccionMaterial,
    (leccionMaterial) => leccionMaterial.curso_leccion
  )
  materiales: LeccionMaterial[];

}