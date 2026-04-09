import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Docente } from '../../docente/entities/docente.entity';
import { Curso } from '../../curso/entities/curso.entity';
import { Matricula } from '../../matricula/entities/matricula.entity';
import { Examen } from '../../examen/entities/examen.entity';

@Entity({ name: 'grupo' }) // Respeta el nombre exacto en BD
export class Grupo {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombregrupo: string;

  @Column({ type: 'varchar' })
  horario: string;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'varchar' })
  modalidad: string;

  @Column({ type: 'integer' })
  cantidadpersonas: number;

  @ManyToOne(
    () => Curso,
    (curso) => curso.grupos,
    { nullable: true }
  )
  @JoinColumn({ name: 'idcurso' })
  curso?: Curso;

  @ManyToOne(() => Docente, { nullable: true })
    @JoinColumn({ name: 'iddocente' })
    docente?: Docente;

  @OneToMany(
      () => Matricula,
      (matricula) => matricula.grupo
    )
    matriculas: Matricula[];

  @OneToMany(
      () => Examen,
      (examen) => examen.grupo
    )
    examenesGrupo: Examen[];
}
