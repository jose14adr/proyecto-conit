import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Alumno } from '../../alumno/entities/alumno.entity';
import { Grupo } from '../../grupo/entities/grupo.entity';

@Entity({ name: 'matricula' })
export class Matricula {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  observacion: string;

  @Column({ type: 'varchar', nullable: true })
  serie: string;

  @Column({ type: 'varchar' })
  estado: string;

  @Column({ type: 'varchar', nullable: true })
  beneficio: string;

  @ManyToOne(() => Alumno)
  @JoinColumn({ name: 'idalumno' })
  alumno: Alumno;

  @Column({ type: 'integer', nullable: true })
  idadministrador: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'idgrupo' })
  grupo: Grupo;

  @Column({ type: 'integer', nullable: true })
  idcertificado: number;

  @Column({ type: 'integer', nullable: true })
  idcontrolacademico: number;

  @Column({ type: 'varchar', nullable: true })
  pacademico: string;

  @Column({ type: 'numeric', nullable: true })
  precio: number;

  @Column({ type: 'boolean', default: false })
  puede_ver_certificado: boolean;

  @Column({ type: 'boolean', default: false })
  puede_descargar_certificado: boolean;

  @Column({ type: 'timestamp', nullable: true })
  created_at: Date;
}
