import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCursoDto {
  @ApiProperty({
    example: 'Ingeniería de Software II',
    description: 'Nombre completo del curso académico',
  })
  @IsString()
  @IsNotEmpty()
  nombrecurso: string;

  @ApiProperty({
    example: 'Curso avanzado sobre patrones de diseño y microservicios.',
    description: 'Breve descripción del contenido del curso',
    required: false,
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    example: 'Intermedio',
    description: 'Nivel de dificultad del curso',
    enum: ['Básico', 'Intermedio', 'Avanzado'],
  })
  @IsEnum(['Básico', 'Intermedio', 'Avanzado'])
  @IsNotEmpty()
  nivel: string;

  @ApiProperty({
    example: 'Estudiantes de octavo ciclo de ingeniería',
    description: 'Perfil del estudiante al que va dirigido el curso',
    required: false,
  })
  @IsString()
  @IsOptional()
  publicoobjetivo?: string;

  @ApiProperty({
    example: '10 horas',
    description: 'Tiempo estimado de dedicación semanal',
    required: false,
  })
  @IsString()
  @IsOptional()
  tiemposemana?: string;

  @ApiProperty({
    example: 40,
    description: 'Duración total del curso en horas',
  })
  @IsNumber()
  @Min(1)
  duracion: number;

  @ApiProperty({
    example: 4,
    description: 'Cantidad de créditos académicos que otorga el curso',
  })
  @IsNumber()
  @Min(0)
  creditos: number;

  @ApiProperty({
    example: 250.0,
    description: 'Precio base del curso (sin descuentos)',
  })
  @IsNumber()
  @Min(0)
  precio: number;

  @ApiProperty({
    example: 15,
    description: 'Porcentaje de descuento (0 a 100)',
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  descuento?: number;

  @ApiProperty({
    example: 212.5,
    description: 'Precio final calculado después de aplicar descuentos',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  precio_final?: number;
}
