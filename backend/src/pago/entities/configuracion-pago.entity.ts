import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity({ name: 'configuracion_pago' })
export class ConfiguracionPago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  pasarela: string; // Ej: 'mercadopago', 'paypal', 'izipay', 'yape', 'transferencia'

  @Column({ type: 'jsonb' })
  credenciales: any; // Aquí va el JSON dinámico

  @Column({ type: 'boolean', default: false })
  activa: boolean;

  @Column({ type: 'varchar', default: 'produccion' })
  entorno: string; // 'sandbox' o 'produccion'
  
  @ManyToOne(() => Empresa, (empresa) => empresa.configuracionesPago)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;
}
