import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"

@Entity({ name: 'recurso' }) // Respeta el nombre exacto en BD
export class Recurso {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  titulo: string;

  @Column({ type: 'text' })
  curso: string;

  @Column({ type: 'text' })
  tipo: string;

  @Column({ type: 'text' })
  tamanio: string;

  @Column({ type: 'text' })
  link: string;

  @Column({ type: 'int' })
  descargas: number;

  @Column({ type: 'boolean' })
  favorito: boolean;

}
