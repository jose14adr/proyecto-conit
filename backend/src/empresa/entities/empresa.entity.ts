import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ConfiguracionPago } from '../../pago/entities/configuracion-pago.entity';


@Entity({ name: 'empresa' })
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombreEmpresa: string;

  @Column({ type: 'varchar' })
  rubro: string;

  @Column({ type: 'varchar' })
  direccion: string;

  @Column({ type: 'varchar' })
  distrito: string;

  @Column({ type: 'varchar' })
  provincia: string;

  @Column({ type: 'varchar' })
  departamento: string;

  @Column({ type: 'char' })
  ruc: string;

  @OneToMany(() => ConfiguracionPago, (configuracion) => configuracion.empresa)
  configuracionesPago: ConfiguracionPago[];
}
