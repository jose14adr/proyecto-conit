import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Unidad } from '../../unidad/entities/unidad.entity';

@Entity({ name: 'tarea' })
export class Tarea {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  idcurso: number;

  @Column()
  titulo: string;

  @Column()
  descripcion: string;

  @Column()
  fecha_limite: Date;

  @Column()
  tipo_entrega: string;

  @Column({ nullable: true })
  tipo_apoyo: string;

  @Column({ nullable: true })
  texto_apoyo: string;

  @Column({ nullable: true })
  archivo_apoyo_url: string;

  @Column({ nullable: true })
  video_apoyo_url: string;

  @Column()
  created_at: Date;

  @Column()
  fecha_inicio: Date;

  @ManyToOne(() => Unidad, { nullable: true })
    @JoinColumn({ name: 'unidad_id' })
    sesion?: Unidad;
  

}