import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, Timestamp } from 'typeorm';
import { Curso } from '../../curso/entities/curso.entity';
import { CursoLeccion } from '../../curso_leccion/entities/curso_leccion.entity';


@Entity('curso_modulo')
export class CursoModulo {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Curso, (curso) => curso.modulos)
      @JoinColumn({ name: 'idcurso' })
      curso: Curso;
    
    @Column({ nullable: true })
        titulo: string;
    
        @Column({ nullable: true })
        descripcion: string;
    
        @Column()
        orden: number;
    
        @Column()
        created_at: Date;

        @Column()
        idpadre: number;
    
    @OneToMany(
    () => CursoLeccion,
    (cursoLeccion) => cursoLeccion.cursoModulo
    )
    lecciones: CursoLeccion[];
}
