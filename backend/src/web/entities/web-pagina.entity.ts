import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('web_pagina')
export class WebPagina {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 180 })
  titulo: string;

  @Column({ type: 'varchar', length: 160, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  ruta: string;

  @Column({ type: 'varchar', length: 50, default: 'personalizada' })
  tipo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'boolean', default: true })
  visible_menu: boolean;

  @Column({ type: 'boolean', default: true })
  publicada: boolean;

  @Column({ type: 'boolean', default: false })
  protegida: boolean;

  @Column({ type: 'int', default: 1 })
  orden: number;

  @Column({ type: 'varchar', length: 220, nullable: true })
  seo_title: string | null;

  @Column({ type: 'text', nullable: true })
  seo_description: string | null;

  @Column({ type: 'jsonb', default: () => `'{"secciones":[]}'::jsonb` })
  contenido: any;

  @Column({ type: 'timestamp with time zone', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  updated_at: Date | null;
}