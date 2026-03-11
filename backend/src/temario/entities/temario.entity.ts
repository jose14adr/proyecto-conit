import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { Unidad } from '../../unidad/entities/unidad.entity';

@Entity({ name: 'temario' })
export class Temario {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  titulomodulo: string;

  @Column({ type: 'varchar' })
  detallelecciones: string;

  @Column({ type: 'numeric' })
  evaluacion: number;

  @Column({ type: 'integer' })
  idcontenido: number;

  @OneToMany(
    () => Unidad,
    (unidad) => unidad.temario
  )
  unidades: Unidad[];
}
