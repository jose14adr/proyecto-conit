import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsEnum,
} from 'class-validator';

export class CreateCursoDto {
  @IsString()
  @IsNotEmpty()
  nombrecurso: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(['Básico', 'Intermedio', 'Avanzado'])
  @IsNotEmpty()
  nivel: string;

  @IsString()
  @IsOptional()
  publicoobjetivo?: string;

  @IsString()
  @IsOptional()
  tiemposemana?: string;

  @IsNumber()
  @Min(1)
  duracion: number;

  @IsNumber()
  @Min(0)
  creditos: number;

  @IsNumber()
  @Min(0)
  precio: number;

  // Nuevos campos comerciales
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  descuento?: number;

  @IsNumber()
  @IsOptional()
  precio_final?: number;
}
