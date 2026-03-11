import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Matricula } from '../../matricula/entities/matricula.entity';

@Entity({ name: 'pago' }) // Respeta el nombre exacto en BD
export class Pago {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fechapago: Date;

  @Column({ type: 'numeric' })
  igv: number;

  @Column({ type: 'numeric' })
  precioinicial: number;

  @Column({ type: 'numeric' })
  preciofinal: number;

  @Column({ type: 'numeric' })
  preciodescuento: number;

  @Column({ type: 'varchar' })
  tipopago: string;

  @Column({ type: 'numeric' })
  idpagoDoc: number;

  @Column({ type: 'numeric' })
  idtipocomprobante: number;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'varchar' })
  estado: string;

  @ManyToOne(() => Matricula)
  @JoinColumn({ name: "idmatricula" })
  matricula: Matricula
}
