export class CreateDocenteCursoAdicionalDto {
  iddocente: number;
  nombre: string;
  institucion?: string;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  archivo_url?: string;
}