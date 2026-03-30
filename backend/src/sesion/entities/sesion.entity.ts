import { Entity, Column, PrimaryGeneratedColumn, OneToMany  } from 'typeorm';


@Entity({ name: 'sesion' }) // Respeta el nombre exacto en BD
export class Sesion {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombresesion: string;

  @Column({ type: 'integer' })
  idevaluacion: number;

}
