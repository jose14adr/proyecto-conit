import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { DocenteCursoAdicional } from '../../docente-curso-adicional/entities/docente-curso-adicional.entity';

@Entity({ name: 'docente' })
export class Docente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ name: 'tipodocumento' })
  tipoDocumento: string;

  @Column({ name: 'numdocumento' })
  numDocumento: string;

  @Column({ type: 'varchar' })
  telefono: string;

  @Column()
  direccion: string;

  @Column()
  correo: string;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  // Nuevos campos de RRHH / Perfil
  @Column({ type: 'varchar', nullable: true })
  titulo: string;

  @Column({ type: 'varchar', nullable: true })
  experiencia: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', nullable: true })
  foto_url: string;

  @Column({ type: 'text', nullable: true })
  estado_motivo: string;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento: Date;

  @Column({ type: 'int', nullable: true })
  grado_instruccion_id: number;

  @Column({ type: 'int', nullable: true })
  anios_experiencia: number;

  @Column({ type: 'varchar', nullable: true })
  sector_experiencia: string;

  @Column({ type: 'date', nullable: true })
  tiempo_estudios_inicio: Date;

  @Column({ type: 'date', nullable: true })
  tiempo_estudios_fin: Date;

  @Column({ type: 'varchar', nullable: true })
  institucion_egreso: string;

  @Column({ type: 'varchar', nullable: true })
  contacto_emergencia_nombre: string;

  @Column({ type: 'varchar', nullable: true })
  contacto_emergencia_telefono: string;

  @Column({ type: 'text', nullable: true })
  perfil_profesional: string;

  @OneToOne(() => Usuario, { nullable: true })
  @JoinColumn()
  usuario?: Usuario;

  @OneToMany(() => DocenteCursoAdicional, (cursoAdicional) => cursoAdicional.docente)
  cursosAdicionales: DocenteCursoAdicional[];
}