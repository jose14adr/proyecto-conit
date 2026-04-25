import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, } from 'typeorm';
import { Examen } from '../../examen/entities/examen.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Matricula } from '../../matricula/entities/matricula.entity';
import { ExamenRespuesta } from '../../examen_respuesta/entities/examen_respuesta.entity';


@Entity({ name: 'examen_intento' })
export class ExamenIntento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Examen)
  @JoinColumn({ name: 'idexamen' })
  examen: Examen;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'idalumno' })
  alumno: Usuario;

  @ManyToOne(() => Matricula)
  @JoinColumn({ name: 'idmatricula' })
  matricula: Matricula;

  @Column({ type: 'int' })
  intento_numero: number;

  @Column({ type: 'numeric', nullable: true })
  nota: number;

  @OneToMany(() => ExamenRespuesta, (r) => r.intento)
  respuestas: ExamenRespuesta[];

  @Column({ type: 'boolean', default: false })
  finalizado: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fecha_inicio: Date;

  @Column({ type: 'timestamptz', nullable: true })
  fecha_fin: Date;

}