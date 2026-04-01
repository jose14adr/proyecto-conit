import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CursoLeccion } from '../../curso_leccion/entities/curso_leccion.entity';

@Entity('leccion_material')
export class LeccionMaterial {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CursoLeccion, (curso_leccion) => curso_leccion.materiales)
  @JoinColumn({ name: 'idleccion' })
  curso_leccion: CursoLeccion;

  @Column({ nullable: true })
  titulo: string;

  @Column({ nullable: true })
  tipo: string;

  @Column({ nullable: true })
  contenido_texto: string;

  @Column({ nullable: true })
  archivo_url: string;

  @Column({ nullable: true })
  video_url: string;

  @Column({ nullable: true })
  nombre_archivo: string;

  @Column({ nullable: true })
  tamano_bytes: number;

  @Column({ nullable: true })
  enlace_url: string;

  @Column({ nullable: true })
  mime_type: string;

  @Column({ nullable: true })
  orden: number;

  @Column({ nullable: true })
  vimeo_video_id: string;

  @Column({ nullable: true })
  embed_url: string;

  @Column({ nullable: true })
  estado_video: string;

  @Column({ nullable: true })
  vimeo_uri: string;

}