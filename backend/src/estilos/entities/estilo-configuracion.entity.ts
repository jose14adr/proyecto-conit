import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { EstiloColor } from './estilo-color.entity';

@Entity({ name: 'estilo_configuracion' })
export class EstiloConfiguracion {
  @PrimaryColumn({ type: 'integer', default: 1 })
  id: number;

  @ManyToOne(() => EstiloColor, { nullable: true })
  @JoinColumn({ name: 'color_principal_id' })
  colorPrincipal: EstiloColor | null;

  @ManyToOne(() => EstiloColor, { nullable: true })
  @JoinColumn({ name: 'color_secundario_id' })
  colorSecundario: EstiloColor | null;

  @ManyToOne(() => EstiloColor, { nullable: true })
  @JoinColumn({ name: 'color_sidenav_id' })
  colorSidenav: EstiloColor | null;

  @Column({ name: 'color_principal_custom', type: 'varchar', length: 20, nullable: true })
  colorPrincipalCustom: string | null;

  @Column({ name: 'color_secundario_custom', type: 'varchar', length: 20, nullable: true })
  colorSecundarioCustom: string | null;

  @Column({ name: 'color_sidenav_custom', type: 'varchar', length: 20, nullable: true })
  colorSidenavCustom: string | null;

  @Column({ name: 'boton_primario_usa_sidenav', type: 'boolean', default: true })
  botonPrimarioUsaSidenav: boolean;

  @Column({ name: 'boton_secundario_usa_sidenav', type: 'boolean', default: true })
  botonSecundarioUsaSidenav: boolean;

  @ManyToOne(() => EstiloColor, { nullable: true })
  @JoinColumn({ name: 'boton_primario_color_id' })
  botonPrimarioColor: EstiloColor | null;

  @ManyToOne(() => EstiloColor, { nullable: true })
  @JoinColumn({ name: 'boton_secundario_color_id' })
  botonSecundarioColor: EstiloColor | null;

  @Column({ name: 'boton_primario_custom', type: 'varchar', length: 20, nullable: true })
  botonPrimarioCustom: string | null;

  @Column({ name: 'boton_secundario_custom', type: 'varchar', length: 20, nullable: true })
  botonSecundarioCustom: string | null;

  @Column({ name: 'tipo_sidenav', type: 'varchar', length: 30, default: 'OSCURO' })
  tipoSidenav: 'OSCURO' | 'TRANSPARENTE' | 'BLANCO';

  @Column({ name: 'sidenav_mini', type: 'boolean', default: false })
  sidenavMini: boolean;

  @Column({ name: 'modo_oscuro', type: 'boolean', default: false })
  modoOscuro: boolean;

  @Column({ name: 'actualizado_en', type: 'timestamptz', default: () => 'now()' })
  actualizadoEn: Date;
}