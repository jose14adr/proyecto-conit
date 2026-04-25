import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ExamenIntento } from '../../examen_intento/entities/examen_intento.entity';

@Entity({ name: 'examen_respuesta' })
export class ExamenRespuesta {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ExamenIntento, (intento) => intento.respuestas)
  @JoinColumn({ name: 'idintento' })
  intento: ExamenIntento;

  @Column()
  idpregunta: number;

  @Column({ nullable: true })
  idopcion: number;

  @Column({ default: false })
  es_correcta: boolean;

  @Column({ type: 'numeric', default: 0 })
  puntaje_obtenido: number;
}