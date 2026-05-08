import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ConfiguracionPago } from '../../pago/entities/configuracion-pago.entity';

<<<<<<< HEAD

=======
>>>>>>> 22b56407c02e89b5c6ba5a4d5c809994e244fc99
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

<<<<<<< HEAD
  @OneToMany(() => ConfiguracionPago, (configuracion) => configuracion.empresa)
  configuracionesPago: ConfiguracionPago[];
}
=======
  @Column({ name: 'meeting_provider', type: 'varchar', default: 'google' })
  meetingProvider: string;
}
>>>>>>> 22b56407c02e89b5c6ba5a4d5c809994e244fc99
