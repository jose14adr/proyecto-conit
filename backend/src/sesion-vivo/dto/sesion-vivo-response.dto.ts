export class SesionVivoResponseDto {
  id: number;
  curso: { id: number } | null;
  titulo: string;
  descripcion: string | null;
  fecha: Date;
  duracion: number;
  link_reunion: string;
  provider: string;
  external_meeting_id: string | null;
  estado: string;
  idgrupo: number | null;
}