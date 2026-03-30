import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany  } from 'typeorm';
import { Sesion } from '../../sesion/entities/sesion.entity';
import { Temario } from '../../temario/entities/temario.entity';

@Entity({ name: 'unidad' })
export class Unidad {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'varchar' })
  nombreunidad: string;

  @ManyToOne(
    () => Temario,
    (temario) => temario.unidades,
    { nullable: true }
  )
  @JoinColumn({ name: 'idtemario' })
  temario?: Temario;

  @ManyToOne(() => Sesion, { nullable: true })
  @JoinColumn({ name: 'idsesion' })
  sesion?: Sesion;

}
