import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class ReportarProgresoMaterialDto {
  @IsNumber()
  idmatricula: number;

  @IsNumber()
  idmaterial: number;

  @IsNumber()
  segundoActual: number;

  @IsNumber()
  duracionSegundos: number;

  @IsOptional()
  @IsIn(['play', 'pause', 'timeupdate', 'seeked', 'ended', 'loaded'])
  evento?: 'play' | 'pause' | 'timeupdate' | 'seeked' | 'ended' | 'loaded';
}