import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'entregas_video' })
export class EntregasVideo {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int'})
  alumno_id: number;

  @Column({ type: 'int'})
  tarea_id: number;

  @Column({ type: 'int'})
  curso_id: number;

  @Column({ type: 'text'})
  video_url: string;
}
