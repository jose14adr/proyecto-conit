import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ConfiguracionPago } from '../../pago/entities/configuracion-pago.entity';

@Entity({ name: 'empresa' })
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombreempresa', type: 'varchar' })
  nombreEmpresa: string;

  @Column({ name: 'rubro', type: 'varchar' })
  rubro: string;

  @Column({ name: 'direccion', type: 'varchar' })
  direccion: string;

  @Column({ name: 'distrito', type: 'varchar' })
  distrito: string;

  @Column({ name: 'provincia', type: 'varchar' })
  provincia: string;

  @Column({ name: 'departamento', type: 'varchar' })
  departamento: string;

  @Column({ name: 'ruc', type: 'char' })
  ruc: string;

  @Column({ name: 'meeting_provider', type: 'varchar', default: 'google' })
  meetingProvider: string;
  
  @OneToMany(() => ConfiguracionPago, (configuracion) => configuracion.empresa)
  configuracionesPago: ConfiguracionPago[];
}
